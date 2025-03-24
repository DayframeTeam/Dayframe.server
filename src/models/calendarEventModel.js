const db = require('../config/db');

// Получить все события пользователя
function getEventsByUserId(user_id) {
  const query = 'SELECT * FROM calendar_events WHERE user_id = ?';
  return db.query(query, [user_id]);
}

// Добавить новое событие
function addEvent(event) {
  const {
    title,
    start_time,
    event_date,
    duration = null,
    category = null,
    priority = null,
    repeat_rule = null,
    exp = null,
    description = null,
    user_id,
  } = event;

  const query = `
    INSERT INTO calendar_events (
      title, start_time, event_date, duration,
      category, priority, repeat_rule, exp, description, user_id
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    title,
    start_time,
    event_date,
    duration,
    category,
    priority,
    repeat_rule,
    exp,
    description,
    user_id,
  ];

  return db.query(query, values);
}

// Удалить событие по ID
function deleteEventById(id) {
  return db.query('DELETE FROM calendar_events WHERE id = ?', [id]);
}

module.exports = {
  getEventsByUserId,
  addEvent,
  deleteEventById,
};
