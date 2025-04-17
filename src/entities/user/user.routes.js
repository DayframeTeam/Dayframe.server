const express = require('express');
const router = express.Router();
const userController = require('./user.controller');

// Получить данные текущего пользователя
router.get('/me', (req, res) => userController.getCurrentUser(req, res));

module.exports = router;
