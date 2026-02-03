import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '@/components/Layout';
import SearchFilterBar from '@/components/SearchFilterBar';
import ExportButton from '@/components/ExportButton';
import axios from 'axios';
import { Plus, Trash2, Edit2 } from 'lucide-react';
import { processData, getUniqueValues } from '@/lib/searchUtils';

export default function Teachers() {
  const [teachers, setTeachers] = useState([]);
  const [filteredTeachers, setFilteredTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({});
  const [sortField, setSortField] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [filterOptions, setFilterOptions] = useState({});
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: '',
    qualification: '',
  });
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    fetchTeachers();
  }, []);

  useEffect(() => {
    // Apply search, filter, and sort
    const processed = processData(
      teachers,
      searchTerm,
      ['name', 'email', 'department', 'qualification'],
      filters,
      sortField,
      sortOrder
    );
    setFilteredTeachers(processed);
  }, [teachers, searchTerm, filters, sortField, sortOrder]);

  useEffect(() => {
    // Generate filter options from data
    if (teachers.length > 0) {
      const departments = getUniqueValues(teachers, 'department');
      const statuses = getUniqueValues(teachers, 'status');
      setFilterOptions({
        department: departments,
        status: statuses,
      });
    }
  }, [teachers]);

  const fetchTeachers = async () => {
    try {
      const response = await axios.get('/api/teachers');
      setTeachers(response.data.data);
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

  const handleAddTeacher = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/teachers', formData);
      setTeachers([...teachers, response.data.data]);
      setFormData({ name: '', email: '', department: '', qualification: '' });
      setShowForm(false);
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to add teacher');
    }
  };

  const handleDeleteTeacher = async (id) => {
    if (confirm('Are you sure?')) {
      try {
        await axios.delete(`/api/teachers/${id}`);
        setTeachers(teachers.filter(t => t.id !== id));
      } catch (error) {
        console.error('Error:', error);
        alert('Failed to delete teacher');
      }
    }
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  return (
    <Layout>
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-blue-900">Faculty Management</h1>
          <p className="text-blue-700 mt-2">Manage nursing & pharmacy faculty records</p>
        </div>
        <div className="flex gap-3">
          <ExportButton
            data={filteredTeachers}
            filename="teachers"
            columns={['name', 'email', 'department', 'qualification', 'status']}
          />
          <button 
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus size={20} />
            Add Teacher
          </button>
        </div>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Add New Teacher</h2>
          <form onSubmit={handleAddTeacher}>
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                name="department"
                placeholder="Department"
                value={formData.department}
                onChange={handleInputChange}
                required
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                name="qualification"
                placeholder="Qualification"
                value={formData.qualification}
                onChange={handleInputChange}
                required
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-2 mt-4">
              <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
                Save Teacher
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
            placeholder="Search by name, email, or department..."
          />

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    onClick={() => handleSort('name')}
                    className="px-6 py-3 text-left text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-100"
                  >
                    Name {sortField === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th
                    onClick={() => handleSort('email')}
                    className="px-6 py-3 text-left text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-100"
                  >
                    Email {sortField === 'email' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th
                    onClick={() => handleSort('department')}
                    className="px-6 py-3 text-left text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-100"
                  >
                    Department {sortField === 'department' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Qualification</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredTeachers.length > 0 ? (
                  filteredTeachers.map((teacher) => (
                    <tr key={teacher.id} className="hover:bg-gray-50 cursor-pointer">
                      <td className="px-6 py-4 text-sm text-gray-800">
                        <Link href={`/teachers/${teacher.id}`} className="text-blue-600 hover:text-blue-800 font-semibold">
                          {teacher.name}
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{teacher.email}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{teacher.department}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{teacher.qualification}</td>
                      <td className="px-6 py-4 text-sm space-x-2">
                        <button className="text-blue-600 hover:text-blue-800">
                          <Edit2 size={18} />
                        </button>
                        <button 
                          onClick={() => handleDeleteTeacher(teacher.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                      No teachers found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            <div className="px-6 py-3 bg-gray-50 text-sm text-gray-600 border-t">
              Showing {filteredTeachers.length} of {teachers.length} teachers
            </div>
          </div>
        </>
      )}
    </Layout>
  );
}
