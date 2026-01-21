import { verifyToken } from '../../../../lib/jwt-helper';
import { hasPermission } from '../../../../lib/rbac';

// Mock faculty course assignments
const mockAssignments = [
  {
    id: 'assign_001',
    faculty_id: 'faculty_001',
    course_id: 'course_001',
    course_name: 'Physics 101',
    class_id: 'class_001',
    class_name: '12A',
    semester: 1,
    academic_year: '2024-2025',
    assigned_date: '2024-01-01T00:00:00Z'
  },
  {
    id: 'assign_002',
    faculty_id: 'faculty_002',
    course_id: 'course_002',
    course_name: 'English Literature',
    class_id: 'class_002',
    class_name: '11A',
    semester: 1,
    academic_year: '2024-2025',
    assigned_date: '2024-01-01T00:00:00Z'
  }
];

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

      // Get assignments for this faculty
      const assignments = mockAssignments.filter(a => a.faculty_id === id);

      return res.status(200).json({
        success: true,
        data: {
          faculty_id: id,
          assignments,
          total: assignments.length
        },
        meta: {
          timestamp: new Date().toISOString()
        }
      });
    }

    if (req.method === 'POST') {
      // Check permission: faculty.update (assign courses)
      if (!hasPermission(user.role, 'faculty.update')) {
        return res.status(403).json({
          success: false,
          error: 'Permission denied: faculty.update'
        });
      }

      const { course_id, course_name, class_id, class_name, semester, academic_year } = req.body;

      if (!course_id || !class_id) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: course_id, class_id'
        });
      }

      // Create new assignment
      const newAssignment = {
        id: `assign_${Date.now()}`,
        faculty_id: id,
        course_id,
        course_name,
        class_id,
        class_name,
        semester,
        academic_year,
        assigned_date: new Date().toISOString(),
        assigned_by: user.id
      };

      mockAssignments.push(newAssignment);

      return res.status(201).json({
        success: true,
        data: newAssignment,
        message: 'Course assigned successfully',
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
    console.error('Faculty courses endpoint error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}
