const express = require('express');
const router = express.Router();
const taskController = require('./task.controller');
const authorizeTask = require('../../middleware/authorizeTask');
const authorizeSubTask = require('../../middleware/authorizeSubTask');
const authenticate = require('../../middleware/authenticate');

// Получить все задачи по id пользователя
router.get('/', authenticate, (req, res) => taskController.getTasksWithSubTasks(req, res));

// Получить задачи за период
router.get('/period', authenticate, (req, res) => taskController.getTasksForPeriod(req, res));

// Добавить новую задачу
router.post('/', authenticate, (req, res) => taskController.createTask(req, res));

// Удалить задачу
router.delete('/:id', authenticate, authorizeTask, (req, res) =>
  taskController.deleteTask(req, res)
);

// Отметить задачу как выполненную
router.patch('/is_done/:id', authenticate, authorizeTask, (req, res) =>
  taskController.updateTaskStatus(req, res)
);

// 🔄 Обновить задачу
router.patch('/:id', authenticate, authorizeTask, (req, res) =>
  taskController.updateTask(req, res)
);

// Отметить подзадачу как выполненную
router.patch('/subtasks/:id', authenticate, authorizeSubTask, (req, res) =>
  taskController.updateSubtaskStatus(req, res)
);

module.exports = router;
