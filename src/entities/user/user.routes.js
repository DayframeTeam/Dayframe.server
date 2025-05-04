const express = require('express');
const router = express.Router();
const userController = require('./user.controller');
const authenticate = require('../../middleware/authenticate');

// Получить данные текущего пользователя
router.get('/me', authenticate, (req, res) => userController.getCurrentUser(req, res));

module.exports = router;
