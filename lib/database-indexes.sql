/**
 * Database Indexes for Performance Optimization
 * Phase 2 Week 1 Day 2
 * 
 * These indexes optimize query performance for high-frequency queries
 */

-- Students Table Indexes
ALTER TABLE students ADD INDEX idx_student_email (email);
ALTER TABLE students ADD INDEX idx_student_class (class_id);
ALTER TABLE students ADD INDEX idx_student_section (section);
ALTER TABLE students ADD INDEX idx_student_status (status);
ALTER TABLE students ADD INDEX idx_student_enrollment_date (enrollment_date);
ALTER TABLE students ADD INDEX idx_student_created_at (created_at);

-- Faculty Table Indexes
ALTER TABLE faculty ADD INDEX idx_faculty_email (email);
ALTER TABLE faculty ADD INDEX idx_faculty_department (department);
ALTER TABLE faculty ADD INDEX idx_faculty_status (status);
ALTER TABLE faculty ADD INDEX idx_faculty_created_at (created_at);

-- Admissions Table Indexes
ALTER TABLE admissions ADD INDEX idx_admission_email (email);
ALTER TABLE admissions ADD INDEX idx_admission_status (status);
ALTER TABLE admissions ADD INDEX idx_admission_created_at (created_at);
ALTER TABLE admissions ADD INDEX idx_admission_program (program);
ALTER TABLE admissions ADD INDEX idx_admission_application_date (application_date);

-- Attendance Table Indexes (Most Critical - Heavy Query Load)
ALTER TABLE attendance ADD INDEX idx_attendance_student (student_id);
ALTER TABLE attendance ADD INDEX idx_attendance_date (date);
ALTER TABLE attendance ADD INDEX idx_attendance_class (class_id);
ALTER TABLE attendance ADD INDEX idx_attendance_status (status);
ALTER TABLE attendance ADD INDEX idx_attendance_student_date (student_id, date);
ALTER TABLE attendance ADD INDEX idx_attendance_class_date (class_id, date);

-- Faculty Courses Table Indexes
ALTER TABLE faculty_courses ADD INDEX idx_fc_faculty (faculty_id);
ALTER TABLE faculty_courses ADD INDEX idx_fc_class (class_id);
ALTER TABLE faculty_courses ADD INDEX idx_fc_semester (semester);

-- Grades Table Indexes
ALTER TABLE grades ADD INDEX idx_grade_student (student_id);
ALTER TABLE grades ADD INDEX idx_grade_subject (subject);
ALTER TABLE grades ADD INDEX idx_grade_semester (semester);
ALTER TABLE grades ADD INDEX idx_grade_student_semester (student_id, semester);

-- Composite Indexes for Complex Queries
ALTER TABLE attendance ADD INDEX idx_attendance_composite (student_id, date, status);
ALTER TABLE grades ADD INDEX idx_grades_composite (student_id, subject, semester);
ALTER TABLE faculty ADD INDEX idx_faculty_composite (department, status);

-- Full Text Search Indexes (Optional - if using full text search)
-- ALTER TABLE students ADD FULLTEXT INDEX ft_student_search (first_name, last_name, email);
-- ALTER TABLE faculty ADD FULLTEXT INDEX ft_faculty_search (first_name, last_name, email);
-- ALTER TABLE admissions ADD FULLTEXT INDEX ft_admission_search (first_name, last_name, email);

-- Index Statistics - Run after creating indexes
ANALYZE TABLE students;
ANALYZE TABLE faculty;
ANALYZE TABLE admissions;
ANALYZE TABLE attendance;
ANALYZE TABLE faculty_courses;
ANALYZE TABLE grades;

-- Check Index Usage Query (for monitoring)
-- SELECT * FROM INFORMATION_SCHEMA.STATISTICS WHERE TABLE_SCHEMA = 'college_erp' ORDER BY INDEX_NAME;

-- Explain Query Performance
-- EXPLAIN SELECT * FROM attendance WHERE student_id = ? AND date BETWEEN ? AND ?;
