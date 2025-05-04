const db = require('../../../config/db');

// Получить пользователя по ID
function getUserById(userId) {
  return db.query('SELECT * FROM users WHERE id = ?', [userId]);
}

// Обновить опыт пользователя (добавить или вычесть)
function updateUserExp(userId, delta) {
  return db.query('UPDATE users SET exp = GREATEST(exp + ?, 0) WHERE id = ?', [
    delta,
    userId,
  ]);
}

// Установить конкретное значение опыта
function setUserExp(userId, exp) {
  return db.query('UPDATE users SET exp = GREATEST(?, 0) WHERE id = ?', [
    exp,
    userId,
  ]);
}

function getUserByChatId(chat_id) {
  return db.query('SELECT * FROM users WHERE chat_id = ?', [chat_id]);
}

function registerUser(newUser) {
  const { username, password, chat_id } = newUser;
  return db.query(
    'INSERT INTO users (username, password, chat_id) VALUES (?, ?, ?)',
    [username, password, chat_id],
  );
}

module.exports = { getUserById, updateUserExp, setUserExp, getUserByChatId, registerUser };
