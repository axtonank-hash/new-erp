import { verifyToken } from '../../../../lib/jwt-helper';
import { hasPermission } from '../../../../lib/rbac';
import { getStudentAttendanceSummary } from '../../../../lib/attendance-service';

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

    const { id } = req.query;

    if (req.method === 'GET') {
      // Check permission: attendance.read
      if (!hasPermission(user.role, 'attendance.read')) {
        return res.status(403).json({
          success: false,
          error: 'Permission denied: attendance.read'
        });
      }

      // Extract date range filters if provided
      const filters = {};
      if (req.query.start_date && req.query.end_date) {
        filters.date_range = [req.query.start_date, req.query.end_date];
      }

      const result = await getStudentAttendanceSummary(id, filters);

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

    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  } catch (error) {
    console.error('Attendance summary endpoint error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}
