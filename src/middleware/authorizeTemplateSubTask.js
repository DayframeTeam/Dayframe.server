const db = require('../config/db');

function authorizeTemplateSubTask(req, res, next) {
  const id = req.params.id;
  const user_id = Number(req.headers['user-id']);

  if (!user_id) {
    return res.status(400).json({ error: 'Не передан user-id в заголовке' });
  }

  db.query('SELECT * FROM template_subtasks WHERE id = ?', [id])
    .then(([rows]) => {
      if (!rows.length) {
        return res.status(404).json({ error: 'Шаблон подзадачи не найдена' });
      }

      const task = rows[0];

      if (task.user_id !== user_id) {
        return res
          .status(403)
          .json({ error: 'Доступ запрещён: не ваш шаблон подзадачи' });
      }

      req.task = task;
      next();
    })
    .catch((err) => {
      console.error('❌ Ошибка авторизации задачи:', err);
      res.status(500).json({ error: 'Ошибка авторизации' });
    });
}

module.exports = authorizeTemplateSubTask;
