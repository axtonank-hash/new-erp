import { verifyToken } from '../../../lib/jwt-helper';
import { hasPermission } from '../../../lib/rbac';
import { getAdmissions, createAdmission } from '../../../lib/admission-service';

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

      // Extract filters and pagination
      const { status, stream, course, search, page = 1, limit = 10 } = req.query;

      const filters = {};
      if (status) filters.status = status;
      if (stream) filters.stream = stream;
      if (course) filters.course = course;
      if (search) filters.search = search;

      const result = await getAdmissions(filters, parseInt(page), parseInt(limit));

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
      // Check permission: admissions.create
      if (!hasPermission(user.role, 'admissions.create')) {
        return res.status(403).json({
          success: false,
          error: 'Permission denied: admissions.create'
        });
      }

      // Validate required fields
      const { first_name, last_name, email, course_applied, marks_10th } = req.body;
      if (!first_name || !last_name || !email || !course_applied || marks_10th === undefined) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: first_name, last_name, email, course_applied, marks_10th'
        });
      }

      // Create admission
      const result = await createAdmission(req.body, user.id);

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
    console.error('Admission endpoint error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}
