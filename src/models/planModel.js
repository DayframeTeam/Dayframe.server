const db = require('../config/db');

// Получить все планы пользователя
function getPlansByUserId(user_id) {
  console.log(user_id);
  const query = 'SELECT * FROM plans WHERE user_id = ?';
  return db.query(query, [user_id]);
}

// Добавить новый план
function addPlan(plan) {
  const {
    title,
    duration = null,
    category = null,
    priority = null,
    exp = null,
    description = null,
    is_active = true,
    repeat_rule = 'daily',
    user_id,
  } = plan;

  const query = `
    INSERT INTO plans (
      title, duration, category, priority,
      exp, description, is_active, repeat_rule, user_id
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    title,
    duration,
    category,
    priority,
    exp,
    description,
    is_active,
    repeat_rule,
    user_id,
  ];

  return db.query(query, values);
}

// Удалить план по ID
function deletePlanById(id) {
  return db.query('DELETE FROM plans WHERE id = ?', [id]);
}

module.exports = {
  getPlansByUserId,
  addPlan,
  deletePlanById,
};
