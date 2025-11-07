const botService = require('./bot.service');

class BotController {
  /**
   * Get tasks for a specific date by chat_id
   * Route: GET /bot/tasks/:chat_id?date=YYYY-MM-DD
   * If date is not provided, returns tasks for today
   */
  getTasksForDateByChatId(req, res) {
    const chat_id = req.params.chat_id;
    const date = req.query.date || null; // Optional date parameter

    botService.getTasksForDateByChatId(chat_id, date).then((result) => {
      res.status(result.status).json(result.data);
    });
  }

  /**
   * @deprecated Use getTasksForDateByChatId instead. This method is kept for backward compatibility.
   */
  getTasksForTodayByChatId(req, res) {
    const chat_id = req.params.chat_id;
    botService.getTasksForTodayByChatId(chat_id).then((result) => {
      res.status(result.status).json(result.data);
    });
  }
}

module.exports = new BotController();
