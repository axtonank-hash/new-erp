import { verifyToken } from '../../../../lib/jwt-helper';
import { hasAnyPermission } from '../../../../lib/rbac';
import { bulkMarkAttendance } from '../../../../lib/attendance-service';

export default async function handler(req, res) {
  try {
    // Verify authentication
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const user = verifyToken(token);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired token'
      });
    }

    if (req.method === 'POST') {
      // Check permission: attendance.create (faculty only)
      if (!hasAnyPermission(user.role, ['attendance.create', 'faculty.attendance'])) {
        return res.status(403).json({
          success: false,
          error: 'Permission denied: attendance.create'
        });
      }

      const { class_id, date, subject, students } = req.body;

      if (!class_id || !date || !subject || !Array.isArray(students)) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: class_id, date, subject, students (array)'
        });
      }

      if (students.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Students array cannot be empty'
        });
      }

      // Bulk mark attendance
      const result = await bulkMarkAttendance(req.body, user.id);

      if (!result.success) {
        const statusCode = result.status || 500;
        return res.status(statusCode).json({
          success: false,
          error: result.error
        });
      }

      return res.status(201).json({
        success: true,
        data: result.data,
        message: result.message,
        meta: {
          timestamp: new Date().toISOString()
        }
      });
    }

    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  } catch (error) {
    console.error('Bulk attendance endpoint error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}
