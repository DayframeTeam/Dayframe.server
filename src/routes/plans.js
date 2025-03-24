const express = require('express');
const router = express.Router();
const planController = require('../controllers/planController');

// Получить все планы пользователя
router.get('/:userId', planController.getPlansByUser);

// Добавить новый план
router.post('/', planController.createPlan);

// Удалить план по ID
router.delete('/:id', planController.deletePlan);

module.exports = router;
