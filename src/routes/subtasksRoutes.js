const express = require('express');
const router = express.Router();
const subtasksController = require('../controllers/subtasksController');
const authorizeSubTask = require('../middleware/authorizeSubTask');

// 🔹 Обновить статус подзадачи (is_done)
router.patch('/is_done/:id', authorizeSubTask, subtasksController.updateSubtaskStatus);

module.exports = router;
