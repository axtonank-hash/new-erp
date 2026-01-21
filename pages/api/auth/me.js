/**
 * Get Current User Endpoint
 * GET /api/auth/me
 * Returns authenticated user profile (protected route)
 */

const UserService = require('../../lib/user-service');
const { withAuth } = require('../../lib/auth-middleware');

async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed',
      message: `${req.method} is not allowed for this endpoint`
    });
  }

  try {
    // User is already authenticated by middleware
    // req.user contains: id, email, full_name, role

    // Fetch full user data from database
    const user = await UserService.getUserById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Not found',
        message: 'User not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'User profile retrieved',
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        status: user.status
      }
    });

  } catch (error) {
    console.error('Get user error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
}

// Export protected handler
export default withAuth(handler);
