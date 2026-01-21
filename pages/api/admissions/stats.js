import { verifyToken } from '../../../lib/jwt-helper';
import { hasPermission } from '../../../lib/rbac';
import { getAdmissionStats } from '../../../lib/admission-service';

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
      // Check permission: admissions.read
      if (!hasPermission(user.role, 'admissions.read')) {
        return res.status(403).json({
          success: false,
          error: 'Permission denied: admissions.read'
        });
      }

      const result = await getAdmissionStats();

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
    console.error('Admission stats endpoint error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}
