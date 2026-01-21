import { mockData } from '@/lib/mockData';

export default function handler(req, res) {
  const { id } = req.query;

  if (req.method === 'PATCH') {
    const admission = mockData.admissions.find(a => a.id === parseInt(id));
    if (admission) {
      admission.status = req.body.status;
      return res.status(200).json({
        success: true,
        data: admission,
      });
    }
    return res.status(404).json({ error: 'Admission not found' });
  }

  res.status(405).json({ error: 'Method not allowed' });
}
