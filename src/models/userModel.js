const db = require('../config/db');

exports.updateUserExp = (userId, delta) => {
  return db.query('UPDATE users SET exp = GREATEST(exp + ?, 0) WHERE id = ?', [
    delta,
    userId,
  ]);
};
