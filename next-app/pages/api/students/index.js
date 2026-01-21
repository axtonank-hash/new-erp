import { mockData } from '@/lib/mockData';

export default function handler(req, res) {
  if (req.method === 'GET') {
    return res.status(200).json({
      success: true,
      data: mockData.students,
    });
  }

  if (req.method === 'POST') {
    const newStudent = {
      id: (mockData.students.length + 1).toString(),
      status: 'active',
      ...req.body,
    };
    mockData.students.push(newStudent);
    return res.status(201).json({
      success: true,
      data: newStudent,
    });
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
