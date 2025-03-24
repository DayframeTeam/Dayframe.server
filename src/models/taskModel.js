const db = require('../config/db');

// Получить все задачи
function getAllTasks() {
  return db.query('SELECT * FROM tasks');
}

// Добавить задачу
function addTask(task) {
  const {
    title,
    status = 'planned',
    duration = null,
    category = null,
    priority = null,
    start_time = null,
    exp = null,
    description = null,
    task_date = null,
    source = 'manual',
    repeat_rule = null,
    source_id = null,
    user_id,
  } = task;

  const query = `
    INSERT INTO tasks (
      title, status, duration, category, priority, start_time,
      exp, description, task_date, source, repeat_rule, source_id, user_id
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    title,
    status,
    duration,
    category,
    priority,
    start_time,
    exp,
    description,
    task_date,
    source,
    repeat_rule,
    source_id,
    user_id,
  ];

  return db.query(query, values);
}

// Удалить задачу по ID
function deleteTaskById(id) {
  return db.query('DELETE FROM tasks WHERE id = ?', [id]);
}

// Отметить задачу выполненной
function markTaskAsDone(id) {
  return db.query('UPDATE tasks SET status = ? WHERE id = ?', ['done', id]);
}

module.exports = {
  getAllTasks,
  addTask,
  deleteTaskById,
  markTaskAsDone,
};
