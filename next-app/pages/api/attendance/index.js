import { mockData } from '@/lib/mockData';

export default function handler(req, res) {
  if (req.method === 'GET') {
    return res.status(200).json({
      success: true,
      data: mockData.attendance,
    });
  }

  if (req.method === 'POST') {
    const { studentId, date, status } = req.body;
    const record = mockData.attendance.find(a => a.id === studentId);
    if (record) {
      record.status = status;
      record.date = date;
    }
    return res.status(200).json({
      success: true,
      data: record,
    });
  }

  res.status(405).json({ error: 'Method not allowed' });
}
