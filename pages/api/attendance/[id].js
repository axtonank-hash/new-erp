import { verifyToken } from '../../../../lib/jwt-helper';
import { hasPermission } from '../../../../lib/rbac';
import { getAttendanceById, updateAttendance, deleteAttendance } from '../../../../lib/attendance-service';

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

      const result = await getAttendanceById(id);

      if (!result.success) {
        const statusCode = result.status || 500;
        return res.status(statusCode).json({
          success: false,
          error: result.error
        });
      }

      return res.status(200).json({
        success: true,
        data: result.data,
        meta: {
          timestamp: new Date().toISOString()
        }
      });
    }

    if (req.method === 'PATCH') {
      // Check permission: attendance.update
      if (!hasPermission(user.role, 'attendance.update')) {
        return res.status(403).json({
          success: false,
          error: 'Permission denied: attendance.update'
        });
      }

      const result = await updateAttendance(id, req.body, user.id);

      if (!result.success) {
        const statusCode = result.status || 500;
        return res.status(statusCode).json({
          success: false,
          error: result.error
        });
      }

      return res.status(200).json({
        success: true,
        data: result.data,
        message: result.message,
        meta: {
          timestamp: new Date().toISOString()
        }
      });
    }

    if (req.method === 'DELETE') {
      // Check permission: attendance.delete
      if (!hasPermission(user.role, 'attendance.delete')) {
        return res.status(403).json({
          success: false,
          error: 'Permission denied: attendance.delete'
        });
      }

      const result = await deleteAttendance(id);

      if (!result.success) {
        const statusCode = result.status || 500;
        return res.status(statusCode).json({
          success: false,
          error: result.error
        });
      }

      return res.status(200).json({
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
    console.error('Attendance detail endpoint error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}
