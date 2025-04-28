const db = require('../../../config/db');

function getAllTemplateSubtasksByParentTemplateTaskId(template_task_id) {
  return db.query(
    'SELECT * FROM template_subtasks WHERE template_task_id = ?',
    [template_task_id],
  );
}

function addTemplateSubtask(user_id, subtask) {
  const {
    title,
    position,
    created_at,
    special_id,
    template_task_id,
  } = subtask;
  return db.query(
    'INSERT INTO template_subtasks (title, position, user_id, created_at, special_id, template_task_id) VALUES (?, ?, ?, ?, ?, ?)',
    [
      title,
      position,
      user_id,
      created_at,
      special_id,
      template_task_id,
    ],
  );
}

function deleteTemplateSubtaskById(id) {
  return db.query('DELETE FROM template_subtasks WHERE id = ?', [id]);
}

function updateTemplateSubtask(id, title, position) {
  return db.query('UPDATE template_subtasks SET title = ?, position = ? WHERE id = ?', [title, position, id]);
}

module.exports = {
  getAllTemplateSubtasksByParentTemplateTaskId,
  addTemplateSubtask,
  deleteTemplateSubtaskById,
  updateTemplateSubtask,
};
