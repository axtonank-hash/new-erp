/**
 * API Endpoint: GET/POST /api/students
 * List students (GET) or create student (POST)
 * Requires: students.read (GET), students.create (POST)
 */

const { withAuth } = require('../../lib/auth-middleware');
const { hasPermission } = require('../../lib/rbac');
const StudentService = require('../../lib/student-service');

async function handler(req, res) {
  try {
    // GET: List students
    if (req.method === 'GET') {
      // Check permission
      if (!hasPermission(req.user.role, 'students.read')) {
        return res.status(403).json({
          success: false,
          error: 'Forbidden',
          message: 'You do not have permission to view students'
        });
      }

      // Get query parameters
      const { class_id, section, status, search, page = 1, limit = 10 } = req.query;

      // Build filters
      const filters = {};
      if (class_id) filters.class_id = class_id;
      if (section) filters.section = section;
      if (status) filters.status = status;
      if (search) filters.search = search;

      // Get students
      const result = await StudentService.getStudents(
        filters,
        parseInt(page),
        parseInt(limit)
      );

      if (!result.success) {
        return res.status(500).json({
          success: false,
          error: 'Internal server error',
          message: result.error
        });
      }

      return res.status(200).json({
        success: true,
        status: 200,
        data: result.data,
        message: 'Students retrieved successfully'
      });
    }

    // POST: Create student
    else if (req.method === 'POST') {
      // Check permission
      if (!hasPermission(req.user.role, 'students.create')) {
        return res.status(403).json({
          success: false,
          error: 'Forbidden',
          message: 'You do not have permission to create students'
        });
      }

      // Get student data from request body
      const studentData = req.body;

      // Validate data
      if (!studentData) {
        return res.status(400).json({
          success: false,
          error: 'Bad Request',
          message: 'Student data is required'
        });
      }

      // Create student
      const result = await StudentService.createStudent(studentData, req.user.id);

      if (!result.success) {
        return res.status(result.status || 400).json({
          success: false,
          error: 'Bad Request',
          message: result.error
        });
      }

      return res.status(201).json({
        success: true,
        status: 201,
        data: result.data,
        message: result.message || 'Student created successfully'
      });
    }

    // Method not allowed
    else {
      return res.status(405).json({
        success: false,
        error: 'Method Not Allowed',
        message: `${req.method} method not allowed on this endpoint`
      });
    }

  } catch (error) {
    console.error('Students endpoint error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
}

module.exports = withAuth(handler);
