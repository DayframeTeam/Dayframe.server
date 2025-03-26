const db = require('../config/db');

exports.getAllByUserId = (userId) => {
  const query = `
    SELECT ts.*
    FROM template_subtasks ts
    JOIN template_tasks tt ON ts.parent_template_task_id = tt.id
    WHERE tt.user_id = ?
  `;
  return db.query(query, [userId]);
};

exports.getAllByParentId = (parentId) => {
  const query = `
      SELECT *
      FROM template_subtasks
      WHERE parent_template_task_id = ?
      ORDER BY position ASC
    `;
  return db.query(query, [parentId]);
};

exports.create = (subtask) => {
  const {
    parent_template_task_id,
    title,
    is_done = false,
    position,
    special_id,
    user_id,
  } = subtask;

  const query = `
      INSERT INTO template_subtasks (
        parent_template_task_id, title, is_done, position, special_id, user_id
      ) VALUES (?, ?, ?, ?, ?, ?)
    `;

  return db.query(query, [
    parent_template_task_id,
    title,
    is_done,
    position,
    special_id,
    user_id,
  ]);
};

exports.getById = (id) => {
  return db.query('SELECT * FROM template_subtasks WHERE id = ?', [id]);
};

exports.deleteById = (id) => {
  return db.query('DELETE FROM template_subtasks WHERE id = ?', [id]);
};

exports.getTemplateSubtaskById = (id) => {
  return db.query('SELECT * FROM template_subtasks WHERE id = ?', [id]);
};

exports.updateTemplateSubtaskStatus = (id, is_done) => {
  return db.query('UPDATE template_subtasks SET is_done = ? WHERE id = ?', [
    is_done,
    id,
  ]);
};

exports.updateStatusByTemplateSubtasks = async (templateTaskId) => {
  const [[{ total }]] = await db.query(
    'SELECT COUNT(*) as total FROM template_subtasks WHERE template_task_id = ?',
    [templateTaskId],
  );

  const [[{ active }]] = await db.query(
    'SELECT COUNT(*) as active FROM template_subtasks WHERE template_task_id = ? AND is_done = 1',
    [templateTaskId],
  );

  const newStatus = total > 0 && total === active ? 1 : 0;

  return db.query('UPDATE template_tasks SET is_done = ? WHERE id = ?', [
    newStatus,
    templateTaskId,
  ]);
};
