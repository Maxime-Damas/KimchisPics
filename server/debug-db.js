const mysql = require('mysql2/promise');
require('dotenv').config();

async function check() {
    const url = new URL(process.env.DATABASE_URL);
    const connection = await mysql.createConnection({
        host: url.hostname,
        user: url.username,
        password: url.password,
        database: url.pathname.substring(1),
        port: url.port || 4000,
        ssl: { rejectUnauthorized: true }
    });

    console.log('--- SESSIONS ---');
    const [sessions] = await connection.query('DESCRIBE sessions');
    console.table(sessions);

    console.log('--- PHOTOS ---');
    const [photos] = await connection.query('DESCRIBE photos');
    console.table(photos);

    await connection.end();
}

check().catch(console.error);
