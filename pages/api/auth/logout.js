/**
 * Logout Endpoint
 * POST /api/auth/logout
 * Invalidates user session (protected route)
 */

const { withAuth } = require('../../lib/auth-middleware');

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed',
      message: `${req.method} is not allowed for this endpoint`
    });
  }

  try {
    // User is already authenticated by middleware
    // In a production app, you might:
    // - Invalidate tokens in a blacklist/database
    // - Remove sessions from Redis
    // - Clear user cache

    // Clear refresh token cookie
    res.setHeader(
      'Set-Cookie',
      'refreshToken=; HttpOnly; Path=/; Max-Age=0'
    );

    return res.status(200).json({
      success: true,
      message: 'Logout successful',
      user_id: req.user.id
    });

  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
}

// Export protected handler
export default withAuth(handler);
