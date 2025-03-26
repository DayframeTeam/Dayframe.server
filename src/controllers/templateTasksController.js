const templateTaskModel = require('../models/templateTaskModel');

// ✅ Получить все шаблонные задачи пользователя
exports.getTemplateTasks = (req, res) => {
  const userId = Number(req.headers['user-id']);

  if (!userId) {
    return res.status(400).json({ error: 'Не передан user-id в заголовке' });
  }

  templateTaskModel
    .getAllTemplateTasksByUser(userId)
    .then(([rows]) => res.json(rows))
    .catch((err) => res.status(500).json({ error: err.message }));
};

// ✅ Добавить шаблонную задачу
exports.createTemplateTask = (req, res) => {
  const userId = Number(req.headers['user-id']);
  const task = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'Не передан user-id в заголовке' });
  }

  const newTask = {
    ...task,
    user_id: userId,
  };

  templateTaskModel
    .addTemplateTask(newTask)
    .then(([result]) => templateTaskModel.getTemplateTaskById(result.insertId))
    .then(([rows]) => {
      if (!rows || rows.length === 0) {
        return res
          .status(404)
          .json({ error: 'Шаблон не найден после создания' });
      }
      res.status(201).json(rows[0]);
    })
    .catch((err) => res.status(500).json({ error: err.message }));
};

// ✅ Удалить шаблон
exports.deleteTemplateTask = (req, res) => {
  const taskId = req.params.id;

  templateTaskModel
    .deleteTemplateTaskById(taskId)
    .then(([result]) => {
      res.json({ message: '✅ Шаблон удалён' });
    })
    .catch((err) => {
      console.error('❌ Ошибка при удалении шаблона:', err);
      res.status(500).json({ error: 'Ошибка при удалении шаблона' });
    });
};

// ✅ Обновить шаблон
exports.updateTemplateTask = (req, res) => {
  const taskId = req.params.id;
  const updatedData = req.body;

  templateTaskModel
    .updateTemplateTaskById(taskId, updatedData)
    .then(([result]) => {
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Шаблон не найден' });
      }
      return templateTaskModel.getTemplateTaskById(taskId);
    })
    .then(([rows]) => {
      if (!rows || rows.length === 0) {
        return res
          .status(404)
          .json({ error: 'Шаблон не найден после обновления' });
      }
      res.json(rows[0]);
    })
    .catch((err) => {
      console.error('❌ Ошибка при обновлении шаблона:', err);
      res.status(500).json({ error: 'Ошибка при обновлении шаблона' });
    });
};
