const express = require('express');
const router = express.Router();
const AuthController = require('./auth.controller');

router.post('/login', (req, res) => AuthController.webappLogin(req, res));
router.post('/dev-login', (req, res) => AuthController.devLogin(req, res));

module.exports = router;
