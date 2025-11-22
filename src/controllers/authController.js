const User = require('../models/User');
const jwt = require('jsonwebtoken');

class AuthController {
    static async register(req, res) {
        try {
            const { firstName, lastName, username, email, password, role } = req.body;

            if (!firstName || !lastName || !username || !email || !password) {
                return res.status(400).json({ 
                    error: 'All fields are required.' 
                });
            }
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return res.status(400).json({ 
                    error: 'Invalid email format.' 
                });
            }
            if (password.length < 6) {
                return res.status(400).json({ 
                    error: 'Password must be at least 6 characters long.' 
                });
            }
            const existingEmail = await User.findByEmail(email);
            if (existingEmail) {
                return res.status(409).json({ 
                    error: 'Email already exists.' 
                });
            }
            const existingUsername = await User.findByUsername(username);
            if (existingUsername) {
                return res.status(409).json({ 
                    error: 'Username already exists.' 
                });
            }
            const validRole = role && ['basic', 'admin'].includes(role) ? role : 'basic';
            
            // Kreiraj usera
            const userId = await User.create({
                firstName,
                lastName,
                username,
                email,
                password,
                role: validRole
            });
            
            const newUser = await User.findById(userId);
            
            res.status(201).json({
                message: 'User registered successfully.',
                user: newUser
            });
            
        } catch (error) {
            console.error('Register error:', error);
            res.status(500).json({ 
                error: 'Internal server error.' 
            });
        }
    }
    
    static async login(req, res) {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                return res.status(400).json({ 
                    error: 'Email and password are required.' 
                });
            }
            const user = await User.findByEmail(email);
            if (!user) {
                return res.status(401).json({ 
                    error: 'Invalid email or password.' 
                });
            }
            const isPasswordValid = await User.verifyPassword(password, user.password);
            if (!isPasswordValid) {
                return res.status(401).json({ 
                    error: 'Invalid email or password.' 
                });
            }
            const token = jwt.sign(
                { 
                    id: user.id, 
                    role: user.role 
                },
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRES_IN }
            );
            res.status(200).json({
                message: 'Login successful.',
                token,
                user: {
                    id: user.id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    username: user.username,
                    email: user.email,
                    role: user.role
                }
            });
        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({ 
                error: 'Internal server error.' 
            });
        }
    }
}

module.exports = AuthController;