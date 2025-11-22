const Task = require('../models/Task');

class TaskController {
    // POST /api/tasks - Kreiranje novog taska (samo BASIC user)
    static async createTask(req, res) {
        try {
            const { body } = req.body;
            const userId = req.user.id;
            const userRole = req.user.role;
            
            if (userRole === 'admin') {
                return res.status(403).json({ 
                    error: 'Admins cannot create tasks.' 
                });
            }
            
            if (!body || body.trim() === '') {
                return res.status(400).json({ 
                    error: 'Task body is required.' 
                });
            }
            
            const taskId = await Task.create({ body, userId });
            
            const newTask = await Task.findById(taskId);
            
            res.status(201).json({
                message: 'Task created successfully.',
                task: newTask
            });
            
        } catch (error) {
            console.error('Create task error:', error);
            res.status(500).json({ 
                error: 'Internal server error.' 
            });
        }
    }
    
    // GET /api/tasks - Listanje taskova sa paginacijom i sortiranjem
    static async getTasks(req, res) {
        try {
            const userId = req.user.id;
            const userRole = req.user.role;
            
            const pageParam = req.query.page ? parseInt(req.query.page) : 1;
            const limitParam = req.query.limit ? parseInt(req.query.limit) : 10;
            const sortOrder = req.query.sort || 'DESC';

            if (req.query.page && (isNaN(pageParam) || pageParam < 1)) {
                return res.status(400).json({ 
                error: 'Page must be greater than 0.' 
            });
            }

            if (req.query.limit && (isNaN(limitParam) || limitParam < 1 || limitParam > 100)) {
                return res.status(400).json({ 
                    error: 'Limit must be between 1 and 100.' 
                });
            }

            if (req.query.sort && !['ASC', 'DESC'].includes(sortOrder.toUpperCase())) {
                return res.status(400).json({ 
                    error: 'Sort order must be ASC or DESC.' 
                });
            }

            const page = pageParam;
            const limit = limitParam;
        
            if (page < 1) {
                return res.status(400).json({ 
                    error: 'Page must be greater than 0.' 
                });
            }
            
            if (limit < 1 || limit > 100) {
                return res.status(400).json({ 
                    error: 'Limit must be between 1 and 100.' 
                });
            }
            
            if (!['ASC', 'DESC'].includes(sortOrder.toUpperCase())) {
                return res.status(400).json({ 
                    error: 'Sort order must be ASC or DESC.' 
                });
            }
            const options = {
                userId: userRole === 'basic' ? userId : null,
                page,
                limit,
                sortOrder
            };
            
            const result = await Task.findAll(options);
            
            res.status(200).json(result);
            
        } catch (error) {
            console.error('Get tasks error:', error);
            res.status(500).json({ 
                error: 'Internal server error.' 
            });
        }
    }
    
    // GET /api/tasks/:id - Dobijanje pojedinačnog taska
    static async getTask(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user.id;
            const userRole = req.user.role;
            
            const task = await Task.findById(id);
            
            if (!task) {
                return res.status(404).json({ 
                    error: 'Task not found.' 
                });
            }
            if (userRole === 'basic' && task.userId !== userId) {
                return res.status(403).json({ 
                    error: 'Access forbidden. You can only view your own tasks.' 
                });
            }
            
            res.status(200).json({ task });
            
        } catch (error) {
            console.error('Get task error:', error);
            res.status(500).json({ 
                error: 'Internal server error.' 
            });
        }
    }
    
    // PUT /api/tasks/:id - Update taska
    static async updateTask(req, res) {
        try {
            const { id } = req.params;
            const { body } = req.body;
            const userId = req.user.id;
            const userRole = req.user.role;

            if (!body || body.trim() === '') {
                return res.status(400).json({ 
                    error: 'Task body is required.' 
                });
            }
            const task = await Task.findById(id);
            if (!task) {
                return res.status(404).json({ 
                    error: 'Task not found.' 
                });
            }
            if (userRole === 'basic' && task.userId !== userId) {
                return res.status(403).json({ 
                    error: 'Access forbidden. You can only update your own tasks.' 
                });
            }
            const updated = await Task.update(id, body);
            
            if (!updated) {
                return res.status(500).json({ 
                    error: 'Failed to update task.' 
                });
            }
            const updatedTask = await Task.findById(id);
            
            res.status(200).json({
                message: 'Task updated successfully.',
                task: updatedTask
            });
        } catch (error) {
            console.error('Update task error:', error);
            res.status(500).json({ 
                error: 'Internal server error.' 
            });
        }
    }
}

module.exports = TaskController;