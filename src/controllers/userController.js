const userModel = require('../models/userModel');

// Получить данные текущего пользователя
exports.getCurrentUser = async (req, res) => {
  const userId = Number(req.headers['user-id']);

  if (!userId) {
    return res.status(400).json({ error: 'Не передан user-id в заголовке' });
  }

  try {
    const [rows] = await userModel.getUserById(userId);

    if (!rows || rows.length === 0) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    // Удаляем пароль из ответа
    const user = { ...rows[0] };
    delete user.password;

    res.json(user);
  } catch (err) {
    console.error('❌ Ошибка при получении данных пользователя:', err);
    res.status(500).json({ error: 'Ошибка при получении данных пользователя' });
  }
};

// Обновить опыт пользователя
exports.updateUserExp = async (req, res) => {
  const userId = Number(req.headers['user-id']);
  const { exp } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'Не передан user-id в заголовке' });
  }

  if (typeof exp !== 'number') {
    return res.status(400).json({ error: 'Поле exp должно быть числом' });
  }

  try {
    const [result] = await userModel.setUserExp(userId, exp);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    // Получаем обновленные данные пользователя
    const [rows] = await userModel.getUserById(userId);
    const user = { ...rows[0] };
    delete user.password;

    res.json(user);
  } catch (err) {
    console.error('❌ Ошибка при обновлении опыта пользователя:', err);
    res.status(500).json({ error: 'Ошибка при обновлении опыта пользователя' });
  }
};
