/**
 * API Endpoint: GET /api/students/[id]/grades
 * Get student grades
 * Requires: students.read or grades.read
 */

const { withAuth } = require('../../../lib/auth-middleware');
const { hasAnyPermission } = require('../../../lib/rbac');
const StudentService = require('../../../lib/student-service');

async function handler(req, res) {
  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'Bad Request',
        message: 'Student ID is required'
      });
    }

    if (req.method !== 'GET') {
      return res.status(405).json({
        success: false,
        error: 'Method Not Allowed'
      });
    }

    // Check permission
    if (!hasAnyPermission(req.user.role, ['students.read', 'grades.read'])) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: 'You do not have permission to view student grades'
      });
    }

    const result = await StudentService.getStudentGrades(id);

    if (!result.success) {
      return res.status(result.status || 400).json({
        success: false,
        error: 'Error',
        message: result.error
      });
    }

    return res.status(200).json({
      success: true,
      status: 200,
      data: result.data,
      message: 'Student grades retrieved successfully'
    });

  } catch (error) {
    console.error('Student grades endpoint error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
}

module.exports = withAuth(handler);
