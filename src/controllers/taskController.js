const taskModel = require('../models/taskModel');

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

exports.createTask = (req, res) => {
  const userId = Number(req.headers['user-id']);
  const task = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'Не передан user-id в заголовке' });
  }

  const newTask = {
    ...task,
    user_id: userId,
  };

  taskModel
    .addTask(newTask)
    .then(([result]) =>
      res.status(201).json({ id: result.insertId, ...newTask }),
    )
    .catch((err) => res.status(500).json({ error: err.message }));
};

exports.deleteTask = (req, res) => {
  const taskId = req.params.id;

  taskModel
    .deleteTaskById(taskId)
    .then(([result]) => {
      res.json({ message: '✅ Задача удалена' });
    })
    .catch((err) => {
      console.error('❌ Ошибка при удалении задачи:', err);
      res.status(500).json({ error: 'Ошибка при удалении задачи' });
    });
};

exports.updateTaskStatus = (req, res) => {
  const taskId = req.params.id;
  const { status } = req.body; // ожидается boolean

  if (typeof status !== 'boolean') {
    return res.status(400).json({ error: 'Поле status должно быть boolean' });
  }

  taskModel
    .setTaskStatus(taskId, status)
    .then(([result]) => {
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Задача не найдена' });
      }

      res.json({
        message: `Задача ${status ? 'выполнена' : 'снята с выполнения'}`,
      });
    })
    .catch((err) => res.status(500).json({ error: err.message }));
};

exports.updateTask = (req, res) => {
  const taskId = req.params.id;
  const updatedData = req.body;

  taskModel
    .updateTaskById(taskId, updatedData)
    .then(([result]) => {
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Задача не найдена' });
      }

      res.json({ message: '✅ Задача обновлена', updated: updatedData });
    })
    .catch((err) => {
      console.error('❌ Ошибка при обновлении задачи:', err);
      res.status(500).json({ error: 'Ошибка при обновлении задачи' });
    });
};
