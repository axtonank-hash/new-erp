/**
 * Role-Based Access Control (RBAC) Module
 * Defines roles, permissions, and permission matrices
 */

/**
 * Permission Matrix: Maps roles to their permissions
 * Follows the principle of least privilege
 */
const PERMISSION_MATRIX = {
  // Super Admin: Full system access
  super_admin: [
    // User Management
    'users.create',
    'users.read',
    'users.update',
    'users.delete',
    'users.list',
    
    // Role Management
    'roles.create',
    'roles.read',
    'roles.update',
    'roles.delete',
    'roles.list',
    
    // Student Management
    'students.create',
    'students.read',
    'students.update',
    'students.delete',
    'students.list',
    'students.approve',
    
    // Faculty Management
    'faculty.create',
    'faculty.read',
    'faculty.update',
    'faculty.delete',
    'faculty.list',
    
    // Admission Management
    'admissions.create',
    'admissions.read',
    'admissions.update',
    'admissions.delete',
    'admissions.approve',
    'admissions.reject',
    'admissions.list',
    
    // Attendance
    'attendance.create',
    'attendance.read',
    'attendance.update',
    'attendance.delete',
    'attendance.list',
    
    // Grades & Exams
    'grades.create',
    'grades.read',
    'grades.update',
    'grades.delete',
    'grades.list',
    
    // Fee Management
    'fees.create',
    'fees.read',
    'fees.update',
    'fees.delete',
    'fees.list',
    
    // Reports
    'reports.create',
    'reports.read',
    'reports.list',
    
    // System Configuration
    'system.configure',
    'system.logs',
    'system.backup',
    
    // Dashboard
    'dashboard.view'
  ],

  // Principal: Academic head with broad permissions
  principal: [
    // Student Management
    'students.read',
    'students.list',
    'students.approve',
    
    // Faculty Management
    'faculty.create',
    'faculty.read',
    'faculty.update',
    'faculty.list',
    
    // Admission Management
    'admissions.read',
    'admissions.approve',
    'admissions.reject',
    'admissions.list',
    
    // Attendance
    'attendance.read',
    'attendance.list',
    
    // Grades & Exams
    'grades.read',
    'grades.list',
    
    // Fee Management
    'fees.read',
    'fees.list',
    
    // Reports
    'reports.create',
    'reports.read',
    'reports.list',
    
    // Dashboard
    'dashboard.view'
  ],

  // Admin: System administrator
  admin: [
    // User Management
    'users.create',
    'users.read',
    'users.update',
    'users.list',
    
    // Student Management
    'students.create',
    'students.read',
    'students.update',
    'students.list',
    
    // Faculty Management
    'faculty.create',
    'faculty.read',
    'faculty.update',
    'faculty.list',
    
    // Admission Management
    'admissions.create',
    'admissions.read',
    'admissions.update',
    'admissions.list',
    
    // Attendance
    'attendance.read',
    'attendance.list',
    
    // Grades & Exams
    'grades.read',
    'grades.list',
    
    // Fee Management
    'fees.read',
    'fees.list',
    
    // Reports
    'reports.read',
    'reports.list',
    
    // Dashboard
    'dashboard.view'
  ],

  // Faculty: Teachers
  faculty: [
    // Student Management (view only)
    'students.read',
    'students.list',
    
    // Attendance (submit and view)
    'attendance.create',
    'attendance.read',
    'attendance.list',
    
    // Grades (submit and view)
    'grades.create',
    'grades.read',
    'grades.update',
    'grades.list',
    
    // Dashboard
    'dashboard.view'
  ],

  // Student: Student users
  student: [
    // Own grade viewing
    'grades.read',
    
    // Attendance viewing
    'attendance.read',
    
    // Dashboard
    'dashboard.view'
  ],

  // Parent: Parent/Guardian
  parent: [
    // Child grade viewing
    'grades.read',
    
    // Child attendance viewing
    'attendance.read',
    
    // Fee information
    'fees.read',
    
    // Dashboard
    'dashboard.view'
  ]
};

/**
 * Role hierarchy (for cascade permissions if needed)
 */
const ROLE_HIERARCHY = {
  super_admin: ['principal', 'admin', 'faculty', 'student', 'parent'],
  principal: ['faculty', 'student'],
  admin: ['faculty', 'student'],
  faculty: ['student'],
  student: [],
  parent: []
};

/**
 * Get permissions for a specific role
 * @param {String} role - The role to get permissions for
 * @returns {Array} Array of permission strings
 */
function getPermissionsForRole(role) {
  return PERMISSION_MATRIX[role] || [];
}

/**
 * Check if a role has a specific permission
 * @param {String} role - The role to check
 * @param {String} permission - The permission to verify
 * @returns {Boolean} True if role has permission
 */
function hasPermission(role, permission) {
  const permissions = getPermissionsForRole(role);
  
  // Super admin has all permissions
  if (role === 'super_admin') {
    return true;
  }
  
  // Check if permission exists in array
  return permissions.includes(permission);
}

/**
 * Check if a role has any of the provided permissions
 * @param {String} role - The role to check
 * @param {Array} permissions - Array of permissions to check
 * @returns {Boolean} True if role has at least one permission
 */
function hasAnyPermission(role, permissions) {
  return Array.isArray(permissions) 
    ? permissions.some(perm => hasPermission(role, perm))
    : hasPermission(role, permissions);
}

/**
 * Check if a role has all of the provided permissions
 * @param {String} role - The role to check
 * @param {Array} permissions - Array of permissions to check
 * @returns {Boolean} True if role has all permissions
 */
function hasAllPermissions(role, permissions) {
  if (!Array.isArray(permissions)) {
    return hasPermission(role, permissions);
  }
  
  return permissions.every(perm => hasPermission(role, perm));
}

/**
 * Get all available roles
 * @returns {Array} Array of role names
 */
function getAllRoles() {
  return Object.keys(PERMISSION_MATRIX);
}

/**
 * Get all available permissions for all roles (unique)
 * @returns {Array} Sorted array of unique permissions
 */
function getAllPermissions() {
  const allPerms = new Set();
  
  Object.values(PERMISSION_MATRIX).forEach(perms => {
    perms.forEach(perm => allPerms.add(perm));
  });
  
  return Array.from(allPerms).sort();
}

/**
 * Get permission categories
 * @returns {Object} Permissions grouped by category
 */
function getPermissionsByCategory() {
  const categories = {
    users: [],
    roles: [],
    students: [],
    faculty: [],
    admissions: [],
    attendance: [],
    grades: [],
    fees: [],
    reports: [],
    system: [],
    dashboard: []
  };

  getAllPermissions().forEach(perm => {
    const category = perm.split('.')[0];
    if (categories[category]) {
      categories[category].push(perm);
    }
  });

  return categories;
}

/**
 * Validate if a role exists
 * @param {String} role - The role to validate
 * @returns {Boolean} True if role exists
 */
function isValidRole(role) {
  return Object.keys(PERMISSION_MATRIX).includes(role);
}

/**
 * Get role display name
 * @param {String} role - The role
 * @returns {String} Display name for the role
 */
function getRoleDisplayName(role) {
  const displayNames = {
    super_admin: 'Super Administrator',
    principal: 'Principal',
    admin: 'Administrator',
    faculty: 'Faculty/Teacher',
    student: 'Student',
    parent: 'Parent/Guardian'
  };
  
  return displayNames[role] || role;
}

/**
 * Compare two roles (useful for permission checking)
 * @param {String} role1 - First role
 * @param {String} role2 - Second role
 * @returns {Number} -1 if role1 < role2, 0 if equal, 1 if role1 > role2
 */
function compareRoles(role1, role2) {
  const hierarchy = ['parent', 'student', 'faculty', 'admin', 'principal', 'super_admin'];
  const index1 = hierarchy.indexOf(role1);
  const index2 = hierarchy.indexOf(role2);
  
  if (index1 < index2) return -1;
  if (index1 > index2) return 1;
  return 0;
}

/**
 * Get all roles that can manage a specific role
 * @param {String} role - The role to check
 * @returns {Array} Roles that can manage this role
 */
function getManagerRoles(role) {
  const managers = [];
  
  Object.entries(ROLE_HIERARCHY).forEach(([managerRole, subordinates]) => {
    if (subordinates.includes(role)) {
      managers.push(managerRole);
    }
  });
  
  return managers;
}

module.exports = {
  PERMISSION_MATRIX,
  ROLE_HIERARCHY,
  getPermissionsForRole,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  getAllRoles,
  getAllPermissions,
  getPermissionsByCategory,
  isValidRole,
  getRoleDisplayName,
  compareRoles,
  getManagerRoles
};
