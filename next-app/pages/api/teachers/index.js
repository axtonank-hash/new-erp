import { mockData } from '@/lib/mockData';

export default function handler(req, res) {
  if (req.method === 'GET') {
    return res.status(200).json({
      success: true,
      data: mockData.teachers,
    });
  }

  if (req.method === 'POST') {
    const newTeacher = {
      id: mockData.teachers.length + 1,
      ...req.body,
    };
    mockData.teachers.push(newTeacher);
    return res.status(201).json({
      success: true,
      data: newTeacher,
    });
  }

  res.status(405).json({ error: 'Method not allowed' });
}
