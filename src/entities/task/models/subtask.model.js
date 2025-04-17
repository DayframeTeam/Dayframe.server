const db = require('../../../config/db');

function getSubtasksAllByUserId(user_id) {
  const query = 'SELECT * FROM subtasks WHERE user_id = ?';
  return db.query(query, [user_id]);
}

function getAllSubtasksByParentTaskId(parent_task_id) {
  return db.query('SELECT * FROM subtasks WHERE parent_task_id = ?', [
    parent_task_id,
  ]);
}

function addSubtask(user_id, subtask) {
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
}

function getSubtaskById(id) {
  return db.query('SELECT * FROM subtasks WHERE id = ?', [id]);
}

function deleteSubtaskById(id) {
  return db.query('DELETE FROM subtasks WHERE id = ?', [id]);
}

function updateSubtaskStatus(id, is_done) {
  return db.query('UPDATE subtasks SET is_done = ? WHERE id = ?', [
    is_done,
    id,
  ]);
}

function updateSubtasksStatus(parentTaskId, isDone) {
  return db.query(`UPDATE subtasks SET is_done = ? WHERE parent_task_id = ?`, [
    isDone,
    parentTaskId,
  ]);
}

function updateSubtask(id, title, position) {
  return db.query('UPDATE subtasks SET title = ?, position = ? WHERE id = ?', [
    title,
    position,
    id,
  ]);
}

function countAllSubtaskByParentTaskId(parent_task_id) {
  const query = `
    SELECT COUNT(*) AS total
    FROM subtasks
    WHERE parent_task_id = ?
  `;
  return db.query(query, [parent_task_id]);
}

function countCompletedSubtaskByParentTaskId(parent_task_id) {
  const query = `
    SELECT COUNT(*) AS completed
    FROM subtasks
    WHERE parent_task_id = ? AND is_done = 1
  `;
  return db.query(query, [parent_task_id]);
}

module.exports = {
  getSubtasksAllByUserId,
  getAllSubtasksByParentTaskId,
  addSubtask,
  getSubtaskById,
  deleteSubtaskById,
  updateSubtaskStatus,
  updateSubtask,
  countAllSubtaskByParentTaskId,
  countCompletedSubtaskByParentTaskId,
  updateSubtasksStatus,
};
