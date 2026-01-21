import { verifyToken } from '../../../lib/jwt-helper';
import { hasPermission } from '../../../lib/rbac';
import { getFaculty, createFaculty } from '../../../lib/faculty-service';

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
      // Check permission: faculty.read
      if (!hasPermission(user.role, 'faculty.read')) {
        return res.status(403).json({
          success: false,
          error: 'Permission denied: faculty.read'
        });
      }

      // Extract filters and pagination
      const { department, status, search, page = 1, limit = 10 } = req.query;

      const filters = {};
      if (department) filters.department = department;
      if (status) filters.status = status;
      if (search) filters.search = search;

      const result = await getFaculty(filters, parseInt(page), parseInt(limit));

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
      // Check permission: faculty.create
      if (!hasPermission(user.role, 'faculty.create')) {
        return res.status(403).json({
          success: false,
          error: 'Permission denied: faculty.create'
        });
      }

      // Validate required fields
      const { first_name, last_name, email, department } = req.body;
      if (!first_name || !last_name || !email || !department) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: first_name, last_name, email, department'
        });
      }

      // Create faculty
      const result = await createFaculty(req.body, user.id);

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
    console.error('Faculty endpoint error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}
