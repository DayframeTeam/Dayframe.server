const express = require('express');
const router = express.Router();
const authorizeTemplateTask = require('../middleware/authorizeTask');
const templateTasksController = require('../controllers/templateTasksController');

router.get('/', templateTasksController.getTemplateTasks);
router.post('/', templateTasksController.createTemplateTask);
router.delete('/:id', authorizeTemplateTask,  templateTasksController.deleteTemplateTask);
router.patch('/:id', authorizeTemplateTask, templateTasksController.updateTemplateTask);

module.exports = router;
