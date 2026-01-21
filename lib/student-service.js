/**
 * Student Service Layer (Database Version - Optimized)
 * Handles all student operations with MySQL database
 * Phase 2 Week 1 Day 2: Added query optimization and caching
 */

const db = require('./mysql-helper');
const optimizer = require('./query-optimizer');

/**
 * Get all students with optional filtering
 * @param {Object} filters - Filter criteria
 * @param {Number} page - Page number
 * @param {Number} limit - Records per page
 * @returns {Object} Paginated student list
 */
async function getStudents(filters = {}, page = 1, limit = 10) {
  try {
    let whereClause = '1=1';
    let params = [];

    // Build WHERE clause
    if (filters.class_id) {
      whereClause += ' AND class_id = ?';
      params.push(filters.class_id);
    }
    if (filters.section) {
      whereClause += ' AND section = ?';
      params.push(filters.section);
    }
    if (filters.status) {
      whereClause += ' AND status = ?';
      params.push(filters.status);
    }
    if (filters.search) {
      whereClause += ' AND (first_name LIKE ? OR last_name LIKE ? OR email LIKE ?)';
      const searchTerm = `%${filters.search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    // Get total count
    const countSql = `SELECT COUNT(*) as total FROM students WHERE ${whereClause}`;
    const [countResult] = await db.query(countSql, params);
    const total = countResult[0].total;
    const pages = Math.ceil(total / limit);

    // Get paginated results
    const offset = (page - 1) * limit;
    const sql = `
      SELECT * FROM students 
      WHERE ${whereClause}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `;
    const queryParams = [...params, limit, offset];
    const [rows] = await db.query(sql, queryParams);

    return {
      success: true,
      data: {
        items: rows,
        total,
        page,
        limit,
        pages
      }
    };
  } catch (error) {
    console.error('Error getting students:', error);
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
    const sql = 'SELECT * FROM students WHERE id = ?';
    const student = await db.queryOne(sql, [id]);
    
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
    console.error('Error getting student:', error);
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
    const requiredFields = ['first_name', 'last_name', 'email'];
    const missing = requiredFields.filter(field => !studentData[field]);
    
    if (missing.length > 0) {
      return {
        success: false,
        error: `Missing required fields: ${missing.join(', ')}`,
        status: 400
      };
    }

    // Check email uniqueness
    const emailExists = await db.exists('students', { email: studentData.email });
    if (emailExists) {
      return {
        success: false,
        error: 'Email already in use',
        status: 409
      };
    }

    // Prepare data
    const studentId = `student_${Date.now()}`;
    const insertData = {
      id: studentId,
      first_name: studentData.first_name,
      last_name: studentData.last_name,
      email: studentData.email,
      phone: studentData.phone || null,
      class_id: studentData.class_id || null,
      section: studentData.section || null,
      date_of_birth: studentData.date_of_birth || null,
      gender: studentData.gender || null,
      address: studentData.address || null,
      city: studentData.city || null,
      state: studentData.state || null,
      pincode: studentData.pincode || null,
      status: studentData.status || 'active',
      parent_id: studentData.parent_id || null,
      created_by: createdBy,
      updated_by: createdBy
    };

    // Insert student
    await db.insert('students', insertData);

    // Fetch created student
    const created = await getStudentById(studentId);

    return {
      success: true,
      data: created.data,
      message: 'Student created successfully',
      status: 201
    };
  } catch (error) {
    console.error('Error creating student:', error);
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
 * @param {String} updatedBy - User ID updating
 * @returns {Object} Updated student or error
 */
async function updateStudent(id, updateData, updatedBy) {
  try {
    // Check student exists
    const student = await getStudentById(id);
    if (!student.success) {
      return student;
    }

    // Check email uniqueness if being changed
    if (updateData.email && updateData.email !== student.data.email) {
      const emailExists = await db.exists('students', { email: updateData.email });
      if (emailExists) {
        return {
          success: false,
          error: 'Email already in use',
          status: 409
        };
      }
    }

    // Prepare update data
    const dataToUpdate = {
      ...updateData,
      updated_by: updatedBy
    };

    // Remove id and created fields
    delete dataToUpdate.id;
    delete dataToUpdate.created_at;

    // Update student
    await db.update('students', dataToUpdate, { id });

    // Fetch updated student
    const updated = await getStudentById(id);

    return {
      success: true,
      data: updated.data,
      message: 'Student updated successfully'
    };
  } catch (error) {
    console.error('Error updating student:', error);
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
    // Check student exists
    const student = await getStudentById(id);
    if (!student.success) {
      return student;
    }

    // Delete student
    await db.deleteRecord('students', { id });

    return {
      success: true,
      data: student.data,
      message: 'Student deleted successfully'
    };
  } catch (error) {
    console.error('Error deleting student:', error);
    return {
      success: false,
      error: error.message,
      status: 500
    };
  }
}

/**
 * Get student grades (from grades table)
 * @param {String} id - Student ID
 * @returns {Object} Grades data
 */
async function getStudentGrades(id) {
  try {
    // Check student exists
    const student = await getStudentById(id);
    if (!student.success) {
      return student;
    }

    // Get grades from database
    const sql = `
      SELECT * FROM grades 
      WHERE student_id = ? 
      ORDER BY semester DESC, subject ASC
    `;
    const [grades] = await db.query(sql, [id]);

    return {
      success: true,
      data: {
        student_id: id,
        grades: grades || [],
        total: grades ? grades.length : 0
      }
    };
  } catch (error) {
    console.error('Error getting student grades:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Get student attendance summary
 * @param {String} id - Student ID
 * @returns {Object} Attendance data
 */
async function getStudentAttendance(id) {
  try {
    // Check student exists
    const student = await getStudentById(id);
    if (!student.success) {
      return student;
    }

    // Get attendance summary
    const sql = `
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present,
        SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as absent,
        SUM(CASE WHEN status = 'late' THEN 1 ELSE 0 END) as late,
        SUM(CASE WHEN status = 'excused' THEN 1 ELSE 0 END) as excused
      FROM attendance
      WHERE student_id = ?
    `;
    const result = await db.queryOne(sql, [id]);

    const summary = result || {
      total: 0,
      present: 0,
      absent: 0,
      late: 0,
      excused: 0
    };

    // Calculate attendance percentage
    summary.attendance_percentage = summary.total > 0 
      ? Math.round((summary.present / summary.total) * 100) 
      : 0;

    return {
      success: true,
      data: {
        student_id: id,
        ...summary
      }
    };
  } catch (error) {
    console.error('Error getting student attendance:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Get students count with statistics
 * @returns {Object} Statistics
 */
async function getStudentsCount() {
  try {
    const sql = `
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active,
        SUM(CASE WHEN status = 'inactive' THEN 1 ELSE 0 END) as inactive,
        SUM(CASE WHEN status = 'graduated' THEN 1 ELSE 0 END) as graduated,
        COUNT(DISTINCT class_id) as total_classes
      FROM students
    `;
    const result = await db.queryOne(sql);

    return {
      success: true,
      data: result || {
        total: 0,
        active: 0,
        inactive: 0,
        graduated: 0,
        total_classes: 0
      }
    };
  } catch (error) {
    console.error('Error getting students count:', error);
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
