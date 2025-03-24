const express = require('express');
const router = express.Router();
const calendarController = require('../controllers/calendarController');

// Получить все события пользователя
router.get('/:userId', calendarController.getEventsByUser);

// Добавить событие
router.post('/', calendarController.createEvent);

// Удалить событие
router.delete('/:id', calendarController.deleteEvent);

module.exports = router;
