const db = require('../config/db');

// ✅ Получить все шаблонные задачи пользователя
function getAllTemplateTasksByUser(userId) {
  return db.query('SELECT * FROM template_tasks WHERE user_id = ?', [userId]);
}

// ✅ Получить шаблонную задачу по ID
function getTemplateTaskById(id) {
  return db.query('SELECT * FROM template_tasks WHERE id = ?', [id]);
}

// ✅ Добавить новую шаблонную задачу
function addTemplateTask(task) {
  const {
    title,
    description = null,
    category = null,
    priority = null,
    exp = 0,
    duration = null,
    start_time = null,
    end_time = null,
    is_active = true,
    special_id,
    repeat_rule,
    start_date = null,
    end_date = null,
    user_id,
  } = task;

  return db.query(
    `INSERT INTO template_tasks (
      title, description, category, priority, exp,
      duration, start_time, end_time,
      is_active, special_id, repeat_rule,
      start_date, end_date, user_id
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      title,
      description,
      category,
      priority,
      exp,
      duration,
      start_time,
      end_time,
      is_active,
      special_id,
      JSON.stringify(repeat_rule),
      start_date,
      end_date,
      user_id,
    ],
  );
}

// ✅ Удалить шаблонную задачу
function deleteTemplateTaskById(id) {
  return db.query('DELETE FROM template_tasks WHERE id = ?', [id]);
}

// ✅ Обновить шаблонную задачу
function updateTemplateTaskById(id, task) {
  const {
    title,
    description = null,
    category = null,
    priority = null,
    exp = 0,
    duration = null,
    start_time = null,
    end_time = null,
    is_active = true,
    special_id,
    repeat_rule,
    start_date = null,
    end_date = null,
  } = task;

  return db.query(
    `UPDATE template_tasks SET
      title = ?, description = ?, category = ?, priority = ?, exp = ?,
      duration = ?, start_time = ?, end_time = ?,
      is_active = ?, special_id = ?, repeat_rule = ?,
      start_date = ?, end_date = ?
     WHERE id = ?`,
    [
      title,
      description,
      category,
      priority,
      exp,
      duration,
      start_time,
      end_time,
      is_active,
      special_id,
      JSON.stringify(repeat_rule),
      start_date,
      end_date,
      id,
    ],
  );
}

module.exports = {
  getAllTemplateTasksByUser,
  getTemplateTaskById,
  addTemplateTask,
  deleteTemplateTaskById,
  updateTemplateTaskById,
};
