import { mockData } from '@/lib/mockData';

export default function handler(req, res) {
  if (req.method === 'GET') {
    return res.status(200).json({
      success: true,
      data: mockData.exams,
    });
  }

  if (req.method === 'POST') {
    const newExam = {
      id: mockData.exams.length + 1,
      ...req.body,
    };
    mockData.exams.push(newExam);
    return res.status(201).json({
      success: true,
      data: newExam,
    });
  }

  res.status(405).json({ error: 'Method not allowed' });
}
