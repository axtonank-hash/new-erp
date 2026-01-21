import { verifyToken } from '../../../../lib/jwt-helper';
import { hasPermission } from '../../../../lib/rbac';
import { updateAdmissionStatus } from '../../../../lib/admission-service';

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

    if (req.method === 'PATCH') {
      // Check permission: admissions.update
      if (!hasPermission(user.role, 'admissions.update')) {
        return res.status(403).json({
          success: false,
          error: 'Permission denied: admissions.update'
        });
      }

      const { status } = req.body;

      if (!status) {
        return res.status(400).json({
          success: false,
          error: 'Status field is required'
        });
      }

      const result = await updateAdmissionStatus(id, status, user.id);

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
    console.error('Admission status endpoint error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}
