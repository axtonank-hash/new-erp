/**
 * Faculty Service Layer
 * Handles all business logic for faculty operations
 */

// Mock data for development
const mockFaculty = [
  {
    id: 'faculty_001',
    employee_id: 'EMP001',
    first_name: 'Rajesh',
    last_name: 'Sharma',
    email: 'rajesh@college.edu',
    phone: '9876543220',
    qualification: 'M.Sc Physics',
    specialization: 'Quantum Mechanics',
    experience_years: 12,
    department: 'Science',
    hire_date: '2011-06-01',
    status: 'active',
    designation: 'Senior Lecturer',
    address: '789 College Road',
    city: 'Mumbai',
    state: 'Maharashtra',
    created_at: '2011-06-01T00:00:00Z',
    updated_at: '2011-06-01T00:00:00Z'
  },
  {
    id: 'faculty_002',
    employee_id: 'EMP002',
    first_name: 'Anjali',
    last_name: 'Desai',
    email: 'anjali@college.edu',
    phone: '9876543221',
    qualification: 'B.A Literature',
    specialization: 'English Literature',
    experience_years: 8,
    department: 'Humanities',
    hire_date: '2015-07-15',
    status: 'active',
    designation: 'Lecturer',
    address: '456 Park Street',
    city: 'Pune',
    state: 'Maharashtra',
    created_at: '2015-07-15T00:00:00Z',
    updated_at: '2015-07-15T00:00:00Z'
  }
];

/**
 * Get all faculty with optional filtering
 * @param {Object} filters - Filter criteria
 * @param {Number} page - Page number
 * @param {Number} limit - Records per page
 * @returns {Object} Paginated faculty list
 */
async function getFaculty(filters = {}, page = 1, limit = 10) {
  try {
    let faculty = [...mockFaculty];

    // Apply filters
    if (filters.department) {
      faculty = faculty.filter(f => f.department === filters.department);
    }
    if (filters.status) {
      faculty = faculty.filter(f => f.status === filters.status);
    }
    if (filters.search) {
      const search = filters.search.toLowerCase();
      faculty = faculty.filter(f =>
        f.first_name.toLowerCase().includes(search) ||
        f.last_name.toLowerCase().includes(search) ||
        f.email.toLowerCase().includes(search)
      );
    }

    // Pagination
    const total = faculty.length;
    const pages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    const items = faculty.slice(start, start + limit);

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
 * Get single faculty member by ID
 * @param {String} id - Faculty ID
 * @returns {Object} Faculty data or error
 */
async function getFacultyById(id) {
  try {
    const faculty = mockFaculty.find(f => f.id === id);
    
    if (!faculty) {
      return {
        success: false,
        error: 'Faculty member not found',
        status: 404
      };
    }

    return {
      success: true,
      data: faculty
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Create new faculty member
 * @param {Object} facultyData - Faculty information
 * @param {String} createdBy - User ID creating the record
 * @returns {Object} Created faculty or error
 */
async function createFaculty(facultyData, createdBy) {
  try {
    // Validate required fields
    const requiredFields = ['first_name', 'last_name', 'email', 'department'];
    const missing = requiredFields.filter(field => !facultyData[field]);
    
    if (missing.length > 0) {
      return {
        success: false,
        error: `Missing required fields: ${missing.join(', ')}`,
        status: 400
      };
    }

    // Check email uniqueness
    const emailExists = mockFaculty.some(f => f.email === facultyData.email);
    if (emailExists) {
      return {
        success: false,
        error: 'Email already in use',
        status: 409
      };
    }

    // Create new faculty
    const newFaculty = {
      id: `faculty_${Date.now()}`,
      employee_id: facultyData.employee_id || `EMP${Date.now()}`,
      first_name: facultyData.first_name,
      last_name: facultyData.last_name,
      email: facultyData.email,
      phone: facultyData.phone,
      qualification: facultyData.qualification,
      specialization: facultyData.specialization,
      experience_years: facultyData.experience_years || 0,
      department: facultyData.department,
      hire_date: facultyData.hire_date || new Date().toISOString().split('T')[0],
      status: facultyData.status || 'active',
      designation: facultyData.designation || 'Lecturer',
      address: facultyData.address,
      city: facultyData.city,
      state: facultyData.state,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: createdBy
    };

    mockFaculty.push(newFaculty);

    return {
      success: true,
      data: newFaculty,
      message: 'Faculty member created successfully',
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
 * Update faculty member
 * @param {String} id - Faculty ID
 * @param {Object} updateData - Fields to update
 * @param {String} updatedBy - User ID updating the record
 * @returns {Object} Updated faculty or error
 */
async function updateFaculty(id, updateData, updatedBy) {
  try {
    const facultyIndex = mockFaculty.findIndex(f => f.id === id);
    
    if (facultyIndex === -1) {
      return {
        success: false,
        error: 'Faculty member not found',
        status: 404
      };
    }

    // Check email uniqueness if being changed
    if (updateData.email && updateData.email !== mockFaculty[facultyIndex].email) {
      const emailExists = mockFaculty.some(
        f => f.email === updateData.email && f.id !== id
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
    const updatedFaculty = {
      ...mockFaculty[facultyIndex],
      ...updateData,
      id: mockFaculty[facultyIndex].id,
      created_at: mockFaculty[facultyIndex].created_at,
      updated_at: new Date().toISOString(),
      updated_by: updatedBy
    };

    mockFaculty[facultyIndex] = updatedFaculty;

    return {
      success: true,
      data: updatedFaculty,
      message: 'Faculty member updated successfully'
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
 * Delete faculty member
 * @param {String} id - Faculty ID
 * @returns {Object} Success or error
 */
async function deleteFaculty(id) {
  try {
    const facultyIndex = mockFaculty.findIndex(f => f.id === id);
    
    if (facultyIndex === -1) {
      return {
        success: false,
        error: 'Faculty member not found',
        status: 404
      };
    }

    const deletedFaculty = mockFaculty.splice(facultyIndex, 1)[0];

    return {
      success: true,
      data: deletedFaculty,
      message: 'Faculty member deleted successfully'
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
 * Get faculty member count
 * @returns {Object} Faculty count
 */
async function getFacultyCount() {
  try {
    return {
      success: true,
      data: {
        total: mockFaculty.length,
        active: mockFaculty.filter(f => f.status === 'active').length,
        inactive: mockFaculty.filter(f => f.status === 'inactive').length,
        on_leave: mockFaculty.filter(f => f.status === 'on_leave').length
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
  getFaculty,
  getFacultyById,
  createFaculty,
  updateFaculty,
  deleteFaculty,
  getFacultyCount
};
