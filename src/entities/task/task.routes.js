const express = require('express');
const router = express.Router();
const taskController = require('./task.controller');
const authorizeTask = require('../../middleware/authorizeTask');
const authorizeSubTask = require('../../middleware/authorizeSubTask');

// Получить все задачи по id пользователя
router.get('/', (req, res) => taskController.getTasksWithSubTasks(req, res));

// Добавить новую задачу
router.post('/', (req, res) => taskController.createTask(req, res));

// Удалить задачу
router.delete('/:id', authorizeTask, (req, res) => taskController.deleteTask(req, res));

// Отметить задачу как выполненную
router.patch('/is_done/:id', authorizeTask, (req, res) => taskController.updateTaskStatus(req, res));

// 🔄 Обновить задачу
router.patch('/:id', authorizeTask, (req, res) => taskController.updateTask(req, res));

// Отметить подзадачу как выполненную
router.patch('/subtasks/:id', authorizeSubTask, (req, res) =>taskController.updateSubtaskStatus(req, res));

// Обновить данные подзадачи
router.patch('/subtasks/update/:id', authorizeSubTask, (req, res) => taskController.updateSubtask(req, res));

module.exports = router;
