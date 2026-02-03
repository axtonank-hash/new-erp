import { mockData } from '@/lib/mockData';

export default function handler(req, res) {
  const { id } = req.query;

  if (req.method === 'GET') {
    // Find teacher by ID
    const teacher = mockData.teachers.find(t => t.id === id || t.id === parseInt(id));
    
    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Teacher not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: teacher,
    });
  }

  if (req.method === 'PUT') {
    // Update teacher
    const teacherIndex = mockData.teachers.findIndex(t => t.id === id || t.id === parseInt(id));
    
    if (teacherIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Teacher not found',
      });
    }

    mockData.teachers[teacherIndex] = {
      ...mockData.teachers[teacherIndex],
      ...req.body,
    };

    return res.status(200).json({
      success: true,
      data: mockData.teachers[teacherIndex],
    });
  }

  if (req.method === 'DELETE') {
    const index = mockData.teachers.findIndex(t => t.id === parseInt(id));
    if (index > -1) {
      mockData.teachers.splice(index, 1);
      return res.status(200).json({ success: true });
    }
    return res.status(404).json({ error: 'Teacher not found' });
  }

  res.status(405).json({ error: 'Method not allowed' });
}
