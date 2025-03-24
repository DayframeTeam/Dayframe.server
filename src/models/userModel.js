const db = require('../config/db');

// Добавить нового пользователя
function addUser(user) {
  const { username, email, password, telegram_id, is_premium } = user;

  const query = `
    INSERT INTO users (username, email, password, telegram_id, is_premium)
    VALUES (?, ?, ?, ?, ?)
  `;

  return db.query(query, [
    username,
    email,
    password,
    telegram_id,
    is_premium ?? false,
  ]);
}

// Найти пользователя по ID
function getUserById(id) {
  return db.query('SELECT * FROM users WHERE id = ?', [id]);
}

// Найти пользователя по Telegram ID
function getUserByTelegramId(telegramId) {
  return db.query('SELECT * FROM users WHERE telegram_id = ?', [telegramId]);
}

module.exports = {
  addUser,
  getUserById,
  getUserByTelegramId,
};
