const userModel = require('../models/userModel');

exports.createUser = (req, res) => {
  const user = req.body;
  userModel
    .addUser(user)
    .then(([result]) => res.status(201).json({ id: result.insertId, ...user }))
    .catch((err) => res.status(500).json({ error: err.message }));
};

exports.getUserById = (req, res) => {
  const { id } = req.params;
  userModel
    .getUserById(id)
    .then(([rows]) => {
      if (rows.length === 0)
        return res.status(404).json({ error: 'Пользователь не найден' });
      res.json(rows[0]);
    })
    .catch((err) => res.status(500).json({ error: err.message }));
};

exports.getUserByTelegramId = (req, res) => {
  const { telegram_id } = req.params;
  userModel
    .getUserByTelegramId(telegram_id)
    .then(([rows]) => {
      if (rows.length === 0)
        return res.status(404).json({ error: 'Пользователь не найден' });
      res.json(rows[0]);
    })
    .catch((err) => res.status(500).json({ error: err.message }));
};
