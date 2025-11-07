const express = require('express');
const router = express.Router();
const botController = require('./bot.controller');

// Получить задачи на конкретную дату по chat_id
// Route: GET /bot/tasks/:chat_id?date=YYYY-MM-DD
// If date is not provided, returns tasks for today
//TODO:: authenticate придумать для бота
router.get('/tasks/:chat_id', (req, res) => botController.getTasksForDateByChatId(req, res));

// Deprecated: старый роут для обратной совместимости
//TODO:: authenticate придумать для бота
router.get('/today/:chat_id', (req, res) => botController.getTasksForTodayByChatId(req, res));

module.exports = router;
