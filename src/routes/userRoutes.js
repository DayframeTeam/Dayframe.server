const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Получить данные текущего пользователя
router.get('/me', userController.getCurrentUser);

module.exports = router;
