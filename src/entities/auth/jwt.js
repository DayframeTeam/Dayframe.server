const jwt = require('jsonwebtoken');
require('dotenv').config();

const { JWT_SECRET, JWT_EXPIRES_IN = '1d' } = process.env;

if (!JWT_SECRET) {
  throw new Error('Environment variable JWT_SECRET must be defined');
}

/**
 * Создаёт JWT для указанного payload.
 * @param {object} payload — полезная нагрузка (например: { sub: userId, chatId })
 * @returns {string} — подписанный токен
 */
function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
}

/**
 * Проверяет и декодирует JWT.
 * @param {string} token — строка токена из заголовка Authorization
 * @returns {object} — декодированный payload
 * @throws {JsonWebTokenError|TokenExpiredError} — если токен невалиден или просрочен
 */
function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

module.exports = { signToken, verifyToken };
