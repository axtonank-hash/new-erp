# College ERP - API Specification & Data Schema

**Project:** College ERP System for Nursing & Pharmacy Colleges  
**Version:** 1.0  
**Last Updated:** January 2026  

---

## 📊 Database Schema Overview

### Core Tables Structure

#### 1. Users Table
```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  role ENUM('super_admin','principal','vice_principal','admin','faculty',
             'clinical_instructor','accountant','student','parent') NOT NULL,
  status ENUM('active','inactive','suspended') DEFAULT 'active',
  last_login DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME,
  INDEX idx_email (email),
  INDEX idx_role (role),
  INDEX idx_status (status)
);
```

#### 2. Programs Table
```sql
CREATE TABLE programs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  code VARCHAR(20) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  type ENUM('nursing','pharmacy') NOT NULL,
  sub_type VARCHAR(50),  -- ANM, GNM, B.Sc Nursing, D.Pharm, B.Pharm, etc.
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
);
```

#### 3. Academic Years Table
```sql
CREATE TABLE academic_years (
  id INT PRIMARY KEY AUTO_INCREMENT,
  program_id INT NOT NULL,
  academic_year INT,  -- e.g., 2024
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status ENUM('planning','active','closed','archived') DEFAULT 'planning',
  locked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (program_id) REFERENCES programs(id),
  INDEX idx_program_year (program_id, academic_year),
  INDEX idx_status (status)
);
```

#### 4. Semesters Table
```sql
CREATE TABLE semesters (
  id INT PRIMARY KEY AUTO_INCREMENT,
  academic_year_id INT NOT NULL,
  semester_number INT,  -- 1, 2, 3, etc.
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
);
```

#### 5. Subjects Table
```sql
CREATE TABLE subjects (
  id INT PRIMARY KEY AUTO_INCREMENT,
  program_id INT NOT NULL,
  semester_id INT NOT NULL,
  subject_code VARCHAR(20) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  subject_type ENUM('theory','practical','clinical','lab') NOT NULL,
  credits INT,  -- For pharmacy
  hours INT,    -- For nursing
  max_marks INT DEFAULT 100,
  pass_marks INT DEFAULT 40,
  internal_marks INT DEFAULT 30,
  external_marks INT DEFAULT 70,
  practical_marks INT,
  viva_marks INT,
  prerequisites VARCHAR(255),  -- Comma-separated subject codes
  faculty_id INT,
  status ENUM('active','inactive') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (program_id) REFERENCES programs(id),
  FOREIGN KEY (semester_id) REFERENCES semesters(id),
  FOREIGN KEY (faculty_id) REFERENCES users(id),
  INDEX idx_program_semester (program_id, semester_id),
  INDEX idx_subject_type (subject_type)
);
```

#### 6. Students Table
```sql
CREATE TABLE students (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL UNIQUE,
  program_id INT NOT NULL,
  batch_year INT,
  semester_id INT,
  roll_number VARCHAR(20) UNIQUE NOT NULL,
  registration_number VARCHAR(50) UNIQUE,
  inc_pci_registration VARCHAR(50),  -- INC/PCI registration
  status ENUM('active','inactive','passed','dropout','on_leave') DEFAULT 'active',
  personal_details JSON,  -- Name, DOB, gender, phone, email, address
  enrollment_date DATE,
  expected_graduation_date DATE,
  previous_qualification VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (program_id) REFERENCES programs(id),
  FOREIGN KEY (semester_id) REFERENCES semesters(id),
  INDEX idx_roll_number (roll_number),
  INDEX idx_program (program_id),
  INDEX idx_status (status)
);
```

#### 7. Faculty Table
```sql
CREATE TABLE faculty (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL UNIQUE,
  designation VARCHAR(50),  -- Lecturer, Senior Lecturer, Professor
  department VARCHAR(50),   -- Nursing, Pharmacy, Anatomy, etc.
  specialization VARCHAR(100),
  qualification JSON,  -- Degrees, institutions, years
  experience_years INT,
  inc_pci_registration VARCHAR(50),
  registration_expiry DATE,
  license_status ENUM('active','expired','pending_renewal'),
  employment_type ENUM('full_time','part_time','contract','temporary'),
  join_date DATE,
  salary_grade VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  INDEX idx_department (department),
  INDEX idx_registration_expiry (registration_expiry)
);
```

#### 8. Student Enrollment (Subject Registration)
```sql
CREATE TABLE student_enrollments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT NOT NULL,
  subject_id INT NOT NULL,
  semester_id INT NOT NULL,
  enrollment_date DATE NOT NULL,
  status ENUM('active','dropped','completed') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_student_subject (student_id, subject_id, semester_id),
  FOREIGN KEY (student_id) REFERENCES students(id),
  FOREIGN KEY (subject_id) REFERENCES subjects(id),
  FOREIGN KEY (semester_id) REFERENCES semesters(id)
);
```

#### 9. Attendance Table
```sql
CREATE TABLE attendance (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT NOT NULL,
  subject_id INT NOT NULL,
  date DATE NOT NULL,
  status ENUM('present','absent','leave','makeup') DEFAULT 'absent',
  remarks VARCHAR(255),
  marked_by INT,  -- Faculty ID
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_attendance (student_id, subject_id, date),
  FOREIGN KEY (student_id) REFERENCES students(id),
  FOREIGN KEY (subject_id) REFERENCES subjects(id),
  FOREIGN KEY (marked_by) REFERENCES users(id),
  INDEX idx_date (date),
  INDEX idx_student_subject (student_id, subject_id)
);
```

#### 10. Exams Table
```sql
CREATE TABLE exams (
  id INT PRIMARY KEY AUTO_INCREMENT,
  subject_id INT NOT NULL,
  exam_type ENUM('internal','practical','university_exam','viva','supplementary'),
  exam_date DATE NOT NULL,
  exam_time TIME,
  duration_minutes INT,
  total_marks INT DEFAULT 100,
  pass_marks INT DEFAULT 40,
  location VARCHAR(100),
  invigilator_id INT,
  status ENUM('scheduled','in_progress','completed','result_declared','cancelled'),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (subject_id) REFERENCES subjects(id),
  FOREIGN KEY (invigilator_id) REFERENCES users(id),
  INDEX idx_exam_date (exam_date),
  INDEX idx_status (status)
);
```

#### 11. Results (Marks) Table
```sql
CREATE TABLE results (
  id INT PRIMARY KEY AUTO_INCREMENT,
  exam_id INT NOT NULL,
  student_id INT NOT NULL,
  internal_marks INT,
  practical_marks INT,
  external_marks INT,
  viva_marks INT,
  total_marks INT,
  percentage DECIMAL(5,2),
  grade CHAR(2),  -- A+, A, B, C, D, F
  status ENUM('draft','submitted','approved','locked','revised'),
  entered_by INT,  -- Faculty ID
  entered_at DATETIME,
  approved_by INT,  -- Principal/VP ID
  approved_at DATETIME,
  remarks VARCHAR(255),
  is_grace BOOLEAN DEFAULT FALSE,
  grace_marks INT,
  grace_approval_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_result (exam_id, student_id),
  FOREIGN KEY (exam_id) REFERENCES exams(id),
  FOREIGN KEY (student_id) REFERENCES students(id),
  FOREIGN KEY (entered_by) REFERENCES users(id),
  FOREIGN KEY (approved_by) REFERENCES users(id),
  INDEX idx_exam (exam_id),
  INDEX idx_student (student_id),
  INDEX idx_grade (grade)
);
```

#### 12. Fees Table
```sql
CREATE TABLE fees (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT NOT NULL,
  semester_id INT NOT NULL,
  fee_type VARCHAR(50),  -- Tuition, Clinical, Lab, Exam, etc.
  amount DECIMAL(10,2) NOT NULL,
  due_date DATE NOT NULL,
  paid_amount DECIMAL(10,2) DEFAULT 0,
  remaining_amount DECIMAL(10,2),
  status ENUM('pending','partial','paid','overdue','waived') DEFAULT 'pending',
  payment_method ENUM('online','offline','cheque','demand_draft'),
  transaction_id VARCHAR(100),
  paid_date DATE,
  scholarship_applied BOOLEAN DEFAULT FALSE,
  scholarship_amount DECIMAL(10,2),
  fine_amount DECIMAL(10,2) DEFAULT 0,
  remarks VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id),
  FOREIGN KEY (semester_id) REFERENCES semesters(id),
  INDEX idx_student (student_id),
  INDEX idx_due_date (due_date),
  INDEX idx_status (status)
);
```

#### 13. Hospitals Table (Nursing)
```sql
CREATE TABLE hospitals (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  city VARCHAR(50),
  state VARCHAR(50),
  bed_strength INT,
  affiliation_date DATE,
  mou_validity_date DATE,
  contact_person VARCHAR(100),
  contact_phone VARCHAR(20),
  email VARCHAR(100),
  status ENUM('active','inactive','terminated') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_status (status)
);
```

#### 14. Clinical Postings Table (Nursing)
```sql
CREATE TABLE clinical_postings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT NOT NULL,
  hospital_id INT NOT NULL,
  ward VARCHAR(50),
  posting_type ENUM('medical','surgical','pediatric','obstetric','icu','ot'),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  duration_days INT,
  required_hours INT,
  completed_hours INT DEFAULT 0,
  supervisor_id INT,
  status ENUM('scheduled','ongoing','completed','cancelled'),
  completion_certificate BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id),
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id),
  FOREIGN KEY (supervisor_id) REFERENCES users(id),
  INDEX idx_student (student_id),
  INDEX idx_posting_dates (start_date, end_date)
);
```

#### 15. Clinical Logbook Table (Nursing)
```sql
CREATE TABLE clinical_logbook (
  id INT PRIMARY KEY AUTO_INCREMENT,
  clinical_posting_id INT NOT NULL,
  student_id INT NOT NULL,
  entry_date DATE NOT NULL,
  entry_time TIME,
  procedure_category VARCHAR(50),  -- Patient assessment, interventions, etc.
  procedure_name VARCHAR(100),
  patient_type VARCHAR(50),  -- Medical, Surgical, Pediatric
  hours_spent DECIMAL(4,2),
  competency_level ENUM('supervised','independent','co-performed'),
  supervisor_id INT,
  supervisor_remarks VARCHAR(255),
  supervisor_approved BOOLEAN DEFAULT FALSE,
  supervisor_approved_at DATETIME,
  student_remarks VARCHAR(255),
  submitted_at DATETIME,
  locked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (clinical_posting_id) REFERENCES clinical_postings(id),
  FOREIGN KEY (student_id) REFERENCES students(id),
  FOREIGN KEY (supervisor_id) REFERENCES users(id),
  INDEX idx_student_date (student_id, entry_date),
  INDEX idx_posting (clinical_posting_id)
);
```

#### 16. Lab Equipment Table (Pharmacy)
```sql
CREATE TABLE lab_equipment (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  equipment_code VARCHAR(50) UNIQUE,
  category VARCHAR(50),
  purchase_date DATE,
  maintenance_date DATE,
  next_maintenance_date DATE,
  location VARCHAR(100),
  status ENUM('operational','maintenance','retired','damaged') DEFAULT 'operational',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_status (status),
  INDEX idx_next_maintenance (next_maintenance_date)
);
```

#### 17. Practicals Table (Pharmacy)
```sql
CREATE TABLE practicals (
  id INT PRIMARY KEY AUTO_INCREMENT,
  subject_id INT NOT NULL,
  practical_number INT,
  name VARCHAR(100) NOT NULL,
  duration_minutes INT DEFAULT 180,
  max_students_per_batch INT DEFAULT 20,
  equipment_required JSON,
  safety_precautions TEXT,
  date_scheduled DATE,
  status ENUM('planned','ongoing','completed','cancelled'),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (subject_id) REFERENCES subjects(id),
  INDEX idx_subject (subject_id),
  INDEX idx_date (date_scheduled)
);
```

#### 18. Practical Records Table (Pharmacy)
```sql
CREATE TABLE practical_records (
  id INT PRIMARY KEY AUTO_INCREMENT,
  practical_id INT NOT NULL,
  student_id INT NOT NULL,
  semester_id INT NOT NULL,
  marks_obtained INT,
  max_marks INT DEFAULT 50,
  grade CHAR(2),
  status ENUM('pending','completed','absent'),
  observations TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_practical_student (practical_id, student_id),
  FOREIGN KEY (practical_id) REFERENCES practicals(id),
  FOREIGN KEY (student_id) REFERENCES students(id),
  FOREIGN KEY (semester_id) REFERENCES semesters(id)
);
```

#### 19. Industrial Training Table (Pharmacy)
```sql
CREATE TABLE industrial_trainings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT NOT NULL,
  organization_name VARCHAR(100) NOT NULL,
  organization_type VARCHAR(50),  -- Pharmaceutical, Hospital, Contract
  location VARCHAR(100),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  duration_weeks INT,
  mentor_name VARCHAR(100),
  mentor_contact VARCHAR(20),
  daily_attendance INT,
  tasks_completed JSON,
  mentor_evaluation TEXT,
  completion_status ENUM('pending','in_progress','completed','failed') DEFAULT 'pending',
  certificate_issued BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id),
  INDEX idx_student (student_id),
  INDEX idx_status (completion_status)
);
```

#### 20. Documents Table
```sql
CREATE TABLE documents (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT NOT NULL,
  document_type VARCHAR(50),  -- Academic, Medical, Regulatory, Professional
  document_name VARCHAR(100),
  file_path VARCHAR(255) NOT NULL,
  file_size INT,
  upload_date DATE NOT NULL,
  expiry_date DATE,
  verification_status ENUM('pending','approved','rejected') DEFAULT 'pending',
  verified_by INT,
  verified_at DATETIME,
  remarks VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id),
  FOREIGN KEY (verified_by) REFERENCES users(id),
  INDEX idx_student (student_id),
  INDEX idx_document_type (document_type),
  INDEX idx_verification_status (verification_status)
);
```

#### 21. Staff (HR) Table
```sql
CREATE TABLE staff (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL UNIQUE,
  employee_id VARCHAR(20) UNIQUE NOT NULL,
  designation VARCHAR(50),
  department VARCHAR(50),
  category ENUM('teaching','non_teaching'),
  employment_type ENUM('permanent','contract','temporary'),
  join_date DATE NOT NULL,
  salary DECIMAL(10,2),
  salary_grade VARCHAR(20),
  pf_account_number VARCHAR(50),
  insurance_policy_number VARCHAR(50),
  status ENUM('active','inactive','retired') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  INDEX idx_department (department),
  INDEX idx_status (status)
);
```

#### 22. Leave Requests Table
```sql
CREATE TABLE leave_requests (
  id INT PRIMARY KEY AUTO_INCREMENT,
  staff_id INT NOT NULL,
  leave_type ENUM('casual','earned','sick','maternity','study','other'),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  days_requested INT,
  reason TEXT,
  status ENUM('pending','approved','rejected','cancelled') DEFAULT 'pending',
  approved_by INT,
  approval_remarks VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (staff_id) REFERENCES staff(id),
  FOREIGN KEY (approved_by) REFERENCES staff(id),
  INDEX idx_staff (staff_id),
  INDEX idx_status (status),
  INDEX idx_dates (start_date, end_date)
);
```

#### 23. Payroll Table
```sql
CREATE TABLE payroll (
  id INT PRIMARY KEY AUTO_INCREMENT,
  staff_id INT NOT NULL,
  payroll_month INT,
  payroll_year INT,
  basic_salary DECIMAL(10,2),
  hra DECIMAL(10,2),
  dearness_allowance DECIMAL(10,2),
  special_allowance DECIMAL(10,2),
  gross_salary DECIMAL(10,2),
  provident_fund DECIMAL(10,2),
  insurance DECIMAL(10,2),
  income_tax DECIMAL(10,2),
  other_deductions DECIMAL(10,2),
  total_deductions DECIMAL(10,2),
  net_salary DECIMAL(10,2),
  payment_status ENUM('pending','processed','paid') DEFAULT 'pending',
  payment_date DATE,
  remarks VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_payroll (staff_id, payroll_month, payroll_year),
  FOREIGN KEY (staff_id) REFERENCES staff(id),
  INDEX idx_staff_month_year (staff_id, payroll_month, payroll_year)
);
```

#### 24. Notifications Table
```sql
CREATE TABLE notifications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  type VARCHAR(50),  -- attendance, fee, exam, academic, etc.
  title VARCHAR(100),
  message TEXT,
  channel ENUM('sms','email','whatsapp','in_app','push') DEFAULT 'in_app',
  status ENUM('pending','sent','delivered','read','failed'),
  sent_at DATETIME,
  read_at DATETIME,
  retry_count INT DEFAULT 0,
  error_message VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  INDEX idx_user_status (user_id, status),
  INDEX idx_created_at (created_at)
);
```

#### 25. Certificates Table
```sql
CREATE TABLE certificates (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT NOT NULL,
  certificate_type VARCHAR(50),  -- Bonafide, Conduct, Clinical Posting, etc.
  issued_date DATE,
  issue_number VARCHAR(50) UNIQUE,
  qr_code VARCHAR(255),
  digital_signature VARCHAR(255),
  collection_status ENUM('pending','collected','dispatched','received') DEFAULT 'pending',
  collected_by INT,
  collected_date DATE,
  validity_date DATE,
  is_duplicate BOOLEAN DEFAULT FALSE,
  fee_paid DECIMAL(10,2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id),
  FOREIGN KEY (collected_by) REFERENCES users(id),
  INDEX idx_student (student_id),
  INDEX idx_certificate_type (certificate_type)
);
```

#### 26. Audit Log Table
```sql
CREATE TABLE audit_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  action VARCHAR(100),
  entity_type VARCHAR(50),  -- students, exams, fees, etc.
  entity_id INT,
  old_value TEXT,
  new_value TEXT,
  ip_address VARCHAR(45),
  user_agent VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  INDEX idx_user_date (user_id, created_at),
  INDEX idx_entity (entity_type, entity_id)
);
```

---

## 🔌 Core API Endpoints (By Phase)

### Phase 1: Authentication & Core

#### Authentication Endpoints
```
POST   /api/auth/login
POST   /api/auth/refresh
POST   /api/auth/logout
POST   /api/auth/password-reset
GET    /api/auth/user
POST   /api/auth/2fa/setup
POST   /api/auth/2fa/verify
```

#### User Management (Admin)
```
GET    /api/users
POST   /api/users
PATCH  /api/users/:id
DELETE /api/users/:id
GET    /api/roles
```

#### System
```
GET    /api/health
GET    /api/config
GET    /api/stats/dashboard
```

### Phase 2: Core Modules

#### Students
```
GET    /api/students
POST   /api/students
GET    /api/students/:id
PATCH  /api/students/:id
DELETE /api/students/:id
GET    /api/students/:id/attendance
GET    /api/students/:id/results
GET    /api/students/:id/documents
POST   /api/students/:id/documents
```

#### Faculty
```
GET    /api/faculty
POST   /api/faculty
GET    /api/faculty/:id
PATCH  /api/faculty/:id
DELETE /api/faculty/:id
GET    /api/faculty/:id/subjects
POST   /api/faculty/:id/subjects
PATCH  /api/faculty/:id/subjects/:subjectId
DELETE /api/faculty/:id/subjects/:subjectId
```

#### Programs & Curriculum
```
GET    /api/programs
POST   /api/programs
GET    /api/academic-years
POST   /api/academic-years
GET    /api/semesters
POST   /api/semesters
GET    /api/subjects
POST   /api/subjects
PATCH  /api/subjects/:id
```

#### Attendance
```
GET    /api/attendance
POST   /api/attendance/bulk
PATCH  /api/attendance/:id
GET    /api/attendance/:studentId/summary
POST   /api/attendance/lock
GET    /api/attendance/report
```

### Phase 3: Advanced Modules

#### Clinical Training (Nursing)
```
GET    /api/hospitals
POST   /api/hospitals
GET    /api/clinical-postings
POST   /api/clinical-postings
PATCH  /api/clinical-postings/:id
GET    /api/clinical-logbook
POST   /api/clinical-logbook
PATCH  /api/clinical-logbook/:id/approve
GET    /api/clinical-logbook/:id/download
```

#### Lab Management (Pharmacy)
```
GET    /api/lab/equipment
POST   /api/lab/equipment
GET    /api/lab/practicals
POST   /api/lab/practicals
GET    /api/lab/batches
POST   /api/lab/batches
GET    /api/lab/records
POST   /api/lab/records
GET    /api/industrial-training
POST   /api/industrial-training
```

#### Exams & Results
```
GET    /api/exams
POST   /api/exams
PATCH  /api/exams/:id
GET    /api/exams/:id/attendance-sheet
POST   /api/exams/:id/marks
PATCH  /api/exams/:id/marks/:studentId
GET    /api/exams/:id/lock
POST   /api/exams/:id/publish-results
GET    /api/results/:studentId/semester
GET    /api/results/:studentId/marksheet
```

#### Fees
```
GET    /api/fees
POST   /api/fees
PATCH  /api/fees/:id
GET    /api/fees/:studentId/summary
POST   /api/fees/:id/payment
POST   /api/fees/:id/scholarship
GET    /api/fees/report
```

#### HR & Payroll
```
GET    /api/staff
POST   /api/staff
GET    /api/staff/:id
PATCH  /api/staff/:id
GET    /api/leave-requests
POST   /api/leave-requests
PATCH  /api/leave-requests/:id/approve
GET    /api/payroll
POST   /api/payroll/process
GET    /api/payroll/:staffId/slip
```

### Phase 4: Compliance & Reporting

#### Compliance
```
GET    /api/compliance/inc/dashboard
GET    /api/compliance/pci/dashboard
GET    /api/compliance/university/dashboard
GET    /api/compliance/metrics/:type
POST   /api/compliance/export-report/:type
GET    /api/compliance/non-compliance-log
```

#### Reports
```
GET    /api/reports/academic
GET    /api/reports/performance
GET    /api/reports/attendance
GET    /api/reports/financial
GET    /api/reports/hr
GET    /api/reports/compliance
POST   /api/reports/generate
GET    /api/reports/:id/status
GET    /api/reports/:id/export
```

#### Certificates
```
GET    /api/certificates/types
POST   /api/certificates/request
GET    /api/certificates/requests (admin queue)
POST   /api/certificates/:id/generate
GET    /api/certificates/:id/download
POST   /api/certificates/verify (public)
```

#### Notifications & Communication
```
GET    /api/notifications
POST   /api/notifications/:id/read
GET    /api/communications/templates
POST   /api/communications/send-bulk
GET    /api/communications/logs
```

---

## 📋 API Response Format

### Standard Response Success
```json
{
  "status": "success",
  "code": 200,
  "message": "Operation completed successfully",
  "data": {
    "id": 1,
    "name": "John Doe",
    ...
  },
  "timestamp": "2026-01-21T10:30:00Z"
}
```

### Paginated Response
```json
{
  "status": "success",
  "code": 200,
  "data": [
    { "id": 1, "name": "John Doe", ... },
    { "id": 2, "name": "Jane Smith", ... }
  ],
  "pagination": {
    "total": 100,
    "page": 1,
    "per_page": 10,
    "total_pages": 10,
    "has_next": true,
    "has_prev": false
  },
  "timestamp": "2026-01-21T10:30:00Z"
}
```

### Error Response
```json
{
  "status": "error",
  "code": 400,
  "message": "Invalid request",
  "errors": [
    {
      "field": "email",
      "message": "Email is required"
    }
  ],
  "timestamp": "2026-01-21T10:30:00Z"
}
```

---

## 🔐 Authentication

### JWT Structure
```javascript
{
  "iss": "college-erp",
  "sub": "user_id",
  "email": "user@college.edu",
  "role": "faculty",
  "iat": 1642765800,
  "exp": 1642852200,  // 24 hours
  "refresh_exp": 1645444200  // 30 days
}
```

### Request Headers
```
Authorization: Bearer <access_token>
X-API-Key: <optional_api_key>
Content-Type: application/json
```

---

## 📊 Data Validation Rules

### Student Enrollment
- Roll number must be unique per program
- Registration number from INC/PCI must be verified
- Enrollment in same semester not allowed for same subject
- Active status required for exam participation

### Faculty Assignment
- Faculty qualification must match subject requirements
- INC/PCI registration must be active
- Maximum workload: 30 hours/week
- Cannot teach same subject in multiple batches

### Attendance
- Cannot mark for future dates
- Cannot mark for dates outside semester
- Minimum 75% required for exam eligibility
- Attendance locked before exam start

### Fees
- Fee structure locked once semester starts
- Payment method must be valid
- Scholarship cannot exceed 100% of fees
- Late fine calculated automatically

---

## 📈 Performance Targets

| Metric | Target | Monitoring |
|---|---|---|
| API Response Time | < 500ms (p95) | APM tool |
| Page Load Time | < 2 seconds | Lighthouse |
| Database Query Time | < 100ms (p95) | Query logs |
| Concurrent Users | 100+ | Load test |
| Data Consistency | 100% | Audit logs |
| Uptime | 99%+ | Health checks |

---

## 🔒 Security Considerations

1. **SQL Injection:** Use parameterized queries
2. **XSS:** Sanitize all user inputs
3. **CSRF:** Implement CSRF tokens
4. **Rate Limiting:** 100 requests/minute per API key
5. **Data Encryption:** Encrypt sensitive fields at rest
6. **HTTPS/TLS:** All communications encrypted
7. **JWT Validation:** Verify token signature and expiry
8. **Audit Logging:** Log all data modifications

---

**Document Version:** 1.0  
**Last Updated:** January 2026  
**Next Review:** Upon schema finalization
