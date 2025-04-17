const taskModel = require('./models/task.model');
const subtaskModel = require('./models/subtask.model');
const userService = require('../user/user.service');

/**
 * Task service class with business logic for task operations
 */
class TaskService {
  /**
   * Get full task with all subtasks
   */
  async getFullTaskById(taskId) {
    try {
      const [rows] = await taskModel.getTaskById(taskId);
      const task = rows[0];
      if (!task) return null;

      const [subtasks] = await subtaskModel.getAllSubtasksByParentTaskId(
        taskId,
      );
      return {
        ...task,
        subtasks: subtasks || [],
      };
    } catch (error) {
      console.error(`Ошибка при получении задачи ${taskId}:`, error);
      // Return null instead of throwing to avoid cascading failures
      // Service will handle null returns gracefully
      return null;
    }
  }

  /**
   * Update parent task status based on subtasks completion
   */
  async updateStatusBySubtasks(parent_task_id, req, res) {
    try {
      const [[rowsTotal], [rowsCompleted]] = await Promise.all([
        subtaskModel.countAllSubtaskByParentTaskId(parent_task_id),
        subtaskModel.countCompletedSubtaskByParentTaskId(parent_task_id),
      ]);

      const total = Number(rowsTotal[0]?.total || 0);
      const completed = Number(rowsCompleted[0]?.completed || 0);

      const newStatus = total > 0 && total === completed;
      console.log({ total, completed, newStatus });

      // Create a fake request to reuse updateTaskStatus
      const fakeReq = {
        ...req,
        params: { id: parent_task_id },
        body: { is_done: newStatus },
      };

      return this.updateTaskStatus(fakeReq, res);
    } catch (err) {
      console.error(
        '❌ Ошибка при пересчёте статуса задачи по подзадачам:',
        err,
      );
      res.status(500).json({ error: 'Ошибка при обновлении статуса задачи' });
    }
  }

  /**
   * Get all tasks with subtasks for a user
   */
  async getTasksWithSubTasks(userId) {
    try {
      const [rows] = await taskModel.getAllTasksByUser(userId);
      if (!rows.length) {
        return { status: 404, data: { error: 'Задачи не найдены' } };
      }

      // Get tasks one by one instead of using Promise.all which fails if any single task fails
      const fullTasks = [];
      for (const task of rows) {
        try {
          const fullTask = await this.getFullTaskById(task.id);
          if (fullTask) {
            fullTasks.push(fullTask);
          }
        } catch (err) {
          console.error(`Ошибка при получении задачи ${task.id}:`, err);
          // Continue with other tasks even if one fails
        }
      }

      return { status: 200, data: fullTasks };
    } catch (err) {
      console.error('❌ Ошибка при получении задач с подзадачами:', err);
      return { status: 500, data: { error: err.message } };
    }
  }

  /**
   * Create a new task
   */
  async createTask(userId, taskData) {
    try {
      const task = { ...taskData, user_id: userId };
      const [result] = await taskModel.addTask(task);
      const fullTask = await this.getFullTaskById(result.insertId);

      if (!fullTask) {
        return {
          status: 404,
          data: { error: 'Задача не найдена после создания' },
        };
      }

      return { status: 201, data: fullTask };
    } catch (err) {
      console.error('❌ Ошибка при создании задачи:', err);
      return { status: 500, data: { error: err.message } };
    }
  }

  /**
   * Update a task and its subtasks
   */
  async updateTask(taskId, updatedTask) {
    try {
      // Update the task itself
      await taskModel.updateTaskById(taskId, updatedTask);

      // Process subtasks
      const subtaskPromises = updatedTask.subtasks.map((subtask) => {
        if (!subtask.id && !subtask.is_deleted) {
          // New subtask
          return subtaskModel.addSubtask(updatedTask.user_id, {
            ...subtask,
            parent_task_id: taskId,
          });
        }

        if (subtask.is_deleted) {
          // Delete existing subtask
          return subtaskModel.deleteSubtaskById(subtask.id);
        }

        // Update existing subtask
        return subtaskModel.updateSubtask(
          subtask.id,
          subtask.title,
          subtask.position,
        );
      });

      await Promise.all(subtaskPromises);
      return { status: 200 };
    } catch (err) {
      console.error('❌ Ошибка при обновлении задачи и подзадач:', err);
      return { status: 500, data: { error: 'Ошибка при обновлении задачи' } };
    }
  }

  /**
   * Update task completion status
   */
  async updateTaskStatus(taskId, is_done, userId) {
    try {
      // Update task status
      const [updateResult] = await taskModel.setTaskStatus(is_done, taskId);
      if (updateResult.affectedRows === 0) {
        return {
          status: 404,
          data: { error: 'Задача не найдена для обновления' },
        };
      }

      // Get full task
      const fullTask = await this.getFullTaskById(taskId);
      if (!fullTask) {
        return {
          status: 404,
          data: { error: 'Не удалось получить полную задачу' },
        };
      }

      // Update all subtasks to match the parent task status
      if (fullTask.subtasks?.length) {
        await subtaskModel.updateSubtasksStatus(taskId, is_done);
      }

      if (fullTask.exp !== 0) {
        // Calculate XP delta based on updated status
        // const deltaXP =
        //   is_done == fullTask.is_done
        //     ? 0
        //     : is_done
        //     ? fullTask.exp
        //     : -fullTask.exp;

        const deltaXP = fullTask.is_done ? fullTask.exp : -fullTask.exp;
        await userService.updateUserExp(userId, deltaXP);
        console.log(
          'начисленно опыта ' + deltaXP,
          //   'is_done ' + is_done,
          //   'fullTask.is_done ' + fullTask.is_done,
        );
      }

      // 4. Мутируем объект, чтобы не дергать БД ещё раз
      if (fullTask.subtasks) {
        fullTask.subtasks.forEach((s) => (s.is_done = is_done));
      }

      // 5. Возвращаем уже мутированный объект
      return { status: 200, data: fullTask };
    } catch (err) {
      console.error('❌ Ошибка при обновлении статуса задачи:', err);
      return { status: 500, data: { error: err.message } };
    }
  }

  /**
   * Delete a task
   */
  async deleteTask(taskId) {
    try {
      const [result] = await taskModel.deleteTaskById(taskId);
      if (result.affectedRows === 0) {
        return {
          status: 404,
          data: { error: 'Задача не найдена или уже удалена' },
        };
      }
      return {
        status: 200,
        data: { message: '✅ Задача успешно удалена', id: taskId },
      };
    } catch (err) {
      console.error('❌ Ошибка при удалении задачи:', err);
      return { status: 500, data: { error: 'Ошибка при удалении задачи' } };
    }
  }

  /**
   * Update a subtask's status
   */
  async updateSubtaskStatus(subtaskId, is_done) {
    try {
      // Get the subtask by ID
      const [rows] = await subtaskModel.getSubtaskById(subtaskId);
      if (!rows.length) {
        return { status: 404, data: { error: 'Подзадача не найдена' } };
      }

      const parentTaskId = rows[0].parent_task_id;

      // Update subtask status
      await subtaskModel.updateSubtaskStatus(subtaskId, is_done);

      // Return the parent task ID for recalculating task status
      return {
        status: 200,
        data: { parentTaskId },
        parentTaskId,
      };
    } catch (err) {
      console.error('❌ Ошибка при обновлении подзадачи:', err);
      return {
        status: 500,
        data: { error: 'Ошибка при обновлении подзадачи' },
      };
    }
  }

  /**
   * Update a subtask
   */
  async updateSubtask(subtaskId, title, position, parent_task_id) {
    try {
      const [result] = await subtaskModel.updateSubtask(
        subtaskId,
        title,
        position,
      );
      if (result.affectedRows === 0) {
        return { status: 404, data: { error: 'Подзадача не найдена' } };
      }

      const fullTask = await this.getFullTaskById(parent_task_id);
      if (!fullTask) {
        return {
          status: 404,
          data: { error: 'Задача не найдена после обновления подзадачи' },
        };
      }

      return { status: 200, data: fullTask };
    } catch (err) {
      console.error('❌ Ошибка при обновлении подзадачи:', err);
      return {
        status: 500,
        data: { error: 'Ошибка при обновлении подзадачи' },
      };
    }
  }
}

// Create a singleton instance
const taskService = new TaskService();

// Export the instance
module.exports = taskService;
