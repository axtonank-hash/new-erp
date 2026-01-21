/**
 * Login API Endpoint
 * POST /api/auth/login
 * Authenticates user and returns JWT tokens
 */

const UserService = require('../../lib/user-service');
const { generateTokens } = require('../../lib/jwt-helper');

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed',
      message: `${req.method} is not allowed for this endpoint`
    });
  }

  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Bad request',
        message: 'Email and password are required'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Bad request',
        message: 'Invalid email format'
      });
    }

    // Find user by email
    const user = await UserService.getUserByEmail(email.toLowerCase());
    
    if (!user) {
      // Don't reveal if email exists (security best practice)
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'Invalid email or password'
      });
    }

    // Check if user is active
    if (user.status !== 'active') {
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: 'Account is inactive. Please contact administrator.'
      });
    }

    // Validate password
    const isValidPassword = await UserService.validatePassword(
      password,
      user.password_hash
    );

    if (!isValidPassword) {
      // Don't reveal if email exists (security best practice)
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'Invalid email or password'
      });
    }

    // Update last login timestamp
    await UserService.updateLastLogin(user.id);

    // Generate tokens
    const tokens = generateTokens({
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      role: user.role
    });

    // Set refresh token as httpOnly cookie (optional but recommended for security)
    res.setHeader(
      'Set-Cookie',
      `refreshToken=${tokens.refreshToken}; HttpOnly; Path=/; SameSite=Strict; Max-Age=604800`
    );

    // Return success response
    return res.status(200).json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role
      },
      tokens: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresIn: tokens.expiresIn,
        type: tokens.type
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
}
