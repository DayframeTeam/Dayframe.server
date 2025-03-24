const planModel = require('../models/planModel');

// Получить все планы пользователя
exports.getPlansByUser = (req, res) => {
  const { userId } = req.params;

  planModel
    .getPlansByUserId(userId)
    .then(([rows]) => res.json(rows))
    .catch((err) => res.status(500).json({ error: err.message }));
};

// Добавить новый план
exports.createPlan = (req, res) => {
  const plan = req.body;

  planModel
    .addPlan(plan)
    .then(([result]) => res.status(201).json({ id: result.insertId, ...plan }))
    .catch((err) => res.status(500).json({ error: err.message }));
};

// Удалить план
exports.deletePlan = (req, res) => {
  const { id } = req.params;

  planModel
    .deletePlanById(id)
    .then(([result]) => {
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'План не найден' });
      }

      res.json({ message: 'План удалён' });
    })
    .catch((err) => res.status(500).json({ error: err.message }));
};
