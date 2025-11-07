const taskService = require('./task.service');

/**
 * Task controller class for handling HTTP requests related to tasks
 */
class TaskController {
  /**
   * Get all tasks with their subtasks for a user
   * @deprecated Use getAllTasksOptimized instead. This method uses inefficient N+1 queries.
   */
  getTasksWithSubTasks(req, res) {
    const userId = Number(req.user.id);
    if (!userId) {
      return res.status(400).json({ error: 'Не передан user-id в заголовке' });
    }

    taskService.getTasksWithSubTasks(userId).then((result) => {
      res.status(result.status).json(result.data);
    });
  }

  /**
   * Optimized version: Get all tasks with subtasks using optimized query
   * Includes timeout handling to prevent 502 errors
   */
  getAllTasksOptimized(req, res) {
    const userId = Number(req.user.id);
    if (!userId) {
      return res.status(400).json({ error: 'Не передан user-id в заголовке' });
    }

    // Add timeout of 25 seconds (less than 30 seconds at Express level)
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Request timeout')), 25000)
    );

    Promise.race([taskService.getAllTasksWithSubTasksOptimized(userId), timeoutPromise])
      .then((result) => {
        if (res.headersSent) return; // Check if response already sent
        res.status(result.status).json(result.data);
      })
      .catch((err) => {
        if (res.headersSent) return; // Check if response already sent
        console.error('❌ Ошибка при получении задач:', err);
        res.status(500).json({
          error:
            err.message === 'Request timeout'
              ? 'Превышено время ожидания ответа от сервера'
              : 'Ошибка при получении задач',
        });
      });
  }

  /**
   * Create a new task
   */
  createTask(req, res) {
    const userId = Number(req.user.id);
    if (!userId) return res.status(400).json({ error: 'Не передан user-id в заголовке' });

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
    const { is_done, completion_date } = req.body;
    const userId = Number(req.user.id);

    const result = await taskService.updateTaskStatus(taskId, is_done, userId, completion_date);
    res.status(result.status).json(result.data);
  }

  /**
   * Update an existing task and its subtasks
   */
  async updateTask(req, res) {
    const taskId = Number(req.params.id);
    const updatedTask = req.body;
    const userId = Number(req.user.id);

    try {
      const result = await taskService.updateTask(taskId, updatedTask);
      res.status(result.status).json(result.data);
    } catch (err) {
      console.error('❌ Ошибка при обновлении задачи и подзадач:', err);
      res.status(500).json({ error: 'Ошибка при обновлении задачи' });
    }
  }

  /**
   * Update subtask completion status
   */
  async updateSubtaskStatus(req, res) {
    const userId = Number(req.user.id);
    const subtaskId = Number(req.params.id);
    const { is_done } = req.body;

    // Check input data
    if (typeof is_done !== 'boolean') {
      return res.status(400).json({ error: 'Поле is_done должно быть boolean (true/false)' });
    }

    try {
      // Update subtask status
      const subtaskResult = await taskService.updateSubtaskStatus(subtaskId, is_done, userId);
      res.status(subtaskResult.status).json(subtaskResult.data);
    } catch (err) {
      console.error('❌ Ошибка при обновлении подзадачи:', err);
      res.status(500).json({ error: 'Ошибка при обновлении подзадачи' });
    }
  }

  /**
   * Get tasks for a specific date period
   */
  getTasksForPeriod(req, res) {
    const userId = Number(req.user.id);
    const { startDate, endDate } = req.query;

    if (!userId) {
      return res.status(400).json({ error: 'Не передан user-id в заголовке' });
    }

    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'Не переданы параметры startDate и endDate' });
    }

    taskService.getTasksForPeriod(userId, startDate, endDate).then((result) => {
      res.status(result.status).json(result.data);
    });
  }
}

module.exports = new TaskController();
