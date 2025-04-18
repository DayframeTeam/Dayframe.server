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

      return user;
    } catch (error) {
      console.error('Error in getUserById service:', error);
      throw error;
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
}

// Create a singleton instance
const userService = new UserService();

// Export the instance
module.exports = userService;
