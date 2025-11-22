const mysql = require('mysql2/promise');
require('dotenv').config();

const createPool = () => {
    const dbName = process.env.NODE_ENV === 'test' 
        ? process.env.DB_NAME_TEST 
        : process.env.DB_NAME;
    
    console.log(`Creating database pool for: ${dbName}`);
    
    return mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: dbName,
        port: process.env.DB_PORT,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
    });
};

const pool = createPool();

pool.getConnection()
    .then(connection => {
        console.log('Database connected successfully');
        connection.release();
    })
    .catch(err => {
        console.error('Database connection failed:', err.message);
    });

module.exports = pool;