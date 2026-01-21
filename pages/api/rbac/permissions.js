/**
 * API Endpoint: GET /api/rbac/permissions
 * Returns RBAC information (role permissions, etc.)
 * Accessible to authenticated users
 */

const { withAuth } = require('../../lib/auth-middleware');
const { 
  getPermissionsForRole, 
  getAllRoles, 
  getRoleDisplayName,
  getPermissionsByCategory 
} = require('../../lib/rbac');

/**
 * Handler for RBAC information endpoint
 */
async function handler(req, res) {
  try {
    const { action } = req.query;

    // Get current user's permissions
    if (!action || action === 'my-permissions') {
      const userRole = req.user.role;
      const permissions = getPermissionsForRole(userRole);
      
      return res.status(200).json({
        success: true,
        data: {
          user_id: req.user.id,
          email: req.user.email,
          role: userRole,
          role_display: getRoleDisplayName(userRole),
          permissions: permissions,
          permission_count: permissions.length
        }
      });
    }

    // Get all roles and their permissions (admin only)
    if (action === 'all-roles') {
      const roles = getAllRoles();
      const roleData = {};
      
      roles.forEach(role => {
        roleData[role] = {
          display_name: getRoleDisplayName(role),
          permissions: getPermissionsForRole(role),
          permission_count: getPermissionsForRole(role).length
        };
      });

      return res.status(200).json({
        success: true,
        data: roleData
      });
    }

    // Get permissions by category (admin only)
    if (action === 'categories') {
      const categories = getPermissionsByCategory();
      
      return res.status(200).json({
        success: true,
        data: categories
      });
    }

    // Get specific role permissions
    if (action === 'role-permissions') {
      const { role } = req.query;
      
      if (!role) {
        return res.status(400).json({
          success: false,
          error: 'Bad Request',
          message: 'role parameter is required'
        });
      }

      const permissions = getPermissionsForRole(role);
      
      return res.status(200).json({
        success: true,
        data: {
          role: role,
          role_display: getRoleDisplayName(role),
          permissions: permissions,
          permission_count: permissions.length
        }
      });
    }

    return res.status(400).json({
      success: false,
      error: 'Bad Request',
      message: 'Invalid action. Available: my-permissions, all-roles, categories, role-permissions'
    });

  } catch (error) {
    console.error('RBAC endpoint error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
}

// Export protected handler
module.exports = withAuth(handler);
