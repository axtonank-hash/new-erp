import { mockData } from '@/lib/mockData';

export default function handler(req, res) {
  if (req.method === 'GET') {
    return res.status(200).json({
      success: true,
      data: mockData.admissions
    });
  }

  if (req.method === 'POST') {
    const newAdmission = {
      id: mockData.admissions.length + 1,
      status: 'pending',
      appliedDate: new Date(),
      ...req.body,
    };
    mockData.admissions.push(newAdmission);
    return res.status(201).json({
      success: true,
      data: newAdmission,
    });
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
