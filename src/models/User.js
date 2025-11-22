const db = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
    static async create(userData) {
        const { firstName, lastName, username, email, password, role = 'basic' } = userData;
        
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const query = `
            INSERT INTO users (firstName, lastName, username, email, password, role)
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        
        const [result] = await db.execute(query, [
            firstName,
            lastName,
            username,
            email,
            hashedPassword,
            role
        ]);
        
        return result.insertId;
    }
    
    static async findByEmail(email) {
        const query = 'SELECT * FROM users WHERE email = ?';
        const [rows] = await db.execute(query, [email]);
        return rows[0] || null;
    }
    
    static async findByUsername(username) {
        const query = 'SELECT * FROM users WHERE username = ?';
        const [rows] = await db.execute(query, [username]);
        return rows[0] || null;
    }
    
    static async findById(id) {
        const query = 'SELECT id, firstName, lastName, username, email, role, created_at FROM users WHERE id = ?';
        const [rows] = await db.execute(query, [id]);
        return rows[0] || null;
    }
    
    static async update(id, updateData) {
        const { firstName, lastName, username, email } = updateData;
        
        const query = `
            UPDATE users 
            SET firstName = ?, lastName = ?, username = ?, email = ?
            WHERE id = ?
        `;
        
        const [result] = await db.execute(query, [
            firstName,
            lastName,
            username,
            email,
            id
        ]);
        
        return result.affectedRows > 0;
    }
    
    static async updatePassword(id, newPassword) {
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        
        const query = 'UPDATE users SET password = ? WHERE id = ?';
        const [result] = await db.execute(query, [hashedPassword, id]);
        
        return result.affectedRows > 0;
    }
    
    static async verifyPassword(plainPassword, hashedPassword) {
        return await bcrypt.compare(plainPassword, hashedPassword);
    }
}

module.exports = User;