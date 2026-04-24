const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function init() {
    const url = new URL(process.env.DATABASE_URL);
    const connection = await mysql.createConnection({
        host: url.hostname,
        user: url.username,
        password: url.password,
        database: url.pathname.substring(1),
        port: url.port || 4000,
        ssl: { rejectUnauthorized: true },
        multipleStatements: true
    });

    console.log('Connected to DB');
    const sql = fs.readFileSync(path.join(__dirname, 'database.sql'), 'utf8');
    await connection.query(sql);
    console.log('Tables created and admin seeded');
    await connection.end();
}

init().catch(console.error);
