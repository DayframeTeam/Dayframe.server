require('dotenv').config();
const crypto = require('node:crypto');

class AuthService {
  // Собираем data_check_string
  buildDataCheckString(initData) {
    const params = new URLSearchParams(initData);
    const dataPairs = [];
    for (const [key, value] of params.entries()) {
      if (key === 'hash') continue;
      dataPairs.push(`${key}=${value}`);
    }
    dataPairs.sort();
    return dataPairs.join('\n');
  }

  async validateInitData(initData) {
    if (typeof initData !== 'string') {
      return { valid: false, error: 'initData missing' };
    }

    // Вытаскиваем hash из строки
    const params = new URLSearchParams(initData);
    const hash = params.get('hash');
    if (!hash) {
      return { valid: false, error: 'hash missing' };
    }

    // Собираем нашу строку для подписи
    const dataCheckString = this.buildDataCheckString(initData);

    // Шаг 1: из BOT_TOKEN делаем секретный ключ
    // secretKey = HMAC_SHA256(bot_token, "WebAppData")
    const secretKey = crypto
      .createHmac('sha256', 'WebAppData')
      .update(process.env.BOT_TOKEN)
      .digest();

    // Шаг 2: считаем HMAC-SHA256(dataCheckString, secretKey)
    const calculatedHmac = crypto
      .createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');

    const valid = calculatedHmac === hash;
    return { valid };
  }
}

// Create a singleton instance
const authService = new AuthService();

// Export the instance
module.exports = authService;
