const taskModel = require('./models/task.model');
const subtaskModel = require('./models/subtask.model');
const userService = require('../user/user.service');
const { getDateStringInTZ } = require('../../utils/date');
const templateModel = require('../template.task/models/template.task.model');

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
      if (!task)
        return {
          status: 404,
          data: { error: 'Не удалось получить задачу' },
        };

      const [subtasks] = await subtaskModel.getAllSubtasksByParentTaskId(taskId);
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
      const taskId = result.insertId;

      // Создаем подзадачи, если они есть
      const subtasks = taskData.subtasks ?? [];
      const promises = [];

      for (const sub of subtasks) {
        // Добавляем только не удаленные подзадачи
        if (!sub.is_deleted) {
          promises.push(
            subtaskModel.addSubtask(userId, {
              ...sub,
              parent_task_id: taskId,
            })
          );
        }
      }

      // Ждём, пока все операции над подзадачами завершатся
      if (promises.length > 0) {
        await Promise.all(promises);
      }

      if (taskData.is_done) {
        return await this.updateTaskStatus(taskId, true, userId);
      }

      if (!taskData.is_done && Array.isArray(taskData.subtasks)) {
        // фильтруем реально созданные (не удалённые)
        const subs = taskData.subtasks.filter((sub) => !sub.is_deleted);

        const totalCount = subs.length;
        const completedCount = subs.filter((sub) => sub.is_done).length;

        // если есть хотя бы 1 подзадача и все они выполнены
        if (totalCount > 0 && totalCount === completedCount) {
          // помечаем саму задачу выполненной
          return await this.updateTaskStatus(taskId, true, userId);
        }
      }

      const newTask = await this.getFullTaskById(taskId);
      const newUser = await userService.getUserById(userId);
      // 2 проверка на выполнение всех подзадач

      if (!newTask) {
        return {
          status: 404,
          data: { error: 'Задача не найдена после создания' },
        };
      }

      return { status: 200, data: { task: newTask, userExp: newUser.exp } };
    } catch (err) {
      console.error('❌ Ошибка при создании задачи:', err);
      return { status: 500, data: { error: err.message } };
    }
  }

  async updateTask(taskId, updatedTask) {
    try {
      // 1) Обновляем саму задачу
      await taskModel.updateTaskById(taskId, updatedTask);

      // 2) Готовим обработку подзадач
      const subtasks = updatedTask.subtasks ?? [];
      let needReopen = false;
      const promises = [];

      for (const sub of subtasks) {
        // новая подзадача
        if (!sub.id && !sub.is_deleted) {
          needReopen = true;
          promises.push(
            subtaskModel.addSubtask(updatedTask.user_id, {
              ...sub,
              parent_task_id: taskId,
            })
          );

          // удаление подзадачи
        } else if (sub.id && sub.is_deleted) {
          promises.push(subtaskModel.deleteSubtaskById(sub.id));

          // обновление существующей подзадачи
        } else if (sub.id) {
          promises.push(subtaskModel.updateSubtask(sub.id, sub.title, sub.position));
        }
      }

      // 3) Ждём, пока все операции над подзадачами завершатся
      await Promise.all(promises);

      // 4) Если добавили хоть одну новую — переоткрываем задачу
      if (needReopen) {
        const result = await this.updateTaskStatus(taskId, false, updatedTask.user_id);

        return {
          status: 200,
          data: result.data,
        };
      }

      // 5) Если ничего «статусного» не меняли, получаем и возвращаем обновленную задачу
      const updatedFullTask = await this.getFullTaskById(taskId);

      return {
        status: 200,
        data: {
          task: updatedFullTask,
          userExp: undefined,
        },
      };
    } catch (err) {
      console.error('❌ Ошибка при обновлении задачи и подзадач:', err);
      return { status: 500, data: { error: err.message } };
    }
  }

  /**
   * Update task completion status
   */
  async updateTaskStatus(taskId, is_done, userId, completion_date) {
    try {
      // Get full task
      const fullTask = await this.getFullTaskById(taskId);
      if (fullTask.is_done === is_done) {
        return { status: 200, data: { task: undefined, userExp: undefined } };
      }

      // Update task status
      await taskModel.setTaskStatus(is_done, taskId);
      if (!fullTask.task_date) {
        await taskModel.setTaskDate(completion_date, taskId);
      }

      if (is_done) {
        // задача выполненна, начисляем опыт
        fullTask.exp > 0 && (await userService.updateUserExp(userId, fullTask.exp));
        // выполняем все подзадачи
        fullTask.subtasks &&
          (await subtaskModel.updateSubtasksStatusByParentTaskId(fullTask.id, is_done));
      } else {
        // задача не выполненна, снимаем опыт
        fullTask.exp > 0 && (await userService.updateUserExp(userId, -fullTask.exp));
        fullTask.subtasks &&
          (await subtaskModel.updateSubtasksStatusByParentTaskId(fullTask.id, is_done));
      }
      //   if (fullTask.exp !== 0) {
      //     // Calculate XP delta based on updated status
      //     const deltaXP =
      //       is_done == fullTask.is_done
      //         ? 0
      //         : is_done
      //         ? fullTask.exp
      //         : -fullTask.exp;
      //     await userService.updateUserExp(userId, deltaXP);
      //     console.log(
      //       'начисленно опыта ' + deltaXP,
      //       'is_done ' + is_done,
      //       'fullTask.is_done ' + fullTask.is_done,
      //     );
      //   }
      const newTask = await this.getFullTaskById(taskId);
      const newUser = await userService.getUserById(userId);
      return { status: 200, data: { task: newTask, userExp: newUser.exp } };
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
  async updateSubtaskStatus(subtaskId, is_done, userId) {
    try {
      // Get the subtask by ID
      const [rows] = await subtaskModel.getSubtaskById(subtaskId);
      if (!rows.length) {
        return { status: 404, data: { error: 'Подзадача не найдена' } };
      }

      if (rows[0].is_done === is_done) {
        return { status: 200, data: { task: undefined, userExp: undefined } };
      }

      // Update subtask status
      await subtaskModel.updateSubtaskStatus(subtaskId, is_done);

      const fullTask = await this.getFullTaskById(rows[0].parent_task_id);

      const [[rowsTotal], [rowsCompleted]] = await Promise.all([
        subtaskModel.countAllSubtaskByParentTaskId(fullTask.id),
        subtaskModel.countCompletedSubtaskByParentTaskId(fullTask.id),
      ]);

      const total = Number(rowsTotal[0]?.total || 0);
      const completed = Number(rowsCompleted[0]?.completed || 0);

      let result;

      if (completed === total) {
        result = await this.updateTaskStatus(fullTask.id, true, userId);
      } else if (completed === total - 1) {
        result = await this.updateTaskStatus(fullTask.id, false, userId);
      } else {
        return { status: 200, data: { task: fullTask, userExp: undefined } };
      }

      return result;
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
      const [result] = await subtaskModel.updateSubtask(subtaskId, title, position);
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

  /**
   * Get tasks for a specific date period
   * @param {string} userId
   * @param {string} startDate - Start date in YYYY-MM-DD format
   * @param {string} endDate - End date in YYYY-MM-DD format
   * @param {string} timeZone - IANA-имя зоны, например "Europe/Moscow"
   */
  async getTasksForPeriod(userId, startDate, endDate, timeZone = 'Europe/Moscow') {
    try {
      const [tasks] = await taskModel.getTasksForPeriod(userId, startDate, endDate);
      return { status: 200, data: tasks };
    } catch (err) {
      console.error('❌ Ошибка при получении задач за период:', err);
      return { status: 500, data: { error: err.message } };
    }
  }

  /**
   * @param {string} userId
   * @param {string} timeZone — IANA-имя зоны, например "Europe/Moscow"
   */
  async getTasksForToday(userId, timeZone = 'Europe/Moscow') {
    try {
      const dateString = getDateStringInTZ(timeZone);
      const [tasks] = await taskModel.getTasksForDate(userId, dateString);

      // день недели тоже вычисляем по локальному времени
      const local = new Date(new Date().toLocaleString('en-US', { timeZone }));
      const jsDay = local.getDay();
      const dayOfWeek = jsDay === 0 ? 7 : jsDay;
      const [templates] = await templateModel.getTemplatesForDay(userId, dayOfWeek);

      return { status: 200, data: { tasks, templates, dateString, dayOfWeek } };
    } catch (err) {
      console.error('❌ Ошибка при получении задач на сегодня:', err);
      return { status: 500, data: { error: err.message } };
    }
  }
}

// Create a singleton instance
const taskService = new TaskService();

// Export the instance
module.exports = taskService;
