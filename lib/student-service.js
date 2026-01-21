/**
 * Student Service Layer
 * Handles all business logic for student operations
 */

// Mock data for development (will be replaced with database queries)
const mockStudents = [
  {
    id: 'student_001',
    registration_number: 'REG001',
    first_name: 'Raj',
    last_name: 'Kumar',
    date_of_birth: '2010-05-15',
    gender: 'male',
    email: 'raj@college.edu',
    phone: '9876543210',
    address: '123 Main Street',
    city: 'Mumbai',
    state: 'Maharashtra',
    zip_code: '400001',
    blood_group: 'O+',
    parent_name: 'Ramesh Kumar',
    parent_email: 'ramesh@email.com',
    parent_phone: '9876543200',
    class_id: 'class_10a',
    section: 'A',
    roll_number: 1,
    admission_date: '2023-06-01',
    status: 'active',
    created_at: '2023-06-01T00:00:00Z',
    updated_at: '2023-06-01T00:00:00Z'
  },
  {
    id: 'student_002',
    registration_number: 'REG002',
    first_name: 'Priya',
    last_name: 'Singh',
    date_of_birth: '2010-08-22',
    gender: 'female',
    email: 'priya@college.edu',
    phone: '9876543211',
    address: '456 Oak Avenue',
    city: 'Delhi',
    state: 'Delhi',
    zip_code: '110001',
    blood_group: 'B+',
    parent_name: 'Vijay Singh',
    parent_email: 'vijay@email.com',
    parent_phone: '9876543201',
    class_id: 'class_10a',
    section: 'A',
    roll_number: 2,
    admission_date: '2023-06-01',
    status: 'active',
    created_at: '2023-06-01T00:00:00Z',
    updated_at: '2023-06-01T00:00:00Z'
  }
];

/**
 * Get all students with optional filtering
 * @param {Object} filters - Filter criteria (class_id, section, status, search)
 * @param {Number} page - Page number for pagination
 * @param {Number} limit - Records per page
 * @returns {Object} Paginated students list
 */
async function getStudents(filters = {}, page = 1, limit = 10) {
  try {
    let students = [...mockStudents];

    // Apply filters
    if (filters.class_id) {
      students = students.filter(s => s.class_id === filters.class_id);
    }
    if (filters.section) {
      students = students.filter(s => s.section === filters.section);
    }
    if (filters.status) {
      students = students.filter(s => s.status === filters.status);
    }
    if (filters.search) {
      const search = filters.search.toLowerCase();
      students = students.filter(s =>
        s.first_name.toLowerCase().includes(search) ||
        s.last_name.toLowerCase().includes(search) ||
        s.registration_number.toLowerCase().includes(search)
      );
    }

    // Pagination
    const total = students.length;
    const pages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    const items = students.slice(start, start + limit);

    return {
      success: true,
      data: {
        items,
        total,
        page,
        limit,
        pages
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Get single student by ID
 * @param {String} id - Student ID
 * @returns {Object} Student data or error
 */
async function getStudentById(id) {
  try {
    const student = mockStudents.find(s => s.id === id);
    
    if (!student) {
      return {
        success: false,
        error: 'Student not found',
        status: 404
      };
    }

    return {
      success: true,
      data: student
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Create new student
 * @param {Object} studentData - Student information
 * @param {String} createdBy - User ID creating the record
 * @returns {Object} Created student or error
 */
async function createStudent(studentData, createdBy) {
  try {
    // Validate required fields
    const requiredFields = ['first_name', 'last_name', 'email', 'class_id'];
    const missing = requiredFields.filter(field => !studentData[field]);
    
    if (missing.length > 0) {
      return {
        success: false,
        error: `Missing required fields: ${missing.join(', ')}`,
        status: 400
      };
    }

    // Check email uniqueness
    const emailExists = mockStudents.some(s => s.email === studentData.email);
    if (emailExists) {
      return {
        success: false,
        error: 'Email already in use',
        status: 409
      };
    }

    // Check registration number uniqueness if provided
    if (studentData.registration_number) {
      const regExists = mockStudents.some(
        s => s.registration_number === studentData.registration_number
      );
      if (regExists) {
        return {
          success: false,
          error: 'Registration number already in use',
          status: 409
        };
      }
    }

    // Create new student
    const newStudent = {
      id: `student_${Date.now()}`,
      registration_number: studentData.registration_number || `REG${Date.now()}`,
      first_name: studentData.first_name,
      last_name: studentData.last_name,
      date_of_birth: studentData.date_of_birth,
      gender: studentData.gender,
      email: studentData.email,
      phone: studentData.phone,
      address: studentData.address,
      city: studentData.city,
      state: studentData.state,
      zip_code: studentData.zip_code,
      blood_group: studentData.blood_group,
      parent_name: studentData.parent_name,
      parent_email: studentData.parent_email,
      parent_phone: studentData.parent_phone,
      class_id: studentData.class_id,
      section: studentData.section || 'A',
      roll_number: studentData.roll_number,
      admission_date: studentData.admission_date || new Date().toISOString().split('T')[0],
      status: studentData.status || 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: createdBy
    };

    mockStudents.push(newStudent);

    return {
      success: true,
      data: newStudent,
      message: 'Student created successfully',
      status: 201
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      status: 500
    };
  }
}

/**
 * Update student
 * @param {String} id - Student ID
 * @param {Object} updateData - Fields to update
 * @param {String} updatedBy - User ID updating the record
 * @returns {Object} Updated student or error
 */
async function updateStudent(id, updateData, updatedBy) {
  try {
    const studentIndex = mockStudents.findIndex(s => s.id === id);
    
    if (studentIndex === -1) {
      return {
        success: false,
        error: 'Student not found',
        status: 404
      };
    }

    // Check email uniqueness if being changed
    if (updateData.email && updateData.email !== mockStudents[studentIndex].email) {
      const emailExists = mockStudents.some(
        s => s.email === updateData.email && s.id !== id
      );
      if (emailExists) {
        return {
          success: false,
          error: 'Email already in use',
          status: 409
        };
      }
    }

    // Update fields
    const updatedStudent = {
      ...mockStudents[studentIndex],
      ...updateData,
      id: mockStudents[studentIndex].id, // Keep original ID
      created_at: mockStudents[studentIndex].created_at, // Keep original date
      updated_at: new Date().toISOString(),
      updated_by: updatedBy
    };

    mockStudents[studentIndex] = updatedStudent;

    return {
      success: true,
      data: updatedStudent,
      message: 'Student updated successfully'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      status: 500
    };
  }
}

/**
 * Delete student
 * @param {String} id - Student ID
 * @returns {Object} Success or error
 */
async function deleteStudent(id) {
  try {
    const studentIndex = mockStudents.findIndex(s => s.id === id);
    
    if (studentIndex === -1) {
      return {
        success: false,
        error: 'Student not found',
        status: 404
      };
    }

    const deletedStudent = mockStudents.splice(studentIndex, 1)[0];

    return {
      success: true,
      data: deletedStudent,
      message: 'Student deleted successfully'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      status: 500
    };
  }
}

/**
 * Get student grades
 * @param {String} studentId - Student ID
 * @returns {Object} Student grades or error
 */
async function getStudentGrades(studentId) {
  try {
    const student = mockStudents.find(s => s.id === studentId);
    
    if (!student) {
      return {
        success: false,
        error: 'Student not found',
        status: 404
      };
    }

    // Mock grades data
    return {
      success: true,
      data: {
        student_id: studentId,
        class_id: student.class_id,
        grades: [
          { subject: 'Mathematics', marks: 85, grade: 'A' },
          { subject: 'English', marks: 78, grade: 'B+' },
          { subject: 'Science', marks: 92, grade: 'A+' },
          { subject: 'History', marks: 81, grade: 'A' }
        ],
        overall_percentage: 84,
        overall_grade: 'A'
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      status: 500
    };
  }
}

/**
 * Get student attendance
 * @param {String} studentId - Student ID
 * @returns {Object} Student attendance or error
 */
async function getStudentAttendance(studentId) {
  try {
    const student = mockStudents.find(s => s.id === studentId);
    
    if (!student) {
      return {
        success: false,
        error: 'Student not found',
        status: 404
      };
    }

    // Mock attendance data
    return {
      success: true,
      data: {
        student_id: studentId,
        total_days: 180,
        present_days: 165,
        absent_days: 10,
        late_days: 5,
        attendance_percentage: 91.67
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      status: 500
    };
  }
}

/**
 * Get all students count
 * @returns {Object} Students count
 */
async function getStudentsCount() {
  try {
    return {
      success: true,
      data: {
        total: mockStudents.length,
        active: mockStudents.filter(s => s.status === 'active').length,
        inactive: mockStudents.filter(s => s.status === 'inactive').length,
        graduated: mockStudents.filter(s => s.status === 'graduated').length
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

module.exports = {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  getStudentGrades,
  getStudentAttendance,
  getStudentsCount
};
