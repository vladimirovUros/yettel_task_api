const request = require('supertest');

const createTestUser = async (app, userData = {}) => {
    const defaultUser = {
        firstName: 'Test',
        lastName: 'User',
        username: `testuser_${Date.now()}`,
        email: `test_${Date.now()}@example.com`,
        password: 'test123',
        role: 'basic'
    };
    
    const user = { ...defaultUser, ...userData };
    
    const response = await request(app)
        .post('/api/auth/register')
        .send(user);
    
    return {
        user: response.body.user,
        userData: user
    };
};

const loginUser = async (app, email, password) => {
    const response = await request(app)
        .post('/api/auth/login')
        .send({ email, password });
    
    return response.body.token;
};

const createTestTask = async (app, token, body = 'Test task') => {
    const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send({ body });
    
    return response.body.task;
};

const createAuthenticatedUser = async (app, role = 'basic') => {
    const { user, userData } = await createTestUser(app, { role });
    const token = await loginUser(app, userData.email, userData.password);
    
    return { user, token, userData };
};

module.exports = {
    createTestUser,
    loginUser,
    createTestTask,
    createAuthenticatedUser
};