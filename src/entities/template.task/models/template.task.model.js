const db = require('../../../config/db');

function getTemplateTaskById(id) {
  return db.query('SELECT * FROM template_tasks WHERE id = ?', [id]);
}

function getAllTemplateTasksByUser(user_id) {
  return db.query('SELECT * FROM template_tasks WHERE user_id = ?', [user_id]);
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
  createTemplateTask,
  deleteTemplateTaskById,
  updateTemplateTaskById,
  updateTemplateTaskActive,
  getTemplatesForDay,
};
