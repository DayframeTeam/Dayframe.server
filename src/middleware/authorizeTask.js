const db = require('../config/db');

// Middleware: проверяет, что задача существует и принадлежит пользователю
function authorizeTask(req, res, next) {
  const id = req.params.id;
  const user_id = Number(req.user.id);

  if (!user_id) {
    return res.status(400).json({ error: 'Не передан user-id в заголовке' });
  }

  db.query('SELECT * FROM tasks WHERE id = ?', [id])
    .then(([rows]) => {
      if (!rows.length) {
        return res.status(404).json({ error: 'Задача не найдена' });
      }

      const task = rows[0];

      if (task.user_id !== user_id) {
        return res
          .status(403)
          .json({ error: 'Доступ запрещён: не ваша задача' });
      }

      req.task = task;
      next();
    })
    .catch((err) => {
      console.error('❌ Ошибка авторизации задачи:', err);
      res.status(500).json({ error: 'Ошибка авторизации' });
    });
}

module.exports = authorizeTask;
