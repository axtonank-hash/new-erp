import { mockData } from '@/lib/mockData';

export default function handler(req, res) {
  const { id } = req.query;

  if (req.method === 'PATCH') {
    const fee = mockData.fees.find(f => f.id === parseInt(id));
    if (fee) {
      fee.status = req.body.status;
      return res.status(200).json({
        success: true,
        data: fee,
      });
    }
    return res.status(404).json({ error: 'Fee not found' });
  }

  res.status(405).json({ error: 'Method not allowed' });
}
