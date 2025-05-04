const express = require('express');
const router = express.Router();
const userController = require('./user.controller');

// Получить данные текущего пользователя
// router.get('/me', (req, res) => userController.getCurrentUser(req, res));
// router.get('/getByChatId/:chat_id', (req, res) => userController.getUserByChatId(req, res));
// router.post('/register', (req, res) => userController.registerUser(req, res));
module.exports = router;
