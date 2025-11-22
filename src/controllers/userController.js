const User = require('../models/User');

class UserController {
    // GET /api/users/:id - Dobijanje user podataka
    static async getUser(req, res) {
        try {
            const { id } = req.params;
            const requesterId = req.user.id;
            const requesterRole = req.user.role;
            
            if (requesterRole !== 'admin' && parseInt(id) !== requesterId) {
                return res.status(403).json({ 
                    error: 'Access forbidden. You can only view your own data.' 
                });
            }
            
            const user = await User.findById(id);
            
            if (!user) {
                return res.status(404).json({ 
                    error: 'User not found.' 
                });
            }
            
            res.status(200).json({ user });
            
        } catch (error) {
            console.error('Get user error:', error);
            res.status(500).json({ 
                error: 'Internal server error.' 
            });
        }
    }
    
    // PUT /api/users/:id - Update user podataka
    static async updateUser(req, res) {
        try {
            const { id } = req.params;
            const { firstName, lastName, username, email } = req.body;
            const requesterId = req.user.id;
            const requesterRole = req.user.role;
            
            if (requesterRole !== 'admin' && parseInt(id) !== requesterId) {
                return res.status(403).json({ 
                    error: 'Access forbidden. You can only update your own data.' 
                });
            }
            
            const user = await User.findById(id);
            if (!user) {
                return res.status(404).json({ 
                    error: 'User not found.' 
                });
            }
            
            if (!firstName && !lastName && !username && !email) {
                return res.status(400).json({ 
                    error: 'At least one field must be provided for update.' 
                });
            }
            
            if (email) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(email)) {
                    return res.status(400).json({ 
                        error: 'Invalid email format.' 
                    });
                }
                
                const existingEmail = await User.findByEmail(email);
                if (existingEmail && existingEmail.id !== parseInt(id)) {
                    return res.status(409).json({ 
                        error: 'Email already exists.' 
                    });
                }
            }
            
            if (username) {
                const existingUsername = await User.findByUsername(username);
                if (existingUsername && existingUsername.id !== parseInt(id)) {
                    return res.status(409).json({ 
                        error: 'Username already exists.' 
                    });
                }
            }
            
            const updateData = {
                firstName: firstName || user.firstName,
                lastName: lastName || user.lastName,
                username: username || user.username,
                email: email || user.email
            };
            
            const updated = await User.update(id, updateData);
            
            if (!updated) {
                return res.status(500).json({ 
                    error: 'Failed to update user.' 
                });
            }
            
            const updatedUser = await User.findById(id);
            
            res.status(200).json({
                message: 'User updated successfully.',
                user: updatedUser
            });
            
        } catch (error) {
            console.error('Update user error:', error);
            res.status(500).json({ 
                error: 'Internal server error.' 
            });
        }
    }
}

module.exports = UserController;