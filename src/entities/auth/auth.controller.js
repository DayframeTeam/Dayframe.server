const { signToken } = require('./jwt.js');
const userService = require('../user/user.service.js');
const authService = require('./auth.service.js');

class AuthController {
  async webappLogin(req, res) {
    const { initData } = req.body;

    const { valid } = await authService.validateInitData(initData);
    if (!valid) {
      return res.status(400).json({ valid: false, error: 'initData missing' });
    }
    const { status, data } = await userService.getOrCreateByChatId(initData);
    if (status !== 200) {
      return res.status(status).json(data);
    }

    // Генерируем JWT, КЛАДЁМ В PAYLOAD и user.id, и chatId
    const token = signToken({
      id: data.id, // стандартный claim "subject" — ваш внутренний user.id
      chat_id: data.chat_id, // кастомный claim для telegram chat id
    });

    // Отдаём его клиенту
    res.json({ accessToken: token });
  }
}

module.exports = new AuthController();
