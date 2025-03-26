const subtaskModel = require('../models/subtaskModel');
const taskModel = require('../models/taskModel');
const taskController = require('./taskController');

exports.getAllByUserId = (req, res) => {
  const userId = Number(req.headers['user-id']);

  if (!userId) {
    return res.status(400).json({ error: 'Не передан user-id в заголовке' });
  }

  subtaskModel
    .getAllSubtasksByUser(userId)
    .then(([rows]) => res.json(rows))
    .catch((err) => {
      console.error('Ошибка при получении подзадач:', err);
      res.status(500).json({ error: err.message });
    });
};

// 🔹 Получить все подзадачи по parent_task_id
exports.getAllByParentTaskId = (req, res) => {
  const parentTaskId = Number(req.params.id);

  if (!parentTaskId) {
    return res.status(400).json({ error: 'Не передан parent_task_id' });
  }

  subtaskModel
    .getAllByParentId(parentTaskId)
    .then(([rows]) => res.json(rows))
    .catch((err) => res.status(500).json({ error: err.message }));
};

exports.createSubtask = (req, res) => {
  const subtask = req.body;
  const userId = Number(req.headers['user-id']);

  if (!subtask || !subtask.parent_task_id || !subtask.title) {
    return res
      .status(400)
      .json({ error: 'Необходимы поля: parent_task_id, title' });
  }

  subtaskModel
    .addSubtask(userId, subtask)
    .then(([result]) =>
      taskModel
        .updateStatusBySubtasks(subtask.parent_task_id)
        .then(() => taskController.getFullTaskById(subtask.parent_task_id)),
    )
    .then((task) => {
      if (!task) {
        return res
          .status(404)
          .json({ error: 'Задача не найдена после добавления подзадачи' });
      }
      res.status(201).json(task);
    })
    .catch((err) => {
      console.error('Ошибка при создании подзадачи:', err);
      res.status(500).json({ error: err.message });
    });
};

exports.deleteSubtask = (req, res) => {
  const subtaskId = Number(req.params.id);

  if (!subtaskId) {
    return res.status(400).json({ error: 'Некорректный ID подзадачи' });
  }

  subtaskModel
    .getSubtaskById(subtaskId)
    .then(([rows]) => {
      if (!rows || rows.length === 0) {
        return res.status(404).json({ error: 'Подзадача не найдена' });
      }

      const parentTaskId = rows[0].parent_task_id;

      return subtaskModel
        .deleteSubtaskById(subtaskId)
        .then(() => taskModel.updateStatusBySubtasks(parentTaskId))
        .then(() => taskController.getFullTaskById(parentTaskId));
    })
    .then((task) => {
      if (!task) {
        return res
          .status(404)
          .json({ error: 'Задача не найдена после удаления подзадачи' });
      }
      res.json(task);
    })
    .catch((err) => {
      console.error('❌ Ошибка при удалении подзадачи:', err);
      res.status(500).json({ error: 'Ошибка при удалении подзадачи' });
    });
};

exports.updateSubtaskStatus = (req, res) => {
  const subtaskId = Number(req.params.id);
  const { is_done } = req.body;

  if (typeof is_done !== 'boolean') {
    return res.status(400).json({ error: 'Поле is_done должно быть boolean' });
  }

  subtaskModel
    .getSubtaskById(subtaskId)
    .then(([rows]) => {
      if (!rows.length) {
        return res.status(404).json({ error: 'Подзадача не найдена' });
      }

      const parentTaskId = rows[0].parent_task_id;

      return subtaskModel
        .updateSubtaskStatus(subtaskId, is_done)
        .then(() => taskModel.updateStatusBySubtasks(parentTaskId))
        .then(() => taskController.getFullTaskById(parentTaskId));
    })
    .then((task) => {
      if (!task) {
        return res
          .status(404)
          .json({ error: 'Задача не найдена после обновления подзадачи' });
      }
      res.json(task);
    })
    .catch((err) => {
      console.error('❌ Ошибка при обновлении статуса подзадачи:', err);
      res.status(500).json({ error: 'Ошибка при обновлении подзадачи' });
    });
};

exports.updateSubtask = (req, res) => {
  const subtaskId = Number(req.params.id);
  const { title, position } = req.body;

  if (typeof title !== 'string' || typeof position !== 'number') {
    return res.status(400).json({
      error: 'Неверные поля: title должен быть строкой, position — числом',
    });
  }

  subtaskModel
    .getSubtaskById(subtaskId)
    .then(([rows]) => {
      if (!rows.length) {
        return res.status(404).json({ error: 'Подзадача не найдена' });
      }

      const parentTaskId = rows[0].parent_task_id;

      return subtaskModel
        .updateSubtask(subtaskId, title, position)
        .then(() => taskController.getFullTaskById(parentTaskId));
    })
    .then((task) => {
      if (!task) {
        return res
          .status(404)
          .json({ error: 'Задача не найдена после обновления подзадачи' });
      }
      res.json(task);
    })
    .catch((err) => {
      console.error('❌ Ошибка при обновлении подзадачи:', err);
      res.status(500).json({ error: 'Ошибка при обновлении подзадачи' });
    });
};
