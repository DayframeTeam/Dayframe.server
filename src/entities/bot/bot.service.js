const userService = require('../user/user.service');
const taskService = require('../task/task.service');
const templateModel = require('../template.task/models/template.task.model');
const { getDateStringInTZ } = require('../../utils/date');

/**
 * Bot service class with business logic for bot operations
 */
class BotService {
  /**
   * Get tasks for a specific date by chat_id (optimized with subtasks)
   * Returns format compatible with old API: { tasks, templates, dateString, dayOfWeek }
   * @param {string} chat_id - Telegram chat ID
   * @param {string} date - Optional date in YYYY-MM-DD format. If not provided, uses today in user's timezone
   * @returns {Promise<{status: number, data: any}>}
   */
  async getTasksForDateByChatId(chat_id, date = null) {
    try {
      const user = await userService.getUserByChatId(chat_id);
      if (!user) {
        return { status: 404, data: { error: 'Пользователь не найден' } };
      }

      const timezone = user.timezone || 'Europe/Moscow';

      // If date is not provided, use today in user's timezone
      const taskDate = date || getDateStringInTZ(timezone);
      const dateString = taskDate;

      // Get tasks with subtasks (optimized - 2 queries)
      const tasksResult = await taskService.getTasksForDateWithSubTasks(user.id, taskDate);
      if (tasksResult.status !== 200) {
        return tasksResult;
      }

      // Calculate day of week for templates
      // Parse the date to get day of week
      const dateObj = new Date(taskDate + 'T12:00:00'); // Use noon to avoid timezone issues
      const jsDay = dateObj.getDay();
      const dayOfWeek = jsDay === 0 ? 7 : jsDay; // Convert Sunday (0) to 7

      // Get templates for this day of week
      const [templates] = await templateModel.getTemplatesForDay(user.id, dayOfWeek);

      return {
        status: 200,
        data: {
          tasks: tasksResult.data,
          templates: templates || [],
          dateString,
          dayOfWeek,
        },
      };
    } catch (err) {
      console.error('❌ Ошибка при получении задач на дату:', err);
      return { status: 500, data: { error: err.message } };
    }
  }

  /**
   * @deprecated Use getTasksForDateByChatId instead. This method is kept for backward compatibility.
   */
  async getTasksForTodayByChatId(chat_id) {
    return this.getTasksForDateByChatId(chat_id);
  }
}

// Create a singleton instance
const botService = new BotService();

// Export the instance
module.exports = botService;
