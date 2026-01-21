/**
 * API Endpoint: GET/PATCH/DELETE /api/students/[id]
 * Get student (GET), update student (PATCH), delete student (DELETE)
 * Requires: students.read (GET), students.update (PATCH), students.delete (DELETE)
 */

const { withAuth } = require('../../../lib/auth-middleware');
const { hasPermission } = require('../../../lib/rbac');
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

    // GET: Get single student
    if (req.method === 'GET') {
      // Check permission
      if (!hasPermission(req.user.role, 'students.read')) {
        return res.status(403).json({
          success: false,
          error: 'Forbidden',
          message: 'You do not have permission to view students'
        });
      }

      const result = await StudentService.getStudentById(id);

      if (!result.success) {
        return res.status(result.status || 400).json({
          success: false,
          error: 'Not Found',
          message: result.error
        });
      }

      return res.status(200).json({
        success: true,
        status: 200,
        data: result.data,
        message: 'Student retrieved successfully'
      });
    }

    // PATCH: Update student
    else if (req.method === 'PATCH') {
      // Check permission
      if (!hasPermission(req.user.role, 'students.update')) {
        return res.status(403).json({
          success: false,
          error: 'Forbidden',
          message: 'You do not have permission to update students'
        });
      }

      const updateData = req.body;

      if (!updateData || Object.keys(updateData).length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Bad Request',
          message: 'Update data is required'
        });
      }

      const result = await StudentService.updateStudent(id, updateData, req.user.id);

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
        message: result.message || 'Student updated successfully'
      });
    }

    // DELETE: Delete student
    else if (req.method === 'DELETE') {
      // Check permission
      if (!hasPermission(req.user.role, 'students.delete')) {
        return res.status(403).json({
          success: false,
          error: 'Forbidden',
          message: 'You do not have permission to delete students'
        });
      }

      const result = await StudentService.deleteStudent(id);

      if (!result.success) {
        return res.status(result.status || 400).json({
          success: false,
          error: 'Not Found',
          message: result.error
        });
      }

      return res.status(200).json({
        success: true,
        status: 200,
        data: result.data,
        message: result.message || 'Student deleted successfully'
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
    console.error('Student detail endpoint error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
}

module.exports = withAuth(handler);
