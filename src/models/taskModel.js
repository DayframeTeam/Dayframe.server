const db = require('../config/db');

function getAllTasksByUser(user_id) {
  return db
    .query('SELECT * FROM tasks WHERE user_id = ?', [user_id])
    .then(([tasks]) => [tasks])
    .catch((error) => {
      console.error('Ошибка при получении задач:', error);
      return [[]];
    });
}

function getTaskById(id) {
  return db
    .query('SELECT * FROM tasks WHERE id = ?', [id])
    .then(([tasks]) => {
      if (!tasks.length) return [[]];
      return [[tasks[0]]];
    })
    .catch((error) => {
      console.error('Ошибка при получении задачи:', error);
      return [[]];
    });
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

function setTaskStatus(is_done, id) {
  return db.query('UPDATE tasks SET is_done = ? WHERE id = ?', [is_done, id]);
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
  getTaskById,
  addTask,
  deleteTaskById,
  setTaskStatus,
  updateTaskById,
};
