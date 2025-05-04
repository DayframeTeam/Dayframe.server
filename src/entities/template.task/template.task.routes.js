const express = require('express');
const router = express.Router();
const templateTaskController = require('./template.task.controller');
const authenticate = require('../../middleware/authenticate');
router.get('/', authenticate, (req, res) => templateTaskController.getTemplateTasksWithSubTasks(req, res));

router.post('/', authenticate, (req, res) => templateTaskController.createTemplateTask(req, res));
router.delete('/:id', authenticate, (req, res) => templateTaskController.deleteTemplateTask(req, res));
router.patch('/:id', authenticate, (req, res) => templateTaskController.updateTemplateTask(req, res));
router.patch('/:id/set_active', authenticate, (req, res) => templateTaskController.toggleActiveTemplateTask(req, res));
module.exports = router;
