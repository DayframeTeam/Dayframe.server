const subtaskModel = require('../models/subtaskModel');
const taskController = require('./taskController');

exports.getAllByUserId = (req, res) => {
  const userId = Number(req.headers['user-id']);

  if (!userId) {
    return res.status(400).json({ error: 'Не передан user-id в заголовке' });
  }

  subtaskModel
    .getSubtasksAllByUserId(userId)
    .then(([result]) => {
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Задача не найдена' });
      }
      return taskController.getFullTaskById(taskId);
    })
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
  taskController.getFullTaskById(parentTaskId);
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
      taskController
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
  const parentTaskId = Number(req.body.parent_task_id);

  if (!subtaskId || !parentTaskId) {
    return res
      .status(400)
      .json({ error: 'Некорректный ID подзадачи или задачи' });
  }

  subtaskModel
    .deleteSubtaskById(subtaskId)
    .then(([result]) => {
      if (result.affectedRows === 0) {
        return res
          .status(404)
          .json({ error: 'Подзадача не найдена или уже удалена' });
      }

      return taskController
        .updateStatusBySubtasks(parentTaskId)
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

  // Проверяем корректность входных данных
  if (typeof is_done !== 'boolean') {
    return res
      .status(400)
      .json({ error: 'Поле is_done должно быть boolean (true/false)' });
  }

  // Получаем подзадачу по её ID
  subtaskModel
    .getSubtaskById(subtaskId)
    .then(([rows]) => {
      if (!rows.length) {
        return res.status(404).json({ error: 'Подзадача не найдена' });
      }

      const parentTaskId = rows[0].parent_task_id;

      // Обновляем статус подзадачи
      return subtaskModel.updateSubtaskStatus(subtaskId, is_done).then(() => {
        // После обновления подзадачи — пересчитываем статус родительской задачи
        return taskController.updateStatusBySubtasks(parentTaskId, req, res);
      });
    })
    .catch((err) => {
      console.error('❌ Ошибка при обновлении подзадачи:', err);
      res.status(500).json({ error: 'Ошибка при обновлении подзадачи' });
    });
};

exports.updateSubtask = (req, res) => {
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

  subtaskModel
    .updateSubtask(subtaskId, title, position)
    .then(([result]) => {
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Подзадача не найдена' });
      }

      return taskController.getFullTaskById(parent_task_id);
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
