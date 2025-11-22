const db = require('../config/database');

class Task {
    static async create(taskData) {
        const { body, userId } = taskData;
        
        const query = 'INSERT INTO tasks (body, userId) VALUES (?, ?)';
        const [result] = await db.execute(query, [body, userId]);
        
        return result.insertId;
    }
    
    static async findById(id) {
        const query = `
            SELECT t.*, u.firstName, u.lastName, u.username 
            FROM tasks t
            JOIN users u ON t.userId = u.id
            WHERE t.id = ?
        `;
        const [rows] = await db.execute(query, [id]);
        return rows[0] || null;
    }
    
    static async findAll(options = {}) {
        const {
            userId = null,        // Ako je null, vraća sve taskove (za admina)
            page = 1,             // Trenutna stranica
            limit = 10,           // Koliko taskova po stranici
            sortOrder = 'DESC'    // 'DESC' (najnoviji first) ili 'ASC' (najstariji first)
        } = options;
        
        const order = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
        
        const offset = (page - 1) * limit;
        
        let query = `
            SELECT t.*, u.firstName, u.lastName, u.username 
            FROM tasks t
            JOIN users u ON t.userId = u.id
        `;
        
        const params = [];
        
        if (userId) {
            query += ' WHERE t.userId = ?';
            params.push(userId);
        }
        
        query += ` ORDER BY t.created_at ${order} LIMIT ? OFFSET ?`;
        params.push(limit, offset);
        
        const [rows] = await db.execute(query, params);
        
        let countQuery = 'SELECT COUNT(*) as total FROM tasks';
        const countParams = [];
        
        if (userId) {
            countQuery += ' WHERE userId = ?';
            countParams.push(userId);
        }
        
        const [countResult] = await db.execute(countQuery, countParams);
        const total = countResult[0].total;
        
        return {
            tasks: rows,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalTasks: total,
                tasksPerPage: limit
            }
        };
    }
    
    static async update(id, body) {
        const query = 'UPDATE tasks SET body = ? WHERE id = ?';
        const [result] = await db.execute(query, [body, id]);
        
        return result.affectedRows > 0;
    }
    
    static async belongsToUser(taskId, userId) {
        const query = 'SELECT id FROM tasks WHERE id = ? AND userId = ?';
        const [rows] = await db.execute(query, [taskId, userId]);
        
        return rows.length > 0;
    }
}

module.exports = Task;