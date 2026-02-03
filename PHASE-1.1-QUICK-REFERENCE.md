# Phase 1.1 Quick Reference Guide

## Quick Start Commands

### 1. Run Migrations
```bash
cd /workspaces/new-erp
php artisan migrate --path="database/migrations/2025_01_22_100000_create_nursing_pharmacy_programs_table.php"
php artisan migrate --path="database/migrations/2025_01_22_100001_create_nursing_pharmacy_subjects_table.php"
php artisan migrate --path="database/migrations/2025_01_22_100002_create_nursing_pharmacy_curricula_table.php"

# Or run all migrations
php artisan migrate
```

### 2. Create Test Data

Create a Laravel tinker session:
```bash
php artisan tinker
```

Then create programs:
```php
// Create BSc Nursing Program
$program = App\Models\NursingPharmacyProgram::create([
    'name' => 'B.Sc Nursing',
    'type' => 'nursing',
    'program_type' => 'BSc',
    'duration_years' => 4,
    'total_intake_limit' => 60,
    'clinical_hours_required' => 800,
    'theory_hours_required' => 1200,
    'regulatory_body' => 'INC',
    'is_active' => true
]);

// Create B.Pharm Program
$bpharm = App\Models\NursingPharmacyProgram::create([
    'name' => 'B.Pharm',
    'type' => 'pharmacy',
    'program_type' => 'B.Pharm',
    'duration_years' => 4,
    'total_intake_limit' => 40,
    'regulatory_body' => 'PCI',
    'is_active' => true
]);

// Add subjects to nursing program
$anatomy = App\Models\NursingPharmacySubject::create([
    'program_id' => $program->id,
    'name' => 'Anatomy',
    'code' => 'NUR-101',
    'semester' => 1,
    'theory_hours' => 60,
    'practical_hours' => 30,
    'is_mandatory' => true,
    'regulatory_body' => 'INC'
]);

// Add subjects to pharmacy program
$pharmaceutics = App\Models\NursingPharmacySubject::create([
    'program_id' => $bpharm->id,
    'name' => 'Pharmaceutics',
    'code' => 'PHARM-101',
    'semester' => 1,
    'credit_hours' => 3,
    'theory_hours' => 40,
    'practical_hours' => 40,
    'is_mandatory' => true,
    'regulatory_body' => 'PCI'
]);

// Create curriculum entry
$curriculum = App\Models\NursingPharmacyCurriculum::create([
    'program_id' => $program->id,
    'subject_id' => $anatomy->id,
    'academic_year' => 1,
    'sequence' => 1
]);

// Verify compliance
print_r($program->validateINCCompliance());
print_r($bpharm->validatePCICompliance());

exit;
```

---

## API Endpoint Examples

### Programs

#### List Programs
```bash
curl -X GET "http://localhost:8000/api/v2/nursing-pharmacy/programs?type=nursing" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Create Program
```bash
curl -X POST "http://localhost:8000/api/v2/nursing-pharmacy/programs" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "GNM Nursing",
    "type": "nursing",
    "program_type": "GNM",
    "duration_years": 3,
    "total_intake_limit": 50,
    "clinical_hours_required": 600,
    "theory_hours_required": 900,
    "regulatory_body": "INC"
  }'
```

#### Get Program Compliance Report
```bash
curl -X GET "http://localhost:8000/api/v2/nursing-pharmacy/programs/1/compliance-report" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Subjects

#### List Program Subjects
```bash
curl -X GET "http://localhost:8000/api/v2/nursing-pharmacy/programs/1/subjects-list?semester=1" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Add Subject to Program
```bash
curl -X POST "http://localhost:8000/api/v2/nursing-pharmacy/subjects" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "program_id": 1,
    "name": "Physiology",
    "code": "NUR-102",
    "semester": 1,
    "theory_hours": 60,
    "practical_hours": 20,
    "is_mandatory": true,
    "regulatory_body": "INC"
  }'
```

#### Validate All Subjects for Program
```bash
curl -X POST "http://localhost:8000/api/v2/nursing-pharmacy/programs/1/validate-subjects" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Curriculum

#### Get Program Academic Years
```bash
curl -X GET "http://localhost:8000/api/v2/nursing-pharmacy/programs/1/years" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Get Curriculum for Year
```bash
curl -X GET "http://localhost:8000/api/v2/nursing-pharmacy/programs/1/curriculum-by-year?academic_year=1" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Add Subject to Curriculum
```bash
curl -X POST "http://localhost:8000/api/v2/nursing-pharmacy/curricula" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "program_id": 1,
    "subject_id": 1,
    "academic_year": 1,
    "sequence": 1
  }'
```

#### Lock Curriculum Entry
```bash
curl -X POST "http://localhost:8000/api/v2/nursing-pharmacy/curricula/1/lock" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Lock All for Academic Year
```bash
curl -X POST "http://localhost:8000/api/v2/nursing-pharmacy/programs/1/lock-year" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"academic_year": 1}'
```

---

## Regulatory Compliance Rules

### INC (Indian Nursing Council) - Nursing Programs

| Program | Clinical Hours | Theory Hours | Practical Limit |
|---------|---|---|---|
| ANM | 480 | 720 | 40% |
| GNM | 600 | 900 | 40% |
| B.Sc Nursing | 800 | 1200 | 40% |
| Post Basic B.Sc | 600 | 900 | 40% |
| M.Sc Nursing | 500 | 750 | 40% |

### PCI (Pharmacy Council of India) - Pharmacy Programs

| Program | Total Credits | Subject Practical Limit |
|---------|---|---|
| D.Pharm | 64-66 | 50% |
| B.Pharm | 150-152 | 50% |
| M.Pharm | 80-82 | 50% |
| Pharm.D | 280-282 | 50% |

---

## Validation Rules Applied

### Program Validation
- ✓ Name uniqueness
- ✓ Type must be nursing or pharmacy
- ✓ Duration must be 1-10 years
- ✓ Intake limit must be > 0
- ✓ Clinical hours validated for nursing (INC)
- ✓ Credits validated for pharmacy (PCI)

### Subject Validation
- ✓ Code uniqueness
- ✓ Semester 1-12
- ✓ Practical ratio ≤ 40% (INC) or 50% (PCI)
- ✓ Credit hours calculated correctly for PCI
- ✓ Theory + Practical > 0

### Curriculum Validation
- ✓ Subject belongs to program
- ✓ No duplicate subject in same year/program
- ✓ Sequence must be unique per program/year
- ✓ Cannot delete locked entries
- ✓ Lock tracking (who, when)

---

## Error Handling

All endpoints return consistent JSON response format:

**Success (200):**
```json
{
    "success": true,
    "message": "Resource created successfully",
    "data": { ... }
}
```

**Validation Error (422):**
```json
{
    "success": false,
    "message": "Validation failed",
    "errors": {
        "name": ["Program name is required"],
        "clinical_hours_required": ["INC requires minimum 800 clinical hours for BSc"]
    }
}
```

**Not Found (404):**
```json
{
    "success": false,
    "message": "Resource not found",
    "errors": null
}
```

---

## Database Relationships

```
User (locked_by)
    ↓
    └── NursingPharmacyCurriculum (locked_by: user_id)

NursingPharmacyProgram
    ├── NursingPharmacySubject (1:N)
    │   └── NursingPharmacyCurriculum (1:N)
    └── NursingPharmacyCurriculum (1:N)
        └── NursingPharmacySubject (N:1)
```

---

## Common Issues & Solutions

### Issue: "Subject does not belong to program"
**Solution:** Verify subject_id belongs to program_id before adding to curriculum

### Issue: "Practical ratio exceeds INC limit"
**Solution:** Reduce practical_hours or increase theory_hours
- INC: Practical must be ≤ 40% of total

### Issue: "Subject is already in curriculum for this year"
**Solution:** Each subject can only appear once per program per academic year

### Issue: "Cannot delete locked curriculum entry"
**Solution:** Unlock the entry first using `/lock` endpoint, then delete

---

## Testing Checklist

- [ ] Create nursing program with INC compliance
- [ ] Create pharmacy program with PCI compliance
- [ ] Add subjects with correct practical/theory ratios
- [ ] Validate subjects for compliance
- [ ] Create curriculum entries
- [ ] Lock curriculum
- [ ] Unlock curriculum
- [ ] Get compliance reports
- [ ] Test bulk import
- [ ] Test pagination and filtering
- [ ] Test error handling

---

## Performance Considerations

1. **Indexes:** Programs indexed by type, is_active
2. **Relationships:** Always eager load with `->with()`
3. **Queries:** Use `paginate()` for large result sets
4. **Caching:** Consider caching compliance rules

---

## Next Phase (1.2)

Phase 1.2 will add:
- Faculty Management (INC/PCI registration)
- Attendance System (Theory/Clinical/Lab)
- Student Eligibility Validation
- Faculty-Subject Mapping

---

*Last Updated: January 22, 2026*
