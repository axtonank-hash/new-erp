import { mockUsers, mockStudents, mockTeachers, mockAdmissions, mockFees } from '@/lib/mockData';
import { withAuth } from '@/lib/auth';

const handler = (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  return res.status(200).json({
    success: true,
    data: {
      students: mockStudents.length,
      teachers: mockTeachers.length,
      admissions: mockAdmissions.length,
      fees_collected: mockFees.filter(f => f.status === 'paid').reduce((sum, f) => sum + f.amount, 0)
    }
  });
};

export default handler;
