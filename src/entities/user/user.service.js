const userModel = require('./models/user.model');

/**
 * Validation helper class
 */
class Validation {
  /**
   * Validate user ID
   *
   * @param {number} userId - User ID to validate
   * @throws {Error} If userId is invalid
   */
  static validateUserId(userId) {
    if (!userId || isNaN(userId) || userId <= 0) {
      throw new Error('Invalid user ID');
    }
  }
}

/**
 * User service class with business logic for user operations
 */
class UserService {
  async returnSafeUser(user) {
    const safeUser = {
      id: user.id,
      username: user.username,
      email: user.email,
      chat_id: user.chat_id,
      is_premium: user.is_premium,
      user_categories: user.user_categories,
      exp: user.exp,
      timezone: user.timezone,
      created_at: user.created_at,
    };

    return safeUser;
  }
  /**
   * Get user by ID with password removed
   *
   * @param {number} userId - User ID
   * @returns {Promise<Object|null>} User object without password or null if not found
   * @throws {Error} If userId is invalid or database error occurs
   */
  async getUserById(userId) {
    Validation.validateUserId(userId);

    try {
      const [rows] = await userModel.getUserById(userId);

      if (!rows || rows.length === 0) {
        return null;
      }

      // Remove password from response
      const user = { ...rows[0] };
      delete user.password;

      return this.returnSafeUser(user);
    } catch (error) {
      console.error('Error in getUserById service:', error);
      return { status: 500, data: { error: error.message } };
    }
  }

  /**
   * Update user experience points
   *
   * @param {number} userId - User ID
   * @param {number} exp - New experience points value
   * @returns {Promise<Object|null>} Updated user object without password or null if not found
   * @throws {Error} If userId is invalid, exp is invalid, or database error occurs
   */
  async updateUserExp(userId, exp) {
    Validation.validateUserId(userId);

    // if (typeof exp !== 'number' || exp < 0) {
    //   throw new Error('Experience points must be a non-negative number');
    // }

    try {
      const [result] = await userModel.updateUserExp(userId, exp);

      if (result.affectedRows === 0) {
        return null;
      }

      // Get updated user data
      return await this.getUserById(userId);
    } catch (error) {
      console.error('Error in updateUserExp service:', error);
      throw error;
    }
  }

  async parseInitData(initDataString) {
    const params = new URLSearchParams(initDataString);
    const result = {};

    for (const [rawKey, rawValue] of params.entries()) {
      if (rawKey === 'hash') continue;

      if (rawKey === 'user') {
        // Обрабатываем user как JSON
        result.user = JSON.parse(rawValue);
      } else {
        // Обрабатываем остальные поля как обычно
        const keys = rawKey.split('.');
        let cursor = result;

        keys.forEach((key, idx) => {
          if (idx === keys.length - 1) {
            const num = Number(rawValue);
            cursor[key] = String(num) === rawValue ? num : rawValue;
          } else {
            if (cursor[key] == null) {
              cursor[key] = {};
            }
            cursor = cursor[key];
          }
        });
      }
    }

    return result;
  }

  async getUserByChatId(chat_id) {
    try {
      const [rows] = await userModel.getUserByChatId(chat_id);
      if (!rows || rows.length === 0) {
        return null;
      }
      const user = this.returnSafeUser(rows[0]);
      return user;
    } catch (error) {
      console.error('Error in getUserByChatId service:', error);
      return { status: 500, data: { error: error.message } };
    }
  }

  async registerUser(initData) {
    try {
      const newUser = {
        username: initData.user.first_name,
        password: 'password',
        chat_id: initData.user.id,
      };
      await userModel.registerUser(newUser);
      const user = await this.getUserByChatId(initData.user.id);
      return user;
    } catch (error) {
      console.error('Error in registerUser service:', error);
      return { status: 500, data: { error: error.message } };
    }
  }

  async getOrCreateByChatId(initData) {
    try {
      const parsedInitData = await this.parseInitData(initData);
      const user = await this.getUserByChatId(parsedInitData.user.id);
      if (!user) {
        const newUser = await this.registerUser(parsedInitData);
        return { status: 200, data: newUser };
      }
      return { status: 200, data: user };
    } catch (error) {
      console.error('Error in getOrCreateByChatId service:', error);
      return { status: 500, data: { error: error.message } };
    }
  }
}

// Create a singleton instance
const userService = new UserService();

// Export the instance
module.exports = userService;
