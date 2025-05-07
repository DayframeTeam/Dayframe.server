const userService = require('../user/user.service');
const taskService = require('../task/task.service');
/**
 * Bot service class with business logic for bot operations
 */
class BotService {
  async getTasksForTodayByChatId(chat_id) {
    try {
      const user = await userService.getUserByChatId(chat_id);
      if (!user) {
        return { status: 404, data: { error: 'Пользователь не найден' } };
      }
      const result = await taskService.getTasksForToday(user.id, user.timezone);
      return { status: result.status, data: result.data };
    } catch (err) {
      console.error("❌ Ошибка при получении задач на сегодня:", err);
      return { status: 500, data: { error: err.message } };
    }
  }
}

// Create a singleton instance
const botService = new BotService();

// Export the instance
module.exports = botService;
