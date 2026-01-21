/**
 * API Endpoint: POST /api/admin/users
 * Create new user (Admin only)
 * Demonstrates RBAC enforcement
 */

const { withAuth } = require('../../lib/auth-middleware');
const { hasPermission } = require('../../lib/rbac');

async function handler(req, res) {
  try {
    // Check if user has permission to create users
    if (!hasPermission(req.user.role, 'users.create')) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: 'You do not have permission to create users',
        required_permission: 'users.create',
        your_role: req.user.role
      });
    }

    if (req.method !== 'POST') {
      return res.status(405).json({
        success: false,
        error: 'Method Not Allowed'
      });
    }

    const { email, full_name, password, role } = req.body;

    // Input validation
    if (!email || !full_name || !password || !role) {
      return res.status(400).json({
        success: false,
        error: 'Bad Request',
        message: 'Missing required fields: email, full_name, password, role'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Bad Request',
        message: 'Invalid email format'
      });
    }

    // In production, you would:
    // 1. Hash the password
    // 2. Check if email already exists
    // 3. Create user in database
    // 4. Send welcome email

    return res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: {
        id: `user_${Date.now()}`,
        email: email,
        full_name: full_name,
        role: role,
        created_at: new Date().toISOString(),
        created_by: req.user.email
      }
    });

  } catch (error) {
    console.error('Create user error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
}

module.exports = withAuth(handler);
