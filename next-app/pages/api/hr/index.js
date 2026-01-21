import { mockData } from '@/lib/mockData';

export default function handler(req, res) {
  if (req.method === 'GET') {
    return res.status(200).json({
      success: true,
      data: mockData.employees,
    });
  }

  if (req.method === 'POST') {
    const newEmployee = {
      id: mockData.employees.length + 1,
      status: 'Active',
      ...req.body,
    };
    mockData.employees.push(newEmployee);
    return res.status(201).json({
      success: true,
      data: newEmployee,
    });
  }

  res.status(405).json({ error: 'Method not allowed' });
}
