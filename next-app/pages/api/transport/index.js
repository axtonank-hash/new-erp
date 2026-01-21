import { mockData } from '@/lib/mockData';

export default function handler(req, res) {
  if (req.method === 'GET') {
    return res.status(200).json({
      success: true,
      data: mockData.routes,
    });
  }

  if (req.method === 'POST') {
    const newRoute = {
      id: mockData.routes.length + 1,
      students: 0,
      status: 'Active',
      ...req.body,
    };
    mockData.routes.push(newRoute);
    return res.status(201).json({
      success: true,
      data: newRoute,
    });
  }

  res.status(405).json({ error: 'Method not allowed' });
}
