const express = require('express');
const router = express.Router();
const templateTaskController = require('./template.task.controller');

router.get('/', (req, res) => templateTaskController.getTemplateTasksWithSubTasks(req, res));

router.post('/', (req, res) => templateTaskController.createTemplateTask(req, res));
router.delete('/:id', (req, res) => templateTaskController.deleteTemplateTask(req, res));
router.patch('/:id', (req, res) => templateTaskController.updateTemplateTask(req, res));
router.patch('/:id/set_active', (req, res) => templateTaskController.toggleActiveTemplateTask(req, res));
module.exports = router;
