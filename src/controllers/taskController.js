const taskModel = require('../models/taskModel');

exports.getTasks = (req, res) => {
  taskModel
    .getAllTasks()
    .then(([rows]) => res.json(rows))
    .catch((err) => res.status(500).json({ error: err.message }));
};

exports.createTask = (req, res) => {
  const task = req.body;
  taskModel
    .addTask(task)
    .then(([result]) => res.status(201).json({ id: result.insertId, ...task }))
    .catch((err) => res.status(500).json({ error: err.message }));
};

exports.deleteTask = (req, res) => {
  const { id } = req.params;

  taskModel
    .deleteTaskById(id)
    .then(([result]) => {
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Задача не найдена' });
      }

      res.json({ message: 'Задача удалена' });
    })
    .catch((err) => res.status(500).json({ error: err.message }));
};

exports.markAsDone = (req, res) => {
  const { id } = req.params;

  taskModel
    .markTaskAsDone(id)
    .then(([result]) => {
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Задача не найдена' });
      }

      res.json({ message: 'Задача отмечена как выполненная' });
    })
    .catch((err) => res.status(500).json({ error: err.message }));
};
