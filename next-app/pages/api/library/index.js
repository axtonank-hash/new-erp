import { mockData } from '@/lib/mockData';

export default function handler(req, res) {
  if (req.method === 'GET') {
    return res.status(200).json({
      success: true,
      data: mockData.books,
    });
  }

  if (req.method === 'POST') {
    const newBook = {
      id: mockData.books.length + 1,
      status: 'available',
      ...req.body,
    };
    mockData.books.push(newBook);
    return res.status(201).json({
      success: true,
      data: newBook,
    });
  }

  res.status(405).json({ error: 'Method not allowed' });
}
