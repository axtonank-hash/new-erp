import { mockData } from '@/lib/mockData';

export default function handler(req, res) {
  const { id, action } = req.query;
  const bookId = parseInt(id);
  const book = mockData.books.find(b => b.id === bookId);

  if (!book) {
    return res.status(404).json({ error: 'Book not found' });
  }

  if (req.method === 'POST') {
    if (action === 'issue') {
      book.status = 'issued';
      return res.status(200).json({ success: true, data: book });
    } else if (action === 'return') {
      book.status = 'available';
      return res.status(200).json({ success: true, data: book });
    }
  }

  res.status(405).json({ error: 'Method not allowed' });
}
