const templateTaskService = require('./template.task.service');

class TemplateTaskController {
  getTemplateTasksWithSubTasks(req, res) {
    const userId = Number(req.headers['user-id']);
    if (!userId) {
      return res.status(400).json({ error: 'Не передан user-id в заголовке' });
    }

    templateTaskService.getTemplateTasksWithSubTasks(userId).then((result) => {
      res.status(result.status).json(result.data);
    });
  }

  createTemplateTask(req, res) {
    const userId = Number(req.headers['user-id']);
    if (!userId)
      return res.status(400).json({ error: 'Не передан user-id в заголовке' });

    templateTaskService.createTemplateTask(userId, req.body).then((result) => {
      res.status(result.status).json(result.data);
    });
  }

  deleteTemplateTask(req, res) {
    const taskId = Number(req.params.id);

    templateTaskService.deleteTemplateTask(taskId).then((result) => {
      res.status(result.status).json(result.data);
    });
  }

  async updateTemplateTask(req, res) {
    const taskId = Number(req.params.id);
    const updatedTask = req.body;

    try {
      const result = await templateTaskService.updateTemplateTask(taskId, updatedTask);
      res.status(result.status).json(result.data);
    } catch (err) {
      console.error('❌ Ошибка при обновлении шаблона задачи и подзадач:', err);
      res.status(500).json({ error: 'Ошибка при обновлении шаблона задачи' });
    }
  }
}

module.exports = new TemplateTaskController();
