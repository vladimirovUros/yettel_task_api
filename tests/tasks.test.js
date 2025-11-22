const request = require('supertest');
const app = require('../src/app');
const { setupTestDatabase, teardownTestDatabase, cleanDatabase } = require('./setup');
const { createAuthenticatedUser, createTestTask } = require('./helpers');

process.env.DB_NAME = process.env.DB_NAME_TEST;

describe('Task Endpoints', () => {
    beforeAll(async () => {
        await setupTestDatabase();
    });
    
    afterAll(async () => {
        await teardownTestDatabase();
    });
    
    beforeEach(async () => {
        await cleanDatabase();
    });
    
    describe('POST /api/tasks', () => {
        it('should create a task as basic user', async () => {
            const { token } = await createAuthenticatedUser(app, 'basic');
            
            const response = await request(app)
                .post('/api/tasks')
                .set('Authorization', `Bearer ${token}`)
                .send({ body: 'Test task' });
            
            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('message', 'Task created successfully.');
            expect(response.body.task).toHaveProperty('id');
            expect(response.body.task).toHaveProperty('body', 'Test task');
            expect(response.body.task).toHaveProperty('userId');
        });
        
        it('should fail to create task as admin', async () => {
            const { token } = await createAuthenticatedUser(app, 'admin');
            
            const response = await request(app)
                .post('/api/tasks')
                .set('Authorization', `Bearer ${token}`)
                .send({ body: 'Admin task' });
            
            expect(response.status).toBe(403);
            expect(response.body).toHaveProperty('error', 'Admins cannot create tasks.');
        });
        
        it('should fail with empty body', async () => {
            const { token } = await createAuthenticatedUser(app, 'basic');
            
            const response = await request(app)
                .post('/api/tasks')
                .set('Authorization', `Bearer ${token}`)
                .send({ body: '' });
            
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error', 'Task body is required.');
        });
        
        it('should fail without authentication', async () => {
            const response = await request(app)
                .post('/api/tasks')
                .send({ body: 'Test task' });
            
            expect(response.status).toBe(401);
            expect(response.body).toHaveProperty('error', 'Access denied. No token provided.');
        });
        
        it('should fail with invalid token', async () => {
            const response = await request(app)
                .post('/api/tasks')
                .set('Authorization', 'Bearer invalid_token')
                .send({ body: 'Test task' });
            
            expect(response.status).toBe(401);
            expect(response.body).toHaveProperty('error', 'Invalid token.');
        });
    });
    
    describe('GET /api/tasks', () => {
        it('should return only own tasks for basic user', async () => {
            const { user: user1, token: token1 } = await createAuthenticatedUser(app, 'basic');
            const { user: user2, token: token2 } = await createAuthenticatedUser(app, 'basic');
            
            await createTestTask(app, token1, 'User 1 Task 1');
            await createTestTask(app, token1, 'User 1 Task 2');
            await createTestTask(app, token1, 'User 1 Task 3');
            
            await createTestTask(app, token2, 'User 2 Task 1');
            await createTestTask(app, token2, 'User 2 Task 2');
            
            const response = await request(app)
                .get('/api/tasks')
                .set('Authorization', `Bearer ${token1}`);
            
            expect(response.status).toBe(200);
            expect(response.body.tasks).toHaveLength(3);
            expect(response.body.pagination).toHaveProperty('totalTasks', 3);
            
            response.body.tasks.forEach(task => {
                expect(task.userId).toBe(user1.id);
            });
        });
        
        it('should return all tasks for admin user', async () => {
            const { token: basicToken } = await createAuthenticatedUser(app, 'basic');
            const { token: adminToken } = await createAuthenticatedUser(app, 'admin');
            
            await createTestTask(app, basicToken, 'Task 1');
            await createTestTask(app, basicToken, 'Task 2');
            await createTestTask(app, basicToken, 'Task 3');
            
            const response = await request(app)
                .get('/api/tasks')
                .set('Authorization', `Bearer ${adminToken}`);
            
            expect(response.status).toBe(200);
            expect(response.body.tasks).toHaveLength(3);
            expect(response.body.pagination).toHaveProperty('totalTasks', 3);
        });
        
        it('should paginate tasks correctly', async () => {
            const { token } = await createAuthenticatedUser(app, 'basic');
            
            for (let i = 1; i <= 5; i++) {
                await createTestTask(app, token, `Task ${i}`);
            }
            
            const response = await request(app)
                .get('/api/tasks?page=1&limit=2')
                .set('Authorization', `Bearer ${token}`);
            
            expect(response.status).toBe(200);
            expect(response.body.tasks).toHaveLength(2);
            expect(response.body.pagination).toMatchObject({
                currentPage: 1,
                totalPages: 3,
                totalTasks: 5,
                tasksPerPage: 2
            });
        });
        
        // it('should sort tasks by newest first (DESC)', async () => {
        //     const { token } = await createAuthenticatedUser(app, 'basic');
            
        //     const task1 = await createTestTask(app, token, 'First Task');
        //     await new Promise(resolve => setTimeout(resolve, 10));
        //     const task2 = await createTestTask(app, token, 'Second Task');
        //     await new Promise(resolve => setTimeout(resolve, 10));
        //     const task3 = await createTestTask(app, token, 'Third Task');
            
        //     const response = await request(app)
        //         .get('/api/tasks?sort=DESC')
        //         .set('Authorization', `Bearer ${token}`);
            
        //     expect(response.status).toBe(200);
        //     expect(response.body.tasks[0].id).toBeGreaterThanOrEqual(response.body.tasks[1].id);
        //     expect(response.body.tasks[1].id).toBeGreaterThanOrEqual(response.body.tasks[2].id);
        // });
        
        it('should sort tasks by oldest first (ASC)', async () => {
            const { token } = await createAuthenticatedUser(app, 'basic');
            
            const task1 = await createTestTask(app, token, 'First Task');
            await new Promise(resolve => setTimeout(resolve, 10));
            const task2 = await createTestTask(app, token, 'Second Task');
            await new Promise(resolve => setTimeout(resolve, 10));
            const task3 = await createTestTask(app, token, 'Third Task');
            
            const response = await request(app)
                .get('/api/tasks?sort=ASC')
                .set('Authorization', `Bearer ${token}`);
            
            expect(response.status).toBe(200);
            expect(response.body.tasks[0].id).toBeLessThanOrEqual(response.body.tasks[1].id);
            expect(response.body.tasks[1].id).toBeLessThanOrEqual(response.body.tasks[2].id);
        });
        
        it('should fail with invalid page parameter', async () => {
            const { token } = await createAuthenticatedUser(app, 'basic');
            
            const response = await request(app)
                .get('/api/tasks?page=0')
                .set('Authorization', `Bearer ${token}`);
            
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error', 'Page must be greater than 0.');
        });
        
        it('should fail with invalid limit parameter', async () => {
            const { token } = await createAuthenticatedUser(app, 'basic');
            
            const response = await request(app)
                .get('/api/tasks?limit=200')
                .set('Authorization', `Bearer ${token}`);
            
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error', 'Limit must be between 1 and 100.');
        });
        
        it('should fail with invalid sort parameter', async () => {
            const { token } = await createAuthenticatedUser(app, 'basic');
            
            const response = await request(app)
                .get('/api/tasks?sort=INVALID')
                .set('Authorization', `Bearer ${token}`);
            
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error', 'Sort order must be ASC or DESC.');
        });
    });
    
    describe('GET /api/tasks/:id', () => {
        it('should get own task as basic user', async () => {
            const { token } = await createAuthenticatedUser(app, 'basic');
            const task = await createTestTask(app, token, 'My Task');
            
            const response = await request(app)
                .get(`/api/tasks/${task.id}`)
                .set('Authorization', `Bearer ${token}`);
            
            expect(response.status).toBe(200);
            expect(response.body.task).toHaveProperty('id', task.id);
            expect(response.body.task).toHaveProperty('body', 'My Task');
        });
        
        it('should fail to get other user task as basic user', async () => {
            const { token: token1 } = await createAuthenticatedUser(app, 'basic');
            const { token: token2 } = await createAuthenticatedUser(app, 'basic');
            
            const task = await createTestTask(app, token1, 'User 1 Task');
            
            const response = await request(app)
                .get(`/api/tasks/${task.id}`)
                .set('Authorization', `Bearer ${token2}`);
            
            expect(response.status).toBe(403);
            expect(response.body).toHaveProperty('error', 'Access forbidden. You can only view your own tasks.');
        });
        
        it('should get any task as admin', async () => {
            const { token: basicToken } = await createAuthenticatedUser(app, 'basic');
            const { token: adminToken } = await createAuthenticatedUser(app, 'admin');
            
            const task = await createTestTask(app, basicToken, 'Basic User Task');
            
            const response = await request(app)
                .get(`/api/tasks/${task.id}`)
                .set('Authorization', `Bearer ${adminToken}`);
            
            expect(response.status).toBe(200);
            expect(response.body.task).toHaveProperty('id', task.id);
        });
        
        it('should return 404 for non-existent task', async () => {
            const { token } = await createAuthenticatedUser(app, 'basic');
            
            const response = await request(app)
                .get('/api/tasks/99999')
                .set('Authorization', `Bearer ${token}`);
            
            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('error', 'Task not found.');
        });
    });
    
    describe('PUT /api/tasks/:id', () => {
        it('should update own task as basic user', async () => {
            const { token } = await createAuthenticatedUser(app, 'basic');
            const task = await createTestTask(app, token, 'Original Task');
            
            const response = await request(app)
                .put(`/api/tasks/${task.id}`)
                .set('Authorization', `Bearer ${token}`)
                .send({ body: 'Updated Task' });
            
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('message', 'Task updated successfully.');
            expect(response.body.task).toHaveProperty('body', 'Updated Task');
        });
        
        it('should fail to update other user task as basic user', async () => {
            const { token: token1 } = await createAuthenticatedUser(app, 'basic');
            const { token: token2 } = await createAuthenticatedUser(app, 'basic');
            
            const task = await createTestTask(app, token1, 'User 1 Task');
            
            const response = await request(app)
                .put(`/api/tasks/${task.id}`)
                .set('Authorization', `Bearer ${token2}`)
                .send({ body: 'Hacked Task' });
            
            expect(response.status).toBe(403);
            expect(response.body).toHaveProperty('error', 'Access forbidden. You can only update your own tasks.');
        });
        
        it('should update any task as admin', async () => {
            const { token: basicToken } = await createAuthenticatedUser(app, 'basic');
            const { token: adminToken } = await createAuthenticatedUser(app, 'admin');
            
            const task = await createTestTask(app, basicToken, 'Basic User Task');
            
            const response = await request(app)
                .put(`/api/tasks/${task.id}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ body: 'Admin Updated Task' });
            
            expect(response.status).toBe(200);
            expect(response.body.task).toHaveProperty('body', 'Admin Updated Task');
        });
        
        it('should fail with empty body', async () => {
            const { token } = await createAuthenticatedUser(app, 'basic');
            const task = await createTestTask(app, token, 'Test Task');
            
            const response = await request(app)
                .put(`/api/tasks/${task.id}`)
                .set('Authorization', `Bearer ${token}`)
                .send({ body: '' });
            
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error', 'Task body is required.');
        });
        
        it('should return 404 for non-existent task', async () => {
            const { token } = await createAuthenticatedUser(app, 'basic');
            
            const response = await request(app)
                .put('/api/tasks/99999')
                .set('Authorization', `Bearer ${token}`)
                .send({ body: 'Updated Task' });
            
            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('error', 'Task not found.');
        });
    });
});