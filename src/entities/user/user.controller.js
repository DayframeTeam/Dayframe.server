const userService = require('./user.service');

/**
 * User controller class that handles HTTP requests related to users
 */
class UserController {
  /**
   * Get current user data
   *
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   */
  async getCurrentUser(req, res) {
    const userId = Number(req.user.id);

    try {
      const user = await userService.getUserById(userId);

      if (!user) {
        return res.status(404).json({ error: 'Пользователь не найден' });
      }

      res.json(user);
    } catch (err) {
      console.error('Ошибка при получении данных пользователя:', err);
      return res
        .status(500)
        .json({ error: 'Ошибка при получении данных пользователя' });
    }
  }
}

module.exports = new UserController();
