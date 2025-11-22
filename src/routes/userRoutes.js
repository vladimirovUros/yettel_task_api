const express = require('express');
const router = express.Router();
const UserController = require('../controllers/userController');
const auth = require('../middleware/auth');

// Sve user rute zahtevaju autentikaciju
// Basic user može pristupiti samo svojim podacima
// Admin može pristupiti svim podacima

// GET /api/users/:id - Dobijanje user podataka
router.get('/:id', auth, UserController.getUser);

// PUT /api/users/:id - Update user podataka
router.put('/:id', auth, UserController.updateUser);

module.exports = router;