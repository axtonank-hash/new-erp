/**
 * JWT Helper - Token Generation and Validation
 * Handles JWT token creation and verification for authentication
 */

const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'college-erp-secret-key-change-in-production';
const ACCESS_TOKEN_EXPIRY = '1h';      // Access token expires in 1 hour
const REFRESH_TOKEN_EXPIRY = '7d';     // Refresh token expires in 7 days
const ALGORITHM = 'HS256';

/**
 * Generate JWT access token
 * @param {Object} payload - Token payload (user data)
 * @returns {String} Signed JWT token
 */
function generateAccessToken(payload) {
  try {
    return jwt.sign(payload, JWT_SECRET, {
      expiresIn: ACCESS_TOKEN_EXPIRY,
      algorithm: ALGORITHM,
      issuer: 'college-erp',
      subject: payload.id.toString()
    });
  } catch (error) {
    console.error('Error generating access token:', error);
    throw error;
  }
}

/**
 * Generate JWT refresh token
 * @param {Object} payload - Token payload (user data)
 * @returns {String} Signed JWT token
 */
function generateRefreshToken(payload) {
  try {
    return jwt.sign(payload, JWT_SECRET, {
      expiresIn: REFRESH_TOKEN_EXPIRY,
      algorithm: ALGORITHM,
      issuer: 'college-erp',
      subject: payload.id.toString()
    });
  } catch (error) {
    console.error('Error generating refresh token:', error);
    throw error;
  }
}

/**
 * Verify JWT token
 * @param {String} token - JWT token to verify
 * @returns {Object|null} Decoded token payload or null if invalid
 */
function verifyToken(token) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      algorithms: [ALGORITHM]
    });
    return decoded;
  } catch (error) {
    console.error('Token verification failed:', error.message);
    return null;
  }
}

/**
 * Decode token without verification (for debugging)
 * @param {String} token - JWT token to decode
 * @returns {Object|null} Decoded token payload or null if invalid
 */
function decodeToken(token) {
  try {
    return jwt.decode(token);
  } catch (error) {
    console.error('Token decode failed:', error.message);
    return null;
  }
}

/**
 * Generate both access and refresh tokens for a user
 * @param {Object} user - User object
 * @returns {Object} Object containing accessToken, refreshToken, and expiresIn
 */
function generateTokens(user) {
  try {
    const payload = {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      role: user.role,
      iat: Math.floor(Date.now() / 1000)
    };

    return {
      accessToken: generateAccessToken(payload),
      refreshToken: generateRefreshToken(payload),
      expiresIn: ACCESS_TOKEN_EXPIRY,
      type: 'Bearer'
    };
  } catch (error) {
    console.error('Error generating tokens:', error);
    throw error;
  }
}

/**
 * Refresh access token using refresh token
 * @param {String} refreshToken - Refresh token
 * @returns {Object|null} New tokens or null if refresh fails
 */
function refreshAccessToken(refreshToken) {
  try {
    const decoded = verifyToken(refreshToken);
    if (!decoded) {
      return null;
    }

    return generateTokens({
      id: decoded.id,
      email: decoded.email,
      full_name: decoded.full_name,
      role: decoded.role
    });
  } catch (error) {
    console.error('Error refreshing access token:', error);
    return null;
  }
}

/**
 * Check if token is expired
 * @param {String} token - JWT token
 * @returns {Boolean} True if token is expired, false otherwise
 */
function isTokenExpired(token) {
  try {
    const decoded = decodeToken(token);
    if (!decoded || !decoded.exp) {
      return true;
    }

    const expiresAt = decoded.exp * 1000; // Convert to milliseconds
    return Date.now() >= expiresAt;
  } catch (error) {
    return true;
  }
}

/**
 * Get token expiration time in seconds
 * @param {String} token - JWT token
 * @returns {Number} Seconds until expiration
 */
function getTokenExpiration(token) {
  try {
    const decoded = decodeToken(token);
    if (!decoded || !decoded.exp) {
      return null;
    }

    return decoded.exp - Math.floor(Date.now() / 1000);
  } catch (error) {
    return null;
  }
}

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
  decodeToken,
  generateTokens,
  refreshAccessToken,
  isTokenExpired,
  getTokenExpiration,
  JWT_SECRET,
  ACCESS_TOKEN_EXPIRY,
  REFRESH_TOKEN_EXPIRY,
  ALGORITHM
};
