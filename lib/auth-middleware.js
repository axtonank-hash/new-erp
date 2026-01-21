/**
 * Authentication Middleware - Protects API routes
 * Validates JWT tokens and attaches user to request
 */

const { verifyToken } = require('./jwt-helper');
const { hasPermission, hasAnyPermission, hasAllPermissions } = require('./rbac');

/**
 * Higher-order function to protect API routes with authentication
 * @param {Function} handler - API handler function
 * @returns {Function} Protected handler function
 */
function withAuth(handler) {
  return async (req, res) => {
    try {
      // Extract token from Authorization header
      const authHeader = req.headers.authorization;
      
      if (!authHeader) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: 'No authorization header provided'
        });
      }

      // Check if header follows Bearer scheme
      if (!authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: 'Invalid authorization header format. Expected: Bearer <token>'
        });
      }

      // Extract token
      const token = authHeader.substring(7); // Remove "Bearer " prefix

      if (!token) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: 'No token provided'
        });
      }

      // Verify token
      const decoded = verifyToken(token);
      
      if (!decoded) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: 'Invalid or expired token'
        });
      }

      // Attach user to request object
      req.user = {
        id: decoded.id,
        email: decoded.email,
        full_name: decoded.full_name,
        role: decoded.role
      };

      // Call the actual handler
      return handler(req, res);
    } catch (error) {
      console.error('Auth middleware error:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: error.message
      });
    }
  };
}

/**
 * Higher-order function to verify specific role
 * @param {String|Array} requiredRoles - Single role or array of allowed roles
 * @returns {Function} Middleware function
 */
function withRole(requiredRoles) {
  // Normalize to array
  const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];

  return (handler) => {
    return withAuth(async (req, res) => {
      if (!roles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          error: 'Forbidden',
          message: `This action requires one of the following roles: ${roles.join(', ')}`
        });
      }
      return handler(req, res);
    });
  };
}

/**
 * Higher-order function to verify specific permission
 * @param {String|Array} requiredPermissions - Permission or array of permissions
 * @returns {Function} Middleware function
 */
function withPermission(requiredPermissions) {
  const permissions = Array.isArray(requiredPermissions) 
    ? requiredPermissions 
    : [requiredPermissions];

  return (handler) => {
    return withAuth(async (req, res) => {
      // Load permission matrix (to be implemented)
      const userPermissions = getUserPermissions(req.user.role);
      
      const hasPermission = permissions.some(perm => 
        userPermissions.includes(perm)
      );

      if (!hasPermission) {
        return res.status(403).json({
          success: false,
          error: 'Forbidden',
          message: `Insufficient permissions. Required: ${permissions.join(', ')}`
        });
      }

      return handler(req, res);
    });
  };
}

/**
 * Get permissions for a role (placeholder)
 * @param {String} role - User role
 * @returns {Array} Array of permissions
 */
function getUserPermissions(role) {
  const { getPermissionsForRole } = require('./rbac');
  return getPermissionsForRole(role);
}

/**
 * Optional authentication - doesn't fail if no token
 * @param {Function} handler - API handler function
 * @returns {Function} Handler function
 */
function withOptionalAuth(handler) {
  return async (req, res) => {
    try {
      const authHeader = req.headers.authorization;

      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        const decoded = verifyToken(token);

        if (decoded) {
          req.user = {
            id: decoded.id,
            email: decoded.email,
            full_name: decoded.full_name,
            role: decoded.role
          };
        }
      }

      return handler(req, res);
    } catch (error) {
      console.error('Optional auth middleware error:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  };
}

module.exports = {
  withAuth,
  withRole,
  withPermission,
  withOptionalAuth,
  getUserPermissions
};
