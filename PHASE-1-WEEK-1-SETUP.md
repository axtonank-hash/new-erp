# College ERP - Phase 1 Week 1 Setup Guide

**Phase:** 1 - Foundation & Infrastructure  
**Week:** 1 - Project Setup & Database Design  
**Duration:** 5 working days  
**Status:** 🟢 Ready to Start  
**Project Type:** Laravel Backend + Next.js Frontend  
**Location:** `/workspaces/new-erp`

---

## 🎯 Week 1 Objectives

By the end of this week, you should have:
- ✅ Development environment fully configured
- ✅ Docker containers running (MySQL, Redis, Next.js)
- ✅ Database schema designed and documented
- ✅ Project repository initialized with Git
- ✅ Initial project structure in place

---

## 📋 Tasks for This Week

### Task 1.1: Environment Setup (Day 1-2)

#### Prerequisites Check
```bash
# Verify Node.js version (should be 18+)
node --version

# Verify npm
npm --version

# Verify Docker
docker --version

# Verify Docker Compose
docker-compose --version
```

**Expected Output:**
```
node: v18.17.0 or higher
npm: 9.0.0 or higher
docker: 24.0.0 or higher
docker-compose: 2.20.0 or higher
```

#### Step 1: Create Project Directory
```bash
# Navigate to workspace
cd /workspaces

# Create project directory (if not exists)
mkdir -p college-erp
cd college-erp

# Initialize Git repository
git init
git config user.email "your-email@college.edu"
git config user.name "Your Name"
```

#### Step 2: Initialize Next.js Project
```bash
# Create next.js project with proper setup
npx create-next-app@latest . --typescript --eslint --tailwind --git

# Or if using existing structure, install dependencies:
npm install
```

#### Step 3: Install Required Dependencies
```bash
# Core dependencies
npm install axios jsonwebtoken bcryptjs sequelize mysql2 redis dotenv cors helmet

# Development dependencies
npm install -D typescript @types/node @types/react nodemon

# Testing
npm install -D jest @testing-library/react @testing-library/jest-dom
```

#### Step 4: Create Environment File
```bash
# Copy example env file
cp .env.example .env

# Edit .env with your values
nano .env
# or
code .env
```

**Key values to update:**
```
DB_PASSWORD=your-secure-password
JWT_SECRET=generate-random-secure-key
```

#### Step 5: Docker Setup
```bash
# Create docker-compose.yml in root
# (Already provided - see docker-compose file below)

# Start Docker containers
docker-compose up -d

# Verify containers are running
docker-compose ps
```

**Expected output:**
```
NAME                COMMAND               STATUS
college-erp-mysql   docker-entrypoint... Up 30 seconds
college-erp-redis   docker-entrypoint... Up 25 seconds
```

#### Step 6: Verify Database Connection
```bash
# Test MySQL connection
docker-compose exec mysql mysql -u root -p$DB_PASSWORD college_erp -e "SHOW DATABASES;"

# Test Redis connection
docker-compose exec redis redis-cli ping
# Expected: PONG
```

---

### Task 1.2: Project Structure (Day 1-2)

Create the following directory structure:

```
college-erp/
├── .env                    # Environment variables (local, add to .gitignore)
├── .env.example           # Example env file (commit to repo)
├── .gitignore             # Git ignore rules
├── docker-compose.yml     # Docker services configuration
├── package.json           # Dependencies and scripts
├── next.config.js         # Next.js configuration
├── tailwind.config.js     # Tailwind CSS configuration
├── tsconfig.json          # TypeScript configuration
│
├── app/                   # Next.js app directory (if using app router)
│   ├── layout.tsx
│   └── page.tsx
│
├── pages/                 # Next.js pages directory (if using pages router)
│   ├── _app.tsx
│   ├── _document.tsx
│   ├── index.tsx
│   ├── login.tsx
│   ├── dashboard.tsx
│   └── api/
│       ├── auth/
│       │   ├── login.ts
│       │   └── logout.ts
│       ├── health.ts
│       └── config.ts
│
├── lib/                   # Utilities and helpers
│   ├── db.ts              # Database connection
│   ├── auth.ts            # Authentication utilities
│   ├── api-client.ts      # Axios instance
│   └── constants.ts       # App constants
│
├── components/            # React components
│   ├── Layout.tsx
│   ├── Sidebar.tsx
│   ├── Header.tsx
│   └── common/
│       ├── Button.tsx
│       └── Card.tsx
│
├── models/               # Database models (Sequelize)
│   ├── User.ts
│   ├── Student.ts
│   ├── Faculty.ts
│   └── index.ts
│
├── styles/              # Global styles
│   └── globals.css
│
├── public/              # Static assets
│   ├── logo.png
│   └── favicon.ico
│
├── tests/               # Test files
│   ├── api/
│   └── components/
│
├── logs/                # Application logs (add to .gitignore)
│   └── .gitkeep
│
└── docs/                # Documentation (if additional docs needed)
    └── PHASE-1-SETUP.md
```

#### Create directories:
```bash
mkdir -p pages/api/{auth,students,faculty}
mkdir -p components/common
mkdir -p lib
mkdir -p models
mkdir -p styles
mkdir -p public
mkdir -p tests/{api,components}
mkdir -p logs
mkdir -p docs
```

---

### Task 1.3: Configuration Files (Day 2-3)

#### Create `docker-compose.yml`
```yaml
version: '3.8'

services:
  mysql:
    image: mysql:8.0
    container_name: college-erp-mysql
    environment:
      MYSQL_ROOT_PASSWORD: ${DB_PASSWORD}
      MYSQL_DATABASE: ${DB_NAME}
      MYSQL_USER: college_user
      MYSQL_PASSWORD: college_pass
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql
      - ./sql:/docker-entrypoint-initdb.d
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      timeout: 20s
      retries: 10

  redis:
    image: redis:7-alpine
    container_name: college-erp-redis
    ports:
      - "6379:6379"
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      timeout: 3s
      retries: 5

  adminer:
    image: adminer
    container_name: college-erp-adminer
    ports:
      - "8080:8080"
    depends_on:
      - mysql

volumes:
  mysql_data:

networks:
  default:
    name: college-erp-network
```

#### Create `.gitignore`
```
# Dependencies
node_modules/
/.pnp
.pnp.js

# Environment
.env
.env.local
.env.*.local

# Build
/.next/
/out/
/dist/

# Testing
/coverage/

# Logs
/logs/
*.log
npm-debug.log*

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Docker
.dockerignore
```

#### Create `tsconfig.json`
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "react-jsx",
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules"]
}
```

#### Update `package.json` with scripts
```json
{
  "name": "college-erp",
  "version": "1.0.0",
  "description": "College ERP System for Nursing & Pharmacy Colleges",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "db:migrate": "sequelize db:migrate",
    "db:seed": "sequelize db:seed:all",
    "docker:up": "docker-compose up -d",
    "docker:down": "docker-compose down",
    "docker:logs": "docker-compose logs -f"
  },
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "typescript": "^5.0.0",
    "axios": "^1.6.0",
    "jsonwebtoken": "^9.0.0",
    "bcryptjs": "^2.4.3",
    "sequelize": "^6.33.0",
    "mysql2": "^3.6.0",
    "redis": "^4.6.0",
    "dotenv": "^16.0.3",
    "cors": "^2.8.5",
    "helmet": "^7.0.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/react": "^18.2.0",
    "jest": "^29.0.0",
    "@testing-library/react": "^14.0.0",
    "@testing-library/jest-dom": "^6.0.0",
    "nodemon": "^3.0.0"
  }
}
```

---

### Task 1.4: Initial Database Schema (Day 3-5)

Create base database migration file: `sql/01-init.sql`

```sql
-- Create College ERP Database
CREATE DATABASE IF NOT EXISTS college_erp;
USE college_erp;

-- Users Table
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  role ENUM('super_admin','principal','vice_principal','admin','faculty','clinical_instructor','accountant','student','parent') NOT NULL,
  status ENUM('active','inactive','suspended') DEFAULT 'active',
  last_login DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME,
  INDEX idx_email (email),
  INDEX idx_role (role),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Programs Table
CREATE TABLE programs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  code VARCHAR(20) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  type ENUM('nursing','pharmacy') NOT NULL,
  sub_type VARCHAR(50),
  duration_months INT,
  duration_years INT,
  intake_capacity INT,
  regulatory_approval_year INT,
  approval_number VARCHAR(50),
  status ENUM('active','inactive','deprecated') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_type (type),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Academic Years Table
CREATE TABLE academic_years (
  id INT PRIMARY KEY AUTO_INCREMENT,
  program_id INT NOT NULL,
  academic_year INT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status ENUM('planning','active','closed','archived') DEFAULT 'planning',
  locked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (program_id) REFERENCES programs(id),
  INDEX idx_program_year (program_id, academic_year),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Semesters Table
CREATE TABLE semesters (
  id INT PRIMARY KEY AUTO_INCREMENT,
  academic_year_id INT NOT NULL,
  semester_number INT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  exam_start_date DATE,
  exam_end_date DATE,
  status ENUM('planning','active','closed','result_declared') DEFAULT 'planning',
  locked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (academic_year_id) REFERENCES academic_years(id),
  INDEX idx_academic_year (academic_year_id),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Sample Data
INSERT INTO programs (code, name, type, sub_type, duration_months, duration_years, intake_capacity, status) VALUES
('BSN', 'B.Sc Nursing', 'nursing', 'B.Sc Nursing', 48, 4, 60, 'active'),
('ANM', 'ANM Program', 'nursing', 'ANM', 24, 2, 40, 'active'),
('BPHARM', 'B.Pharm', 'pharmacy', 'B.Pharm', 48, 4, 60, 'active'),
('DPHARM', 'D.Pharm', 'pharmacy', 'D.Pharm', 24, 2, 40, 'active');

-- Create super admin user
INSERT INTO users (username, email, password_hash, full_name, role, status) VALUES
('admin', 'admin@college.edu', '$2a$10$xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', 'Administrator', 'super_admin', 'active');

-- Create indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_programs_type ON programs(type);
CREATE INDEX idx_academic_years_program ON academic_years(program_id);
```

---

### Task 1.5: Git Repository Setup (Day 5)

```bash
# Add all files
git add .

# Create initial commit
git commit -m "Initial: Phase 1 Week 1 setup - Environment and database schema"

# View commit history
git log --oneline
```

**Initial commit message should reference:**
- ✅ Docker Compose configured (MySQL, Redis)
- ✅ Environment files created
- ✅ Project structure initialized
- ✅ Database schema designed
- ✅ Configuration files in place

---

## ✅ Week 1 Checklist

### Environment Setup
- [ ] Node.js 18+ installed
- [ ] Docker and Docker Compose installed
- [ ] Project directory created
- [ ] Git repository initialized
- [ ] `.env` file configured with local values
- [ ] Dependencies installed via npm

### Docker & Database
- [ ] MySQL container running
- [ ] Redis container running
- [ ] Database `college_erp` created
- [ ] Initial schema tables created
- [ ] Admin user created with temporary password
- [ ] Adminer UI accessible at http://localhost:8080

### Project Structure
- [ ] All directories created as specified
- [ ] Configuration files in place
- [ ] Scripts added to `package.json`
- [ ] `.gitignore` configured properly
- [ ] TypeScript configured

### Git & Documentation
- [ ] Repository initialized
- [ ] Initial commit made
- [ ] README updated with setup instructions
- [ ] Phase 1 documentation reviewed
- [ ] Team onboarded on project structure

---

## 🚀 Verification Commands

```bash
# Check Node.js
node --version

# Check npm packages
npm list | head -20

# Check Docker containers
docker-compose ps

# Check database connection
mysql -h localhost -u root -p college_erp -e "SHOW TABLES;"

# Check Redis
redis-cli -h localhost PING

# View logs
docker-compose logs -f

# Stop containers
docker-compose down
```

---

## 📝 Next Steps (Week 2)

Once Week 1 is complete:
1. Begin Week 2 - Authentication System
2. Implement JWT token generation
3. Create login/logout endpoints
4. Set up RBAC middleware

---

## 🆘 Troubleshooting

### Docker Container Won't Start
```bash
# Check logs
docker-compose logs mysql

# Restart container
docker-compose restart mysql
```

### MySQL Connection Failed
```bash
# Verify MySQL is running
docker-compose ps

# Check network
docker network ls

# Rebuild containers
docker-compose down
docker-compose up -d
```

### Port Already in Use
```bash
# Find process using port
lsof -i :3000  # For Node.js
lsof -i :3306  # For MySQL
lsof -i :6379  # For Redis

# Kill process
kill -9 <PID>
```

---

**Week 1 Status:** 🟢 READY TO EXECUTE

**Estimated Completion:** 5 working days

**Success Criteria:** 
✅ All Docker containers running  
✅ Database schema created  
✅ Project compiles without errors  
✅ Initial commit made to Git  

---

**Let's start with Step 1.1! 🚀**
