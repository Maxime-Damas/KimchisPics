const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'kimchi_secret_key_123';

app.use(cors());
app.use(express.json());

// Cloudinary Config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'kimchi-portfolio',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
  },
});

const upload = multer({ storage: storage });

// Database Connection
const url = new URL(process.env.DATABASE_URL);
const db = mysql.createPool({
    host: url.hostname,
    user: url.username,
    password: url.password,
    database: url.pathname.substring(1),
    port: url.port || 4000,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    ssl: {
        rejectUnauthorized: true
    }
});

// Auth Middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.sendStatus(401);
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// --- ROUTES ---

// Admin Login
app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;
    db.query('SELECT * FROM admins WHERE username = ?', [username], (err, results) => {
        if (err) return res.status(500).json(err);
        if (results.length === 0) return res.status(401).json({ message: 'Invalid credentials' });

        const admin = results[0];
        if (password !== admin.password) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: admin.id, username: admin.username }, JWT_SECRET, { expiresIn: '24h' });
        res.json({ token, username: admin.username });
    });
});

// Public: Get all public photos with session details for Portfolio
app.get('/api/public/portfolio', (req, res) => {
    const query = `
        SELECT p.id, p.url, s.category, s.title as sessionTitle
        FROM photos p
        JOIN sessions s ON p.session_id = s.id
        WHERE p.is_public = 1
        ORDER BY s.created_at DESC
    `;
    db.query(query, (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
});

// Public: Get featured photos for Home page (grouped by category)
app.get('/api/public/featured', (req, res) => {
    const query = `
        SELECT p.id, p.url, s.category, s.title
        FROM photos p
        JOIN sessions s ON p.session_id = s.id
        WHERE p.is_public = 1
        ORDER BY s.created_at DESC
        LIMIT 12
    `;
    db.query(query, (err, results) => {
        if (err) return res.status(500).json(err);
        
        // Group by category
        const featured = results.reduce((acc, photo) => {
            if (!acc[photo.category]) acc[photo.category] = [];
            acc[photo.category].push({
                id: photo.id,
                url: photo.url,
                session: { title: photo.title, category: photo.category }
            });
            return acc;
        }, {});
        
        res.json(featured);
    });
});

// Public: Get client gallery by access code
app.get('/api/public/client/:code', (req, res) => {
    const code = req.params.code;
    
    // First find the session
    db.query('SELECT * FROM sessions WHERE access_code = ?', [code], (err, sessions) => {
        if (err) return res.status(500).json(err);
        if (sessions.length === 0) return res.status(404).json({ message: 'Code invalide' });

        const session = sessions[0];
        
        // Then get its photos
        db.query('SELECT id, url FROM photos WHERE session_id = ?', [session.id], (err2, photos) => {
            if (err2) return res.status(500).json(err2);
            res.json({
                id: session.id,
                title: session.title,
                category: session.category,
                photos: photos
            });
        });
    });
});

// Admin: Manage Sessions
app.get('/api/sessions', authenticateToken, (req, res) => {
    const query = `
        SELECT 
            s.id, s.title, s.category, s.access_code as accessCode, s.created_at as createdAt,
            p.id as photoId, p.url, p.public_id as publicId, p.is_public as isPublic
        FROM sessions s
        LEFT JOIN photos p ON s.id = p.session_id
        ORDER BY s.created_at DESC
    `;

    db.query(query, (err, results) => {
        if (err) return res.status(500).json(err);
        
        // Group results by session
        const sessions = results.reduce((acc, row) => {
            let session = acc.find(s => s.id === row.id);
            if (!session) {
                session = {
                    id: row.id,
                    title: row.title,
                    category: row.category,
                    accessCode: row.accessCode,
                    createdAt: row.createdAt,
                    photos: []
                };
                acc.push(session);
            }
            if (row.photoId) {
                session.photos.push({
                    id: row.photoId,
                    url: row.url,
                    publicId: row.publicId,
                    isPublic: row.isPublic
                });
            }
            return acc;
        }, []);

        res.json(sessions);
    });
});

app.post('/api/sessions', authenticateToken, upload.array('photos'), (req, res) => {
    const { title, category, accessCode, isPublic } = req.body;
    const files = req.files;

    db.query('INSERT INTO sessions (title, category, access_code) VALUES (?, ?, ?)', [title, category, accessCode], (err, result) => {
        if (err) {
            console.error('Error creating session:', err);
            return res.status(500).json({ error: err.message });
        }
        
        const sessionId = result.insertId;

        if (files && files.length > 0) {
            const photoValues = files.map(file => [file.path, file.filename, sessionId, isPublic === 'true' ? 1 : 0]);
            db.query('INSERT INTO photos (url, public_id, session_id, is_public) VALUES ?', [photoValues], (err2) => {
                if (err2) {
                    console.error('Error uploading photos:', err2);
                    return res.status(500).json({ error: err2.message });
                }
                res.json({ id: sessionId, title, category, accessCode, photoCount: files.length });
            });
        } else {
            res.json({ id: sessionId, title, category, accessCode, photoCount: 0 });
        }
    });
});

app.delete('/api/sessions/:id', authenticateToken, (req, res) => {
    db.query('DELETE FROM sessions WHERE id = ?', [req.params.id], (err) => {
        if (err) return res.status(500).json(err);
        res.json({ message: 'Session deleted' });
    });
});

// Admin: Manage Photos
app.post('/api/photos', authenticateToken, upload.array('photos'), async (req, res) => {
    const { sessionId, isPublic } = req.body;
    const files = req.files;
    
    if (!files || files.length === 0) return res.status(400).json({ message: 'No photos provided' });

    const values = files.map(file => [file.path, file.filename, sessionId, isPublic === 'true' ? 1 : 0]);
    
    db.query('INSERT INTO photos (url, public_id, session_id, is_public) VALUES ?', [values], (err) => {
        if (err) return res.status(500).json(err);
        res.json({ message: 'Photos uploaded successfully' });
    });
});

// Admin: Manage Forfaits
app.get('/api/admin/forfaits', (req, res) => {
    db.query('SELECT f.*, fp.nb_photos, fp.price FROM forfaits f LEFT JOIN forfait_prices fp ON f.id = fp.forfait_id', (err, results) => {
        if (err) return res.status(500).json(err);
        
        const forfaits = results.reduce((acc, curr) => {
            const found = acc.find(f => f.id === curr.id);
            if (found) {
                if (curr.nb_photos) found.prices.push({ nb_photos: curr.nb_photos, price: curr.price });
            } else {
                acc.push({
                    id: curr.id,
                    label: curr.label,
                    prices: curr.nb_photos ? [{ nb_photos: curr.nb_photos, price: curr.price }] : []
                });
            }
            return acc;
        }, []);
        
        res.json(forfaits);
    });
});

app.post('/api/admin/forfaits', authenticateToken, async (req, res) => {
    const { label, prices } = req.body;
    db.query('INSERT INTO forfaits (label) VALUES (?)', [label], (err, result) => {
        if (err) return res.status(500).json(err);
        const forfaitId = result.insertId;
        
        if (prices && prices.length > 0) {
            const priceValues = prices.map(p => [forfaitId, p.nb_photos, p.price]);
            db.query('INSERT INTO forfait_prices (forfait_id, nb_photos, price) VALUES ?', [priceValues], (err2) => {
                if (err2) return res.status(500).json(err2);
                res.json({ id: forfaitId, label, prices });
            });
        } else {
            res.json({ id: forfaitId, label, prices: [] });
        }
    });
});

app.put('/api/admin/forfaits/:id', authenticateToken, (req, res) => {
    const { label, prices } = req.body;
    db.query('UPDATE forfaits SET label = ? WHERE id = ?', [label, req.params.id], (err) => {
        if (err) return res.status(500).json(err);
        
        db.query('DELETE FROM forfait_prices WHERE forfait_id = ?', [req.params.id], (err2) => {
            if (err2) return res.status(500).json(err2);
            
            if (prices && prices.length > 0) {
                const priceValues = prices.map(p => [req.params.id, p.nb_photos, p.price]);
                db.query('INSERT INTO forfait_prices (forfait_id, nb_photos, price) VALUES ?', [priceValues], (err3) => {
                    if (err3) return res.status(500).json(err3);
                    res.json({ message: 'Forfait updated' });
                });
            } else {
                res.json({ message: 'Forfait updated' });
            }
        });
    });
});

app.delete('/api/admin/forfaits/:id', authenticateToken, (req, res) => {
    db.query('DELETE FROM forfaits WHERE id = ?', [req.params.id], (err) => {
        if (err) return res.status(500).json(err);
        res.json({ message: 'Forfait deleted' });
    });
});

// Public: Get Forfaits
app.get('/api/public/forfaits', (req, res) => {
    db.query('SELECT f.*, fp.nb_photos, fp.price FROM forfaits f LEFT JOIN forfait_prices fp ON f.id = fp.forfait_id', (err, results) => {
        if (err) return res.status(500).json(err);
        
        const forfaits = results.reduce((acc, curr) => {
            const found = acc.find(f => f.id === curr.id);
            if (found) {
                if (curr.nb_photos) found.prices[curr.nb_photos] = curr.price;
            } else {
                acc.push({
                    id: curr.id,
                    label: curr.label,
                    prices: curr.nb_photos ? { [curr.nb_photos]: curr.price } : {}
                });
            }
            return acc;
        }, []);
        
        res.json(forfaits);
    });
});

app.patch('/api/photos/:id/public', authenticateToken, (req, res) => {
    const { isPublic } = req.body;
    db.query('UPDATE photos SET is_public = ? WHERE id = ?', [isPublic ? 1 : 0, req.params.id], (err) => {
        if (err) return res.status(500).json(err);
        res.json({ message: 'Photo visibility updated' });
    });
});

app.delete('/api/photos/:id', authenticateToken, (req, res) => {
    db.query('SELECT public_id FROM photos WHERE id = ?', [req.params.id], (err, results) => {
        if (err || results.length === 0) return res.status(500).json(err || { message: 'Photo not found' });
        
        const publicId = results[0].public_id;
        cloudinary.uploader.destroy(publicId, (cloudinaryErr) => {
            db.query('DELETE FROM photos WHERE id = ?', [req.params.id], (err) => {
                if (err) return res.status(500).json(err);
                res.json({ message: 'Photo deleted' });
            });
        });
    });
});

app.listen(PORT, () => {
    console.log(`Kimchi Portfolio Server running on port ${PORT}`);
});
