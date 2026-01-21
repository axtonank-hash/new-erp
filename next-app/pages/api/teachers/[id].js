import { mockData } from '@/lib/mockData';

export default function handler(req, res) {
  const { id } = req.query;

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
