const mysql = require('mysql2/promise');
require('dotenv').config();


let connection;


const setupTestDatabase = async () => {
    connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME_TEST,
        port: process.env.DB_PORT
    });
    
    console.log('Test database connected');
};

const teardownTestDatabase = async () => {
    if (connection) {
        await connection.end();
        console.log('Test database disconnected');
    }
};

const cleanDatabase = async () => {
    if (!connection) {
        await setupTestDatabase();
    }
    
    try {
        await connection.query('SET FOREIGN_KEY_CHECKS = 0');
        
        await connection.query('TRUNCATE TABLE tasks');
        await connection.query('TRUNCATE TABLE users');
        
        await connection.query('SET FOREIGN_KEY_CHECKS = 1');
        
        console.log('Database cleaned');
    } catch (error) {
        console.error('Database clean failed:', error.message);
    }
};

module.exports = {
    setupTestDatabase,
    teardownTestDatabase,
    cleanDatabase
};