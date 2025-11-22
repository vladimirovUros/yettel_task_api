const request = require('supertest');
const app = require('../src/app');
const { setupTestDatabase, teardownTestDatabase, cleanDatabase } = require('./setup');
const { createTestUser } = require('./helpers');

process.env.DB_NAME = process.env.DB_NAME_TEST;

describe('Auth Endpoints', () => {
    beforeAll(async () => {
        await setupTestDatabase();
    });
    
    afterAll(async () => {
        await teardownTestDatabase();
    });
    
    beforeEach(async () => {
        await cleanDatabase();
    });
    
    describe('POST /api/auth/register', () => {
        it('should register a new basic user successfully', async () => {
            const userData = {
                firstName: 'Marko',
                lastName: 'Markovic',
                username: 'marko123',
                email: 'marko@example.com',
                password: 'marko123',
                role: 'basic'
            };
            
            const response = await request(app)
                .post('/api/auth/register')
                .send(userData);
            
            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('message', 'User registered successfully.');
            expect(response.body.user).toHaveProperty('id');
            expect(response.body.user).toHaveProperty('email', userData.email);
            expect(response.body.user).toHaveProperty('role', 'basic');
            expect(response.body.user).not.toHaveProperty('password');
        });
        
        it('should register a new admin user successfully', async () => {
            const userData = {
                firstName: 'Ana',
                lastName: 'Admin',
                username: 'ana_admin',
                email: 'ana@example.com',
                password: 'admin123',
                role: 'admin'
            };
            
            const response = await request(app)
                .post('/api/auth/register')
                .send(userData);
            
            expect(response.status).toBe(201);
            expect(response.body.user).toHaveProperty('role', 'admin');
        });
        
        it('should fail if required fields are missing', async () => {
            const response = await request(app)
                .post('/api/auth/register')
                .send({
                    firstName: 'Test',
                    email: 'test@example.com'
                });
            
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error', 'All fields are required.');
        });
        
        it('should fail if email format is invalid', async () => {
            const response = await request(app)
                .post('/api/auth/register')
                .send({
                    firstName: 'Test',
                    lastName: 'User',
                    username: 'testuser',
                    email: 'invalid-email',
                    password: 'test123'
                });
            
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error', 'Invalid email format.');
        });
        
        it('should fail if password is too short', async () => {
            const response = await request(app)
                .post('/api/auth/register')
                .send({
                    firstName: 'Test',
                    lastName: 'User',
                    username: 'testuser',
                    email: 'test@example.com',
                    password: '123'
                });
            
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error', 'Password must be at least 6 characters long.');
        });
        
        it('should fail if email already exists', async () => {
            const userData = {
                firstName: 'Test',
                lastName: 'User',
                username: 'testuser1',
                email: 'duplicate@example.com',
                password: 'test123'
            };
            
            await request(app)
                .post('/api/auth/register')
                .send(userData);
            
            const response = await request(app)
                .post('/api/auth/register')
                .send({
                    ...userData,
                    username: 'testuser2'
                });
            
            expect(response.status).toBe(409);
            expect(response.body).toHaveProperty('error', 'Email already exists.');
        });
        
        it('should fail if username already exists', async () => {
            const userData = {
                firstName: 'Test',
                lastName: 'User',
                username: 'duplicateuser',
                email: 'test1@example.com',
                password: 'test123'
            };
            
            await request(app)
                .post('/api/auth/register')
                .send(userData);
            
            const response = await request(app)
                .post('/api/auth/register')
                .send({
                    ...userData,
                    email: 'test2@example.com'
                });
            
            expect(response.status).toBe(409);
            expect(response.body).toHaveProperty('error', 'Username already exists.');
        });
    });
    
    describe('POST /api/auth/login', () => {
        it('should login successfully with valid credentials', async () => {

            const { userData } = await createTestUser(app);
            
            // Login
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: userData.email,
                    password: userData.password
                });
            
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('message', 'Login successful.');
            expect(response.body).toHaveProperty('token');
            expect(response.body.token).toBeTruthy();
            expect(response.body).toHaveProperty('user');
            expect(response.body.user).toHaveProperty('email', userData.email);
            expect(response.body.user).not.toHaveProperty('password');
        });
        
        it('should fail with invalid email', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'nonexistent@example.com',
                    password: 'test123'
                });
            
            expect(response.status).toBe(401);
            expect(response.body).toHaveProperty('error', 'Invalid email or password.');
        });
        
        it('should fail with invalid password', async () => {
            const { userData } = await createTestUser(app);
            
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: userData.email,
                    password: 'wrongpassword'
                });
            
            expect(response.status).toBe(401);
            expect(response.body).toHaveProperty('error', 'Invalid email or password.');
        });
        
        it('should fail if email is missing', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    password: 'test123'
                });
            
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error', 'Email and password are required.');
        });
        
        it('should fail if password is missing', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'test@example.com'
                });
            
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error', 'Email and password are required.');
        });
    });
});