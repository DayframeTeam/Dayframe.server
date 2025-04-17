const taskService = require('./task.service');

/**
 * Task controller class for handling HTTP requests related to tasks
 */
class TaskController {
  /**
   * Get all tasks with their subtasks for a user
   */
  getTasksWithSubTasks(req, res) {
    const userId = Number(req.headers['user-id']);
    if (!userId) {
      return res.status(400).json({ error: 'Не передан user-id в заголовке' });
    }

    taskService.getTasksWithSubTasks(userId).then((result) => {
      res.status(result.status).json(result.data);
    });
  }

  /**
   * Create a new task
   */
  createTask(req, res) {
    const userId = Number(req.headers['user-id']);
    if (!userId)
      return res.status(400).json({ error: 'Не передан user-id в заголовке' });

    taskService.createTask(userId, req.body).then((result) => {
      res.status(result.status).json(result.data);
    });
  }

  /**
   * Delete a task
   */
  deleteTask(req, res) {
    const taskId = Number(req.params.id);

    taskService.deleteTask(taskId).then((result) => {
      res.status(result.status).json(result.data);
    });
  }

  /**
   * Update a task's completion status
   */
  async updateTaskStatus(req, res) {
    const taskId = Number(req.params.id);
    const { is_done } = req.body;
    const userId = Number(req.headers['user-id']);

    const result = await taskService.updateTaskStatus(taskId, is_done, userId);
    res.status(result.status).json(result.data);
  }

  /**
   * Update an existing task and its subtasks
   */
  async updateTask(req, res) {
    const taskId = Number(req.params.id);
    const updatedTask = req.body;

    try {
      const result = await taskService.updateTask(taskId, updatedTask);

      // If we need to recalculate task status based on subtasks
      await taskService.updateStatusBySubtasks(taskId, req, res);
    } catch (err) {
      console.error('❌ Ошибка при обновлении задачи и подзадач:', err);
      res.status(500).json({ error: 'Ошибка при обновлении задачи' });
    }
  }

  /**
   * Update subtask completion status
   */
  async updateSubtaskStatus(req, res) {
    const subtaskId = Number(req.params.id);
    const { is_done } = req.body;

    // Check input data
    if (typeof is_done !== 'boolean') {
      return res
        .status(400)
        .json({ error: 'Поле is_done должно быть boolean (true/false)' });
    }

    try {
      // Update subtask status
      const subtaskResult = await taskService.updateSubtaskStatus(
        subtaskId,
        is_done,
      );

      if (subtaskResult.status !== 200) {
        return res.status(subtaskResult.status).json(subtaskResult.data);
      }

      // Get the parent task ID
      const parentTaskId = subtaskResult.parentTaskId;

      // Recalculate task status based on subtasks
      await this.updateStatusBySubtasks(parentTaskId, req, res);
    } catch (err) {
      console.error('❌ Ошибка при обновлении подзадачи:', err);
      res.status(500).json({ error: 'Ошибка при обновлении подзадачи' });
    }
  }

  /**
   * Update subtask details
   */
  async updateSubtask(req, res) {
    const subtaskId = Number(req.params.id);
    const { title, position, parent_task_id } = req.body;

    if (
      typeof title !== 'string' ||
      typeof position !== 'number' ||
      typeof parent_task_id !== 'number'
    ) {
      return res.status(400).json({
        error:
          'Неверные поля: title должен быть строкой, position — числом, parent_task_id — числом',
      });
    }

    const result = await taskService.updateSubtask(
      subtaskId,
      title,
      position,
      parent_task_id,
    );
    res.status(result.status).json(result.data);
  }
}

module.exports = new TaskController();
