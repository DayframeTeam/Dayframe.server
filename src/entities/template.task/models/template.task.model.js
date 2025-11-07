const db = require('../../../config/db');

function getTemplateTaskById(id) {
  return db.query('SELECT * FROM template_tasks WHERE id = ?', [id]);
}

/**
 * Get all template tasks for a specific user
 * @deprecated Use getAllTemplateTasksWithSubtasksByUser for better performance when subtasks are needed
 * @param {number} user_id - User ID
 */
function getAllTemplateTasksByUser(user_id) {
  return db.query('SELECT * FROM template_tasks WHERE user_id = ?', [user_id]);
}

/**
 * Get all template tasks with their subtasks for a user using SQL JOIN (optimized)
 * @param {number} user_id - User ID
 * @returns {Promise} Promise resolving to template tasks with subtasks in a flat structure
 */
function getAllTemplateTasksWithSubtasksByUser(user_id) {
  return db
    .query(
      `SELECT 
        t.id,
        t.title,
        t.description,
        t.category,
        t.priority,
        t.exp,
        t.start_time,
        t.end_time,
        t.user_id,
        t.created_at,
        t.special_id,
        t.is_active,
        t.repeat_rule,
        t.start_active_date,
        t.end_active_date,
        s.id as subtask_id,
        s.title as subtask_title,
        s.position as subtask_position,
        s.special_id as subtask_special_id,
        s.created_at as subtask_created_at
      FROM template_tasks t
      LEFT JOIN template_subtasks s ON t.id = s.template_task_id
      WHERE t.user_id = ?
      ORDER BY t.id, s.position`,
      [user_id]
    )
    .then(([rows]) => [rows])
    .catch((error) => {
      console.error('Ошибка при получении шаблонов задач с подзадачами:', error);
      throw error;
    });
}

function createTemplateTask(templateTask) {
  const {
    title,
    description,
    category,
    priority,
    exp = 0,
    start_time,
    end_time,
    user_id,
    created_at,
    special_id,
    is_active = true,
    repeat_rule = [], // по умолчанию массив
    start_active_date,
    end_active_date,
  } = templateTask;

  // сериализуем массив в строку
  const repeatRuleJson = JSON.stringify(repeat_rule);

  const sql = `
    INSERT INTO template_tasks
      (title, description, category, priority, exp,
       start_time, end_time, user_id, created_at,
       special_id, is_active, repeat_rule,
       start_active_date, end_active_date)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  return db.query(sql, [
    title,
    description,
    category,
    priority,
    exp,
    start_time,
    end_time,
    user_id,
    created_at,
    special_id,
    is_active,
    repeatRuleJson, // <-- здесь JSON вместо массива
    start_active_date,
    end_active_date,
  ]);
}

function deleteTemplateTaskById(id) {
  return db.query('DELETE FROM template_tasks WHERE id = ?', [id]);
}

function updateTemplateTaskById(id, updatedTask) {
  const {
    title,
    description,
    category,
    priority,
    exp,
    start_time,
    end_time,
    is_active,
    repeat_rule,
    start_active_date,
    end_active_date,
  } = updatedTask;
  return db.query(
    `UPDATE template_tasks SET
      title = ?, 
      description = ?, 
      category = ?, 
      priority = ?, 
      exp = ?,
      start_time = ?, 
      end_time = ?, 
      is_active = ?,
      repeat_rule = ?,
      start_active_date = ?,
      end_active_date = ?
     WHERE id = ?`,
    [
      title,
      description,
      category,
      priority,
      exp,
      start_time,
      end_time,
      is_active,
      repeat_rule,
      start_active_date,
      end_active_date,
      id,
    ],
  );
}

function updateTemplateTaskActive(id, is_active) {
  return db.query('UPDATE template_tasks SET is_active = ? WHERE id = ?', [
    is_active,
    id,
  ]);
}

function getTemplatesForDay(user_id, dayOfWeek) {
  // 1) JSON для «каждый день» — массив 1..7
  const fullWeekJson = JSON.stringify([1, 2, 3, 4, 5, 6, 7]); // -> "[1,2,3,4,5,6,7]"

  // 2) Паттерн для поиска dayOfWeek внутри JSON-массива
  const dowJson = JSON.stringify(dayOfWeek); // -> "3" если день = 3
  const likeDow = `%${dowJson}%`; // -> '%"3"%'

  const sql = `
    SELECT *
      FROM template_tasks
     WHERE user_id   = ?
       AND is_active = 1
       AND (
            -- «каждый день»
            repeat_rule = ?
            -- либо этот день есть в массиве
         OR repeat_rule LIKE ?
       )
  `;

  return db.query(sql, [user_id, fullWeekJson, likeDow]);
}

module.exports = {
  getTemplateTaskById,
  getAllTemplateTasksByUser,
  getAllTemplateTasksWithSubtasksByUser,
  createTemplateTask,
  deleteTemplateTaskById,
  updateTemplateTaskById,
  updateTemplateTaskActive,
  getTemplatesForDay,
};
