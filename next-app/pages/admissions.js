import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import SearchFilterBar from '@/components/SearchFilterBar';
import ExportButton from '@/components/ExportButton';
import axios from 'axios';
import { processData, getUniqueValues } from '@/lib/searchUtils';

export default function Admissions() {
  const [admissions, setAdmissions] = useState([]);
  const [filteredAdmissions, setFilteredAdmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({});
  const [sortField, setSortField] = useState('studentName');
  const [sortOrder, setSortOrder] = useState('asc');
  const [filterOptions, setFilterOptions] = useState({});
  const [formData, setFormData] = useState({
    studentName: '',
    class: '',
    parentEmail: '',
  });
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    fetchAdmissions();
  }, []);

  useEffect(() => {
    const processed = processData(
      admissions,
      searchTerm,
      ['studentName', 'parentEmail', 'class'],
      filters,
      sortField,
      sortOrder
    );
    setFilteredAdmissions(processed);
  }, [admissions, searchTerm, filters, sortField, sortOrder]);

  useEffect(() => {
    if (admissions.length > 0) {
      const classes = getUniqueValues(admissions, 'class');
      const statuses = getUniqueValues(admissions, 'status');
      setFilterOptions({ class: classes, status: statuses });
    }
  }, [admissions]);

  const fetchAdmissions = async () => {
    try {
      const response = await axios.get('/api/admissions');
      setAdmissions(response.data.data);
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

  const handleAddAdmission = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/admissions', formData);
      setAdmissions([...admissions, response.data.data]);
      setFormData({ studentName: '', class: '', parentEmail: '' });
      setShowForm(false);
      alert('Admission request created successfully!');
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to create admission request');
    }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      await axios.patch(`/api/admissions/${id}`, { status: newStatus });
      setAdmissions(admissions.map(a => 
        a.id === id ? { ...a, status: newStatus } : a
      ));
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to update admission status');
    }
  };

  const handleSearch = (term) => setSearchTerm(term);
  const handleFilterChange = (newFilters) => setFilters(newFilters);
  const handleSort = (field) => {
    setSortOrder(sortField === field && sortOrder === 'asc' ? 'desc' : 'asc');
    setSortField(field);
  };

  return (
    <Layout>
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Admissions</h1>
          <p className="text-gray-600 mt-2">Manage student admissions</p>
        </div>
        <div className="flex gap-3">
          <ExportButton
            data={filteredAdmissions}
            filename="admissions"
            columns={['studentName', 'class', 'parentEmail', 'status']}
          />
          <button 
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <span>➕</span>
            New Admission
          </button>
        </div>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Create New Admission Request</h2>
          <form onSubmit={handleAddAdmission}>
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                name="studentName"
                placeholder="Student Name"
                value={formData.studentName}
                onChange={handleInputChange}
                required
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                name="class"
                placeholder="Class"
                value={formData.class}
                onChange={handleInputChange}
                required
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="email"
                name="parentEmail"
                placeholder="Parent Email"
                value={formData.parentEmail}
                onChange={handleInputChange}
                required
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 col-span-2"
              />
            </div>
            <div className="flex gap-2 mt-4">
              <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
                Create Request
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
          <SearchFilterBar
            onSearch={handleSearch}
            onFilterChange={handleFilterChange}
            filterOptions={filterOptions}
            placeholder="Search by student name or email..."
          />

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    onClick={() => handleSort('studentName')}
                    className="px-6 py-3 text-left text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-100"
                  >
                    Name {sortField === 'studentName' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th
                    onClick={() => handleSort('class')}
                    className="px-6 py-3 text-left text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-100"
                  >
                    Class {sortField === 'class' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th
                    onClick={() => handleSort('parentEmail')}
                    className="px-6 py-3 text-left text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-100"
                  >
                    Parent Email {sortField === 'parentEmail' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredAdmissions.length > 0 ? (
                  filteredAdmissions.map((admission) => (
                    <tr key={admission.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-800">{admission.studentName}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{admission.class}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{admission.parentEmail}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      admission.status === 'approved' ? 'bg-green-100 text-green-800' :
                      admission.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {admission.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm space-x-2">
                    {admission.status === 'pending' && (
                      <>
                        <button 
                          onClick={() => updateStatus(admission.id, 'approved')}
                          className="text-green-600 hover:text-green-800 font-semibold"
                        >
                          Approve
                        </button>
                        <button 
                          onClick={() => updateStatus(admission.id, 'rejected')}
                          className="text-red-600 hover:text-red-800 font-semibold"
                        >
                          Reject
                        </button>
                      </>
                    )}
                  </td>
                </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                      No admissions found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            <div className="px-6 py-3 bg-gray-50 text-sm text-gray-600 border-t">
              Showing {filteredAdmissions.length} of {admissions.length} admissions
            </div>
          </div>
        </>
      )}
    </Layout>
  );
}
