const calendarModel = require('../models/calendarEventModel');

// Получить все события пользователя
exports.getEventsByUser = (req, res) => {
  const { userId } = req.params;

  calendarModel
    .getEventsByUserId(userId)
    .then(([rows]) => res.json(rows))
    .catch((err) => res.status(500).json({ error: err.message }));
};

// Добавить новое событие
exports.createEvent = (req, res) => {
  const event = req.body;

  calendarModel
    .addEvent(event)
    .then(([result]) => res.status(201).json({ id: result.insertId, ...event }))
    .catch((err) => res.status(500).json({ error: err.message }));
};

// Удалить событие
exports.deleteEvent = (req, res) => {
  const { id } = req.params;

  calendarModel
    .deleteEventById(id)
    .then(([result]) => {
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Событие не найдено' });
      }

      res.json({ message: 'Событие удалено' });
    })
    .catch((err) => res.status(500).json({ error: err.message }));
};

// Обновить статус события (и опыт)
exports.updateEventStatus = (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const user_id = 1;//TODO:

  if (!['done', 'planned'].includes(status)) {
    return res.status(400).json({ error: 'Недопустимый статус' });
  }

  calendarModel
    .updateEventStatus(user_id, id, status)
    .then((result) => res.json(result))
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: err.message });
    });
};
