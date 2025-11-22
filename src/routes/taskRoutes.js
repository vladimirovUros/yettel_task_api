const express = require('express');
const router = express.Router();
const TaskController = require('../controllers/taskController');
const auth = require('../middleware/auth');
const checkRole = require('../middleware/roleCheck');

// POST /api/tasks - Kreiranje taska (samo BASIC user)
router.post('/', auth, TaskController.createTask);

// GET /api/tasks - Listanje taskova sa paginacijom
// Basic user vidi samo svoje, Admin vidi sve
router.get('/', auth, checkRole('basic', 'admin'), TaskController.getTasks);

// GET /api/tasks/:id - Dobijanje pojedinačnog taska
router.get('/:id', auth, checkRole('basic', 'admin'), TaskController.getTask);

// PUT /api/tasks/:id - Update taska
// Basic user može update-ovati samo svoje, Admin može sve
router.put('/:id', auth, checkRole('basic', 'admin'), TaskController.updateTask);

module.exports = router;