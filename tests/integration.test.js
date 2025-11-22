const request = require('supertest');
const app = require('../src/app');
const { setupTestDatabase, teardownTestDatabase, cleanDatabase } = require('./setup');

process.env.DB_NAME = process.env.DB_NAME_TEST;

describe('E2E Integration Tests - Complete User Flow', () => {
    beforeAll(async () => {
        await setupTestDatabase();
    });
    
    afterAll(async () => {
        await teardownTestDatabase();
    });
    
    beforeEach(async () => {
        await cleanDatabase();
    });
    
    describe('Complete Basic User Flow', () => {
        it('should complete entire basic user workflow', async () => {
            const registerResponse = await request(app)
                .post('/api/auth/register')
                .send({
                    firstName: 'John',
                    lastName: 'Doe',
                    username: 'johndoe',
                    email: 'john@example.com',
                    password: 'john123',
                    role: 'basic'
                });
            
            expect(registerResponse.status).toBe(201);
            const userId = registerResponse.body.user.id;

            const loginResponse = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'john@example.com',
                    password: 'john123'
                });
            
            expect(loginResponse.status).toBe(200);
            const token = loginResponse.body.token;
            expect(token).toBeTruthy();
            
            const task1 = await request(app)
                .post('/api/tasks')
                .set('Authorization', `Bearer ${token}`)
                .send({ body: 'Buy groceries' });
            
            expect(task1.status).toBe(201);
            const taskId = task1.body.task.id;
            
            await request(app)
                .post('/api/tasks')
                .set('Authorization', `Bearer ${token}`)
                .send({ body: 'Call dentist' });
            
            await request(app)
                .post('/api/tasks')
                .set('Authorization', `Bearer ${token}`)
                .send({ body: 'Finish project' });
            
            const tasksResponse = await request(app)
                .get('/api/tasks')
                .set('Authorization', `Bearer ${token}`);
            
            expect(tasksResponse.status).toBe(200);
            expect(tasksResponse.body.tasks).toHaveLength(3);
            expect(tasksResponse.body.pagination.totalTasks).toBe(3);
            
            const singleTaskResponse = await request(app)
                .get(`/api/tasks/${taskId}`)
                .set('Authorization', `Bearer ${token}`);
            
            expect(singleTaskResponse.status).toBe(200);
            expect(singleTaskResponse.body.task.body).toBe('Buy groceries');
            
            const updateTaskResponse = await request(app)
                .put(`/api/tasks/${taskId}`)
                .set('Authorization', `Bearer ${token}`)
                .send({ body: 'Buy groceries and fruits' });
            
            expect(updateTaskResponse.status).toBe(200);
            expect(updateTaskResponse.body.task.body).toBe('Buy groceries and fruits');
            
            const updateUserResponse = await request(app)
                .put(`/api/users/${userId}`)
                .set('Authorization', `Bearer ${token}`)
                .send({
                    firstName: 'Jonathan',
                    lastName: 'Doe Updated'
                });
            
            expect(updateUserResponse.status).toBe(200);
            expect(updateUserResponse.body.user.firstName).toBe('Jonathan');
            
            const getUserResponse = await request(app)
                .get(`/api/users/${userId}`)
                .set('Authorization', `Bearer ${token}`);
            
            expect(getUserResponse.status).toBe(200);
            expect(getUserResponse.body.user.firstName).toBe('Jonathan');
        });
    });
    
    describe('Complete Admin User Flow', () => {
        it('should complete entire admin workflow with access to all resources', async () => {
            const basicRegister = await request(app)
                .post('/api/auth/register')
                .send({
                    firstName: 'Basic',
                    lastName: 'User',
                    username: 'basicuser',
                    email: 'basic@example.com',
                    password: 'basic123',
                    role: 'basic'
                });
            
            const basicUserId = basicRegister.body.user.id;
            
            const basicLogin = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'basic@example.com',
                    password: 'basic123'
                });
            
            const basicToken = basicLogin.body.token;
            
            const basicTask1 = await request(app)
                .post('/api/tasks')
                .set('Authorization', `Bearer ${basicToken}`)
                .send({ body: 'Basic user task 1' });
            
            await request(app)
                .post('/api/tasks')
                .set('Authorization', `Bearer ${basicToken}`)
                .send({ body: 'Basic user task 2' });
            
            const basicTaskId = basicTask1.body.task.id;
            
            await request(app)
                .post('/api/auth/register')
                .send({
                    firstName: 'Admin',
                    lastName: 'User',
                    username: 'adminuser',
                    email: 'admin@example.com',
                    password: 'admin123',
                    role: 'admin'
                });
            
            const adminLogin = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'admin@example.com',
                    password: 'admin123'
                });
            
            const adminToken = adminLogin.body.token;
            
            const adminCreateTask = await request(app)
                .post('/api/tasks')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ body: 'Admin task' });
            
            expect(adminCreateTask.status).toBe(403);
            expect(adminCreateTask.body.error).toBe('Admins cannot create tasks.');
            
            const adminTasksResponse = await request(app)
                .get('/api/tasks')
                .set('Authorization', `Bearer ${adminToken}`);
            
            expect(adminTasksResponse.status).toBe(200);
            expect(adminTasksResponse.body.tasks.length).toBeGreaterThanOrEqual(2);
            
            const adminViewTask = await request(app)
                .get(`/api/tasks/${basicTaskId}`)
                .set('Authorization', `Bearer ${adminToken}`);
            
            expect(adminViewTask.status).toBe(200);
            expect(adminViewTask.body.task.body).toBe('Basic user task 1');
            
            const adminUpdateTask = await request(app)
                .put(`/api/tasks/${basicTaskId}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ body: 'Admin updated this task' });
            
            expect(adminUpdateTask.status).toBe(200);
            expect(adminUpdateTask.body.task.body).toBe('Admin updated this task');
            
            const adminViewUser = await request(app)
                .get(`/api/users/${basicUserId}`)
                .set('Authorization', `Bearer ${adminToken}`);
            
            expect(adminViewUser.status).toBe(200);
            expect(adminViewUser.body.user.email).toBe('basic@example.com');

            const adminUpdateUser = await request(app)
                .put(`/api/users/${basicUserId}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    firstName: 'BasicUpdatedByAdmin'
                });
            
            expect(adminUpdateUser.status).toBe(200);
            expect(adminUpdateUser.body.user.firstName).toBe('BasicUpdatedByAdmin');
        });
    });
    
    describe('Multiple Users Isolation Test', () => {
        it('should ensure users can only access their own resources', async () => {
            const user1Register = await request(app)
                .post('/api/auth/register')
                .send({
                    firstName: 'User',
                    lastName: 'One',
                    username: 'userone',
                    email: 'user1@example.com',
                    password: 'user123',
                    role: 'basic'
                });
            
            const user1Id = user1Register.body.user.id;
            
            const user1Login = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'user1@example.com',
                    password: 'user123'
                });
            
            const user1Token = user1Login.body.token;
            
            const user1Task = await request(app)
                .post('/api/tasks')
                .set('Authorization', `Bearer ${user1Token}`)
                .send({ body: 'User 1 Task' });
            
            const user1TaskId = user1Task.body.task.id;
            
            const user2Register = await request(app)
                .post('/api/auth/register')
                .send({
                    firstName: 'User',
                    lastName: 'Two',
                    username: 'usertwo',
                    email: 'user2@example.com',
                    password: 'user223',
                    role: 'basic'
                });
            
            const user2Id = user2Register.body.user.id;
            
            const user2Login = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'user2@example.com',
                    password: 'user223'
                });
            
            const user2Token = user2Login.body.token;
            
            await request(app)
                .post('/api/tasks')
                .set('Authorization', `Bearer ${user2Token}`)
                .send({ body: 'User 2 Task' });
            
            const accessTaskResponse = await request(app)
                .get(`/api/tasks/${user1TaskId}`)
                .set('Authorization', `Bearer ${user2Token}`);
            
            expect(accessTaskResponse.status).toBe(403);
            
            const updateTaskResponse = await request(app)
                .put(`/api/tasks/${user1TaskId}`)
                .set('Authorization', `Bearer ${user2Token}`)
                .send({ body: 'Hacked' });
            
            expect(updateTaskResponse.status).toBe(403);
            
            const viewUserResponse = await request(app)
                .get(`/api/users/${user1Id}`)
                .set('Authorization', `Bearer ${user2Token}`);
            
            expect(viewUserResponse.status).toBe(403);
            
            const updateUserResponse = await request(app)
                .put(`/api/users/${user1Id}`)
                .set('Authorization', `Bearer ${user2Token}`)
                .send({ firstName: 'Hacked' });
            
            expect(updateUserResponse.status).toBe(403);
            
            const user2Tasks = await request(app)
                .get('/api/tasks')
                .set('Authorization', `Bearer ${user2Token}`);
            
            expect(user2Tasks.body.tasks).toHaveLength(1);
            expect(user2Tasks.body.tasks[0].body).toBe('User 2 Task');
        });
    });
    //     it('should correctly paginate and sort tasks across pages', async () => {
    //         const { body: { user } } = await request(app)
    //             .post('/api/auth/register')
    //             .send({
    //                 firstName: 'Test',
    //                 lastName: 'User',
    //                 username: 'testuser',
    //                 email: 'test@example.com',
    //                 password: 'test123',
    //                 role: 'basic'
    //             });
            
    //         const { body: { token } } = await request(app)
    //             .post('/api/auth/login')
    //             .send({
    //                 email: 'test@example.com',
    //                 password: 'test123'
    //             });
            
    //         for (let i = 1; i <= 10; i++) {
    //             await request(app)
    //                 .post('/api/tasks')
    //                 .set('Authorization', `Bearer ${token}`)
    //                 .send({ body: `Task ${i}` });
    //             await new Promise(resolve => setTimeout(resolve, 10));
    //         }
            
    //         const page1 = await request(app)
    //             .get('/api/tasks?page=1&limit=3&sort=DESC')
    //             .set('Authorization', `Bearer ${token}`);
            
    //         expect(page1.body.tasks).toHaveLength(3);
    //         expect(page1.body.pagination.totalPages).toBe(4);
    //         expect(page1.body.pagination.totalTasks).toBe(10);
            
    //         expect(page1.body.tasks[0].id).toBeGreaterThanOrEqual(page1.body.tasks[1].id);
    //         expect(page1.body.tasks[1].id).toBeGreaterThanOrEqual(page1.body.tasks[2].id);
            
    //         const page2 = await request(app)
    //             .get('/api/tasks?page=2&limit=3&sort=DESC')
    //             .set('Authorization', `Bearer ${token}`);
            
    //         expect(page2.body.tasks[0].id).toBeLessThanOrEqual(page1.body.tasks[2].id);
            
    //         const ascTasks = await request(app)
    //             .get('/api/tasks?sort=ASC')
    //             .set('Authorization', `Bearer ${token}`);
            
    //         expect(ascTasks.body.tasks[0].id).toBeLessThanOrEqual(ascTasks.body.tasks[9].id);
    //     });
    // });
});