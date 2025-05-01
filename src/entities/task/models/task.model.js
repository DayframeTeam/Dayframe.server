const db = require('../../../config/db');

/**
 * Get all tasks for a specific user
 * @param {number} user_id - User ID
 */
function getAllTasksByUser(user_id) {
  return db
    .query('SELECT * FROM tasks WHERE user_id = ?', [user_id])
    .then(([tasks]) => [tasks])
    .catch((error) => {
      console.error('Ошибка при получении задач:', error);
      throw error; // Let the service layer handle the error
    });
}

/**
 * Get a task by its ID
 * @param {number} id - Task ID
 */
function getTaskById(id) {
  return db
    .query('SELECT * FROM tasks WHERE id = ?', [id])
    .then(([tasks]) => {
      if (!tasks.length) return [[]];
      return [[tasks[0]]];
    })
    .catch((error) => {
      console.error('Ошибка при получении задачи:', error);
      throw error; // Let the service layer handle the error
    });
}

/**
 * Add a new task
 * @param {Object} task - Task object
 */
function addTask(task) {
  const {
    title,
    description = null,
    category = null,
    priority = null, // 'low', 'medium', 'high'
    exp = 0,
    start_time = null,
    end_time = null,
    task_date = null,
    user_id,
    special_id,
    is_done = false,
  } = task;

  return db.query(
    `INSERT INTO tasks (
      title, description, category, priority, exp,
      start_time, end_time, user_id, special_id, is_done, task_date
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      title,
      description,
      category,
      priority,
      exp,
      start_time,
      end_time,
      user_id,
      special_id,
      is_done,
      task_date,
    ],
  );
}

/**
 * Delete a task by its ID
 * @param {number} id - Task ID
 */
function deleteTaskById(id) {
  return db.query('DELETE FROM tasks WHERE id = ?', [id]);
}

/**
 * Update a task's completion status
 * @param {boolean} is_done - Task completion status
 * @param {number} id - Task ID
 */
function setTaskStatus(is_done, id) {
  return db.query('UPDATE tasks SET is_done = ? WHERE id = ?', [is_done, id]);
}

function setTaskDate(task_date, id) {
  return db.query('UPDATE tasks SET task_date = ? WHERE id = ?', [task_date, id]);
}

/**
 * Update a task by its ID
 * @param {number} id - Task ID
 * @param {Object} task - Task object with updated fields
 */
function updateTaskById(id, task) {
  const {
    title,
    description,
    category,
    priority,
    start_time,
    end_time,
    task_date,
    is_done,
  } = task;

  return db.query(
    `UPDATE tasks SET
      title = ?, 
      description = ?, 
      category = ?, 
      priority = ?, 
      start_time = ?, 
      end_time = ?, 
      task_date = ?,
      is_done = ?
     WHERE id = ?`,
    [
      title,
      description,
      category,
      priority,
      start_time,
      end_time,
      task_date,
      is_done,
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
  setTaskDate,
  updateTaskById,
};
