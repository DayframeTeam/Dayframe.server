const pool = require('../config/db');

// Получить все задачи
function getAllTasks() {
  return pool.query('SELECT * FROM tasks');
}

// Добавить задачу
function addTask(task) {
  const {
    title,
    status,
    duration,
    category,
    priority,
    startTime,
    exp,
    description,
  } = task;

  const query = `
    INSERT INTO tasks (title, status, duration, category, priority, startTime, exp, description)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  return pool.query(query, [
    title,
    status,
    duration,
    category,
    priority,
    startTime,
    exp,
    description,
  ]);
}

// Удалить задачу по ID
function deleteTaskById(id) {
  const query = 'DELETE FROM tasks WHERE id = ?';
  return pool.query(query, [id]);
}

// Обновить статус задачи на "done"
function markTaskAsDone(id) {
  const query = 'UPDATE tasks SET status = ? WHERE id = ?';
  return pool.query(query, ['done', id]);
}

module.exports = {
  getAllTasks,
  addTask,
  deleteTaskById,
  markTaskAsDone,
};
