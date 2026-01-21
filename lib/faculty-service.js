/**
 * Faculty Service Layer (Database Version)
 * Handles all faculty operations with MySQL database
 */

const db = require('./mysql-helper');

/**
 * Get all faculty with filtering and pagination
 */
async function getFaculty(filters = {}, page = 1, limit = 10) {
  try {
    let whereClause = '1=1';
    let params = [];

    if (filters.department) {
      whereClause += ' AND department = ?';
      params.push(filters.department);
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

    const countSql = `SELECT COUNT(*) as total FROM faculty WHERE ${whereClause}`;
    const [countResult] = await db.query(countSql, params);
    const total = countResult[0].total;
    const pages = Math.ceil(total / limit);

    const offset = (page - 1) * limit;
    const sql = `
      SELECT * FROM faculty 
      WHERE ${whereClause}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `;
    const queryParams = [...params, limit, offset];
    const [rows] = await db.query(sql, queryParams);

    return {
      success: true,
      data: { items: rows, total, page, limit, pages }
    };
  } catch (error) {
    console.error('Error getting faculty:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get single faculty member
 */
async function getFacultyById(id) {
  try {
    const faculty = await db.queryOne('SELECT * FROM faculty WHERE id = ?', [id]);
    if (!faculty) {
      return { success: false, error: 'Faculty not found', status: 404 };
    }
    return { success: true, data: faculty };
  } catch (error) {
    console.error('Error getting faculty:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Create new faculty
 */
async function createFaculty(facultyData, createdBy) {
  try {
    const requiredFields = ['first_name', 'last_name', 'email', 'department'];
    const missing = requiredFields.filter(field => !facultyData[field]);
    if (missing.length > 0) {
      return { success: false, error: `Missing fields: ${missing.join(', ')}`, status: 400 };
    }

    const emailExists = await db.exists('faculty', { email: facultyData.email });
    if (emailExists) {
      return { success: false, error: 'Email already in use', status: 409 };
    }

    const facultyId = `faculty_${Date.now()}`;
    const insertData = {
      id: facultyId,
      employee_id: facultyData.employee_id || `EMP${Date.now()}`,
      first_name: facultyData.first_name,
      last_name: facultyData.last_name,
      email: facultyData.email,
      phone: facultyData.phone || null,
      qualification: facultyData.qualification || null,
      specialization: facultyData.specialization || null,
      experience_years: facultyData.experience_years || 0,
      department: facultyData.department,
      hire_date: facultyData.hire_date || new Date().toISOString().split('T')[0],
      status: facultyData.status || 'active',
      designation: facultyData.designation || 'Lecturer',
      address: facultyData.address || null,
      city: facultyData.city || null,
      state: facultyData.state || null,
      created_by: createdBy
    };

    await db.insert('faculty', insertData);
    const created = await getFacultyById(facultyId);
    return { success: true, data: created.data, message: 'Faculty created successfully', status: 201 };
  } catch (error) {
    console.error('Error creating faculty:', error);
    return { success: false, error: error.message, status: 500 };
  }
}

/**
 * Update faculty
 */
async function updateFaculty(id, updateData, updatedBy) {
  try {
    const faculty = await getFacultyById(id);
    if (!faculty.success) return faculty;

    if (updateData.email && updateData.email !== faculty.data.email) {
      const emailExists = await db.exists('faculty', { email: updateData.email });
      if (emailExists) {
        return { success: false, error: 'Email already in use', status: 409 };
      }
    }

    const dataToUpdate = { ...updateData, updated_by: updatedBy };
    delete dataToUpdate.id;
    delete dataToUpdate.created_at;

    await db.update('faculty', dataToUpdate, { id });
    const updated = await getFacultyById(id);
    return { success: true, data: updated.data, message: 'Faculty updated successfully' };
  } catch (error) {
    console.error('Error updating faculty:', error);
    return { success: false, error: error.message, status: 500 };
  }
}

/**
 * Delete faculty
 */
async function deleteFaculty(id) {
  try {
    const faculty = await getFacultyById(id);
    if (!faculty.success) return faculty;
    await db.deleteRecord('faculty', { id });
    return { success: true, data: faculty.data, message: 'Faculty deleted successfully' };
  } catch (error) {
    console.error('Error deleting faculty:', error);
    return { success: false, error: error.message, status: 500 };
  }
}

/**
 * Get faculty count
 */
async function getFacultyCount() {
  try {
    const sql = `
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active,
        SUM(CASE WHEN status = 'inactive' THEN 1 ELSE 0 END) as inactive,
        SUM(CASE WHEN status = 'on_leave' THEN 1 ELSE 0 END) as on_leave
      FROM faculty
    `;
    const result = await db.queryOne(sql);
    return { success: true, data: result || { total: 0, active: 0, inactive: 0, on_leave: 0 } };
  } catch (error) {
    console.error('Error getting faculty count:', error);
    return { success: false, error: error.message };
  }
}

module.exports = {
  getFaculty,
  getFacultyById,
  createFaculty,
  updateFaculty,
  deleteFaculty,
  getFacultyCount
};
