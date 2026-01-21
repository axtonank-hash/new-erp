import { verifyToken } from '../../../lib/jwt-helper';
import { hasPermission, hasAnyPermission } from '../../../lib/rbac';
import { getAttendance, markAttendance } from '../../../lib/attendance-service';

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

    if (req.method === 'GET') {
      // Check permission: attendance.read
      if (!hasPermission(user.role, 'attendance.read')) {
        return res.status(403).json({
          success: false,
          error: 'Permission denied: attendance.read'
        });
      }

      // Extract filters and pagination
      const { student_id, class_id, date, status, page = 1, limit = 50 } = req.query;

      const filters = {};
      if (student_id) filters.student_id = student_id;
      if (class_id) filters.class_id = class_id;
      if (date) filters.date = date;
      if (status) filters.status = status;

      const result = await getAttendance(filters, parseInt(page), parseInt(limit));

      if (!result.success) {
        return res.status(500).json(result);
      }

      return res.status(200).json({
        success: true,
        data: result.data,
        meta: {
          timestamp: new Date().toISOString()
        }
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

      // Validate required fields
      const { student_id, date, status, class_id, subject } = req.body;
      if (!student_id || !date || !status || !class_id || !subject) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: student_id, date, status, class_id, subject'
        });
      }

      // Mark attendance
      const result = await markAttendance(req.body, user.id);

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
    console.error('Attendance endpoint error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}
