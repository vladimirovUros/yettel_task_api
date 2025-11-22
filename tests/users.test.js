const request = require('supertest');
const app = require('../src/app');
const { setupTestDatabase, teardownTestDatabase, cleanDatabase } = require('./setup');
const { createAuthenticatedUser } = require('./helpers');

process.env.DB_NAME = process.env.DB_NAME_TEST;

describe('User Endpoints', () => {
    beforeAll(async () => {
        await setupTestDatabase();
    });
    
    afterAll(async () => {
        await teardownTestDatabase();
    });
    
    beforeEach(async () => {
        await cleanDatabase();
    });
    
    describe('GET /api/users/:id', () => {
        it('should get own user data as basic user', async () => {
            const { user, token } = await createAuthenticatedUser(app, 'basic');
            
            const response = await request(app)
                .get(`/api/users/${user.id}`)
                .set('Authorization', `Bearer ${token}`);
            
            expect(response.status).toBe(200);
            expect(response.body.user).toHaveProperty('id', user.id);
            expect(response.body.user).toHaveProperty('email', user.email);
            expect(response.body.user).not.toHaveProperty('password');
        });
        
        it('should fail to get other user data as basic user', async () => {
            const { user: user1, token: token1 } = await createAuthenticatedUser(app, 'basic');
            const { user: user2 } = await createAuthenticatedUser(app, 'basic');
            
            const response = await request(app)
                .get(`/api/users/${user2.id}`)
                .set('Authorization', `Bearer ${token1}`);
            
            expect(response.status).toBe(403);
            expect(response.body).toHaveProperty('error', 'Access forbidden. You can only view your own data.');
        });
        
        it('should get any user data as admin', async () => {
            const { user: basicUser } = await createAuthenticatedUser(app, 'basic');
            const { token: adminToken } = await createAuthenticatedUser(app, 'admin');
            
            const response = await request(app)
                .get(`/api/users/${basicUser.id}`)
                .set('Authorization', `Bearer ${adminToken}`);
            
            expect(response.status).toBe(200);
            expect(response.body.user).toHaveProperty('id', basicUser.id);
        });
        
        it('should return 404 for non-existent user', async () => {
            const { token } = await createAuthenticatedUser(app, 'admin');
            
            const response = await request(app)
                .get('/api/users/99999')
                .set('Authorization', `Bearer ${token}`);
            
            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('error', 'User not found.');
        });
        
        it('should fail without authentication', async () => {
            const response = await request(app)
                .get('/api/users/1');
            
            expect(response.status).toBe(401);
            expect(response.body).toHaveProperty('error', 'Access denied. No token provided.');
        });
    });
    
    describe('PUT /api/users/:id', () => {
        it('should update own user data as basic user', async () => {
            const { user, token } = await createAuthenticatedUser(app, 'basic');
            
            const updateData = {
                firstName: 'Updated',
                lastName: 'Name',
                username: 'updated_username',
                email: 'updated@example.com'
            };
            
            const response = await request(app)
                .put(`/api/users/${user.id}`)
                .set('Authorization', `Bearer ${token}`)
                .send(updateData);
            
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('message', 'User updated successfully.');
            expect(response.body.user).toHaveProperty('firstName', 'Updated');
            expect(response.body.user).toHaveProperty('email', 'updated@example.com');
        });
        
        it('should update partially (only some fields)', async () => {
            const { user, token } = await createAuthenticatedUser(app, 'basic');
            
            const response = await request(app)
                .put(`/api/users/${user.id}`)
                .set('Authorization', `Bearer ${token}`)
                .send({
                    firstName: 'OnlyFirstName'
                });
            
            expect(response.status).toBe(200);
            expect(response.body.user).toHaveProperty('firstName', 'OnlyFirstName');
            expect(response.body.user).toHaveProperty('lastName', user.lastName);
        });
        
        it('should fail to update other user data as basic user', async () => {
            const { user: user1, token: token1 } = await createAuthenticatedUser(app, 'basic');
            const { user: user2 } = await createAuthenticatedUser(app, 'basic');
            
            const response = await request(app)
                .put(`/api/users/${user2.id}`)
                .set('Authorization', `Bearer ${token1}`)
                .send({
                    firstName: 'Hacked'
                });
            
            expect(response.status).toBe(403);
            expect(response.body).toHaveProperty('error', 'Access forbidden. You can only update your own data.');
        });
        
        it('should update any user data as admin', async () => {
            const { user: basicUser } = await createAuthenticatedUser(app, 'basic');
            const { token: adminToken } = await createAuthenticatedUser(app, 'admin');
            
            const response = await request(app)
                .put(`/api/users/${basicUser.id}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    firstName: 'AdminUpdated'
                });
            
            expect(response.status).toBe(200);
            expect(response.body.user).toHaveProperty('firstName', 'AdminUpdated');
        });
        
        it('should fail with duplicate email', async () => {
            const { user: user1, token: token1 } = await createAuthenticatedUser(app, 'basic');
            const { user: user2 } = await createAuthenticatedUser(app, 'basic');
            
            const response = await request(app)
                .put(`/api/users/${user1.id}`)
                .set('Authorization', `Bearer ${token1}`)
                .send({
                    email: user2.email
                });
            
            expect(response.status).toBe(409);
            expect(response.body).toHaveProperty('error', 'Email already exists.');
        });
        
        it('should fail with duplicate username', async () => {
            const { user: user1, token: token1 } = await createAuthenticatedUser(app, 'basic');
            const { user: user2 } = await createAuthenticatedUser(app, 'basic');
            
            const response = await request(app)
                .put(`/api/users/${user1.id}`)
                .set('Authorization', `Bearer ${token1}`)
                .send({
                    username: user2.username
                });
            
            expect(response.status).toBe(409);
            expect(response.body).toHaveProperty('error', 'Username already exists.');
        });
        
        it('should fail with invalid email format', async () => {
            const { user, token } = await createAuthenticatedUser(app, 'basic');
            
            const response = await request(app)
                .put(`/api/users/${user.id}`)
                .set('Authorization', `Bearer ${token}`)
                .send({
                    email: 'invalid-email'
                });
            
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error', 'Invalid email format.');
        });
        
        it('should fail with no fields provided', async () => {
            const { user, token } = await createAuthenticatedUser(app, 'basic');
            
            const response = await request(app)
                .put(`/api/users/${user.id}`)
                .set('Authorization', `Bearer ${token}`)
                .send({});
            
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error', 'At least one field must be provided for update.');
        });
        
        it('should return 404 for non-existent user', async () => {
            const { token } = await createAuthenticatedUser(app, 'admin');
            
            const response = await request(app)
                .put('/api/users/99999')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    firstName: 'Test'
                });
            
            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('error', 'User not found.');
        });
    });
});