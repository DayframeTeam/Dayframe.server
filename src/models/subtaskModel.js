const db = require('../config/db');

exports.getSubtasksAllByUserId = (user_id) => {
  const query = 'SELECT * FROM subtasks WHERE user_id = ?';
  return db.query(query, [user_id]);
};

exports.getAllSubtasksByParentTaskId = (parent_task_id) => {
  return db.query('SELECT * FROM subtasks WHERE parent_task_id = ?', [
    parent_task_id,
  ]);
};

exports.addSubtask = (user_id, subtask) => {
  const {
    parent_task_id,
    title,
    is_done = false,
    position = 0,
    special_id,
  } = subtask;

  if (!special_id) {
    throw new Error('special_id is required for subtasks');
  }

  const query = `
      INSERT INTO subtasks (parent_task_id, title, is_done, position, special_id, user_id, created_at)
      VALUES (?, ?, ?, ?, ?, ?, NOW())
    `;
  return db.query(query, [
    parent_task_id,
    title,
    is_done,
    position,
    special_id,
    user_id,
  ]);
};

exports.getSubtaskById = (id) => {
  return db.query('SELECT * FROM subtasks WHERE id = ?', [id]);
};

exports.deleteSubtaskById = (id) => {
  return db.query('DELETE FROM subtasks WHERE id = ?', [id]);
};

exports.updateSubtaskStatus = (id, is_done) => {
  return db.query('UPDATE subtasks SET is_done = ? WHERE id = ?', [
    is_done,
    id,
  ]);
};

exports.updateSubtask = (id, title, position) => {
  return db.query('UPDATE subtasks SET title = ?, position = ? WHERE id = ?', [
    title,
    position,
    id,
  ]);
};

exports.countAllSubtaskByParentTaskId = (parent_task_id) => {
  const query = `
    SELECT COUNT(*) AS total
    FROM subtasks
    WHERE parent_task_id = ?
  `;
  return db.query(query, [parent_task_id]);
};

exports.countCompletedSubtaskByParentTaskId = (parent_task_id) => {
  const query = `
    SELECT COUNT(*) AS completed
    FROM subtasks
    WHERE parent_task_id = ? AND is_done = 1
  `;
  return db.query(query, [parent_task_id]);
};
