const db = require('../../../config/db');

// Получить пользователя по ID
exports.getUserById = async (userId) => {
  return db.query('SELECT * FROM users WHERE id = ?', [userId]);
};

// Обновить опыт пользователя (добавить или вычесть)
exports.updateUserExp = (userId, delta) => {
  return db.query('UPDATE users SET exp = GREATEST(exp + ?, 0) WHERE id = ?', [
    delta,
    userId,
  ]);
};

// Установить конкретное значение опыта
exports.setUserExp = (userId, exp) => {
  return db.query('UPDATE users SET exp = GREATEST(?, 0) WHERE id = ?', [
    exp,
    userId,
  ]);
};
