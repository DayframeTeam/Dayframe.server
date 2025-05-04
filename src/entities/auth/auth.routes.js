const express = require('express');
const router = express.Router();
const AuthController = require('./auth.controller');

router.post('/webapp-login/:chat_id', (req, res) => AuthController.webappLogin(req, res));

module.exports = router;
