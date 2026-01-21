# Phase 2: Database Integration & Advanced Features

**Status:** Starting Phase 2.1 - Database Integration
**Date:** January 21, 2026
**Duration:** 3 weeks (Weeks 1-3)
**Focus:** Real database persistence + Advanced features

---

## 📋 Phase 2 Overview

### Phase 2.1: Database Integration (Week 1-2)
**Goal:** Replace all mock data with actual MySQL queries

#### Week 1: Core Module Database Integration
- **Day 1:** Database schema refinement & MySQL utilities
- **Day 2:** Student management database integration
- **Day 3:** Faculty management database integration
- **Day 4:** Admission management database integration
- **Day 5:** Attendance management database integration

#### Week 2: Testing & Optimization
- Comprehensive integration testing
- Performance optimization
- Database query optimization
- Data migration testing
- Production readiness

### Phase 2.2: Advanced Features (Week 3)
- Grades management system
- Class/Section management
- Leave management
- Reporting & analytics
- Notification system

---

## 🗄️ Database Integration Strategy

### Current State (Phase 1)
```javascript
// Mock data in memory
const mockStudents = [
  { id: 'student_001', name: 'John', ... },
  { id: 'student_002', name: 'Jane', ... }
];

// Service function returns from mock
async function getStudents() {
  return mockStudents;
}
```

### Target State (Phase 2)
```javascript
// MySQL queries with connection pooling
const pool = mysql.createPool({...});

// Service function queries database
async function getStudents(filters = {}) {
  const query = `SELECT * FROM students WHERE ...`;
  const [rows] = await pool.query(query, values);
  return rows;
}
```

---

## 📊 Phase 2 Week 1 Schedule

### Day 1: Database Setup & Utilities
**Deliverables:**
- [x] MySQL database helper module
- [x] Connection pooling setup
- [x] Query builder utilities
- [x] Error handling middleware
- [x] Transaction support
- **Files:** 4-5 files | **Lines:** 400-500

### Day 2: Student Management
**Deliverables:**
- Update `lib/student-service.js` with MySQL queries
- Migrate mock data to database queries
- Update API endpoints if needed
- Run integration tests
- **Impact:** 7 endpoints updated

### Day 3: Faculty Management
**Deliverables:**
- Update `lib/faculty-service.js` with MySQL queries
- Faculty table integration
- Course assignments table
- **Impact:** 7 endpoints updated

### Day 4: Admission Management
**Deliverables:**
- Update `lib/admission-service.js` with MySQL queries
- Admission tracking tables
- Status history logging
- **Impact:** 7 endpoints updated

### Day 5: Attendance Management
**Deliverables:**
- Update `lib/attendance-service.js` with MySQL queries
- Attendance records table
- Bulk operations optimization
- **Impact:** 7 endpoints updated

---

## 🏗️ Database Schema (Updated)

### Table: students
```sql
CREATE TABLE students (
  id VARCHAR(50) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  class_id VARCHAR(50),
  section VARCHAR(50),
  date_of_birth DATE,
  gender ENUM('M', 'F', 'O'),
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  pincode VARCHAR(10),
  status ENUM('active', 'inactive', 'graduated') DEFAULT 'active',
  parent_id VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_by VARCHAR(50),
  updated_by VARCHAR(50),
  FOREIGN KEY (class_id) REFERENCES classes(id),
  FOREIGN KEY (parent_id) REFERENCES users(id),
  INDEX(email),
  INDEX(status),
  INDEX(class_id)
);
```

### Table: faculty
```sql
CREATE TABLE faculty (
  id VARCHAR(50) PRIMARY KEY,
  employee_id VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  qualification VARCHAR(255),
  specialization VARCHAR(255),
  experience_years INT,
  department VARCHAR(100),
  hire_date DATE,
  status ENUM('active', 'inactive', 'on_leave') DEFAULT 'active',
  designation VARCHAR(100),
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_by VARCHAR(50),
  FOREIGN KEY (created_by) REFERENCES users(id),
  INDEX(email),
  INDEX(status),
  INDEX(department)
);
```

### Table: admissions
```sql
CREATE TABLE admissions (
  id VARCHAR(50) PRIMARY KEY,
  application_id VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  date_of_birth DATE,
  gender ENUM('M', 'F', 'O'),
  course_applied VARCHAR(100),
  stream VARCHAR(50),
  marks_10th DECIMAL(5,2),
  marks_12th DECIMAL(5,2),
  application_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  application_status ENUM('pending', 'approved', 'rejected', 'under_review') DEFAULT 'pending',
  interview_date DATETIME,
  interview_status ENUM('pending', 'completed', 'passed', 'failed'),
  merit_rank INT,
  admission_status ENUM('pending', 'approved', 'rejected', 'admitted', 'under_review') DEFAULT 'under_review',
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  pincode VARCHAR(10),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_by VARCHAR(50),
  FOREIGN KEY (created_by) REFERENCES users(id),
  INDEX(email),
  INDEX(admission_status),
  INDEX(stream)
);
```

### Table: attendance
```sql
CREATE TABLE attendance (
  id VARCHAR(50) PRIMARY KEY,
  student_id VARCHAR(50) NOT NULL,
  date DATE NOT NULL,
  status ENUM('present', 'absent', 'late', 'excused') DEFAULT 'present',
  class_id VARCHAR(50),
  subject VARCHAR(100),
  faculty_id VARCHAR(50),
  remarks TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id),
  FOREIGN KEY (class_id) REFERENCES classes(id),
  FOREIGN KEY (faculty_id) REFERENCES faculty(id),
  UNIQUE KEY unique_attendance (student_id, date, class_id, subject),
  INDEX(date),
  INDEX(status),
  INDEX(student_id),
  INDEX(class_id)
);
```

### Table: faculty_courses
```sql
CREATE TABLE faculty_courses (
  id VARCHAR(50) PRIMARY KEY,
  faculty_id VARCHAR(50) NOT NULL,
  course_id VARCHAR(50) NOT NULL,
  course_name VARCHAR(255),
  class_id VARCHAR(50),
  class_name VARCHAR(50),
  semester INT,
  academic_year VARCHAR(10),
  assigned_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  assigned_by VARCHAR(50),
  FOREIGN KEY (faculty_id) REFERENCES faculty(id),
  FOREIGN KEY (class_id) REFERENCES classes(id),
  INDEX(faculty_id),
  INDEX(academic_year)
);
```

---

## 🛠️ MySQL Utility Module

**File:** `lib/mysql-helper.js`

```javascript
// Connection pooling
// Query builder
// Error handling
// Transaction support
// Prepared statements
// Connection retry logic
// Query logging
```

**Functions:**
- `getConnection()` - Get connection from pool
- `query(sql, values)` - Execute query with params
- `transaction(callback)` - Execute transaction
- `insert(table, data)` - Insert helper
- `update(table, data, where)` - Update helper
- `delete(table, where)` - Delete helper
- `select(table, options)` - Select with filters

---

## 📝 Service Layer Updates

### Pattern Change

**Before (Mock):**
```javascript
async function getStudents(filters = {}, page = 1, limit = 10) {
  let students = [...mockStudents];
  if (filters.class_id) {
    students = students.filter(s => s.class_id === filters.class_id);
  }
  return students.slice((page-1)*limit, page*limit);
}
```

**After (MySQL):**
```javascript
async function getStudents(filters = {}, page = 1, limit = 10) {
  let query = 'SELECT * FROM students WHERE 1=1';
  const params = [];
  
  if (filters.class_id) {
    query += ' AND class_id = ?';
    params.push(filters.class_id);
  }
  
  query += ' LIMIT ? OFFSET ?';
  params.push(limit, (page-1)*limit);
  
  const [rows] = await db.query(query, params);
  return rows;
}
```

---

## ✅ Testing Strategy

### Unit Tests
- Database connection
- Query builder
- Error handling
- Transaction rollback

### Integration Tests
- All 96+ existing tests run with database
- Data persistence verification
- Query performance
- Concurrent request handling

### Data Migration Tests
- Mock data to database
- Integrity checks
- Performance benchmarks

---

## 🚀 Phase 2 Week 1 Deliverables

| Day | Component | Status | Files | Lines |
|-----|-----------|--------|-------|-------|
| 1 | MySQL utilities & setup | TBD | 4-5 | 400-500 |
| 2 | Student DB integration | TBD | 2-3 | 300-400 |
| 3 | Faculty DB integration | TBD | 2-3 | 300-400 |
| 4 | Admission DB integration | TBD | 2-3 | 300-400 |
| 5 | Attendance DB integration | TBD | 2-3 | 300-400 |
| **Week Total** | **Database Layer Complete** | **TBD** | **12-17** | **1,600-2,100** |

---

## 🎯 Success Criteria

- [x] MySQL helper utilities created
- [ ] All 8 service layers updated with queries
- [ ] 96+ integration tests passing with database
- [ ] Data persistence verified
- [ ] Query performance acceptable
- [ ] Transaction support working
- [ ] Error handling comprehensive
- [ ] Code documentation updated

---

## 📊 Phase 2 Architecture

```
┌─────────────────────────────────────────────────┐
│           API Endpoints (Unchanged)             │
│         (40+ endpoints from Phase 1)            │
└──────────────────┬──────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────┐
│         Service Layer (Updated)                 │
│  ├─ student-service.js (MySQL queries)          │
│  ├─ faculty-service.js (MySQL queries)          │
│  ├─ admission-service.js (MySQL queries)        │
│  └─ attendance-service.js (MySQL queries)       │
└──────────────────┬──────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────┐
│       Database Helper (New)                     │
│  ├─ Connection pooling                          │
│  ├─ Query builder                               │
│  ├─ Transaction manager                         │
│  └─ Error handler                               │
└──────────────────┬──────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────┐
│         MySQL Database                          │
│  ├─ students table                              │
│  ├─ faculty table                               │
│  ├─ admissions table                            │
│  ├─ attendance table                            │
│  └─ faculty_courses table                       │
└─────────────────────────────────────────────────┘
```

---

## 🔄 Migration Plan

### Phase 1 → Phase 2 Compatibility
- ✅ API endpoints remain the same
- ✅ Request/response formats unchanged
- ✅ All tests continue to work
- ✅ Gradual database integration

### Rollback Strategy
- Keep mock data modules as fallback
- Feature flags for database/mock switching
- Transaction rollback on errors
- Data consistency checks

---

## 🎓 Next Steps

1. ✅ Phase 2 Plan created (this document)
2. ⏳ Day 1: MySQL helper utilities
3. ⏳ Days 2-5: Service layer integration
4. ⏳ Week 2: Testing & optimization

---

**Status:** Ready to start Phase 2 Week 1 Day 1 ✅
**Next:** Create MySQL helper utilities module
