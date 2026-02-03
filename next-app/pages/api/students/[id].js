import { mockData } from '@/lib/mockData';

export default function handler(req, res) {
  const { id } = req.query;

  if (req.method === 'GET') {
    // Find student by ID
    const student = mockData.students.find(s => s.id === id || s.id === parseInt(id));
    
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: student,
    });
  }

  if (req.method === 'PUT') {
    // Update student
    const studentIndex = mockData.students.findIndex(s => s.id === id || s.id === parseInt(id));
    
    if (studentIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      });
    }

    mockData.students[studentIndex] = {
      ...mockData.students[studentIndex],
      ...req.body,
    };

    return res.status(200).json({
      success: true,
      data: mockData.students[studentIndex],
    });
  }

  if (req.method === 'DELETE') {
    // Delete student
    const studentIndex = mockData.students.findIndex(s => s.id === id || s.id === parseInt(id));
    
    if (studentIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      });
    }

    const deletedStudent = mockData.students.splice(studentIndex, 1);

    return res.status(200).json({
      success: true,
      data: deletedStudent[0],
    });
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
