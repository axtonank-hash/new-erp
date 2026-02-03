# 🏥 Implementation Guide - Phase 1: Academic Structure

## Overview
This guide provides step-by-step implementation details for Phase 1 of the Nursing & Pharmacy College ERP system, focusing on the core academic structure.

---

## 📂 Project Structure

```
next-app/
├── pages/
│   ├── programs/
│   │   ├── index.js (List all programs)
│   │   ├── [id].js (Program details)
│   │   ├── create.js (New program)
│   │   ├── [id]/edit.js (Edit program)
│   │   └── [id]/curriculum.js (Manage curriculum)
│   ├── subjects/
│   │   ├── index.js
│   │   ├── create.js
│   │   └── [id]/edit.js
│   ├── dashboard.js (Updated with programs overview)
│   └── api/
│       ├── programs/
│       │   ├── index.js (GET all, POST create)
│       │   └── [id].js (GET one, PUT update, DELETE)
│       ├── subjects/
│       │   ├── index.js
│       │   └── [id].js
│       └── curriculum/
│           ├── index.js
│           └── [id].js
│
├── components/
│   ├── Programs/
│   │   ├── ProgramForm.js
│   │   ├── ProgramCard.js
│   │   └── ProgramTable.js
│   ├── Curriculum/
│   │   ├── CurriculumBuilder.js
│   │   ├── SubjectMapper.js
│   │   └── CurriculumPreview.js
│   └── Reports/
│       ├── ComplianceReport.js
│       └── ClinicalHoursReport.js
│
├── lib/
│   ├── programUtils.js (Helper functions)
│   ├── complianceValidator.js (INC/PCI rules)
│   └── mockData.js (Updated with programs data)
```

---

## 🗄️ Database Setup

### Step 1: Create Database Tables
```bash
# Run the migration
mysql -u gegok12 -p gegok12 < database/migrations/college_erp_complete_schema.sql
```

### Step 2: Seed Initial Data
Run seeds for:
- Programs (5-10 standard programs)
- Sample hospital affiliations
- Subject templates

---

## 🔧 API Endpoints (Phase 1)

### Programs Management
```
GET    /api/programs                    # List all programs
POST   /api/programs                    # Create program
GET    /api/programs/:id                # Get program details
PUT    /api/programs/:id                # Update program
DELETE /api/programs/:id                # Delete program
GET    /api/programs/:id/curriculum     # Get program curriculum
```

### Subjects Management
```
GET    /api/subjects                    # List all subjects
POST   /api/subjects                    # Create subject
GET    /api/subjects/:id                # Get subject
PUT    /api/subjects/:id                # Update subject
DELETE /api/subjects/:id                # Delete subject
GET    /api/subjects/program/:programId # Get subjects for program
```

### Curriculum Management
```
GET    /api/curriculum                  # List all curricula
POST   /api/curriculum                  # Create curriculum
GET    /api/curriculum/:id              # Get curriculum
PUT    /api/curriculum/:id/lock         # Lock curriculum
POST   /api/curriculum/:id/add-subject  # Add subject to curriculum
DELETE /api/curriculum/:id/remove-subject/:subjectId
```

### Compliance Validation
```
GET    /api/compliance/validate/:programId    # Validate program compliance
GET    /api/compliance/report/:programId      # Generate compliance report
```

---

## 🎨 UI Components to Create

### 1. Program Management
**File:** `components/Programs/ProgramForm.js`
```javascript
Features:
- Program name, code, type (nursing/pharmacy)
- Program type dropdown (ANM, GNM, B.Sc, etc.)
- Duration input (years/months)
- Intake limit
- Regulatory body selection
- Approval numbers (INC/PCI)
- Hours requirements (theory/clinical/lab)
```

**File:** `components/Programs/ProgramCard.js`
```javascript
Display:
- Program name & code
- Type badge (nursing/pharmacy)
- Duration
- Intake capacity
- Status (active/inactive)
- Quick actions (View, Edit, View Curriculum)
```

### 2. Curriculum Builder
**File:** `components/Curriculum/CurriculumBuilder.js`
```javascript
Features:
- Program selection
- Academic year input
- Batch name
- Drag-drop subject assignment by semester
- Hours calculation (auto-calculate)
- Compliance validation
- Lock/Unlock controls
```

### 3. Dashboard Updates
**File:** `pages/dashboard.js`
```javascript
Add sections:
- Active programs overview
- Student intake vs capacity
- Clinical hours compliance status
- Curriculum lock status
- Faculty deficiency alerts
```

---

## 📋 Implementation Checklist

### Week 1: Foundation
- [ ] Database tables created & tested
- [ ] Mock data seeded
- [ ] API routes implemented & tested
- [ ] Postman collection updated

### Week 2: Frontend
- [ ] Program list page created
- [ ] Program form (create/edit)
- [ ] Program detail page
- [ ] Subject management
- [ ] Curriculum builder page
- [ ] Basic validation implemented

### Week 3: Integration
- [ ] Frontend-Backend integration
- [ ] Form validation (client + server)
- [ ] Error handling
- [ ] UI polish

### Week 4: Testing & Compliance
- [ ] Unit tests for APIs
- [ ] Integration tests
- [ ] INC/PCI compliance validation
- [ ] Documentation

---

## 🔐 Compliance Rules (INC/PCI)

### INC (Nursing) Validation Rules
```javascript
// Minimum hours requirements
const INC_RULES = {
  GNM: {
    theory_hours_min: 1800,
    clinical_hours_min: 2000,
    total_months: 36
  },
  BSC_NURSING: {
    theory_hours_min: 2000,
    clinical_hours_min: 2500,
    total_months: 48
  },
  PB_BSC: {
    theory_hours_min: 800,
    clinical_hours_min: 1000,
    total_months: 24
  },
  MSC_NURSING: {
    theory_hours_min: 1000,
    clinical_hours_min: 800,
    total_months: 24
  }
};
```

### PCI (Pharmacy) Validation Rules
```javascript
// Credit hours & components
const PCI_RULES = {
  D_PHARM: {
    total_credits: 60,
    theory_credits_min: 36,
    practical_credits_min: 24,
    total_months: 24
  },
  B_PHARM: {
    total_credits: 220,
    theory_credits_min: 132,
    practical_credits_min: 88,
    total_months: 48
  },
  M_PHARM: {
    theory_credits_min: 60,
    practical_credits_min: 40,
    total_months: 24
  },
  PHARMD: {
    internship_months: 12,
    theory_months: 24,
    total_months: 72
  }
};
```

---

## 📊 Key Functions to Implement

### 1. Auto-Calculate Hours
```javascript
// lib/programUtils.js
calculateTotalHours(program, subjects) {
  return {
    theory: subjects.reduce((sum, s) => sum + s.theory_hours, 0),
    clinical: subjects.reduce((sum, s) => sum + s.clinical_hours, 0),
    lab: subjects.reduce((sum, s) => sum + s.lab_hours, 0),
  };
}
```

### 2. Validate Compliance
```javascript
// lib/complianceValidator.js
validateNursingProgram(program, subjects) {
  const rules = INC_RULES[program.program_type];
  const hours = calculateTotalHours(program, subjects);
  
  return {
    theory_compliant: hours.theory >= rules.theory_hours_min,
    clinical_compliant: hours.clinical >= rules.clinical_hours_min,
    deficiencies: []
  };
}
```

### 3. Generate Compliance Report
```javascript
// lib/complianceValidator.js
generateComplianceReport(program, subjects, faculty) {
  return {
    program_hours_compliance: validateHours(program, subjects),
    faculty_compliance: validateFacultyRatio(program, faculty),
    subject_compliance: validateSubjectMapping(program, subjects),
    recommendations: []
  };
}
```

---

## 🧪 Testing Strategy

### Unit Tests
```javascript
// tests/programUtils.test.js
describe('Program Utils', () => {
  test('calculates total hours correctly', () => {});
  test('validates INC compliance', () => {});
  test('validates PCI compliance', () => {});
});
```

### API Tests
```javascript
// tests/api/programs.test.js
describe('Programs API', () => {
  test('GET /api/programs returns all programs', () => {});
  test('POST /api/programs creates new program', () => {});
  test('PUT /api/programs/:id validates compliance', () => {});
});
```

### Integration Tests
```javascript
// tests/integration/academic-flow.test.js
describe('Academic Flow', () => {
  test('Create program -> Add subjects -> Lock curriculum', () => {});
  test('System rejects non-compliant curriculum', () => {});
});
```

---

## 📱 Frontend Pages Layout

### 1. Programs Page (`/programs`)
```
┌─ Header: "Academic Programs"
├─ Filter/Search
├─ "New Program" Button
└─ Cards View:
   ├─ B.Sc Nursing [Active]
   │  Duration: 4 Years | Intake: 60 | ✓ INC Compliant
   ├─ B.Pharm [Active]
   │  Duration: 4 Years | Intake: 50 | ✓ PCI Compliant
   └─ More programs...
```

### 2. Program Details Page (`/programs/:id`)
```
┌─ Program Header
│  B.Sc Nursing (NRS001)
│  Type: Nursing | Duration: 4 Years | Intake: 60
├─ Quick Stats
│  Theory Hours: 2000/2000 ✓
│  Clinical Hours: 2500/2500 ✓
│  Lab Hours: 500/500 ✓
├─ Curriculum Section
│  Semester 1: [Add Subjects] [View Subjects]
│  Semester 2: [Add Subjects] [View Subjects]
│  ...
├─ Compliance Status
│  INC Compliance: ✓ PASS
│  Faculty Ratio: ✓ OK
│  Infrastructure: ✓ OK
└─ Actions
   [Edit] [Lock Curriculum] [Generate Report]
```

### 3. Curriculum Builder (`/programs/:id/curriculum`)
```
┌─ Academic Year: [2024-2025] Batch: [Batch A]
├─ Semester Overview:
│  ├─ Semester 1 (6 Subjects)
│  │  Theory Hours: 300/300 ✓
│  │  Clinical Hours: 400/400 ✓
│  └─ [Manage] [Lock]
│
├─ Subject Manager:
│  Available Subjects:
│  - Anatomy (5 credits, 100 theory hours, 50 lab hours)
│  - Physiology (5 credits, ...)
│  
│  [Drag to assign to semester]
│
└─ Compliance Check
   ✓ All hours met
   ✓ All mandatory subjects included
   [Lock Curriculum]
```

---

## 🚀 Deployment Checklist

- [ ] Database migrations run
- [ ] API endpoints tested (Postman)
- [ ] Frontend components tested
- [ ] Compliance validation working
- [ ] Documentation updated
- [ ] Code reviewed
- [ ] User acceptance testing
- [ ] Production deployment

---

## 📚 References

- INC Curriculum Guidelines
- PCI Curriculum Guidelines
- University Regulation Documents
- System Architecture Document

---

## ✅ Success Criteria

✓ All programs can be created with INC/PCI compliance validation
✓ Curricula can be locked after compliance verification
✓ 100% compliance reports generated automatically
✓ Clinical/Lab hours auto-calculated
✓ System prevents non-compliant curriculum submission
