/**
 * Admission Service Layer
 * Handles all business logic for admission operations
 */

// Mock data for admissions
const mockAdmissions = [
  {
    id: 'adm_001',
    application_id: 'APP2024001',
    first_name: 'Vikram',
    last_name: 'Singh',
    email: 'vikram.singh@student.com',
    phone: '9876543230',
    date_of_birth: '2006-05-15',
    gender: 'Male',
    course_applied: 'Class 11',
    stream: 'Science',
    marks_10th: 95,
    marks_12th: 0,
    application_date: '2024-01-10T00:00:00Z',
    application_status: 'pending',
    interview_date: '2024-02-01T10:00:00Z',
    interview_status: 'pending',
    merit_rank: null,
    admission_status: 'under_review',
    documents_submitted: ['10th_mark_sheet', 'birth_certificate'],
    address: '123 Main Street',
    city: 'Delhi',
    state: 'Delhi',
    pincode: '110001',
    created_at: '2024-01-10T00:00:00Z',
    updated_at: '2024-01-10T00:00:00Z'
  },
  {
    id: 'adm_002',
    application_id: 'APP2024002',
    first_name: 'Neha',
    last_name: 'Gupta',
    email: 'neha.gupta@student.com',
    phone: '9876543231',
    date_of_birth: '2006-08-22',
    gender: 'Female',
    course_applied: 'Class 11',
    stream: 'Commerce',
    marks_10th: 88,
    marks_12th: 0,
    application_date: '2024-01-12T00:00:00Z',
    application_status: 'approved',
    interview_date: '2024-01-28T14:00:00Z',
    interview_status: 'completed',
    merit_rank: 2,
    admission_status: 'admitted',
    documents_submitted: ['10th_mark_sheet', 'birth_certificate', 'aadhar'],
    address: '456 Park Lane',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400001',
    created_at: '2024-01-12T00:00:00Z',
    updated_at: '2024-01-28T00:00:00Z'
  }
];

/**
 * Get all admissions with optional filtering
 * @param {Object} filters - Filter criteria
 * @param {Number} page - Page number
 * @param {Number} limit - Records per page
 * @returns {Object} Paginated admissions list
 */
async function getAdmissions(filters = {}, page = 1, limit = 10) {
  try {
    let admissions = [...mockAdmissions];

    // Apply filters
    if (filters.status) {
      admissions = admissions.filter(a => a.admission_status === filters.status);
    }
    if (filters.stream) {
      admissions = admissions.filter(a => a.stream === filters.stream);
    }
    if (filters.course) {
      admissions = admissions.filter(a => a.course_applied === filters.course);
    }
    if (filters.search) {
      const search = filters.search.toLowerCase();
      admissions = admissions.filter(a =>
        a.first_name.toLowerCase().includes(search) ||
        a.last_name.toLowerCase().includes(search) ||
        a.email.toLowerCase().includes(search)
      );
    }

    // Pagination
    const total = admissions.length;
    const pages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    const items = admissions.slice(start, start + limit);

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
 * Get single admission by ID
 * @param {String} id - Admission ID
 * @returns {Object} Admission data or error
 */
async function getAdmissionById(id) {
  try {
    const admission = mockAdmissions.find(a => a.id === id);
    
    if (!admission) {
      return {
        success: false,
        error: 'Admission record not found',
        status: 404
      };
    }

    return {
      success: true,
      data: admission
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Create new admission application
 * @param {Object} admissionData - Admission information
 * @param {String} createdBy - User ID creating the record
 * @returns {Object} Created admission or error
 */
async function createAdmission(admissionData, createdBy) {
  try {
    // Validate required fields
    const requiredFields = ['first_name', 'last_name', 'email', 'course_applied', 'marks_10th'];
    const missing = requiredFields.filter(field => !admissionData[field]);
    
    if (missing.length > 0) {
      return {
        success: false,
        error: `Missing required fields: ${missing.join(', ')}`,
        status: 400
      };
    }

    // Check email uniqueness
    const emailExists = mockAdmissions.some(a => a.email === admissionData.email);
    if (emailExists) {
      return {
        success: false,
        error: 'Email already registered',
        status: 409
      };
    }

    // Create new admission
    const newAdmission = {
      id: `adm_${Date.now()}`,
      application_id: `APP${Date.now()}`,
      first_name: admissionData.first_name,
      last_name: admissionData.last_name,
      email: admissionData.email,
      phone: admissionData.phone,
      date_of_birth: admissionData.date_of_birth,
      gender: admissionData.gender,
      course_applied: admissionData.course_applied,
      stream: admissionData.stream,
      marks_10th: admissionData.marks_10th,
      marks_12th: admissionData.marks_12th || 0,
      application_date: new Date().toISOString(),
      application_status: 'pending',
      interview_date: admissionData.interview_date || null,
      interview_status: 'pending',
      merit_rank: null,
      admission_status: 'under_review',
      documents_submitted: admissionData.documents_submitted || [],
      address: admissionData.address,
      city: admissionData.city,
      state: admissionData.state,
      pincode: admissionData.pincode,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: createdBy
    };

    mockAdmissions.push(newAdmission);

    return {
      success: true,
      data: newAdmission,
      message: 'Admission application created successfully',
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
 * Update admission record
 * @param {String} id - Admission ID
 * @param {Object} updateData - Fields to update
 * @param {String} updatedBy - User ID updating the record
 * @returns {Object} Updated admission or error
 */
async function updateAdmission(id, updateData, updatedBy) {
  try {
    const admissionIndex = mockAdmissions.findIndex(a => a.id === id);
    
    if (admissionIndex === -1) {
      return {
        success: false,
        error: 'Admission record not found',
        status: 404
      };
    }

    // Check email uniqueness if being changed
    if (updateData.email && updateData.email !== mockAdmissions[admissionIndex].email) {
      const emailExists = mockAdmissions.some(
        a => a.email === updateData.email && a.id !== id
      );
      if (emailExists) {
        return {
          success: false,
          error: 'Email already registered',
          status: 409
        };
      }
    }

    // Update fields
    const updatedAdmission = {
      ...mockAdmissions[admissionIndex],
      ...updateData,
      id: mockAdmissions[admissionIndex].id,
      application_id: mockAdmissions[admissionIndex].application_id,
      created_at: mockAdmissions[admissionIndex].created_at,
      updated_at: new Date().toISOString(),
      updated_by: updatedBy
    };

    mockAdmissions[admissionIndex] = updatedAdmission;

    return {
      success: true,
      data: updatedAdmission,
      message: 'Admission record updated successfully'
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
 * Delete admission record
 * @param {String} id - Admission ID
 * @returns {Object} Success or error
 */
async function deleteAdmission(id) {
  try {
    const admissionIndex = mockAdmissions.findIndex(a => a.id === id);
    
    if (admissionIndex === -1) {
      return {
        success: false,
        error: 'Admission record not found',
        status: 404
      };
    }

    const deletedAdmission = mockAdmissions.splice(admissionIndex, 1)[0];

    return {
      success: true,
      data: deletedAdmission,
      message: 'Admission record deleted successfully'
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
 * Update admission status
 * @param {String} id - Admission ID
 * @param {String} status - New status
 * @param {String} updatedBy - User ID updating
 * @returns {Object} Updated admission or error
 */
async function updateAdmissionStatus(id, status, updatedBy) {
  try {
    const validStatuses = ['pending', 'approved', 'rejected', 'under_review'];
    if (!validStatuses.includes(status)) {
      return {
        success: false,
        error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
        status: 400
      };
    }

    const admissionIndex = mockAdmissions.findIndex(a => a.id === id);
    
    if (admissionIndex === -1) {
      return {
        success: false,
        error: 'Admission record not found',
        status: 404
      };
    }

    mockAdmissions[admissionIndex].admission_status = status;
    mockAdmissions[admissionIndex].updated_at = new Date().toISOString();
    mockAdmissions[admissionIndex].updated_by = updatedBy;

    // If approved, set merit rank
    if (status === 'approved' && !mockAdmissions[admissionIndex].merit_rank) {
      mockAdmissions[admissionIndex].merit_rank = mockAdmissions.filter(
        a => a.admission_status === 'approved'
      ).length;
    }

    return {
      success: true,
      data: mockAdmissions[admissionIndex],
      message: `Admission status updated to ${status}`
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
 * Get admission statistics
 * @returns {Object} Statistics
 */
async function getAdmissionStats() {
  try {
    return {
      success: true,
      data: {
        total_applications: mockAdmissions.length,
        pending: mockAdmissions.filter(a => a.admission_status === 'pending').length,
        under_review: mockAdmissions.filter(a => a.admission_status === 'under_review').length,
        approved: mockAdmissions.filter(a => a.admission_status === 'approved').length,
        rejected: mockAdmissions.filter(a => a.admission_status === 'rejected').length,
        by_stream: {
          Science: mockAdmissions.filter(a => a.stream === 'Science').length,
          Commerce: mockAdmissions.filter(a => a.stream === 'Commerce').length,
          Arts: mockAdmissions.filter(a => a.stream === 'Arts').length
        }
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
  getAdmissions,
  getAdmissionById,
  createAdmission,
  updateAdmission,
  deleteAdmission,
  updateAdmissionStatus,
  getAdmissionStats
};
