const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');

// Получить все задачи
router.get('/', taskController.getTasks);

// Добавить новую задачу
router.post('/', taskController.createTask);

// Удалить задачу
router.delete('/:id', taskController.deleteTask);

// Отметить задачу как выполненную
router.patch('/:id/done', taskController.markAsDone);

module.exports = router;
