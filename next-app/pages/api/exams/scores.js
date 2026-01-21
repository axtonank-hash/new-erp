import { mockData } from '@/lib/mockData';

export default function handler(req, res) {
  if (req.method === 'GET') {
    return res.status(200).json({
      success: true,
      data: mockData.testScores,
    });
  }

  if (req.method === 'POST') {
    const newScore = {
      id: mockData.testScores.length + 1,
      ...req.body,
    };
    mockData.testScores.push(newScore);
    return res.status(201).json({
      success: true,
      data: newScore,
    });
  }

  res.status(405).json({ error: 'Method not allowed' });
}
