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
  // 1) «daily» в вашем хранилище — это JSON.stringify('daily') === "\"daily\""
  const dailyJson = JSON.stringify('daily');       // -> "\"daily\""
  // 2) Паттерн для поиска числа в массиве: "%\"3\"%" для dayOfWeek = 3
  const likeDow   = `%\"${dayOfWeek}\"%`;          

  const sql = `
    SELECT *
      FROM template_tasks
     WHERE user_id   = ?
       AND is_active = 1
       AND (
            repeat_rule = ?
         OR repeat_rule LIKE ?
       )
  `;

  return db.query(sql, [user_id, dailyJson, likeDow]);
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
