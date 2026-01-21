/**
 * Attendance Service Layer (Database Version)
 * Handles all attendance operations with MySQL database
 */

const db = require('./mysql-helper');

/**
 * Get attendance records with filtering
 */
async function getAttendance(filters = {}, page = 1, limit = 50) {
  try {
    let whereClause = '1=1';
    let params = [];

    if (filters.student_id) {
      whereClause += ' AND student_id = ?';
      params.push(filters.student_id);
    }
    if (filters.class_id) {
      whereClause += ' AND class_id = ?';
      params.push(filters.class_id);
    }
    if (filters.date) {
      whereClause += ' AND date = ?';
      params.push(filters.date);
    }
    if (filters.status) {
      whereClause += ' AND status = ?';
      params.push(filters.status);
    }

    const countSql = `SELECT COUNT(*) as total FROM attendance WHERE ${whereClause}`;
    const [countResult] = await db.query(countSql, params);
    const total = countResult[0].total;
    const pages = Math.ceil(total / limit);

    const offset = (page - 1) * limit;
    const sql = `
      SELECT * FROM attendance 
      WHERE ${whereClause}
      ORDER BY date DESC
      LIMIT ? OFFSET ?
    `;
    const queryParams = [...params, limit, offset];
    const [rows] = await db.query(sql, queryParams);

    return { success: true, data: { items: rows, total, page, limit, pages } };
  } catch (error) {
    console.error('Error getting attendance:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get single attendance record
 */
async function getAttendanceById(id) {
  try {
    const record = await db.queryOne('SELECT * FROM attendance WHERE id = ?', [id]);
    if (!record) {
      return { success: false, error: 'Attendance record not found', status: 404 };
    }
    return { success: true, data: record };
  } catch (error) {
    console.error('Error getting attendance:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Mark attendance
 */
async function markAttendance(attendanceData, createdBy) {
  try {
    const requiredFields = ['student_id', 'date', 'status', 'class_id', 'subject'];
    const missing = requiredFields.filter(field => !attendanceData[field]);
    if (missing.length > 0) {
      return { success: false, error: `Missing fields: ${missing.join(', ')}`, status: 400 };
    }

    const validStatuses = ['present', 'absent', 'late', 'excused'];
    if (!validStatuses.includes(attendanceData.status)) {
      return { success: false, error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`, status: 400 };
    }

    const attendanceId = `att_${Date.now()}`;
    const insertData = {
      id: attendanceId,
      student_id: attendanceData.student_id,
      date: attendanceData.date,
      status: attendanceData.status,
      class_id: attendanceData.class_id,
      subject: attendanceData.subject,
      faculty_id: createdBy,
      remarks: attendanceData.remarks || null
    };

    await db.insert('attendance', insertData);
    const created = await getAttendanceById(attendanceId);
    return { success: true, data: created.data, message: 'Attendance marked successfully', status: 201 };
  } catch (error) {
    console.error('Error marking attendance:', error);
    return { success: false, error: error.message, status: 500 };
  }
}

/**
 * Update attendance
 */
async function updateAttendance(id, updateData, updatedBy) {
  try {
    const record = await getAttendanceById(id);
    if (!record.success) return record;

    if (updateData.status) {
      const validStatuses = ['present', 'absent', 'late', 'excused'];
      if (!validStatuses.includes(updateData.status)) {
        return { success: false, error: `Invalid status`, status: 400 };
      }
    }

    const dataToUpdate = { ...updateData, updated_by: updatedBy };
    delete dataToUpdate.id;
    delete dataToUpdate.created_at;

    await db.update('attendance', dataToUpdate, { id });
    const updated = await getAttendanceById(id);
    return { success: true, data: updated.data, message: 'Attendance updated successfully' };
  } catch (error) {
    console.error('Error updating attendance:', error);
    return { success: false, error: error.message, status: 500 };
  }
}

/**
 * Delete attendance record
 */
async function deleteAttendance(id) {
  try {
    const record = await getAttendanceById(id);
    if (!record.success) return record;
    await db.deleteRecord('attendance', { id });
    return { success: true, data: record.data, message: 'Attendance deleted successfully' };
  } catch (error) {
    console.error('Error deleting attendance:', error);
    return { success: false, error: error.message, status: 500 };
  }
}

/**
 * Bulk mark attendance
 */
async function bulkMarkAttendance(bulkData, createdBy) {
  try {
    const { class_id, date, subject, students } = bulkData;

    if (!class_id || !date || !subject || !Array.isArray(students)) {
      return { success: false, error: 'Missing required fields', status: 400 };
    }

    if (students.length === 0) {
      return { success: false, error: 'Students array cannot be empty', status: 400 };
    }

    const createdRecords = [];
    for (const student of students) {
      const id = `att_${Date.now()}_${Math.random()}`;
      const data = {
        id,
        student_id: student.student_id,
        date,
        status: student.status,
        class_id,
        subject,
        faculty_id: createdBy,
        remarks: student.remarks || null
      };
      await db.insert('attendance', data);
      createdRecords.push(data);
    }

    return { 
      success: true, 
      data: { count: createdRecords.length, records: createdRecords }, 
      message: `${createdRecords.length} records created`, 
      status: 201 
    };
  } catch (error) {
    console.error('Error bulk marking:', error);
    return { success: false, error: error.message, status: 500 };
  }
}

/**
 * Get student attendance summary
 */
async function getStudentAttendanceSummary(student_id, filters = {}) {
  try {
    let whereClause = 'student_id = ?';
    let params = [student_id];

    if (filters.date_range) {
      const [start, end] = filters.date_range;
      whereClause += ' AND date BETWEEN ? AND ?';
      params.push(start, end);
    }

    const sql = `
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present,
        SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as absent,
        SUM(CASE WHEN status = 'late' THEN 1 ELSE 0 END) as late,
        SUM(CASE WHEN status = 'excused' THEN 1 ELSE 0 END) as excused
      FROM attendance
      WHERE ${whereClause}
    `;
    const result = await db.queryOne(sql, params);

    const summary = result || { total: 0, present: 0, absent: 0, late: 0, excused: 0 };
    summary.attendance_percentage = summary.total > 0 
      ? Math.round((summary.present / summary.total) * 100) 
      : 0;

    return { success: true, data: { student_id, ...summary } };
  } catch (error) {
    console.error('Error getting summary:', error);
    return { success: false, error: error.message };
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
