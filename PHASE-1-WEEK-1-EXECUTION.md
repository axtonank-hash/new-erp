# Phase 1 Week 1 - Execution Plan

**Status:** 🟢 READY TO EXECUTE  
**Current Project:** College ERP (Laravel Backend + Next.js Frontend)  
**Location:** `/workspaces/new-erp`  
**Duration:** 5 Working Days  

---

## 📊 Current Project State

### ✅ Already Configured
- [x] Docker Compose setup (MySQL, Redis, Next.js services)
- [x] Laravel project structure initialized
- [x] Database migrations created (47+ files)
- [x] Next.js frontend app in subdirectory
- [x] Git repository initialized
- [x] Package.json with build scripts
- [x] .env.example template

### ⚠️ Items to Verify/Fix
- [ ] PHP environment compatibility (OpenSSL issue detected)
- [ ] Docker containers status
- [ ] Laravel dependencies installed
- [ ] Database schema up-to-date
- [ ] Next.js dependencies
- [ ] Authentication system configured
- [ ] API routes documented

### ❌ Not Yet Started
- [ ] API endpoint testing
- [ ] Frontend-Backend integration
- [ ] RBAC implementation
- [ ] JWT authentication setup

---

## 🎯 This Week's Deliverables

### Day 1-2: Environment Setup & Database
**Goal:** Get Docker containers running and database initialized

#### Task 1.1: Docker Environment Setup
```bash
# Navigate to project
cd /workspaces/new-erp

# Start Docker services
docker-compose up -d

# Verify containers are running
docker-compose ps

# Expected output:
# NAME                   STATUS
# gegok12_mysql          Up
# gegok12_redis          Up
# gegok12_nextjs         Up
```

**Troubleshooting if needed:**
```bash
# Check MySQL logs
docker-compose logs mysql

# Check Redis
docker-compose exec redis redis-cli ping

# Stop and clean rebuild
docker-compose down
docker volume prune
docker-compose up -d --build
```

#### Task 1.2: Laravel Configuration
```bash
# Install PHP dependencies
composer install

# Generate app key (if not exists)
php artisan key:generate

# Create .env file from template
cp .env.example .env

# Update .env with Docker credentials
# DB_HOST=mysql (if using Docker)
# DB_DATABASE=gegok12
# DB_USERNAME=gegok12
# DB_PASSWORD=gegok12
# REDIS_HOST=redis
```

#### Task 1.3: Database Migration
```bash
# Run migrations in container
docker-compose exec mysql mysql -u gegok12 -pgewok12 gegok12 -e "SHOW TABLES;"

# Or via Laravel (if PHP works locally)
php artisan migrate

# Seed initial data
php artisan db:seed
```

#### Task 1.4: Verify Database Schema
```bash
# Connect to MySQL container
docker-compose exec mysql mysql -u gegok12 -pgewok12 gegok12

# Show tables
SHOW TABLES;

# Expected tables (sample):
# users
# schools
# academic_years
# sections
# standards
# etc.
```

---

### Day 2-3: Laravel API Foundation
**Goal:** Set up basic API structure and authentication

#### Task 2.1: Authentication System
```bash
# Verify User model exists
cat app/Models/User.php | head -20

# Check authentication routes
cat routes/web.php | grep auth

# Check API routes
cat routes/api.php | grep auth
```

#### Task 2.2: Create Authentication Endpoints
**File: `routes/api.php`**
```php
// Add these routes if not exist
Route::post('/auth/login', 'Api\AuthController@login');
Route::post('/auth/logout', 'Api\AuthController@logout');
Route::post('/auth/refresh', 'Api\AuthController@refresh');
Route::get('/auth/me', 'Api\AuthController@me');
```

**File: `app/Http/Controllers/Api/AuthController.php`** (Create if not exists)
```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required|string|min:6',
        ]);

        if (!Auth::attempt($credentials)) {
            return response()->json([
                'message' => 'Invalid credentials'
            ], 401);
        }

        $user = Auth::user();
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Login successful',
            'user' => $user,
            'token' => $token,
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logout successful'
        ]);
    }

    public function me(Request $request)
    {
        return response()->json($request->user());
    }
}
```

#### Task 2.3: Test Authentication
```bash
# Test login endpoint
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password"}'

# Expected response:
# {
#   "message": "Login successful",
#   "user": {...},
#   "token": "Bearer eyJ0eXAi..."
# }
```

---

### Day 3-4: API Endpoints & Structure
**Goal:** Create foundational API endpoints as per specification

#### Task 3.1: Create API Resource Classes
```bash
# Create resources for common models
php artisan make:resource UserResource
php artisan make:resource SchoolResource
php artisan make:resource AcademicYearResource
php artisan make:resource SectionResource

# These files will be at:
# app/Http/Resources/UserResource.php
# app/Http/Resources/SchoolResource.php
# etc.
```

#### Task 3.2: Create Basic CRUD Controllers
```bash
# Create API controllers for Phase 1 modules
php artisan make:controller Api/SchoolController --resource
php artisan make:controller Api/AcademicYearController --resource
php artisan make:controller Api/UserController --resource

# Generate models if needed
php artisan make:model School -m
php artisan make:model AcademicYear -m
```

#### Task 3.3: API Routes Structure
**File: `routes/api.php`**
```php
<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Authentication endpoints
Route::post('/auth/login', 'Api\AuthController@login');
Route::post('/auth/logout', 'Api\AuthController@logout');

Route::middleware('auth:sanctum')->group(function () {
    // User endpoints
    Route::get('/auth/me', 'Api\AuthController@me');
    
    // School endpoints
    Route::apiResource('schools', 'Api\SchoolController');
    
    // Academic year endpoints
    Route::apiResource('academic-years', 'Api\AcademicYearController');
    
    // User endpoints
    Route::apiResource('users', 'Api\UserController');
});
```

---

### Day 4-5: Documentation & Testing
**Goal:** Document API and set up basic testing structure

#### Task 4.1: API Documentation
**File: `API-ENDPOINTS.md`**
```markdown
# Phase 1 API Endpoints

## Authentication
- POST /api/auth/login
- POST /api/auth/logout
- GET /api/auth/me

## Schools
- GET /api/schools
- POST /api/schools
- GET /api/schools/{id}
- PUT /api/schools/{id}
- DELETE /api/schools/{id}

## Academic Years
- GET /api/academic-years
- POST /api/academic-years
- GET /api/academic-years/{id}
- PUT /api/academic-years/{id}
- DELETE /api/academic-years/{id}
```

#### Task 4.2: Create Test Suite
```bash
# Create feature tests
php artisan make:test Api/AuthControllerTest --unit

# Create API tests directory
mkdir -p tests/Feature/Api

# Run tests
php artisan test
```

#### Task 4.3: Setup Next.js Frontend
```bash
# Navigate to Next.js app
cd next-app

# Install dependencies
npm install

# Check existing configuration
cat .env.local

# Update .env for API calls
# NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

---

## 🔧 Step-by-Step Execution Guide

### Step 1: Start Docker Services (Day 1 - 5 mins)
```bash
cd /workspaces/new-erp
docker-compose up -d

# Verify
docker-compose ps
```

**✓ Expected:** 3 containers running (MySQL, Redis, Next.js)

---

### Step 2: Setup Laravel (Day 1 - 10 mins)
```bash
# Install Laravel dependencies
composer install

# Generate key
php artisan key:generate

# Create .env
cp .env.example .env
```

**✓ Expected:** No errors, all packages installed

---

### Step 3: Configure Database (Day 1-2 - 15 mins)
```bash
# Check if migrations have run
docker-compose exec mysql mysql -u gegok12 -pgewok12 gegok12 -e "SHOW TABLES;"

# Run migrations
php artisan migrate

# Seed data
php artisan db:seed
```

**✓ Expected:** 20+ tables created

---

### Step 4: Test API (Day 2 - 10 mins)
```bash
# Test login
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password"}'

# Test authenticated endpoint
curl -X GET http://localhost:8000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**✓ Expected:** Valid JSON responses

---

### Step 5: Setup Next.js Frontend (Day 3 - 10 mins)
```bash
# Navigate to Next app
cd next-app

# Install dependencies
npm install

# Start development server
npm run dev

# Access at http://localhost:3000
```

**✓ Expected:** Next.js app running on port 3000

---

### Step 6: Test Integration (Day 4 - 15 mins)
```bash
# From Next.js, call Laravel API
# In a Next.js API route or component:

const response = await fetch('http://localhost:8000/api/schools', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});

const data = await response.json();
console.log(data);
```

**✓ Expected:** Data retrieved successfully

---

### Step 7: Create Documentation (Day 5 - 10 mins)
```bash
# Create API docs file
cat > API-ENDPOINTS-PHASE1.md << 'EOF'
# Phase 1 API Endpoints

## Authentication
POST /api/auth/login
POST /api/auth/logout
GET /api/auth/me

## Schools
GET /api/schools
POST /api/schools
GET /api/schools/{id}
PUT /api/schools/{id}
DELETE /api/schools/{id}

...
EOF

# Commit to Git
git add .
git commit -m "Phase 1 Week 1: Environment setup, database, and basic API"
```

**✓ Expected:** Changes committed to Git

---

## ✅ Week 1 Completion Checklist

### Infrastructure
- [ ] Docker containers running (MySQL, Redis)
- [ ] Docker Compose verified with `docker-compose ps`
- [ ] All 3 services healthy (not restarting)

### Laravel Setup
- [ ] Composer dependencies installed
- [ ] App key generated
- [ ] .env file configured correctly
- [ ] Database connected and verified

### Database
- [ ] 20+ migration tables created
- [ ] Database schema verified
- [ ] Seeders executed
- [ ] Data in tables verified with SQL queries

### API Endpoints
- [ ] Authentication endpoints implemented (login/logout/me)
- [ ] Protected routes middleware configured
- [ ] API returns valid JSON
- [ ] CORS configured for Next.js

### Next.js Frontend
- [ ] Dependencies installed
- [ ] Dev server running on port 3000
- [ ] Can make API calls to backend
- [ ] No console errors

### Version Control
- [ ] Initial commit made
- [ ] All code pushed to repository
- [ ] No uncommitted changes

### Documentation
- [ ] API endpoints documented
- [ ] Setup instructions written
- [ ] Database schema documented

---

## 📈 Success Metrics

| Metric | Target | Status |
|--------|--------|--------|
| Docker containers running | 3/3 | ⏳ |
| Laravel app boots | Yes | ⏳ |
| Database tables | 20+ | ⏳ |
| API endpoints working | 5+ | ⏳ |
| Next.js app running | Yes | ⏳ |
| API-Frontend communication | Working | ⏳ |
| Git commits | 1+ | ⏳ |

---

## 🆘 Troubleshooting Guide

### Docker Issues
```bash
# Container not starting
docker-compose logs [service-name]

# Permission denied
sudo chown -R $USER:$USER .

# Port already in use
lsof -i :3000  # Find process
kill -9 [PID]  # Kill process
```

### Laravel Issues
```bash
# Composer memory error
COMPOSER_MEMORY_LIMIT=-1 composer install

# Migration failed
php artisan migrate --force

# Clear cache
php artisan cache:clear
php artisan config:clear
```

### Database Issues
```bash
# Can't connect
docker-compose restart mysql

# Wrong credentials
docker-compose down
# Update .env with correct credentials
docker-compose up -d mysql

# Data loss
docker volume ls  # List volumes
docker volume rm [volume-name]  # Remove volume
docker-compose up -d  # Recreate
```

---

## 📝 Next Steps (Week 2)

Once Week 1 is complete:
1. **Authentication Enhancement**
   - Implement JWT refresh tokens
   - Add role-based access control (RBAC)
   - Create middleware for permission checking

2. **API Extension**
   - Add Student API endpoints
   - Add Faculty API endpoints
   - Add Program API endpoints

3. **Frontend Integration**
   - Create login page
   - Create dashboard layout
   - Add routing structure

4. **Testing**
   - Unit tests for models
   - Feature tests for API
   - Component tests for React

---

## 💾 Database Schema (Phase 1 Reference)

Key tables to verify exist:
```sql
SHOW TABLES;

-- Expected tables:
-- users
-- schools
-- academic_years
-- sections
-- standards
-- activity_log
-- personal_access_tokens
-- failed_jobs
-- jobs
```

---

## 🚀 Quick Reference Commands

```bash
# Start everything
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f

# Stop everything
docker-compose down

# Laravel commands
php artisan migrate
php artisan db:seed
php artisan tinker

# Test API
curl http://localhost:8000/api/health
curl -X POST http://localhost:8000/api/auth/login -d '...'

# Next.js commands
cd next-app
npm run dev
npm run build
npm run test
```

---

**Week 1 Status: READY TO BEGIN**  
**Start with:** Docker setup (Step 1)  
**Estimated Time:** 5 working days  
**Success Criteria:** All checklist items complete ✓  

---

**Let's Build! 🚀**
