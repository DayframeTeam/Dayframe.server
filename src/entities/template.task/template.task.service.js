const templateTaskModel = require('./models/template.task.model');
const templateSubtaskModel = require('./models/template.subtask.model');

class TemplateTaskService {
  async getFullTemplateTaskById(taskId) {
    try {
      const [rows] = await templateTaskModel.getTemplateTaskById(taskId);
      const task = rows[0];
      if (!task)
        return {
          status: 404,
          data: { error: 'Не удалось получить шаблон задачи' },
        };

      const [subtasks] =
        await templateSubtaskModel.getAllTemplateSubtasksByParentTemplateTaskId(
          taskId,
        );
      return {
        ...task,
        subtasks: subtasks || [],
      };
    } catch (error) {
      console.error(`Ошибка при получении шаблона задачи ${taskId}:`, error);
      return null;
    }
  }

  async getTemplateTasksWithSubTasks(userId) {
    try {
      const [rows] = await templateTaskModel.getAllTemplateTasksByUser(userId);
      if (!rows.length) {
        return { status: 404, data: { error: 'Шаблоны задач не найдены' } };
      }

      const fullTasks = [];
      for (const task of rows) {
        try {
          const fullTask = await this.getFullTemplateTaskById(task.id);
          if (fullTask) {
            fullTasks.push(fullTask);
          }
        } catch (err) {
          console.error(`Ошибка при получении шаблона задачи ${task.id}:`, err);
        }
      }

      return { status: 200, data: fullTasks };
    } catch (err) {
      console.error(
        '❌ Ошибка при получении шаблонов задач с подзадачами:',
        err,
      );
      return { status: 500, data: { error: err.message } };
    }
  }

  async createTemplateTask(userId, templateTask) {
    try {
      const task = { ...templateTask, user_id: userId };
      const [result] = await templateTaskModel.createTemplateTask(task);
      const taskId = result.insertId;

      // Создаем подзадачи, если они есть
      const subtasks = templateTask.subtasks ?? [];
      const promises = [];

      for (const sub of subtasks) {
        // Добавляем только не удаленные подзадачи
        if (!sub.is_deleted) {
          promises.push(
            templateSubtaskModel.addTemplateSubtask(userId, {
              ...sub,
              template_task_id: taskId,
            }),
          );
        }
      }

      // Ждём, пока все операции над подзадачами завершатся
      if (promises.length > 0) {
        await Promise.all(promises);
      }

      const fullTask = await this.getFullTemplateTaskById(taskId);

      if (!fullTask) {
        return {
          status: 404,
          data: { error: 'Шаблон задачи не найден после создания' },
        };
      }

      return { status: 201, data: fullTask };
    } catch (err) {
      console.error('❌ Ошибка при создании шаблона задачи:', err);
      return { status: 500, data: { error: err.message } };
    }
  }

  async deleteTemplateTask(taskId) {
    try {
      const [result] = await templateTaskModel.deleteTemplateTaskById(taskId);
      if (result.affectedRows === 0) {
        return {
          status: 404,
          data: { error: 'Шаблон задачи не найден или уже удален' },
        };
      }
      return {
        status: 200,
        data: { message: '✅ Шаблон задачи успешно удален', id: taskId },
      };
    } catch (err) {
      console.error('❌ Ошибка при удалении шаблона задачи:', err);
      return {
        status: 500,
        data: { error: 'Ошибка при удалении шаблона задачи' },
      };
    }
  }

  async updateTemplateTask(taskId, updatedTask) {
    try {
      // 1) Обновляем саму задачу
      await templateTaskModel.updateTemplateTaskById(taskId, updatedTask);

      // 2) Готовим обработку подзадач
      const subtasks = updatedTask.subtasks ?? [];
      let needReopen = false;
      const promises = [];

      for (const sub of subtasks) {
        // новая подзадача
        if (!sub.id && !sub.is_deleted) {
          needReopen = true;
          promises.push(
            templateSubtaskModel.addTemplateSubtask(updatedTask.user_id, {
              ...sub,
              template_task_id: taskId,
            }),
          );

          // удаление подзадачи
        } else if (sub.id && sub.is_deleted) {
          promises.push(templateSubtaskModel.deleteTemplateSubtaskById(sub.id));

          // обновление существующей подзадачи
        } else if (sub.id) {
          promises.push(
            templateSubtaskModel.updateTemplateSubtask(
              sub.id,
              sub.title,
              sub.position,
            ),
          );
        }
      }

      // 3) Ждём, пока все операции над подзадачами завершатся
      await Promise.all(promises);

      // 4) Получаем и возвращаем обновленный шаблон задачи
      const updatedFullTask = await this.getFullTemplateTaskById(taskId);

      return {
        status: 200,
        data: {
          task: updatedFullTask,
        },
      };
    } catch (err) {
      console.error('❌ Ошибка при обновлении шаблона задачи и подзадач:', err);
      return { status: 500, data: { error: err.message } };
    }
  }
}

// Create a singleton instance
const templateTaskService = new TemplateTaskService();

// Export the instance
module.exports = templateTaskService;
