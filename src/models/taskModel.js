const db = require('../config/db');

function getAllTasksByUser(userId) {
  return db.query('SELECT * FROM tasks WHERE user_id = ?', [userId]);
}

function addTask(task) {
  const {
    title,
    description,
    status = false,
    category,
    priority,
    exp = 0,
    duration,
    start_time,
    end_time,
    task_date,
    user_id,
  } = task;

  return db.query(
    `INSERT INTO tasks (
      title, description, status, category, priority, exp,
      duration, start_time, end_time, task_date, user_id
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      title,
      description,
      status,
      category,
      priority,
      exp,
      duration,
      start_time,
      end_time,
      task_date,
      user_id,
    ],
  );
}

function deleteTaskById(id) {
  return db.query('DELETE FROM tasks WHERE id = ?', [id]);
}

function setTaskStatus(status, id) {
  return db.query('UPDATE tasks SET status = ? WHERE id = ?', [status, id]);
}

function updateTaskById(id, task) {
  const {
    title,
    description,
    status,
    category,
    priority,
    exp,
    duration,
    start_time,
    end_time,
    task_date,
  } = task;

  return db.query(
    `UPDATE tasks SET
      title = ?, description = ?, status = ?, category = ?, priority = ?, exp = ?,
      duration = ?, start_time = ?, end_time = ?, task_date = ?
     WHERE id = ?`,
    [
      title,
      description,
      status,
      category,
      priority,
      exp,
      duration,
      start_time,
      end_time,
      task_date,
      id,
    ],
  );
}

module.exports = {
  getAllTasksByUser,
  addTask,
  deleteTaskById,
  setTaskStatus,
  updateTaskById,
};
