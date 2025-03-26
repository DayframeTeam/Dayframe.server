const taskModel = require('../models/taskModel');
const subtaskModel = require('../models/subtaskModel');
const userModel = require('../models/userModel');

exports.getTasks = (req, res) => {
  const userId = Number(req.headers['user-id']);

  if (!userId) {
    return res.status(400).json({ error: 'Не передан user-id в заголовке' });
  }

  taskModel
    .getAllTasksByUser(userId)
    .then(([rows]) => res.json(rows))
    .catch((err) => res.status(500).json({ error: err.message }));
};

// Получить полную задачу с подзадачами
exports.getFullTaskById = async (taskId) => {
  const [rows] = await taskModel.getTaskById(taskId);
  const task = rows[0];
  if (!task) return null;

  const [subtasks] = await subtaskModel.getAllByParentId(taskId);
  return {
    ...task,
    subtasks: subtasks || [],
  };
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
exports.updateTask = (req, res) => {
  const taskId = Number(req.params.id);

  taskModel
    .updateTaskById(taskId, req.body)
    .then(([result]) => {
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Задача не найдена' });
      }
      return exports.getFullTaskById(taskId);
    })
    .then((fullTask) => {
      if (!fullTask) {
        return res
          .status(404)
          .json({ error: 'Задача не найдена после обновления' });
      }
      res.json(fullTask);
    })
    .catch((err) => {
      console.error('❌ Ошибка при обновлении задачи:', err);
      res.status(500).json({ error: err.message });
    });
};

// Обновление статуса is_done
exports.updateTaskStatus = (req, res) => {
  const taskId = Number(req.params.id);
  const { is_done } = req.body;

  if (typeof is_done !== 'boolean') {
    return res.status(400).json({ error: 'Поле is_done должно быть boolean' });
  }

  let taskData;

  // 1. Получаем задачу
  taskModel
    .getTaskById(taskId)
    .then(([rows]) => {
      if (!rows.length) {
        return res.status(404).json({ error: 'Задача не найдена' });
      }

      taskData = rows[0];
      return taskModel.setTaskStatus(is_done, taskId);
    })
    .then(([result]) => {
      if (result.affectedRows === 0) {
        return res
          .status(404)
          .json({ error: 'Задача не найдена для обновления' });
      }

      const deltaXP = is_done ? taskData.exp : -taskData.exp;
      return userModel.updateUserExp(taskData.user_id, deltaXP);
    })
    .then(() => exports.getFullTaskById(taskId)) // вернуть задачу с подзадачами
    .then((fullTask) => {
      if (!fullTask) {
        return res
          .status(404)
          .json({ error: 'Задача не найдена после изменения' });
      }
      res.json(fullTask);
    })
    .catch((err) => {
      console.error('❌ Ошибка при обновлении статуса задачи:', err);
      res.status(500).json({ error: err.message });
    });
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
