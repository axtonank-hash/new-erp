/**
 * Admission Service Layer (Database Version)
 * Handles all admission operations with MySQL database
 */

const db = require('./mysql-helper');

/**
 * Get all admissions with filtering
 */
async function getAdmissions(filters = {}, page = 1, limit = 10) {
  try {
    let whereClause = '1=1';
    let params = [];

    if (filters.status) {
      whereClause += ' AND admission_status = ?';
      params.push(filters.status);
    }
    if (filters.stream) {
      whereClause += ' AND stream = ?';
      params.push(filters.stream);
    }
    if (filters.course) {
      whereClause += ' AND course_applied = ?';
      params.push(filters.course);
    }
    if (filters.search) {
      whereClause += ' AND (first_name LIKE ? OR last_name LIKE ? OR email LIKE ?)';
      const searchTerm = `%${filters.search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    const countSql = `SELECT COUNT(*) as total FROM admissions WHERE ${whereClause}`;
    const [countResult] = await db.query(countSql, params);
    const total = countResult[0].total;
    const pages = Math.ceil(total / limit);

    const offset = (page - 1) * limit;
    const sql = `
      SELECT * FROM admissions 
      WHERE ${whereClause}
      ORDER BY application_date DESC
      LIMIT ? OFFSET ?
    `;
    const queryParams = [...params, limit, offset];
    const [rows] = await db.query(sql, queryParams);

    return { success: true, data: { items: rows, total, page, limit, pages } };
  } catch (error) {
    console.error('Error getting admissions:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get single admission
 */
async function getAdmissionById(id) {
  try {
    const admission = await db.queryOne('SELECT * FROM admissions WHERE id = ?', [id]);
    if (!admission) {
      return { success: false, error: 'Admission not found', status: 404 };
    }
    return { success: true, data: admission };
  } catch (error) {
    console.error('Error getting admission:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Create new admission
 */
async function createAdmission(admissionData, createdBy) {
  try {
    const requiredFields = ['first_name', 'last_name', 'email', 'course_applied', 'marks_10th'];
    const missing = requiredFields.filter(field => !admissionData[field]);
    if (missing.length > 0) {
      return { success: false, error: `Missing fields: ${missing.join(', ')}`, status: 400 };
    }

    const emailExists = await db.exists('admissions', { email: admissionData.email });
    if (emailExists) {
      return { success: false, error: 'Email already registered', status: 409 };
    }

    const admissionId = `adm_${Date.now()}`;
    const insertData = {
      id: admissionId,
      application_id: `APP${Date.now()}`,
      first_name: admissionData.first_name,
      last_name: admissionData.last_name,
      email: admissionData.email,
      phone: admissionData.phone || null,
      date_of_birth: admissionData.date_of_birth || null,
      gender: admissionData.gender || null,
      course_applied: admissionData.course_applied,
      stream: admissionData.stream || null,
      marks_10th: admissionData.marks_10th,
      marks_12th: admissionData.marks_12th || 0,
      application_status: 'pending',
      interview_date: admissionData.interview_date || null,
      interview_status: 'pending',
      merit_rank: null,
      admission_status: 'under_review',
      address: admissionData.address || null,
      city: admissionData.city || null,
      state: admissionData.state || null,
      pincode: admissionData.pincode || null,
      created_by: createdBy
    };

    await db.insert('admissions', insertData);
    const created = await getAdmissionById(admissionId);
    return { success: true, data: created.data, message: 'Application created successfully', status: 201 };
  } catch (error) {
    console.error('Error creating admission:', error);
    return { success: false, error: error.message, status: 500 };
  }
}

/**
 * Update admission
 */
async function updateAdmission(id, updateData, updatedBy) {
  try {
    const admission = await getAdmissionById(id);
    if (!admission.success) return admission;

    if (updateData.email && updateData.email !== admission.data.email) {
      const emailExists = await db.exists('admissions', { email: updateData.email });
      if (emailExists) {
        return { success: false, error: 'Email already registered', status: 409 };
      }
    }

    const dataToUpdate = { ...updateData, updated_by: updatedBy };
    delete dataToUpdate.id;
    delete dataToUpdate.created_at;

    await db.update('admissions', dataToUpdate, { id });
    const updated = await getAdmissionById(id);
    return { success: true, data: updated.data, message: 'Admission updated successfully' };
  } catch (error) {
    console.error('Error updating admission:', error);
    return { success: false, error: error.message, status: 500 };
  }
}

/**
 * Delete admission
 */
async function deleteAdmission(id) {
  try {
    const admission = await getAdmissionById(id);
    if (!admission.success) return admission;
    await db.deleteRecord('admissions', { id });
    return { success: true, data: admission.data, message: 'Admission deleted successfully' };
  } catch (error) {
    console.error('Error deleting admission:', error);
    return { success: false, error: error.message, status: 500 };
  }
}

/**
 * Update admission status
 */
async function updateAdmissionStatus(id, status, updatedBy) {
  try {
    const validStatuses = ['pending', 'approved', 'rejected', 'under_review'];
    if (!validStatuses.includes(status)) {
      return { success: false, error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`, status: 400 };
    }

    const admission = await getAdmissionById(id);
    if (!admission.success) return admission;

    await db.update('admissions', { admission_status: status, updated_by: updatedBy }, { id });
    const updated = await getAdmissionById(id);
    return { success: true, data: updated.data, message: `Status updated to ${status}` };
  } catch (error) {
    console.error('Error updating status:', error);
    return { success: false, error: error.message, status: 500 };
  }
}

/**
 * Get admission statistics
 */
async function getAdmissionStats() {
  try {
    const sql = `
      SELECT 
        COUNT(*) as total_applications,
        SUM(CASE WHEN admission_status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN admission_status = 'under_review' THEN 1 ELSE 0 END) as under_review,
        SUM(CASE WHEN admission_status = 'approved' THEN 1 ELSE 0 END) as approved,
        SUM(CASE WHEN admission_status = 'rejected' THEN 1 ELSE 0 END) as rejected
      FROM admissions
    `;
    const stats = await db.queryOne(sql);
    
    const streamSql = `
      SELECT stream, COUNT(*) as count FROM admissions 
      WHERE stream IS NOT NULL GROUP BY stream
    `;
    const [streamResults] = await db.query(streamSql);
    const by_stream = {};
    streamResults.forEach(row => {
      by_stream[row.stream] = row.count;
    });

    return { success: true, data: { ...stats, by_stream } };
  } catch (error) {
    console.error('Error getting stats:', error);
    return { success: false, error: error.message };
  }
}

module.exports = {
  getAdmissions,
  getAdmissionById,
  createAdmission,
  updateAdmission,
  deleteAdmission,
  updateAdmissionStatus,
  getAdmissionStats
};
