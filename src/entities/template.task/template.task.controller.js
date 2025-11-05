const templateTaskService = require('./template.task.service');

class TemplateTaskController {
  getTemplateTasksWithSubTasks(req, res) {
    const userId = Number(req.user.id);
    if (!userId) {
      return res.status(400).json({ error: 'Не передан user-id в заголовке' });
    }

    // Добавляем общий таймаут 25 секунд (меньше чем 30 секунд на уровне Express)
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Request timeout')), 25000)
    );

    Promise.race([templateTaskService.getTemplateTasksWithSubTasks(userId), timeoutPromise])
      .then((result) => {
        if (res.headersSent) return; // Проверяем, не отправлен ли уже ответ
        res.status(result.status).json(result.data);
      })
      .catch((err) => {
        if (res.headersSent) return; // Проверяем, не отправлен ли уже ответ
        console.error('❌ Ошибка при получении шаблонов задач:', err);
        res.status(500).json({
          error:
            err.message === 'Request timeout'
              ? 'Превышено время ожидания ответа от сервера'
              : 'Ошибка при получении шаблонов задач',
        });
      });
  }

  createTemplateTask(req, res) {
    const userId = Number(req.user.id);
    if (!userId) return res.status(400).json({ error: 'Не передан user-id в заголовке' });

    templateTaskService
      .createTemplateTask(userId, req.body)
      .then((result) => {
        res.status(result.status).json(result.data);
      })
      .catch((err) => {
        console.error('❌ Ошибка при создании шаблона задачи:', err);
        res.status(500).json({ error: 'Ошибка при создании шаблона задачи' });
      });
  }

  deleteTemplateTask(req, res) {
    const taskId = Number(req.params.id);

    templateTaskService
      .deleteTemplateTask(taskId)
      .then((result) => {
        res.status(result.status).json(result.data);
      })
      .catch((err) => {
        console.error('❌ Ошибка при удалении шаблона задачи:', err);
        res.status(500).json({ error: 'Ошибка при удалении шаблона задачи' });
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

  async toggleActiveTemplateTask(req, res) {
    const taskId = Number(req.params.id);
    const is_active = req.body.is_active;

    try {
      const result = await templateTaskService.toggleActiveTemplateTask(taskId, is_active);
      res.status(result.status).json(result.data);
    } catch (err) {
      console.error('❌ Ошибка при обновлении активности шаблона задачи и подзадач:', err);
      res.status(500).json({ error: 'Ошибка при обновлении активности шаблона задачи' });
    }
  }
}

module.exports = new TemplateTaskController();
