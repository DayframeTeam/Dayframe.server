const express = require('express');
const router = express.Router();
const templateSubtasksController = require('../controllers/templateSubtasksController');
const authorizeTemplateSubTask = require('../middleware/authorizeTemplateSubTask');
const authorizeTemplateTask = require('../middleware/authorizeTemplateTask');

// 🔹 Получить все шаблоны подзадач по id пользователя
router.get('/user/:id', templateSubtasksController.getAllByUserId);

// 🔹 Получить все шаблоны подзадач для родительской задачи
router.get('/parent/:id', authorizeTemplateTask, templateSubtasksController.getAllByParentId);

// 🔹 Создать шаблон подзадачи
router.post('/', authorizeTemplateSubTask, templateSubtasksController.createTemplateSubtask);

// 🔹 Удалить шаблон подзадачи
router.delete('/:id', authorizeTemplateSubTask, templateSubtasksController.deleteTemplateSubtask);

// 🔹 Обновить статус шаблона подзадачи (is_done)
router.patch('/is_done/:id', authorizeTemplateSubTask, templateSubtasksController.updateTemplateSubtaskStatus);

// 🔹 Обновить title и position шаблона подзадачи
router.patch('/:id', authorizeTemplateSubTask, templateSubtasksController.updateTemplateSubtask);

module.exports = router;
