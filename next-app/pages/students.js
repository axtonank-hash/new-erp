import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '@/components/Layout';
import SearchFilterBar from '@/components/SearchFilterBar';
import ExportButton from '@/components/ExportButton';
import axios from 'axios';
import { processData, getUniqueValues } from '@/lib/searchUtils';

export default function Students() {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
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
    enrollmentNumber: '',
    class: '',
  });
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    fetchStudents();
  }, []);

  useEffect(() => {
    // Apply search, filter, and sort
    const processed = processData(
      students,
      searchTerm,
      ['name', 'email', 'enrollmentNumber'],
      filters,
      sortField,
      sortOrder
    );
    setFilteredStudents(processed);
  }, [students, searchTerm, filters, sortField, sortOrder]);

  useEffect(() => {
    // Generate filter options from data
    if (students.length > 0) {
      const classes = getUniqueValues(students, 'class');
      const statuses = getUniqueValues(students, 'status');
      setFilterOptions({
        class: classes,
        status: statuses,
      });
    }
  }, [students]);

  const fetchStudents = async () => {
    try {
      const response = await axios.get('/api/students');
      setStudents(response.data.data);
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

  const handleAddStudent = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/students', formData);
      setStudents([...students, response.data.data]);
      setFormData({ name: '', email: '', enrollmentNumber: '', class: '' });
      setShowForm(false);
      alert('Student added successfully!');
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to add student');
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
          <h1 className="text-3xl font-bold text-blue-900">Student Enrollment</h1>
          <p className="text-blue-700 mt-2">Manage nursing and pharmacy student records</p>
        </div>
        <div className="flex gap-3">
          <ExportButton
            data={filteredStudents}
            filename="students"
            columns={['name', 'email', 'enrollmentNumber', 'class', 'status']}
          />
          <button 
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <span>➕</span>
            Enroll Student
          </button>
        </div>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Add New Student</h2>
          <form onSubmit={handleAddStudent}>
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
                name="enrollmentNumber"
                placeholder="Enrollment Number"
                value={formData.enrollmentNumber}
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
            </div>
            <div className="flex gap-2 mt-4">
              <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
                Save Student
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
            placeholder="Search by name, email, or enrollment number..."
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
                    onClick={() => handleSort('enrollmentNumber')}
                    className="px-6 py-3 text-left text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-100"
                  >
                    Enrollment {sortField === 'enrollmentNumber' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th
                    onClick={() => handleSort('class')}
                    className="px-6 py-3 text-left text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-100"
                  >
                    Class {sortField === 'class' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((student) => (
                    <tr key={student.id} className="hover:bg-gray-50 cursor-pointer">
                      <td className="px-6 py-4 text-sm text-gray-800">
                        <Link href={`/students/${student.id}`} className="text-blue-600 hover:text-blue-800 font-semibold">
                          {student.name}
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{student.email}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{student.enrollmentNumber}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{student.class}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                          {student.status || 'active'}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                      No students found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            <div className="px-6 py-3 bg-gray-50 text-sm text-gray-600 border-t">
              Showing {filteredStudents.length} of {students.length} students
            </div>
          </div>
        </>
      )}
    </Layout>
  );
}
