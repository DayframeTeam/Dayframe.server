const { signToken } = require('./jwt.js');
const userService = require('../user/user.service.js');

class AuthController {
  async webappLogin(req, res) {
    const { chat_id } = req.params;
    console.log('🔑 chat_id', chat_id);
    // Находим или создаём пользователя по chatId
    //    В userService.getOrCreateByChatId должны возвращать объект
    //    { id: <user.id>, chatId: <telegram chat id>, ... }
    const { status, data } = await userService.getOrCreateByChatId(chat_id);

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
