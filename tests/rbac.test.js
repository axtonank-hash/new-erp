/**
 * RBAC Tests - Comprehensive role-based access control tests
 */

const RBAC = require('../lib/rbac');

console.log('🧪 Running RBAC Tests...\n');

let passedTests = 0;
let failedTests = 0;

function test(name, condition) {
  if (condition) {
    console.log(`✅ ${name}`);
    passedTests++;
  } else {
    console.log(`❌ ${name}`);
    failedTests++;
  }
}

// Test 1: Permission Matrix Exists
console.log('📋 Permission Matrix Tests');
console.log('─'.repeat(50));
test('RBAC module has PERMISSION_MATRIX', RBAC.PERMISSION_MATRIX !== undefined);
test('RBAC module has ROLE_HIERARCHY', RBAC.ROLE_HIERARCHY !== undefined);
test('All roles have permissions defined', 
  Object.keys(RBAC.PERMISSION_MATRIX).length === 6
);
console.log();

// Test 2: Role Validation
console.log('🔐 Role Validation Tests');
console.log('─'.repeat(50));
test('super_admin is valid role', RBAC.isValidRole('super_admin'));
test('principal is valid role', RBAC.isValidRole('principal'));
test('admin is valid role', RBAC.isValidRole('admin'));
test('faculty is valid role', RBAC.isValidRole('faculty'));
test('student is valid role', RBAC.isValidRole('student'));
test('parent is valid role', RBAC.isValidRole('parent'));
test('invalid_role is not valid', !RBAC.isValidRole('invalid_role'));
console.log();

// Test 3: Permission Checking - Super Admin
console.log('👑 Super Admin Permission Tests');
console.log('─'.repeat(50));
test('super_admin has users.create', RBAC.hasPermission('super_admin', 'users.create'));
test('super_admin has system.configure', RBAC.hasPermission('super_admin', 'system.configure'));
test('super_admin has any random permission', RBAC.hasPermission('super_admin', 'random.permission'));
test('super_admin has all permissions', 
  RBAC.getAllPermissions().every(perm => RBAC.hasPermission('super_admin', perm))
);
console.log();

// Test 4: Permission Checking - Principal
console.log('🎓 Principal Permission Tests');
console.log('─'.repeat(50));
test('principal has students.read', RBAC.hasPermission('principal', 'students.read'));
test('principal has faculty.create', RBAC.hasPermission('principal', 'faculty.create'));
test('principal does NOT have users.create', !RBAC.hasPermission('principal', 'users.create'));
test('principal does NOT have system.configure', !RBAC.hasPermission('principal', 'system.configure'));
console.log();

// Test 5: Permission Checking - Faculty
console.log('👨‍🏫 Faculty Permission Tests');
console.log('─'.repeat(50));
test('faculty has attendance.create', RBAC.hasPermission('faculty', 'attendance.create'));
test('faculty has grades.create', RBAC.hasPermission('faculty', 'grades.create'));
test('faculty has students.read', RBAC.hasPermission('faculty', 'students.read'));
test('faculty does NOT have users.create', !RBAC.hasPermission('faculty', 'users.create'));
test('faculty does NOT have system.configure', !RBAC.hasPermission('faculty', 'system.configure'));
console.log();

// Test 6: Permission Checking - Student
console.log('👨‍🎓 Student Permission Tests');
console.log('─'.repeat(50));
test('student has grades.read', RBAC.hasPermission('student', 'grades.read'));
test('student has attendance.read', RBAC.hasPermission('student', 'attendance.read'));
test('student does NOT have grades.create', !RBAC.hasPermission('student', 'grades.create'));
test('student does NOT have students.list', !RBAC.hasPermission('student', 'students.list'));
console.log();

// Test 7: Permission Checking - Parent
console.log('👨‍👩‍👧 Parent Permission Tests');
console.log('─'.repeat(50));
test('parent has grades.read', RBAC.hasPermission('parent', 'grades.read'));
test('parent has attendance.read', RBAC.hasPermission('parent', 'attendance.read'));
test('parent has fees.read', RBAC.hasPermission('parent', 'fees.read'));
test('parent does NOT have users.create', !RBAC.hasPermission('parent', 'users.create'));
console.log();

// Test 8: hasAnyPermission Tests
console.log('🔀 Multiple Permission Tests (hasAnyPermission)');
console.log('─'.repeat(50));
test(
  'faculty has any of [users.create, grades.create]',
  RBAC.hasAnyPermission('faculty', ['users.create', 'grades.create'])
);
test(
  'student does NOT have any of [users.create, system.configure]',
  !RBAC.hasAnyPermission('student', ['users.create', 'system.configure'])
);
test(
  'principal has any of [system.configure, faculty.create]',
  RBAC.hasAnyPermission('principal', ['system.configure', 'faculty.create'])
);
console.log();

// Test 9: hasAllPermissions Tests
console.log('✅ All Permissions Tests (hasAllPermissions)');
console.log('─'.repeat(50));
test(
  'faculty has all of [attendance.create, grades.read]',
  RBAC.hasAllPermissions('faculty', ['attendance.create', 'grades.read'])
);
test(
  'faculty does NOT have all of [attendance.create, users.create]',
  !RBAC.hasAllPermissions('faculty', ['attendance.create', 'users.create'])
);
test(
  'principal has all of [faculty.create, students.read]',
  RBAC.hasAllPermissions('principal', ['faculty.create', 'students.read'])
);
console.log();

// Test 10: Get Permissions For Role
console.log('📖 Get Permissions For Role Tests');
console.log('─'.repeat(50));
const superAdminPerms = RBAC.getPermissionsForRole('super_admin');
test('super_admin has permissions array', Array.isArray(superAdminPerms));
test('super_admin permissions is not empty', superAdminPerms.length > 0);
test('super_admin has most permissions', superAdminPerms.length > 20);

const studentPerms = RBAC.getPermissionsForRole('student');
test('student has fewer permissions than super_admin', studentPerms.length < superAdminPerms.length);
console.log();

// Test 11: Get All Roles
console.log('👥 Get All Roles Tests');
console.log('─'.repeat(50));
const allRoles = RBAC.getAllRoles();
test('getAllRoles returns array', Array.isArray(allRoles));
test('getAllRoles returns 6 roles', allRoles.length === 6);
test('getAllRoles includes super_admin', allRoles.includes('super_admin'));
test('getAllRoles includes faculty', allRoles.includes('faculty'));
test('getAllRoles includes student', allRoles.includes('student'));
console.log();

// Test 12: Get All Permissions
console.log('📝 Get All Permissions Tests');
console.log('─'.repeat(50));
const allPerms = RBAC.getAllPermissions();
test('getAllPermissions returns array', Array.isArray(allPerms));
test('getAllPermissions returns permissions', allPerms.length > 0);
test('getAllPermissions is sorted', 
  allPerms.every((perm, idx) => idx === 0 || perm >= allPerms[idx - 1])
);
console.log();

// Test 13: Get Permissions By Category
console.log('🏷️ Permissions By Category Tests');
console.log('─'.repeat(50));
const categories = RBAC.getPermissionsByCategory();
test('getPermissionsByCategory returns object', typeof categories === 'object');
test('has users category', 'users' in categories && categories.users.length > 0);
test('has students category', 'students' in categories && categories.students.length > 0);
test('has grades category', 'grades' in categories && categories.grades.length > 0);
test('has attendance category', 'attendance' in categories && categories.attendance.length > 0);
console.log();

// Test 14: Role Display Names
console.log('📌 Role Display Name Tests');
console.log('─'.repeat(50));
test('super_admin displays as "Super Administrator"', 
  RBAC.getRoleDisplayName('super_admin') === 'Super Administrator'
);
test('principal displays as "Principal"', 
  RBAC.getRoleDisplayName('principal') === 'Principal'
);
test('faculty displays as "Faculty/Teacher"', 
  RBAC.getRoleDisplayName('faculty') === 'Faculty/Teacher'
);
test('student displays as "Student"', 
  RBAC.getRoleDisplayName('student') === 'Student'
);
console.log();

// Test 15: Role Comparison
console.log('⚖️ Role Comparison Tests');
console.log('─'.repeat(50));
test('student < faculty in hierarchy', RBAC.compareRoles('student', 'faculty') < 0);
test('faculty > student in hierarchy', RBAC.compareRoles('faculty', 'student') > 0);
test('admin > faculty in hierarchy', RBAC.compareRoles('admin', 'faculty') > 0);
test('super_admin > all other roles', 
  ['principal', 'admin', 'faculty', 'student', 'parent'].every(role => 
    RBAC.compareRoles('super_admin', role) > 0
  )
);
console.log();

// Test 16: Get Manager Roles
console.log('👔 Manager Roles Tests');
console.log('─'.repeat(50));
const studentManagers = RBAC.getManagerRoles('student');
test('student has manager roles', studentManagers.length > 0);
test('student managers include super_admin', studentManagers.includes('super_admin'));

const facultyManagers = RBAC.getManagerRoles('faculty');
test('faculty has manager roles', facultyManagers.length > 0);
console.log();

// Test 17: Permission Coverage
console.log('🎯 Permission Coverage Tests');
console.log('─'.repeat(50));
test(
  'all permissions are assigned to at least one role',
  RBAC.getAllPermissions().every(perm => 
    RBAC.getAllRoles().some(role => RBAC.hasPermission(role, perm))
  )
);
console.log();

// Summary
console.log();
console.log('═'.repeat(50));
console.log(`📊 Test Results: ${passedTests} passed, ${failedTests} failed`);
console.log(`✨ Success Rate: ${((passedTests / (passedTests + failedTests)) * 100).toFixed(1)}%`);
console.log('═'.repeat(50));

if (failedTests > 0) {
  process.exit(1);
} else {
  console.log('🎉 All tests passed!');
  process.exit(0);
}
