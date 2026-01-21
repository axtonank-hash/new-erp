# Phase 1 Week 2 - Authentication System & API Foundation

**Status:** 🟢 READY TO START  
**Duration:** 5 working days  
**Focus:** JWT Authentication, User Login/Logout, RBAC  
**Previous Phase:** ✅ Complete (Week 1)  

---

## 🎯 Week 2 Objectives

By the end of this week, you should have:
- ✅ JWT token generation working
- ✅ Login/logout API endpoints created
- ✅ Protected routes with middleware
- ✅ Role-based access control
- ✅ User authentication flow tested

---

## 📋 Implementation Tasks

### Task 1: JWT Authentication (Day 1)

**Goal:** Generate and validate JWT tokens

#### Create JWT Helper Library

**File: `lib/jwt-helper.ts` (or `.js`)**
```javascript
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const TOKEN_EXPIRY = '1h';
const REFRESH_TOKEN_EXPIRY = '7d';

// Generate access token
function generateAccessToken(payload) {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: TOKEN_EXPIRY,
    algorithm: 'HS256'
  });
}

// Generate refresh token
function generateRefreshToken(payload) {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRY,
    algorithm: 'HS256'
  });
}

// Verify token
function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

// Generate both tokens
function generateTokens(user) {
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role
  };

  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload),
    expiresIn: TOKEN_EXPIRY
  };
}

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
  generateTokens
};
```

#### Test JWT Generation
```bash
# Create a simple test
node -e "
const jwt = require('./lib/jwt-helper.js');
const tokens = jwt.generateTokens({ id: 1, email: 'test@example.com', role: 'admin' });
console.log('Access Token:', tokens.accessToken);
console.log('Refresh Token:', tokens.refreshToken);
"
```

---

### Task 2: User Authentication (Day 1-2)

**Goal:** Create database functions for user authentication

#### Create User Service

**File: `lib/user-service.js`**
```javascript
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Find user by email
async function getUserByEmail(email) {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query(
      'SELECT id, email, password_hash, full_name, role, status FROM users WHERE email = ? AND deleted_at IS NULL',
      [email]
    );
    connection.release();
    return rows[0] || null;
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
}

// Find user by ID
async function getUserById(id) {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query(
      'SELECT id, email, full_name, role, status FROM users WHERE id = ? AND deleted_at IS NULL',
      [id]
    );
    connection.release();
    return rows[0] || null;
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
}

// Validate password
async function validatePassword(plainPassword, hashedPassword) {
  return bcrypt.compare(plainPassword, hashedPassword);
}

// Update last login
async function updateLastLogin(userId) {
  try {
    const connection = await pool.getConnection();
    await connection.query(
      'UPDATE users SET last_login = NOW() WHERE id = ?',
      [userId]
    );
    connection.release();
  } catch (error) {
    console.error('Error updating last login:', error);
  }
}

module.exports = {
  getUserByEmail,
  getUserById,
  validatePassword,
  updateLastLogin
};
```

---

### Task 3: Login Endpoint (Day 2)

**Goal:** Create API endpoint for user authentication

#### Create Login API Route

**File: `pages/api/auth/login.js`**
```javascript
const { getUserByEmail, validatePassword, updateLastLogin } = require('../../../lib/user-service');
const { generateTokens } = require('../../../lib/jwt-helper');

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    // Find user
    const user = await getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check if user is active
    if (user.status !== 'active') {
      return res.status(401).json({ error: 'Account is inactive' });
    }

    // Validate password
    const isValidPassword = await validatePassword(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Update last login
    await updateLastLogin(user.id);

    // Generate tokens
    const tokens = generateTokens(user);

    // Set refresh token as httpOnly cookie (optional but recommended)
    res.setHeader('Set-Cookie', `refreshToken=${tokens.refreshToken}; HttpOnly; Path=/; SameSite=Strict`);

    // Return response
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
        expiresIn: tokens.expiresIn
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
```

---

### Task 4: Protected Routes Middleware (Day 2-3)

**Goal:** Create middleware to protect API routes

#### Create Auth Middleware

**File: `lib/auth-middleware.js`**
```javascript
const { verifyToken } = require('./jwt-helper');

export function withAuth(handler) {
  return async (req, res) => {
    try {
      // Get token from Authorization header
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const token = authHeader.substring(7); // Remove "Bearer " prefix

      // Verify token
      const decoded = verifyToken(token);
      if (!decoded) {
        return res.status(401).json({ error: 'Invalid or expired token' });
      }

      // Attach user to request
      req.user = decoded;

      // Call the actual handler
      return handler(req, res);
    } catch (error) {
      console.error('Auth middleware error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  };
}

// Role-based access control
export function withRole(...allowedRoles) {
  return (handler) => {
    return withAuth(async (req, res) => {
      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({ error: 'Forbidden - insufficient permissions' });
      }
      return handler(req, res);
    });
  };
}
```

---

### Task 5: Protected Endpoints (Day 3)

**Goal:** Create protected API endpoints

#### Get Current User

**File: `pages/api/auth/me.js`**
```javascript
import { withAuth } from '../../../lib/auth-middleware';
import { getUserById } from '../../../lib/user-service';

async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const user = await getUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export default withAuth(handler);
```

#### Logout

**File: `pages/api/auth/logout.js`**
```javascript
import { withAuth } from '../../../lib/auth-middleware';

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Clear refresh token cookie
    res.setHeader('Set-Cookie', 'refreshToken=; HttpOnly; Path=/; Max-Age=0');

    return res.status(200).json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export default withAuth(handler);
```

---

### Task 6: Test Authentication Flow (Day 4)

**Goal:** Verify all endpoints are working correctly

#### Test Script

**File: `test/auth.test.js`**
```bash
#!/bin/bash

echo "=== Testing Authentication Flow ==="
echo ""

# Test 1: Login with valid credentials
echo "Test 1: Login with valid credentials"
RESPONSE=$(curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@college.edu","password":"password"}')

echo "$RESPONSE" | jq '.'
TOKEN=$(echo "$RESPONSE" | jq -r '.tokens.accessToken')
echo "Access Token: $TOKEN"
echo ""

# Test 2: Get current user (protected route)
echo "Test 2: Get current user"
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer $TOKEN" | jq '.'
echo ""

# Test 3: Logout
echo "Test 3: Logout"
curl -X POST http://localhost:3000/api/auth/logout \
  -H "Authorization: Bearer $TOKEN" | jq '.'
echo ""

# Test 4: Try to access protected route without token (should fail)
echo "Test 4: Access protected route without token (should fail)"
curl -X GET http://localhost:3000/api/auth/me | jq '.'
echo ""

echo "=== All Tests Complete ==="
```

**Run tests:**
```bash
chmod +x test/auth.test.js
bash test/auth.test.js
```

---

### Task 7: RBAC Implementation (Day 4-5)

**Goal:** Implement role-based access control

#### RBAC Constants

**File: `lib/rbac.js`**
```javascript
const ROLES = {
  SUPER_ADMIN: 'super_admin',
  PRINCIPAL: 'principal',
  ADMIN: 'admin',
  FACULTY: 'faculty',
  STUDENT: 'student',
  PARENT: 'parent'
};

const PERMISSIONS = {
  // User management
  'manage_users': [ROLES.SUPER_ADMIN, ROLES.PRINCIPAL],
  'view_users': [ROLES.SUPER_ADMIN, ROLES.PRINCIPAL, ROLES.ADMIN],
  
  // Student management
  'manage_students': [ROLES.SUPER_ADMIN, ROLES.PRINCIPAL, ROLES.ADMIN],
  'view_students': [ROLES.SUPER_ADMIN, ROLES.PRINCIPAL, ROLES.ADMIN, ROLES.FACULTY],
  
  // Faculty management
  'manage_faculty': [ROLES.SUPER_ADMIN, ROLES.PRINCIPAL],
  'view_faculty': [ROLES.SUPER_ADMIN, ROLES.PRINCIPAL, ROLES.ADMIN],
  
  // Reports
  'view_reports': [ROLES.SUPER_ADMIN, ROLES.PRINCIPAL, ROLES.ADMIN],
  'generate_reports': [ROLES.SUPER_ADMIN, ROLES.PRINCIPAL],
};

function hasPermission(role, permission) {
  return PERMISSIONS[permission]?.includes(role) || false;
}

module.exports = {
  ROLES,
  PERMISSIONS,
  hasPermission
};
```

#### RBAC Middleware

**File: `lib/rbac-middleware.js`**
```javascript
import { withAuth } from './auth-middleware';
import { hasPermission } from './rbac';

export function withPermission(requiredPermission) {
  return (handler) => {
    return withAuth(async (req, res) => {
      if (!hasPermission(req.user.role, requiredPermission)) {
        return res.status(403).json({
          error: 'Forbidden',
          message: `Permission '${requiredPermission}' required`
        });
      }
      return handler(req, res);
    });
  };
}
```

#### Protected Endpoint Example

**File: `pages/api/admin/users.js`**
```javascript
import { withPermission } from '../../../lib/rbac-middleware';

async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // This endpoint requires 'manage_users' permission
    // Only super_admin and principal can access
    
    return res.status(200).json({
      success: true,
      message: 'Users list (admin only)',
      data: []
    });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export default withPermission('manage_users')(handler);
```

---

## ✅ Week 2 Completion Checklist

### Authentication System
- [ ] JWT helper library created
- [ ] JWT tokens generate successfully
- [ ] Tokens validate correctly

### User Authentication
- [ ] User service created
- [ ] Database queries working
- [ ] Password validation working
- [ ] Last login tracking working

### API Endpoints
- [ ] POST /api/auth/login - ✅ Working
- [ ] GET /api/auth/me - ✅ Protected
- [ ] POST /api/auth/logout - ✅ Protected
- [ ] All endpoints return proper responses

### Middleware & Security
- [ ] Auth middleware implemented
- [ ] Token verification working
- [ ] Protected routes secured
- [ ] RBAC implemented

### Testing
- [ ] Login endpoint tested
- [ ] Protected routes tested
- [ ] Token expiration tested
- [ ] Unauthorized access blocked

### Documentation
- [ ] API endpoints documented
- [ ] Authentication flow documented
- [ ] RBAC roles documented
- [ ] Setup instructions provided

---

## 🚀 Quick Start for Week 2

### Step 1: Create Auth Files
```bash
cd /workspaces/new-erp

# Create directories
mkdir -p pages/api/auth
mkdir -p lib
mkdir -p test

# Create JWT helper
touch lib/jwt-helper.js
touch lib/user-service.js
touch lib/auth-middleware.js
touch lib/rbac.js
touch lib/rbac-middleware.js

# Create API routes
touch pages/api/auth/login.js
touch pages/api/auth/logout.js
touch pages/api/auth/me.js

# Create test
touch test/auth.test.js
```

### Step 2: Copy Code Templates
Copy the code from each task section above into the corresponding files.

### Step 3: Test Endpoints
```bash
# Login test
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@college.edu","password":"password"}'
```

### Step 4: Verify Success
- [ ] Login returns token
- [ ] Token is valid
- [ ] Protected routes work with token
- [ ] Protected routes fail without token

---

## 📊 Success Metrics

| Metric | Target | Status |
|--------|--------|--------|
| Login endpoint | Working | ⏳ |
| Token generation | Working | ⏳ |
| Protected routes | Secured | ⏳ |
| RBAC | Implemented | ⏳ |
| Tests passing | 100% | ⏳ |

---

## 🎯 Expected Deliverables

By end of Week 2:
- ✅ Complete authentication system
- ✅ User login/logout working
- ✅ JWT tokens generated and validated
- ✅ Protected API endpoints secured
- ✅ Role-based access control
- ✅ Comprehensive testing
- ✅ Documentation

---

## 🔗 Related Documentation

- [COLLEGE-ERP-API-SPEC.md](COLLEGE-ERP-API-SPEC.md) - API design
- [COLLEGE-ERP-SPECIFICATION.md](COLLEGE-ERP-SPECIFICATION.md) - System requirements
- [PHASE-1-WEEK-1-COMPLETE.md](PHASE-1-WEEK-1-COMPLETE.md) - Previous phase

---

**Ready to begin Phase 1 Week 2? Let's build the authentication system! 🚀**
