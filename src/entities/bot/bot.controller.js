const botService = require("./bot.service");

class BotController {
  getTasksForTodayByChatId(req, res) {
    const chat_id = req.params.chat_id;
    botService.getTasksForTodayByChatId(chat_id).then((result) => {
      res.status(result.status).json(result.data);
    });
  }
}

module.exports = new BotController();
