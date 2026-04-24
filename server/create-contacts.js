const mysql = require('mysql2/promise');
require('dotenv').config();

async function run() {
    try {
        const url = new URL(process.env.DATABASE_URL);
        const conn = await mysql.createConnection({
            host: url.hostname,
            user: url.username,
            password: url.password,
            database: url.pathname.substring(1),
            port: url.port || 4000,
            ssl: { rejectUnauthorized: true }
        });
        await conn.query(`
            CREATE TABLE IF NOT EXISTS contacts (
                id INT AUTO_INCREMENT PRIMARY KEY,
                nom VARCHAR(100),
                prenom VARCHAR(100),
                telephone VARCHAR(50),
                forfait VARCHAR(100),
                nb_photos VARCHAR(50),
                message TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('Contacts table created');
        await conn.end();
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
run();
