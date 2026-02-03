-- College ERP Database Schema for Nursing & Pharmacy
-- Comprehensive regulatory-compliant system

-- 1. PROGRAMS TABLE
CREATE TABLE IF NOT EXISTS programs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    type ENUM('nursing', 'pharmacy') NOT NULL,
    program_type VARCHAR(50) NOT NULL,
    -- ANM, GNM, BSc Nursing, PB BSc Nursing, MSc Nursing, D.Pharm, B.Pharm, M.Pharm, Pharm.D
    duration_years INT NOT NULL,
    duration_months INT DEFAULT 0,
    total_intake_limit INT NOT NULL,
    starting_semester INT DEFAULT 1,
    
    -- Regulatory bodies
    regulatory_body VARCHAR(50) NOT NULL, -- INC, PCI, University
    inc_approval_no VARCHAR(100),
    pci_approval_no VARCHAR(100),
    
    -- Clinical/Lab hours (cumulative)
    total_clinical_hours DECIMAL(10, 2) DEFAULT 0,
    total_theory_hours DECIMAL(10, 2) DEFAULT 0,
    total_lab_hours DECIMAL(10, 2) DEFAULT 0,
    
    -- Academic settings
    semester_based BOOLEAN DEFAULT TRUE,
    academic_year_start DATE,
    academic_year_end DATE,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by INT,
    updated_by INT,
    
    INDEX idx_type (type),
    INDEX idx_program_type (program_type),
    INDEX idx_regulatory_body (regulatory_body),
    FOREIGN KEY (created_by) REFERENCES users(id),
    FOREIGN KEY (updated_by) REFERENCES users(id)
);

-- 2. SUBJECTS TABLE
CREATE TABLE IF NOT EXISTS subjects (
    id INT PRIMARY KEY AUTO_INCREMENT,
    program_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) NOT NULL,
    semester INT NOT NULL,
    
    -- Credits and hours
    credit_hours DECIMAL(5, 2) DEFAULT 0,
    theory_hours DECIMAL(10, 2) DEFAULT 0,
    practical_hours DECIMAL(10, 2) DEFAULT 0,
    clinical_hours DECIMAL(10, 2) DEFAULT 0,
    
    -- Subject details
    is_mandatory BOOLEAN DEFAULT TRUE,
    is_elective BOOLEAN DEFAULT FALSE,
    passing_percentage INT DEFAULT 40,
    
    -- Regulatory
    regulatory_body VARCHAR(50), -- INC, PCI
    is_lab_based BOOLEAN DEFAULT FALSE,
    is_clinical_based BOOLEAN DEFAULT FALSE,
    
    -- Sequence
    sequence INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE KEY unique_subject_per_semester (program_id, code, semester),
    INDEX idx_program (program_id),
    INDEX idx_semester (semester),
    FOREIGN KEY (program_id) REFERENCES programs(id)
);

-- 3. CURRICULUM TABLE (Batch-wise)
CREATE TABLE IF NOT EXISTS curriculum (
    id INT PRIMARY KEY AUTO_INCREMENT,
    program_id INT NOT NULL,
    academic_year VARCHAR(9) NOT NULL, -- 2024-2025
    batch_name VARCHAR(50) NOT NULL,
    
    -- Lock status
    is_locked BOOLEAN DEFAULT FALSE,
    locked_at TIMESTAMP NULL,
    locked_by INT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INT NOT NULL,
    
    UNIQUE KEY unique_curriculum (program_id, academic_year, batch_name),
    INDEX idx_program (program_id),
    INDEX idx_academic_year (academic_year),
    FOREIGN KEY (program_id) REFERENCES programs(id),
    FOREIGN KEY (locked_by) REFERENCES users(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- 4. CURRICULUM SUBJECTS (Many-to-many)
CREATE TABLE IF NOT EXISTS curriculum_subjects (
    id INT PRIMARY KEY AUTO_INCREMENT,
    curriculum_id INT NOT NULL,
    subject_id INT NOT NULL,
    sequence INT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE KEY unique_curriculum_subject (curriculum_id, subject_id),
    INDEX idx_curriculum (curriculum_id),
    INDEX idx_subject (subject_id),
    FOREIGN KEY (curriculum_id) REFERENCES curriculum(id),
    FOREIGN KEY (subject_id) REFERENCES subjects(id)
);

-- 5. EXTENDED STUDENT PROFILES (Nursing & Pharmacy specific)
CREATE TABLE IF NOT EXISTS student_profiles_extended (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    program_id INT NOT NULL,
    
    -- Registration numbers
    inc_registration_no VARCHAR(100), -- Nursing
    pci_registration_no VARCHAR(100), -- Pharmacy
    
    -- Nursing specific
    current_clinical_posting_id INT,
    total_clinical_hours_completed DECIMAL(10, 2) DEFAULT 0,
    last_ward_rotation_end_date DATE,
    clinical_eligibility_verified BOOLEAN DEFAULT FALSE,
    
    -- Pharmacy specific
    total_lab_hours_completed DECIMAL(10, 2) DEFAULT 0,
    total_industrial_training_hours DECIMAL(10, 2) DEFAULT 0,
    project_status VARCHAR(50), -- not_started, in_progress, completed, submitted
    project_title VARCHAR(255),
    dissertation_submission_date DATE,
    
    -- General
    eligibility_exam_check BOOLEAN DEFAULT FALSE,
    last_eligibility_check_date DATETIME,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    UNIQUE KEY unique_student_program (student_id, program_id),
    INDEX idx_student (student_id),
    INDEX idx_program (program_id),
    FOREIGN KEY (student_id) REFERENCES users(id),
    FOREIGN KEY (program_id) REFERENCES programs(id),
    FOREIGN KEY (current_clinical_posting_id) REFERENCES clinical_postings(id)
);

-- 6. CLINICAL POSTINGS (Nursing)
CREATE TABLE IF NOT EXISTS clinical_postings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    hospital_id INT,
    department_id INT,
    
    -- Duration
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    expected_hours DECIMAL(10, 2),
    actual_hours_completed DECIMAL(10, 2) DEFAULT 0,
    
    -- Supervisor
    supervisor_id INT,
    supervisor_name VARCHAR(255),
    supervisor_contact VARCHAR(20),
    
    -- Status
    status ENUM('scheduled', 'active', 'completed', 'cancelled') DEFAULT 'scheduled',
    feedback TEXT,
    marks_awarded DECIMAL(5, 2),
    
    -- Ward/Unit info
    ward_name VARCHAR(255),
    unit_specialty VARCHAR(255),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_student (student_id),
    INDEX idx_hospital (hospital_id),
    INDEX idx_department (department_id),
    INDEX idx_status (status),
    INDEX idx_dates (start_date, end_date),
    FOREIGN KEY (student_id) REFERENCES users(id),
    FOREIGN KEY (supervisor_id) REFERENCES users(id)
);

-- 7. HOSPITAL AFFILIATIONS
CREATE TABLE IF NOT EXISTS hospital_affiliations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    hospital_name VARCHAR(255) NOT NULL,
    hospital_code VARCHAR(50) UNIQUE,
    
    -- Contact
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    pin_code VARCHAR(10),
    phone VARCHAR(20),
    email VARCHAR(100),
    
    -- Details
    beds_total INT,
    icu_beds INT,
    affiliated_programs VARCHAR(500), -- JSON array or comma-separated
    
    -- Regulatory
    nmc_accreditation_no VARCHAR(100),
    accreditation_valid_till DATE,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_city_state (city, state),
    INDEX idx_accreditation (nmc_accreditation_no)
);

-- 8. CLINICAL LOGBOOKS (Nursing)
CREATE TABLE IF NOT EXISTS clinical_logbooks (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    clinical_posting_id INT NOT NULL,
    entry_date DATE NOT NULL,
    
    -- Entry details
    procedure_performed VARCHAR(255),
    case_description TEXT,
    learning_points TEXT,
    
    -- Checklist
    observation_only BOOLEAN,
    assisted_procedure BOOLEAN,
    supervised_independently BOOLEAN,
    
    -- Approval
    supervisor_id INT,
    approved_by INT,
    approved_at DATETIME,
    approval_status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    rejection_reason TEXT,
    
    -- Lock status (after approval)
    is_locked BOOLEAN DEFAULT FALSE,
    locked_at DATETIME,
    
    hours_logged DECIMAL(5, 2) DEFAULT 1,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    UNIQUE KEY unique_logbook_entry (student_id, clinical_posting_id, entry_date),
    INDEX idx_student (student_id),
    INDEX idx_posting (clinical_posting_id),
    INDEX idx_approval_status (approval_status),
    INDEX idx_entry_date (entry_date),
    FOREIGN KEY (student_id) REFERENCES users(id),
    FOREIGN KEY (clinical_posting_id) REFERENCES clinical_postings(id),
    FOREIGN KEY (supervisor_id) REFERENCES users(id),
    FOREIGN KEY (approved_by) REFERENCES users(id)
);

-- 9. STUDENT DOCUMENTS (Document Vault)
CREATE TABLE IF NOT EXISTS student_documents (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    
    -- Document types
    document_type ENUM(
        '10plus2_marksheet',
        'migration_certificate',
        'medical_fitness',
        'inc_registration',
        'pci_registration',
        'internship_completion',
        'research_publication',
        'other'
    ),
    
    -- File details
    file_name VARCHAR(255),
    file_path VARCHAR(500),
    file_size INT, -- bytes
    mime_type VARCHAR(50),
    
    -- Metadata
    document_date DATE,
    expiry_date DATE,
    issued_by VARCHAR(255),
    verification_status ENUM('pending', 'verified', 'rejected') DEFAULT 'pending',
    verified_by INT,
    verified_at DATETIME,
    
    version INT DEFAULT 1,
    is_latest BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_student (student_id),
    INDEX idx_document_type (document_type),
    INDEX idx_verification_status (verification_status),
    FOREIGN KEY (student_id) REFERENCES users(id),
    FOREIGN KEY (verified_by) REFERENCES users(id)
);

-- 10. EXTENDED FACULTY PROFILES
CREATE TABLE IF NOT EXISTS faculty_profiles_extended (
    id INT PRIMARY KEY AUTO_INCREMENT,
    faculty_id INT NOT NULL UNIQUE,
    
    -- Registration
    inc_registration_no VARCHAR(100), -- Nursing
    inc_registration_expiry DATE,
    pci_registration_no VARCHAR(100), -- Pharmacy
    pci_registration_expiry DATE,
    
    -- Qualifications
    qualification VARCHAR(100),
    specialization VARCHAR(255),
    additional_qualifications TEXT,
    
    -- Teaching eligibility
    clinical_teaching_eligible BOOLEAN DEFAULT FALSE,
    lab_supervision_eligible BOOLEAN DEFAULT FALSE,
    
    -- Experience
    total_experience_years INT,
    research_publications INT DEFAULT 0,
    research_areas TEXT,
    
    -- Compliance
    student_faculty_ratio INT, -- e.g., 1:15
    subject_specialization JSON,
    can_teach_programs JSON, -- Array of program IDs
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_faculty (faculty_id),
    INDEX idx_registration (inc_registration_no, pci_registration_no),
    FOREIGN KEY (faculty_id) REFERENCES users(id)
);

-- 11. ATTENDANCE_ADVANCED
CREATE TABLE IF NOT EXISTS attendance_advanced (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    faculty_id INT,
    date_of_attendance DATE NOT NULL,
    
    -- Attendance type
    type ENUM('theory', 'clinical', 'lab', 'internship', 'practical') NOT NULL,
    status ENUM('present', 'absent', 'leave', 'late') DEFAULT 'absent',
    hours_logged DECIMAL(5, 2) DEFAULT 1,
    
    -- Context
    subject_id INT,
    ward_id INT, -- For clinical
    lab_id INT, -- For pharmacy labs
    department_id INT,
    
    -- For internship/industrial training
    company_id INT,
    training_location VARCHAR(255),
    
    -- Optional notes
    remarks TEXT,
    
    -- Verification
    verified_by INT,
    verified_at DATETIME,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    UNIQUE KEY unique_attendance (student_id, date_of_attendance, type, subject_id),
    INDEX idx_student (student_id),
    INDEX idx_date (date_of_attendance),
    INDEX idx_type (type),
    INDEX idx_status (status),
    FOREIGN KEY (student_id) REFERENCES users(id),
    FOREIGN KEY (faculty_id) REFERENCES users(id),
    FOREIGN KEY (subject_id) REFERENCES subjects(id),
    FOREIGN KEY (verified_by) REFERENCES users(id)
);

-- 12. ATTENDANCE THRESHOLDS (Compliance)
CREATE TABLE IF NOT EXISTS attendance_thresholds (
    id INT PRIMARY KEY AUTO_INCREMENT,
    program_id INT NOT NULL,
    
    min_theory_percentage INT DEFAULT 75,
    min_clinical_percentage INT DEFAULT 80,
    min_lab_percentage INT DEFAULT 80,
    min_internship_percentage INT DEFAULT 90,
    
    -- Exam eligibility rules
    exam_eligible_if_percentage INT DEFAULT 75,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    UNIQUE KEY unique_program_thresholds (program_id),
    FOREIGN KEY (program_id) REFERENCES programs(id)
);

-- 13. EXAMS TABLE
CREATE TABLE IF NOT EXISTS exams (
    id INT PRIMARY KEY AUTO_INCREMENT,
    program_id INT NOT NULL,
    semester INT NOT NULL,
    subject_id INT NOT NULL,
    
    -- Exam details
    exam_type ENUM('internal', 'practical', 'viva', 'external', 'theory', 'sessional') NOT NULL,
    exam_name VARCHAR(255),
    exam_date DATE,
    exam_time TIME,
    
    -- Marking
    max_marks DECIMAL(5, 2) NOT NULL,
    passing_marks DECIMAL(5, 2) NOT NULL,
    internal_weight INT DEFAULT 30, -- %
    external_weight INT DEFAULT 70, -- %
    
    -- Faculty
    question_setter_id INT,
    examiner_id INT,
    
    -- Status
    status ENUM('scheduled', 'ongoing', 'completed', 'cancelled') DEFAULT 'scheduled',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_program (program_id),
    INDEX idx_semester (semester),
    INDEX idx_subject (subject_id),
    INDEX idx_exam_date (exam_date),
    FOREIGN KEY (program_id) REFERENCES programs(id),
    FOREIGN KEY (subject_id) REFERENCES subjects(id),
    FOREIGN KEY (question_setter_id) REFERENCES users(id),
    FOREIGN KEY (examiner_id) REFERENCES users(id)
);

-- 14. RESULTS TABLE
CREATE TABLE IF NOT EXISTS results (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    exam_id INT NOT NULL,
    subject_id INT NOT NULL,
    
    -- Marks
    internal_marks DECIMAL(5, 2),
    practical_marks DECIMAL(5, 2),
    external_marks DECIMAL(5, 2),
    total_marks DECIMAL(5, 2),
    
    -- Grade
    grade VARCHAR(2), -- A+, A, B, C, D, F
    grade_points DECIMAL(3, 2),
    
    -- Status
    status ENUM('pass', 'fail', 'backlog', 'absent', 'medical_relief') DEFAULT 'absent',
    is_supplementary BOOLEAN DEFAULT FALSE,
    supplementary_date DATE,
    
    -- Entry
    entered_by INT,
    entered_at DATETIME,
    verified_by INT,
    verified_at DATETIME,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    UNIQUE KEY unique_result (student_id, exam_id),
    INDEX idx_student (student_id),
    INDEX idx_subject (subject_id),
    INDEX idx_status (status),
    FOREIGN KEY (student_id) REFERENCES users(id),
    FOREIGN KEY (exam_id) REFERENCES exams(id),
    FOREIGN KEY (subject_id) REFERENCES subjects(id),
    FOREIGN KEY (entered_by) REFERENCES users(id),
    FOREIGN KEY (verified_by) REFERENCES users(id)
);

-- 15. COMPLIANCE REPORTS
CREATE TABLE IF NOT EXISTS compliance_reports (
    id INT PRIMARY KEY AUTO_INCREMENT,
    program_id INT NOT NULL,
    report_type ENUM('inc_audit', 'pci_audit', 'university_compliance', 'inspection') NOT NULL,
    
    -- Report details
    report_date DATE,
    academic_year VARCHAR(9),
    
    -- Findings
    findings_json JSON, -- Structured findings
    deficiencies TEXT,
    corrective_actions TEXT,
    
    -- Status
    status ENUM('draft', 'submitted', 'approved', 'rejected') DEFAULT 'draft',
    submitted_to VARCHAR(100), -- INC, PCI, etc
    submission_date DATE,
    
    generated_by INT,
    approved_by INT,
    approved_at DATETIME,
    
    attachment_path VARCHAR(500),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_program (program_id),
    INDEX idx_report_type (report_type),
    INDEX idx_academic_year (academic_year),
    FOREIGN KEY (program_id) REFERENCES programs(id),
    FOREIGN KEY (generated_by) REFERENCES users(id),
    FOREIGN KEY (approved_by) REFERENCES users(id)
);

-- Create indexes for performance optimization
CREATE INDEX idx_hospital_affiliations_active ON hospital_affiliations(is_active);
CREATE INDEX idx_student_profiles_extended_registration ON student_profiles_extended(inc_registration_no, pci_registration_no);
