const userService = require('./user.service');

/**
 * User controller class that handles HTTP requests related to users
 */
class UserController {
  /**
   * Generic error handler for controllers
   *
   * @param {object} res - Express response object
   * @param {Error} error - Error to handle
   * @param {string} defaultMessage - Default error message
   */
  handleControllerError(res, error, defaultMessage) {
    console.error(`❌ ${defaultMessage}:`, error);

    // Check if it's a validation error from our service
    if (
      error.message === 'Invalid user ID' ||
      error.message === 'Experience points must be a non-negative number'
    ) {
      return res.status(400).json({ error: error.message });
    }

    // Generic server error
    res.status(500).json({ error: defaultMessage });
  }

  /**
   * Get current user data
   *
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   */
  async getCurrentUser(req, res) {
    const userId = Number(req.headers['user-id']);

    try {
      const user = await userService.getUserById(userId);

      if (!user) {
        return res.status(404).json({ error: 'Пользователь не найден' });
      }

      res.json(user);
    } catch (err) {
      this.handleControllerError(
        res,
        err,
        'Ошибка при получении данных пользователя',
      );
    }
  }
}

module.exports = new UserController();
