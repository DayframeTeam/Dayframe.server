const express = require('express');
const router = express.Router();
const botController = require('./bot.controller');

// Получить задачи на сегодня по chat_id
//TODO:: authenticate придумать для бота
router.get('/today/:chat_id', (req, res) => botController.getTasksForTodayByChatId(req, res));

module.exports = router;
