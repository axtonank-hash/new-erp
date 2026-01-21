/**
 * Attendance Service Layer
 * Handles all business logic for attendance operations
 */

// Mock data for attendance records
const mockAttendance = [
  {
    id: 'att_001',
    student_id: 'student_001',
    date: '2024-01-20',
    status: 'present',
    class_id: 'class_12a',
    subject: 'Mathematics',
    faculty_id: 'faculty_001',
    remarks: 'Present throughout',
    created_at: '2024-01-20T09:00:00Z',
    updated_at: '2024-01-20T09:00:00Z'
  },
  {
    id: 'att_002',
    student_id: 'student_002',
    date: '2024-01-20',
    status: 'absent',
    class_id: 'class_12a',
    subject: 'Mathematics',
    faculty_id: 'faculty_001',
    remarks: 'No leave application',
    created_at: '2024-01-20T09:00:00Z',
    updated_at: '2024-01-20T09:00:00Z'
  },
  {
    id: 'att_003',
    student_id: 'student_001',
    date: '2024-01-19',
    status: 'late',
    class_id: 'class_12a',
    subject: 'Physics',
    faculty_id: 'faculty_002',
    remarks: 'Arrived 15 minutes late',
    created_at: '2024-01-19T09:00:00Z',
    updated_at: '2024-01-19T09:00:00Z'
  }
];

/**
 * Get attendance records with filtering
 * @param {Object} filters - Filter criteria
 * @param {Number} page - Page number
 * @param {Number} limit - Records per page
 * @returns {Object} Paginated attendance records
 */
async function getAttendance(filters = {}, page = 1, limit = 50) {
  try {
    let attendance = [...mockAttendance];

    // Apply filters
    if (filters.student_id) {
      attendance = attendance.filter(a => a.student_id === filters.student_id);
    }
    if (filters.class_id) {
      attendance = attendance.filter(a => a.class_id === filters.class_id);
    }
    if (filters.date) {
      attendance = attendance.filter(a => a.date === filters.date);
    }
    if (filters.status) {
      attendance = attendance.filter(a => a.status === filters.status);
    }
    if (filters.date_range) {
      const [start, end] = filters.date_range;
      attendance = attendance.filter(a => a.date >= start && a.date <= end);
    }

    // Sort by date descending
    attendance.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Pagination
    const total = attendance.length;
    const pages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    const items = attendance.slice(start, start + limit);

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
 * Get single attendance record
 * @param {String} id - Attendance record ID
 * @returns {Object} Attendance data or error
 */
async function getAttendanceById(id) {
  try {
    const record = mockAttendance.find(a => a.id === id);
    
    if (!record) {
      return {
        success: false,
        error: 'Attendance record not found',
        status: 404
      };
    }

    return {
      success: true,
      data: record
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Mark student attendance
 * @param {Object} attendanceData - Attendance information
 * @param {String} createdBy - Faculty ID marking attendance
 * @returns {Object} Created attendance record or error
 */
async function markAttendance(attendanceData, createdBy) {
  try {
    // Validate required fields
    const requiredFields = ['student_id', 'date', 'status', 'class_id', 'subject'];
    const missing = requiredFields.filter(field => !attendanceData[field]);
    
    if (missing.length > 0) {
      return {
        success: false,
        error: `Missing required fields: ${missing.join(', ')}`,
        status: 400
      };
    }

    // Validate status
    const validStatuses = ['present', 'absent', 'late', 'excused'];
    if (!validStatuses.includes(attendanceData.status)) {
      return {
        success: false,
        error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
        status: 400
      };
    }

    // Create attendance record
    const newRecord = {
      id: `att_${Date.now()}`,
      student_id: attendanceData.student_id,
      date: attendanceData.date,
      status: attendanceData.status,
      class_id: attendanceData.class_id,
      subject: attendanceData.subject,
      faculty_id: createdBy,
      remarks: attendanceData.remarks || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    mockAttendance.push(newRecord);

    return {
      success: true,
      data: newRecord,
      message: 'Attendance marked successfully',
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
 * Update attendance record
 * @param {String} id - Attendance record ID
 * @param {Object} updateData - Fields to update
 * @param {String} updatedBy - User ID updating
 * @returns {Object} Updated record or error
 */
async function updateAttendance(id, updateData, updatedBy) {
  try {
    const recordIndex = mockAttendance.findIndex(a => a.id === id);
    
    if (recordIndex === -1) {
      return {
        success: false,
        error: 'Attendance record not found',
        status: 404
      };
    }

    // Validate status if being changed
    if (updateData.status) {
      const validStatuses = ['present', 'absent', 'late', 'excused'];
      if (!validStatuses.includes(updateData.status)) {
        return {
          success: false,
          error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
          status: 400
        };
      }
    }

    // Update record
    const updatedRecord = {
      ...mockAttendance[recordIndex],
      ...updateData,
      id: mockAttendance[recordIndex].id,
      created_at: mockAttendance[recordIndex].created_at,
      updated_at: new Date().toISOString(),
      updated_by: updatedBy
    };

    mockAttendance[recordIndex] = updatedRecord;

    return {
      success: true,
      data: updatedRecord,
      message: 'Attendance record updated successfully'
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
 * Delete attendance record
 * @param {String} id - Attendance record ID
 * @returns {Object} Success or error
 */
async function deleteAttendance(id) {
  try {
    const recordIndex = mockAttendance.findIndex(a => a.id === id);
    
    if (recordIndex === -1) {
      return {
        success: false,
        error: 'Attendance record not found',
        status: 404
      };
    }

    const deletedRecord = mockAttendance.splice(recordIndex, 1)[0];

    return {
      success: true,
      data: deletedRecord,
      message: 'Attendance record deleted successfully'
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
 * Bulk mark attendance for entire class
 * @param {Object} bulkData - Class and attendance info
 * @param {String} createdBy - Faculty ID
 * @returns {Object} Created records or error
 */
async function bulkMarkAttendance(bulkData, createdBy) {
  try {
    const { class_id, date, subject, students } = bulkData;

    if (!class_id || !date || !subject || !Array.isArray(students)) {
      return {
        success: false,
        error: 'Missing required fields: class_id, date, subject, students (array)',
        status: 400
      };
    }

    const createdRecords = [];

    for (const student of students) {
      const record = {
        id: `att_${Date.now()}_${Math.random()}`,
        student_id: student.student_id,
        date,
        status: student.status,
        class_id,
        subject,
        faculty_id: createdBy,
        remarks: student.remarks || '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      mockAttendance.push(record);
      createdRecords.push(record);
    }

    return {
      success: true,
      data: {
        count: createdRecords.length,
        records: createdRecords
      },
      message: `${createdRecords.length} attendance records created successfully`,
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
 * Get attendance summary for student
 * @param {String} student_id - Student ID
 * @param {Object} filters - Date range or other filters
 * @returns {Object} Attendance summary
 */
async function getStudentAttendanceSummary(student_id, filters = {}) {
  try {
    let records = mockAttendance.filter(a => a.student_id === student_id);

    if (filters.date_range) {
      const [start, end] = filters.date_range;
      records = records.filter(a => a.date >= start && a.date <= end);
    }

    const summary = {
      student_id,
      total: records.length,
      present: records.filter(a => a.status === 'present').length,
      absent: records.filter(a => a.status === 'absent').length,
      late: records.filter(a => a.status === 'late').length,
      excused: records.filter(a => a.status === 'excused').length,
      attendance_percentage: records.length > 0 
        ? Math.round(((records.filter(a => a.status === 'present').length / records.length) * 100))
        : 0
    };

    return {
      success: true,
      data: summary
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

module.exports = {
  getAttendance,
  getAttendanceById,
  markAttendance,
  updateAttendance,
  deleteAttendance,
  bulkMarkAttendance,
  getStudentAttendanceSummary
};
