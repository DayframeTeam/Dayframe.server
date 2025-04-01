const taskModel = require('../models/taskModel');
const subtaskModel = require('../models/subtaskModel');
const userModel = require('../models/userModel');

// Получить полную задачу с подзадачами
exports.getFullTaskById = async (taskId) => {
  const [rows] = await taskModel.getTaskById(taskId);
  const task = rows[0];
  if (!task) return null;

  const [subtasks] = await subtaskModel.getAllSubtasksByParentTaskId(taskId);
  return {
    ...task,
    subtasks: subtasks || [],
  };
};

exports.updateStatusBySubtasks = async (parent_task_id, req, res) => {
  try {
    const [[rowsTotal], [rowsCompleted]] = await Promise.all([
      subtaskModel.countAllSubtaskByParentTaskId(parent_task_id),
      subtaskModel.countCompletedSubtaskByParentTaskId(parent_task_id),
    ]);

    const total = Number(rowsTotal[0]?.total || 0);
    const completed = Number(rowsCompleted[0]?.completed || 0);

    const newStatus = total > 0 && total === completed;
    console.log({ total, completed, newStatus });

    // Создаём поддельный запрос для повторного использования updateTaskStatus
    const fakeReq = {
      ...req,
      params: { id: parent_task_id },
      body: { is_done: newStatus },
    };

    return exports.updateTaskStatus(fakeReq, res); // отправка происходит внутри
  } catch (err) {
    console.error('❌ Ошибка при пересчёте статуса задачи по подзадачам:', err);
    res.status(500).json({ error: 'Ошибка при обновлении статуса задачи' });
  }
};

exports.getTasksWithSubTasks = (req, res) => {
  const userId = Number(req.headers['user-id']);
  if (!userId) {
    return res.status(400).json({ error: 'Не передан user-id в заголовке' });
  }

  taskModel
    .getAllTasksByUser(userId)
    .then(([rows]) => {
      if (!rows.length) {
        return res.status(404).json({ error: 'Задачи не найдены' });
      }

      return Promise.all(rows.map((task) => exports.getFullTaskById(task.id)));
    })
    .then((fullTasks) => {
      res.json(fullTasks);
    })
    .catch((err) => {
      console.error('❌ Ошибка при получении задач с подзадачами:', err);
      res.status(500).json({ error: err.message });
    });
};

// Создание задачи
exports.createTask = (req, res) => {
  const userId = Number(req.headers['user-id']);
  if (!userId)
    return res.status(400).json({ error: 'Не передан user-id в заголовке' });
  const task = { ...req.body, user_id: userId };
  taskModel
    .addTask(task)
    .then(([result]) => exports.getFullTaskById(result.insertId))
    .then((fullTask) => {
      if (!fullTask) {
        return res
          .status(404)
          .json({ error: 'Задача не найдена после создания' });
      }
      res.status(201).json(fullTask);
    })
    .catch((err) => {
      console.error('❌ Ошибка при создании задачи:', err);
      res.status(500).json({ error: err.message });
    });
};

// Обновление задачи
exports.updateTask = async (req, res) => {
  const taskId = Number(req.params.id);
  const updatedTask = req.body;

  try {
    if (updatedTask.is_deleted) {
      await taskModel.deleteTaskById(taskId);
      return res.json({ message: '✅ Задача успешно удалена', id: taskId });
    }

    // Обновляем саму задачу
    await taskModel.updateTaskById(taskId, updatedTask);

    // Обрабатываем подзадачи
    const subtaskPromises = updatedTask.subtasks.map((subtask) => {
      if (!subtask.id && !subtask.is_deleted) {
        // Новая подзадача
        return subtaskModel.createSubtask({
          ...subtask,
          parent_task_id: taskId,
        });
      }

      if (subtask.is_deleted) {
        // Удаление существующей подзадачи
        return subtaskModel.deleteSubtaskById(subtask.id);
      }

      // Обновление существующей подзадачи
      return subtaskModel.updateSubtask(
        subtask.id,
        subtask.title,
        subtask.position,
      );
    });

    await Promise.all(subtaskPromises);
    await taskController.updateStatusBySubtasks(taskId, req, res);
    // Возвращаем обновлённую задачу
    const fullTask = await taskController.getFullTaskById(taskId);
    res.json(fullTask);
  } catch (err) {
    console.error('❌ Ошибка при обновлении задачи и подзадач:', err);
    res.status(500).json({ error: 'Ошибка при обновлении задачи' });
  }
};

// Обновление статуса is_done
exports.updateTaskStatus = async (req, res) => {
  const taskId = Number(req.params.id);
  const { is_done } = req.body;

  try {
    //нужно проверить, что что в бд и то что пришло это 1 и тоже?
    // 2. Получаем полную обновлённую задачу
    const fullTask = await exports.getFullTaskById(taskId);
    if (!fullTask) {
      return res
        .status(404)
        .json({ error: 'Не удалось получить полную задачу' });
    }

    // 1. Обновляем статус задачи
    const [updateResult] = await taskModel.setTaskStatus(is_done, taskId);
    if (updateResult.affectedRows === 0) {
      return res
        .status(404)
        .json({ error: 'Задача не найдена для обновления' });
    }

    // 3. Расчёт опыта на основе обновлённого статуса
    const deltaXP =
      is_done == fullTask.is_done ? 0 : is_done ? fullTask.exp : -fullTask.exp;
    console.log(
      'начисленно опыта ' + deltaXP,
      'is_done ' + is_done,
      'fullTask.is_done ' + fullTask.is_done,
    );
    await userModel.updateUserExp(fullTask.user_id, deltaXP);

    // 4. Возврат полной задачи с изменёным полем
    fullTask.is_done = is_done;
    res.json(fullTask);
  } catch (err) {
    console.error('❌ Ошибка при обновлении статуса задачи:', err);
    res.status(500).json({ error: err.message });
  }
};

exports.deleteTask = (req, res) => {
  const taskId = Number(req.params.id);

  taskModel
    .deleteTaskById(taskId)
    .then(([result]) => {
      if (result.affectedRows === 0) {
        return res
          .status(404)
          .json({ error: 'Задача не найдена или уже удалена' });
      }
      res.json({ message: '✅ Задача успешно удалена', id: taskId });
    })
    .catch((err) => {
      console.error('❌ Ошибка при удалении задачи:', err);
      res.status(500).json({ error: 'Ошибка при удалении задачи' });
    });
};
