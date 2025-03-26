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
    email ?? null,
    password,
    telegram_id ?? null,
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

// 🔹 Начислить опыт пользователю
function addUserExp(userId, exp) {
  const query = 'UPDATE users SET exp = exp + ? WHERE id = ?';
  return db.query(query, [exp, userId]);
}

// 🔹 Снять опыт у пользователя (если вдруг убрал галочку)
function subtractUserExp(userId, exp) {
  const query = 'UPDATE users SET exp = GREATEST(exp - ?, 0) WHERE id = ?';
  return db.query(query, [exp, userId]);
}

module.exports = {
  addUser,
  getUserById,
  getUserByTelegramId,
  addUserExp,
  subtractUserExp,
};
