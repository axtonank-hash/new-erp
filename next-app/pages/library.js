import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import SearchFilterBar from '@/components/SearchFilterBar';
import ExportButton from '@/components/ExportButton';
import axios from 'axios';
import { Plus, Book, CheckCircle, AlertCircle } from 'lucide-react';
import { processData, getUniqueValues } from '@/lib/searchUtils';

export default function Library() {
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({});
  const [sortField, setSortField] = useState('title');
  const [sortOrder, setSortOrder] = useState('asc');
  const [filterOptions, setFilterOptions] = useState({});
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    isbn: '',
    category: '',
    edition: '',
  });
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    fetchBooks();
  }, []);

  useEffect(() => {
    const processed = processData(
      books,
      searchTerm,
      ['title', 'author', 'isbn', 'category'],
      filters,
      sortField,
      sortOrder
    );
    setFilteredBooks(processed);
  }, [books, searchTerm, filters, sortField, sortOrder]);

  useEffect(() => {
    if (books.length > 0) {
      const statuses = getUniqueValues(books, 'status');
      setFilterOptions({ status: statuses });
    }
  }, [books]);

  const fetchBooks = async () => {
    try {
      const response = await axios.get('/api/library');
      setBooks(response.data.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleAddBook = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/library', formData);
      setBooks([...books, response.data.data]);
      setFormData({ title: '', author: '', isbn: '', category: '', edition: '' });
      setShowForm(false);
      alert('Book added successfully!');
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to add book');
    }
  };

  const issueBook = async (id) => {
    try {
      await axios.post(`/api/library/${id}/issue`);
      setBooks(books.map(b => b.id === id ? { ...b, status: 'issued' } : b));
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to issue book');
    }
  };

  const returnBook = async (id) => {
    try {
      await axios.post(`/api/library/${id}/return`);
      setBooks(books.map(b => b.id === id ? { ...b, status: 'available' } : b));
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to return book');
    }
  };

  const handleSearch = (term) => setSearchTerm(term);
  const handleFilterChange = (newFilters) => setFilters(newFilters);
  const handleSort = (field) => {
    setSortOrder(sortField === field && sortOrder === 'asc' ? 'desc' : 'asc');
    setSortField(field);
  };

  const getLibraryStats = () => {
    const totalBooks = books.length;
    const availableBooks = books.filter(b => b.status === 'available').length;
    const issuedBooks = books.filter(b => b.status === 'issued').length;
    
    return { totalBooks, availableBooks, issuedBooks };
  };

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-12">Loading...</div>
      </Layout>
    );
  }

  const stats = getLibraryStats();

  return (
    <Layout>
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Library Management</h1>
          <p className="text-gray-600 mt-2">Manage library books and issues</p>
        </div>
        <div className="flex gap-3">
          <ExportButton
            data={filteredBooks}
            filename="library-books"
            columns={['title', 'author', 'isbn', 'category', 'status']}
          />
          <button 
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus size={20} />
            Add Book
          </button>
        </div>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Add New Book</h2>
          <form onSubmit={handleAddBook}>
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                name="title"
                placeholder="Book Title"
                value={formData.title}
                onChange={handleInputChange}
                required
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                name="author"
                placeholder="Author"
                value={formData.author}
                onChange={handleInputChange}
                required
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                name="isbn"
                placeholder="ISBN"
                value={formData.isbn}
                onChange={handleInputChange}
                required
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                name="category"
                placeholder="Category"
                value={formData.category}
                onChange={handleInputChange}
                required
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                name="edition"
                placeholder="Edition"
                value={formData.edition}
                onChange={handleInputChange}
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 col-span-2"
              />
            </div>
            <div className="flex gap-2 mt-4">
              <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
                Add Book
              </button>
              <button 
                type="button"
                onClick={() => setShowForm(false)}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Library Statistics */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
          <p className="text-gray-600 text-sm">Total Books</p>
          <p className="text-3xl font-bold text-blue-600">{stats.totalBooks}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
          <p className="text-gray-600 text-sm">Available</p>
          <p className="text-3xl font-bold text-green-600">{stats.availableBooks}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-yellow-500">
          <p className="text-gray-600 text-sm">Issued</p>
          <p className="text-3xl font-bold text-yellow-600">{stats.issuedBooks}</p>
        </div>
      </div>

      <SearchFilterBar
        onSearch={handleSearch}
        onFilterChange={handleFilterChange}
        filterOptions={filterOptions}
        placeholder="Search by title, author, or ISBN..."
      />

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th
                onClick={() => handleSort('title')}
                className="px-6 py-3 text-left text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-100"
              >
                Title {sortField === 'title' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th
                onClick={() => handleSort('author')}
                className="px-6 py-3 text-left text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-100"
              >
                Author {sortField === 'author' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">ISBN</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Category</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredBooks.length > 0 ? (
              filteredBooks.map((book) => (
                <tr key={book.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-800 font-medium flex items-center gap-2">
                    <Book size={18} className="text-blue-600" />
                    {book.title}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{book.author}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{book.isbn}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{book.category || 'General'}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 w-fit ${
                      book.status === 'available' ? 'bg-green-100 text-green-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {book.status === 'available' ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
                      {book.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm space-x-2">
                    {book.status === 'available' && (
                      <button 
                        onClick={() => issueBook(book.id)}
                        className="text-blue-600 hover:text-blue-800 font-semibold"
                      >
                        Issue
                      </button>
                    )}
                    {book.status === 'issued' && (
                      <button 
                        onClick={() => returnBook(book.id)}
                        className="text-green-600 hover:text-green-800 font-semibold"
                      >
                        Return
                      </button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                  No books found
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <div className="px-6 py-3 bg-gray-50 text-sm text-gray-600 border-t">
          Showing {filteredBooks.length} of {books.length} books
        </div>
      </div>
    </Layout>
  );
}
