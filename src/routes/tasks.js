const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const authorizeTask = require('../middleware/authorizeTask');

// Получить все задачи по id пользователя
router.get('/', taskController.getTasks);

// Добавить новую задачу
router.post('/', taskController.createTask);

// Удалить задачу
router.delete('/:id', authorizeTask,  taskController.deleteTask);

// Отметить задачу как выполненную
router.patch('/:id/done', authorizeTask, taskController.updateTaskStatus);

// 🔄 Обновить задачу
router.patch('/:id', authorizeTask, taskController.updateTask);

module.exports = router;
