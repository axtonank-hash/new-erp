import { verifyToken } from '../../../../lib/jwt-helper';
import { hasPermission } from '../../../../lib/rbac';
import { getFacultyById, updateFaculty, deleteFaculty } from '../../../../lib/faculty-service';

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
      // Check permission: faculty.read
      if (!hasPermission(user.role, 'faculty.read')) {
        return res.status(403).json({
          success: false,
          error: 'Permission denied: faculty.read'
        });
      }

      const result = await getFacultyById(id);

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
      // Check permission: faculty.update
      if (!hasPermission(user.role, 'faculty.update')) {
        return res.status(403).json({
          success: false,
          error: 'Permission denied: faculty.update'
        });
      }

      const result = await updateFaculty(id, req.body, user.id);

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
      // Check permission: faculty.delete
      if (!hasPermission(user.role, 'faculty.delete')) {
        return res.status(403).json({
          success: false,
          error: 'Permission denied: faculty.delete'
        });
      }

      const result = await deleteFaculty(id);

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
    console.error('Faculty detail endpoint error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}
