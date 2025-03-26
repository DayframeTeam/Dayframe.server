const db = require('../config/db');
const userModel = require('../models/userModel');

/**
 * Проверка прав доступа пользователя к событию
 * Возвращает { status, exp } если пользователь владелец, иначе null
 */
function checkUserAccessToEvent(id, user_id) {
  const query = `
    SELECT status, exp FROM calendar_events 
    WHERE id = ? AND user_id = ?
  `;
  return db.query(query, [id, user_id]).then(([rows]) => {
    return rows.length > 0 ? rows[0] : null;
  });
}

// Получить все события пользователя
function getEventsByUserId(user_id) {
  console.log('calendar_events');
  const query = 'SELECT * FROM calendar_events WHERE user_id = ?';
  return db.query(query, [user_id]);
}

// Добавить новое событие
function addEvent(event) {
  const {
    title,
    start_time = null,
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

// Обновить статус события и скорректировать опыт пользователя
function updateEventStatus(user_id, id, status) {
  return checkUserAccessToEvent(id, user_id).then((event) => {
    if (!event) {
      throw new Error('Событие не найдено или нет доступа');
    }

    const { status: currentStatus, exp = 0 } = event;

    if (currentStatus === status) {
      return { message: 'Статус не изменился' };
    }

    const updateQuery = 'UPDATE calendar_events SET status = ? WHERE id = ?';
    return db
      .query(updateQuery, [status, id])
      .then(() => {
        if (status === 'done') {
          return userModel.addUserExp(user_id, exp);
        } else if (status === 'planned') {
          return userModel.subtractUserExp(user_id, exp);
        }
      })
      .then(() => ({ message: 'Статус обновлён и опыт скорректирован' }));
  });
}

module.exports = {
  getEventsByUserId,
  addEvent,
  deleteEventById,
  updateEventStatus,
};
