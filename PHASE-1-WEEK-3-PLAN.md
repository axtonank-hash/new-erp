# Phase 1 Week 3: Core CRUD Endpoints - Implementation Plan

**Status: 📋 PLANNING PHASE**  
**Start Date: January 21, 2026**  
**Duration: 5 Days**  
**Priority: CRITICAL - Foundation for all modules**

---

## 🎯 Week 3 Objectives

Build complete CRUD (Create, Read, Update, Delete) endpoints for all core entities with:
- Comprehensive permission checking
- Input validation
- Error handling
- Database integration
- Response formatting
- API documentation

---

## 📊 Module Breakdown

### Module 1: Student Management (25 endpoints)

**Core Endpoints:**
```
GET    /api/students                    List all students (with filters)
GET    /api/students/:id                Get student details
POST   /api/students                    Create new student
PATCH  /api/students/:id                Update student
DELETE /api/students/:id                Delete student

GET    /api/students/:id/grades         Get student grades
GET    /api/students/:id/attendance     Get student attendance
GET    /api/students/:id/fees           Get student fees
GET    /api/students/:id/documents      Get student documents

POST   /api/students/:id/enroll         Enroll student in class
POST   /api/students/:id/deenroll       Remove from class
POST   /api/students/:id/promote        Promote to next class
POST   /api/students/:id/revert         Revert promotion
```

**Data Model:**
```javascript
{
  id: string,
  registration_number: string,
  first_name: string,
  last_name: string,
  date_of_birth: string,
  gender: string,
  email: string,
  phone: string,
  address: string,
  city: string,
  state: string,
  zip_code: string,
  blood_group: string,
  
  // Guardian Info
  parent_name: string,
  parent_email: string,
  parent_phone: string,
  
  // Academic Info
  class_id: string,
  section: string,
  roll_number: number,
  admission_date: string,
  status: string, // active, inactive, graduated
  
  // Metadata
  created_at: string,
  updated_at: string,
  created_by: string,
  updated_by: string
}
```

**Permissions Required:**
- List: `students.read`
- Get: `students.read`
- Create: `students.create`
- Update: `students.update`
- Delete: `students.delete`
- Enroll: `students.update`
- Promote: `students.update`

---

### Module 2: Faculty Management (20 endpoints)

**Core Endpoints:**
```
GET    /api/faculty                     List all faculty
GET    /api/faculty/:id                 Get faculty details
POST   /api/faculty                     Create new faculty
PATCH  /api/faculty/:id                 Update faculty
DELETE /api/faculty/:id                 Delete faculty

GET    /api/faculty/:id/subjects        Get assigned subjects
GET    /api/faculty/:id/classes         Get assigned classes
GET    /api/faculty/:id/students        Get students under faculty
GET    /api/faculty/:id/schedule        Get class schedule

POST   /api/faculty/:id/assign-subject  Assign subject
POST   /api/faculty/:id/assign-class    Assign class
DELETE /api/faculty/:id/subject/:subid  Remove subject
```

**Data Model:**
```javascript
{
  id: string,
  employee_id: string,
  first_name: string,
  last_name: string,
  email: string,
  phone: string,
  
  // Professional Info
  qualification: string,
  specialization: string,
  experience_years: number,
  department: string,
  
  // Employment
  hire_date: string,
  status: string, // active, inactive, on_leave
  designation: string,
  
  // Address
  address: string,
  city: string,
  state: string,
  
  // Metadata
  created_at: string,
  updated_at: string,
  created_by: string
}
```

**Permissions Required:**
- All operations: `faculty.create`, `faculty.read`, `faculty.update`, `faculty.delete`

---

### Module 3: Admission Management (15 endpoints)

**Core Endpoints:**
```
GET    /api/admissions                  List admissions (with filters)
GET    /api/admissions/:id              Get admission details
POST   /api/admissions                  Create admission request
PATCH  /api/admissions/:id              Update admission
DELETE /api/admissions/:id              Delete admission

POST   /api/admissions/:id/approve      Approve admission
POST   /api/admissions/:id/reject       Reject admission
POST   /api/admissions/:id/hold         Put on hold
POST   /api/admissions/:id/cancel       Cancel admission

GET    /api/admissions/:id/documents    Get documents
GET    /api/admissions/:id/payments     Get payment history
```

**Data Model:**
```javascript
{
  id: string,
  application_number: string,
  
  // Applicant Info
  first_name: string,
  last_name: string,
  date_of_birth: string,
  gender: string,
  email: string,
  phone: string,
  
  // Parent Info
  parent_name: string,
  parent_email: string,
  parent_phone: string,
  
  // Application Info
  applied_class: string,
  application_date: string,
  status: string, // pending, approved, rejected, hold, cancelled
  status_reason: string,
  
  // Academic History
  previous_school: string,
  previous_class: string,
  cgpa: number,
  
  // Payment
  application_fee_paid: boolean,
  application_fee_amount: number,
  
  // Processing
  processed_by: string,
  processed_date: string,
  
  // Metadata
  created_at: string,
  updated_at: string
}
```

**Permissions Required:**
- Read: `admissions.read`
- Create: `admissions.create`
- Update: `admissions.update`
- Approve: `admissions.approve`
- Reject: `admissions.reject`
- Delete: `admissions.delete`

---

### Module 4: Attendance Management (20 endpoints)

**Core Endpoints:**
```
GET    /api/attendance                  Get attendance records (filtered)
GET    /api/attendance/student/:id      Get student attendance
GET    /api/attendance/class/:id        Get class attendance
POST   /api/attendance                  Mark attendance
PATCH  /api/attendance/:id              Update attendance

GET    /api/attendance/reports/daily    Daily attendance report
GET    /api/attendance/reports/monthly  Monthly attendance report
GET    /api/attendance/reports/student  Student attendance report

GET    /api/attendance/summary          Attendance summary
POST   /api/attendance/bulk-import      Bulk import attendance
```

**Data Model:**
```javascript
{
  id: string,
  date: string,
  class_id: string,
  section: string,
  student_id: string,
  status: string, // present, absent, late, excused
  
  // Details
  marked_by: string,
  marked_at: string,
  remarks: string,
  
  // Metadata
  created_at: string,
  updated_at: string
}
```

**Permissions Required:**
- View: `attendance.read`
- Create: `attendance.create`
- Update: `attendance.update`
- Reports: `reports.read`

---

## 📅 Implementation Schedule

### Day 1: Student Management (Core CRUD)
- [ ] Database schema finalization
- [ ] List endpoint with filtering
- [ ] Get single student
- [ ] Create student
- [ ] Update student
- [ ] Delete student
- [ ] Basic tests

### Day 2: Faculty Management (Core CRUD)
- [ ] Database schema finalization
- [ ] List endpoint
- [ ] Get single faculty
- [ ] Create faculty
- [ ] Update faculty
- [ ] Delete faculty
- [ ] Assign subject/class endpoints
- [ ] Tests

### Day 3: Admission Management (Core CRUD)
- [ ] Database schema finalization
- [ ] List admissions
- [ ] Get admission
- [ ] Create admission
- [ ] Approve/Reject endpoints
- [ ] Update admission
- [ ] Status management
- [ ] Tests

### Day 4: Attendance Management (Core CRUD)
- [ ] Database schema finalization
- [ ] Mark attendance
- [ ] List attendance
- [ ] Get student attendance
- [ ] Get class attendance
- [ ] Bulk operations
- [ ] Reports
- [ ] Tests

### Day 5: Integration & Testing
- [ ] Full integration testing
- [ ] Cross-module testing
- [ ] Performance testing
- [ ] Documentation finalization
- [ ] Deployment preparation

---

## 🏗️ Architecture Overview

```
API Endpoints
    ├─ /api/students/*
    ├─ /api/faculty/*
    ├─ /api/admissions/*
    └─ /api/attendance/*
           │
           ▼
    Middleware Layer
    ├─ withAuth()      - Token validation
    ├─ withRole()      - Role checking
    ├─ withPermission()- Permission checking
    └─ errorHandler   - Error catching
           │
           ▼
    Service Layer
    ├─ StudentService
    ├─ FacultyService
    ├─ AdmissionService
    └─ AttendanceService
           │
           ▼
    Database Layer
    ├─ students table
    ├─ faculty table
    ├─ admissions table
    └─ attendance table
           │
           ▼
    MySQL Database (gegok12)
```

---

## 🔌 Common API Response Format

**Success Response:**
```javascript
{
  success: true,
  status: 200,
  data: {
    // ... response data
  },
  message: "Operation successful"
}
```

**List Response:**
```javascript
{
  success: true,
  status: 200,
  data: {
    items: [...],
    total: 100,
    page: 1,
    limit: 10,
    pages: 10
  },
  message: "Records retrieved successfully"
}
```

**Error Response:**
```javascript
{
  success: false,
  status: 400,
  error: "Bad Request",
  message: "Description of error",
  details: {...} // Optional
}
```

---

## 📊 Database Schema Required

### Students Table
```sql
CREATE TABLE students (
  id VARCHAR(36) PRIMARY KEY,
  registration_number VARCHAR(50) UNIQUE,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  date_of_birth DATE,
  gender ENUM('male', 'female', 'other'),
  email VARCHAR(120),
  phone VARCHAR(20),
  address TEXT,
  city VARCHAR(50),
  state VARCHAR(50),
  zip_code VARCHAR(10),
  blood_group VARCHAR(5),
  parent_name VARCHAR(100),
  parent_email VARCHAR(120),
  parent_phone VARCHAR(20),
  class_id VARCHAR(36),
  section VARCHAR(10),
  roll_number INT,
  admission_date DATE,
  status ENUM('active', 'inactive', 'graduated') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by VARCHAR(36),
  updated_by VARCHAR(36),
  INDEX(class_id),
  INDEX(status),
  INDEX(created_at)
);
```

### Faculty Table
```sql
CREATE TABLE faculty (
  id VARCHAR(36) PRIMARY KEY,
  employee_id VARCHAR(50) UNIQUE,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(120) UNIQUE,
  phone VARCHAR(20),
  qualification VARCHAR(100),
  specialization VARCHAR(100),
  experience_years INT,
  department VARCHAR(50),
  hire_date DATE,
  status ENUM('active', 'inactive', 'on_leave') DEFAULT 'active',
  designation VARCHAR(50),
  address TEXT,
  city VARCHAR(50),
  state VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by VARCHAR(36),
  INDEX(status),
  INDEX(department)
);
```

### Admissions Table
```sql
CREATE TABLE admissions (
  id VARCHAR(36) PRIMARY KEY,
  application_number VARCHAR(50) UNIQUE,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  date_of_birth DATE,
  gender ENUM('male', 'female', 'other'),
  email VARCHAR(120),
  phone VARCHAR(20),
  parent_name VARCHAR(100),
  parent_email VARCHAR(120),
  parent_phone VARCHAR(20),
  applied_class VARCHAR(10),
  application_date DATE,
  status ENUM('pending', 'approved', 'rejected', 'hold', 'cancelled') DEFAULT 'pending',
  status_reason TEXT,
  previous_school VARCHAR(200),
  previous_class VARCHAR(10),
  cgpa DECIMAL(3,2),
  application_fee_paid BOOLEAN DEFAULT FALSE,
  application_fee_amount DECIMAL(10,2),
  processed_by VARCHAR(36),
  processed_date DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX(status),
  INDEX(applied_class),
  INDEX(created_at)
);
```

### Attendance Table
```sql
CREATE TABLE attendance (
  id VARCHAR(36) PRIMARY KEY,
  date DATE,
  class_id VARCHAR(36),
  section VARCHAR(10),
  student_id VARCHAR(36),
  status ENUM('present', 'absent', 'late', 'excused') DEFAULT 'absent',
  marked_by VARCHAR(36),
  marked_at TIMESTAMP,
  remarks TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX(date),
  INDEX(class_id),
  INDEX(student_id),
  UNIQUE(date, class_id, section, student_id)
);
```

---

## 🧪 Testing Strategy

### Unit Tests
- Input validation
- Permission checking
- Data transformation
- Error handling

### Integration Tests
- Full CRUD workflows
- Cross-module dependencies
- Database transactions
- Permission enforcement

### API Tests
- Endpoint functionality
- Request/response formats
- Status codes
- Error scenarios

### Performance Tests
- Response time (target: <200ms)
- Throughput
- Bulk operations
- Concurrent requests

---

## 📋 Acceptance Criteria

✅ All CRUD endpoints operational
✅ Permission checking enforced
✅ Input validation on all endpoints
✅ Error handling comprehensive
✅ Database integration complete
✅ Response format consistent
✅ Test coverage >80%
✅ Documentation complete
✅ Performance targets met
✅ Security validated

---

## 🚀 Getting Started

**Prerequisites:**
- Phase 1 Week 2 complete (Auth & RBAC)
- MySQL database with schema
- Admin user credentials
- Development environment running

**Execution:**
1. Create database schema (Day 1 morning)
2. Implement Student endpoints (Day 1)
3. Implement Faculty endpoints (Day 2)
4. Implement Admission endpoints (Day 3)
5. Implement Attendance endpoints (Day 4)
6. Integration testing (Day 5)

---

## 📚 Key Files to Create

### By Day 1:
- `lib/student-service.js` - Business logic
- `pages/api/students.js` - List & Create
- `pages/api/students/[id].js` - Get, Update, Delete
- `tests/student-api.test.sh` - API tests

### By Day 2:
- `lib/faculty-service.js`
- `pages/api/faculty/*` (multiple endpoints)
- `tests/faculty-api.test.sh`

### By Day 3:
- `lib/admission-service.js`
- `pages/api/admissions/*`
- `tests/admission-api.test.sh`

### By Day 4:
- `lib/attendance-service.js`
- `pages/api/attendance/*`
- `tests/attendance-api.test.sh`

### By Day 5:
- `PHASE-1-WEEK-3-COMPLETE.md`
- Integration test suites
- Performance reports

---

## ✨ Success Metrics

- ✅ All endpoints implemented
- ✅ 100% test pass rate
- ✅ <200ms average response time
- ✅ Zero security issues
- ✅ Complete documentation
- ✅ Ready for Phase 1 Week 4

---

**Status: READY TO BEGIN IMPLEMENTATION** 🚀

Next: Start with database schema setup and Student management endpoints
