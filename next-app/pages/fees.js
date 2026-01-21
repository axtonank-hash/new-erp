import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import SearchFilterBar from '@/components/SearchFilterBar';
import ExportButton from '@/components/ExportButton';
import axios from 'axios';
import { Plus } from 'lucide-react';
import { processData, getUniqueValues } from '@/lib/searchUtils';

export default function Fees() {
  const [fees, setFees] = useState([]);
  const [filteredFees, setFilteredFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({});
  const [sortField, setSortField] = useState('studentName');
  const [sortOrder, setSortOrder] = useState('asc');
  const [filterOptions, setFilterOptions] = useState({});
  const [formData, setFormData] = useState({
    studentId: '',
    amount: '',
    dueDate: '',
    type: '',
  });
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    fetchFees();
  }, []);

  useEffect(() => {
    const processed = processData(
      fees,
      searchTerm,
      ['studentName', 'type'],
      filters,
      sortField,
      sortOrder
    );
    setFilteredFees(processed);
  }, [fees, searchTerm, filters, sortField, sortOrder]);

  useEffect(() => {
    if (fees.length > 0) {
      const types = getUniqueValues(fees, 'type');
      const statuses = getUniqueValues(fees, 'status');
      setFilterOptions({ type: types, status: statuses });
    }
  }, [fees]);

  const fetchFees = async () => {
    try {
      const response = await axios.get('/api/fees');
      setFees(response.data.data);
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

  const handleAddFee = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/fees', formData);
      setFees([...fees, response.data.data]);
      setFormData({ studentId: '', amount: '', dueDate: '', type: '' });
      setShowForm(false);
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to add fee');
    }
  };

  const markAsPaid = async (id) => {
    try {
      await axios.patch(`/api/fees/${id}`, { status: 'paid' });
      setFees(fees.map(f => f.id === id ? { ...f, status: 'paid' } : f));
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to mark as paid');
    }
  };

  const handleSearch = (term) => setSearchTerm(term);
  const handleFilterChange = (newFilters) => setFilters(newFilters);
  const handleSort = (field) => {
    setSortOrder(sortField === field && sortOrder === 'asc' ? 'desc' : 'asc');
    setSortField(field);
  };

  const getFeeStats = () => {
    const totalAmount = fees.reduce((sum, f) => sum + (f.amount || 0), 0);
    const paidAmount = fees.filter(f => f.status === 'paid').reduce((sum, f) => sum + (f.amount || 0), 0);
    const pendingAmount = fees.filter(f => f.status === 'pending').reduce((sum, f) => sum + (f.amount || 0), 0);
    const paidCount = fees.filter(f => f.status === 'paid').length;
    const pendingCount = fees.filter(f => f.status === 'pending').length;
    
    return {
      totalAmount,
      paidAmount,
      pendingAmount,
      paidCount,
      pendingCount,
      collectionRate: totalAmount > 0 ? ((paidAmount / totalAmount) * 100).toFixed(1) : 0
    };
  };

  return (
    <Layout>
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Fees Management</h1>
          <p className="text-gray-600 mt-2">Manage and track student fees</p>
        </div>
        <div className="flex gap-3">
          <ExportButton
            data={filteredFees}
            filename="fees"
            columns={['studentName', 'amount', 'type', 'dueDate', 'status']}
          />
          <button 
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus size={20} />
            Add Fee
          </button>
        </div>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Add Fee Entry</h2>
          <form onSubmit={handleAddFee}>
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                name="studentId"
                placeholder="Student ID"
                value={formData.studentId}
                onChange={handleInputChange}
                required
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="number"
                name="amount"
                placeholder="Amount"
                value={formData.amount}
                onChange={handleInputChange}
                required
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="date"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleInputChange}
                required
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                required
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Fee Type</option>
                <option value="tuition">Tuition</option>
                <option value="transport">Transport</option>
                <option value="uniform">Uniform</option>
              </select>
            </div>
            <div className="flex gap-2 mt-4">
              <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
                Add Fee
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

      {loading ? (
        <div className="text-center py-12">Loading...</div>
      ) : (
        <>
          {/* Fee Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            {(() => {
              const stats = getFeeStats();
              return (
                <>
                  <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
                    <p className="text-gray-600 text-sm">Total Amount</p>
                    <p className="text-2xl font-bold text-blue-600">₹{stats.totalAmount}</p>
                  </div>
                  <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
                    <p className="text-gray-600 text-sm">Collected</p>
                    <p className="text-2xl font-bold text-green-600">₹{stats.paidAmount}</p>
                    <p className="text-xs text-gray-500 mt-1">{stats.paidCount} payments</p>
                  </div>
                  <div className="bg-white rounded-lg shadow p-4 border-l-4 border-yellow-500">
                    <p className="text-gray-600 text-sm">Pending</p>
                    <p className="text-2xl font-bold text-yellow-600">₹{stats.pendingAmount}</p>
                    <p className="text-xs text-gray-500 mt-1">{stats.pendingCount} pending</p>
                  </div>
                  <div className="bg-white rounded-lg shadow p-4 border-l-4 border-purple-500">
                    <p className="text-gray-600 text-sm">Collection Rate</p>
                    <p className="text-2xl font-bold text-purple-600">{stats.collectionRate}%</p>
                  </div>
                  <div className="bg-white rounded-lg shadow p-4 border-l-4 border-red-500">
                    <p className="text-gray-600 text-sm">Outstanding</p>
                    <p className="text-2xl font-bold text-red-600">{stats.pendingCount}</p>
                  </div>
                </>
              );
            })()}
          </div>

          <SearchFilterBar
            onSearch={handleSearch}
            onFilterChange={handleFilterChange}
            filterOptions={filterOptions}
            placeholder="Search by student name or fee type..."
          />

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    onClick={() => handleSort('studentName')}
                    className="px-6 py-3 text-left text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-100"
                  >
                    Student {sortField === 'studentName' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th
                    onClick={() => handleSort('amount')}
                    className="px-6 py-3 text-left text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-100"
                  >
                    Amount {sortField === 'amount' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th
                    onClick={() => handleSort('type')}
                    className="px-6 py-3 text-left text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-100"
                  >
                    Type {sortField === 'type' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Due Date</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
              {filteredFees.length > 0 ? (
                filteredFees.map((fee) => (
                  <tr key={fee.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-800">{fee.studentName}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">₹{fee.amount}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{fee.type}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{fee.dueDate}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        fee.status === 'paid' ? 'bg-green-100 text-green-800' :
                        fee.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                      {fee.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {fee.status === 'pending' && (
                        <button 
                          onClick={() => markAsPaid(fee.id)}
                          className="text-green-600 hover:text-green-800 font-semibold"
                        >
                          Mark Paid
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                    No fees found
                  </td>
                </tr>
              )}
              </tbody>
            </table>
            <div className="px-6 py-3 bg-gray-50 text-sm text-gray-600 border-t">
              Showing {filteredFees.length} of {fees.length} fee entries
            </div>
          </div>
        </>
      )}
    </Layout>
  );
}
