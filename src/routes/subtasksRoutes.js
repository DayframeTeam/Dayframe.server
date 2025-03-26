const express = require('express');
const router = express.Router();
const subtasksController = require('../controllers/subtasksController');
const authorizeSubTask = require('../middleware/authorizeSubTask');
const authorizeTask = require('../middleware/authorizeTask');

// 🔹 Получить все подзадачи по id пользователя
router.get('/user/:id', subtasksController.getAllByUserId);

// 🔹 Получить все подзадачи для родительской задачи
router.get('/parent/:id', authorizeTask, subtasksController.getAllByParentTaskId);

// 🔹 Создать подзадачу
router.post('/', authorizeSubTask, subtasksController.createSubtask);

// 🔹 Удалить подзадачу
router.delete('/:id', authorizeSubTask, subtasksController.deleteSubtask);

// 🔹 Обновить статус подзадачи (is_done)
router.patch('/is_done/:id', authorizeSubTask, subtasksController.updateSubtaskStatus);

// 🔹 Обновить title и position подзадачи
router.patch('/:id', authorizeSubTask, subtasksController.updateSubtask);

// ✅ В контроллере на create/delete/update is_done — 
// автоматическая проверка статусов всех подзадач и обновление статуса родителя
// в контроллере функционал проверки если подзадача создана, удалена, или поменяла статус is_done проверяем другие подзадачи в родителе чтобы автоматически отметить родителя как is_done = true или false
module.exports = router;
