import { mockData } from '@/lib/mockData';

export default function handler(req, res) {
  if (req.method === 'GET') {
    return res.status(200).json({
      success: true,
      data: mockData.fees,
    });
  }

  if (req.method === 'POST') {
    const newFee = {
      id: mockData.fees.length + 1,
      status: 'pending',
      ...req.body,
    };
    mockData.fees.push(newFee);
    return res.status(201).json({
      success: true,
      data: newFee,
    });
  }

  res.status(405).json({ error: 'Method not allowed' });
}
