const db = require('../config/db');

exports.getAllSubtasksByUser = (userId) => {
  const query = `
    SELECT subtasks.*
    FROM subtasks
    JOIN tasks ON subtasks.parent_task_id = tasks.id
    WHERE tasks.user_id = ?
  `;
  return db.query(query, [userId]);
};

exports.getAllByParentId = (parentTaskId) => {
  return db.query('SELECT * FROM subtasks WHERE parent_task_id = ?', [
    parentTaskId,
  ]);
};

exports.addSubtask = (user_id, subtask) => {
  const {
    parent_task_id,
    title,
    is_done = false,
    position = 0,
    special_id = null,
  } = subtask;

  const query = `
      INSERT INTO subtasks (parent_task_id, title, is_done, position, special_id, user_id, created_at)
      VALUES (?, ?, ?, ?, ?, ?, NOW())
    `;
  return db.query(query, [
    parent_task_id,
    title,
    is_done,
    position,
    user_id,
    special_id,
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
