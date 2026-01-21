/**
 * User Service - Database operations for users
 * Handles user queries, authentication, and profile management
 */

const bcrypt = require('bcryptjs');

// Simulating database connection (replace with actual connection in production)
// For now, using mock data from the database we already created

class UserService {
  /**
   * Find user by email
   * @param {String} email - User email
   * @returns {Promise<Object|null>} User object or null if not found
   */
  static async getUserByEmail(email) {
    try {
      // In production, this would query the database:
      // SELECT id, email, password_hash, full_name, role, status 
      // FROM users WHERE email = ? AND deleted_at IS NULL
      
      // For now, return mock admin user for testing
      if (email === 'admin@college.edu') {
        return {
          id: 1,
          email: 'admin@college.edu',
          password_hash: '$2y$10$EixZaYVK1fsbw1ZfbX3OzeIKND3/rZuQ8.8VnZf2Cg9pmqCLcDjii', // password: password
          full_name: 'Administrator',
          role: 'super_admin',
          status: 'active'
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching user by email:', error);
      throw error;
    }
  }

  /**
   * Find user by ID
   * @param {Number} id - User ID
   * @returns {Promise<Object|null>} User object or null if not found
   */
  static async getUserById(id) {
    try {
      // In production:
      // SELECT id, email, full_name, role, status FROM users 
      // WHERE id = ? AND deleted_at IS NULL
      
      // For testing
      if (id === 1) {
        return {
          id: 1,
          email: 'admin@college.edu',
          full_name: 'Administrator',
          role: 'super_admin',
          status: 'active'
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching user by ID:', error);
      throw error;
    }
  }

  /**
   * Get all users (with pagination)
   * @param {Number} page - Page number (default 1)
   * @param {Number} limit - Records per page (default 10)
   * @returns {Promise<Object>} Paginated users list
   */
  static async getAllUsers(page = 1, limit = 10) {
    try {
      // In production:
      // SELECT * FROM users WHERE deleted_at IS NULL 
      // LIMIT ? OFFSET ?
      
      return {
        page,
        limit,
        total: 1,
        users: [
          {
            id: 1,
            email: 'admin@college.edu',
            full_name: 'Administrator',
            role: 'super_admin',
            status: 'active'
          }
        ]
      };
    } catch (error) {
      console.error('Error fetching all users:', error);
      throw error;
    }
  }

  /**
   * Validate password against hashed password
   * @param {String} plainPassword - Plain text password
   * @param {String} hashedPassword - Hashed password from database
   * @returns {Promise<Boolean>} True if password matches, false otherwise
   */
  static async validatePassword(plainPassword, hashedPassword) {
    try {
      return await bcrypt.compare(plainPassword, hashedPassword);
    } catch (error) {
      console.error('Error validating password:', error);
      throw error;
    }
  }

  /**
   * Hash password (for creating new users)
   * @param {String} password - Plain text password
   * @param {Number} saltRounds - Number of salt rounds (default 10)
   * @returns {Promise<String>} Hashed password
   */
  static async hashPassword(password, saltRounds = 10) {
    try {
      return await bcrypt.hash(password, saltRounds);
    } catch (error) {
      console.error('Error hashing password:', error);
      throw error;
    }
  }

  /**
   * Update user's last login timestamp
   * @param {Number} userId - User ID
   * @returns {Promise<Boolean>} True if update successful
   */
  static async updateLastLogin(userId) {
    try {
      // In production:
      // UPDATE users SET last_login = NOW() WHERE id = ?
      
      console.log(`Last login updated for user ${userId}`);
      return true;
    } catch (error) {
      console.error('Error updating last login:', error);
      // Don't throw - this is not critical
      return false;
    }
  }

  /**
   * Create a new user
   * @param {Object} userData - User data
   * @returns {Promise<Object>} Created user object
   */
  static async createUser(userData) {
    try {
      // In production:
      // INSERT INTO users (username, email, password_hash, full_name, role) 
      // VALUES (?, ?, ?, ?, ?)
      
      throw new Error('User creation not yet implemented');
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  /**
   * Update user profile
   * @param {Number} userId - User ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Updated user object
   */
  static async updateUser(userId, updateData) {
    try {
      // In production:
      // UPDATE users SET ... WHERE id = ?
      
      throw new Error('User update not yet implemented');
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  /**
   * Soft delete user (mark as deleted)
   * @param {Number} userId - User ID
   * @returns {Promise<Boolean>} True if delete successful
   */
  static async deleteUser(userId) {
    try {
      // In production:
      // UPDATE users SET deleted_at = NOW() WHERE id = ?
      
      console.log(`User ${userId} marked as deleted`);
      return true;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  /**
   * Get users by role
   * @param {String} role - User role to filter by
   * @returns {Promise<Array>} Array of users with specified role
   */
  static async getUsersByRole(role) {
    try {
      // In production:
      // SELECT * FROM users WHERE role = ? AND deleted_at IS NULL
      
      if (role === 'super_admin') {
        return [
          {
            id: 1,
            email: 'admin@college.edu',
            full_name: 'Administrator',
            role: 'super_admin',
            status: 'active'
          }
        ];
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching users by role:', error);
      throw error;
    }
  }

  /**
   * Check if email exists
   * @param {String} email - Email to check
   * @returns {Promise<Boolean>} True if email exists
   */
  static async emailExists(email) {
    try {
      const user = await this.getUserByEmail(email);
      return user !== null;
    } catch (error) {
      console.error('Error checking email existence:', error);
      throw error;
    }
  }

  /**
   * Activate/deactivate user
   * @param {Number} userId - User ID
   * @param {Boolean} activate - True to activate, false to deactivate
   * @returns {Promise<Boolean>} True if update successful
   */
  static async setUserStatus(userId, activate) {
    try {
      // In production:
      // UPDATE users SET status = ? WHERE id = ?
      
      const status = activate ? 'active' : 'inactive';
      console.log(`User ${userId} status set to ${status}`);
      return true;
    } catch (error) {
      console.error('Error setting user status:', error);
      throw error;
    }
  }
}

module.exports = UserService;
