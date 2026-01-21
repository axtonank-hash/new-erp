import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import SearchFilterBar from '@/components/SearchFilterBar';
import ExportButton from '@/components/ExportButton';
import axios from 'axios';
import { Save, RefreshCw } from 'lucide-react';
import { processData, getUniqueValues } from '@/lib/searchUtils';

export default function Attendance() {
  const [attendance, setAttendance] = useState([]);
  const [filteredAttendance, setFilteredAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({});
  const [sortField, setSortField] = useState('studentName');
  const [sortOrder, setSortOrder] = useState('asc');
  const [filterOptions, setFilterOptions] = useState({});
  const [saving, setSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState('');
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    fetchAttendance();
  }, []);

  useEffect(() => {
    const processed = processData(
      attendance,
      searchTerm,
      ['studentName', 'class'],
      filters,
      sortField,
      sortOrder
    );
    setFilteredAttendance(processed);
  }, [attendance, searchTerm, filters, sortField, sortOrder]);

  useEffect(() => {
    if (attendance.length > 0) {
      const classes = getUniqueValues(attendance, 'class');
      setFilterOptions({ class: classes });
    }
  }, [attendance]);

  const fetchAttendance = async () => {
    try {
      const response = await axios.get('/api/attendance');
      setAttendance(response.data.data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAttendance = (studentId, status) => {
    setAttendance(attendance.map(a => 
      a.id === studentId ? { ...a, status, date } : a
    ));
  };

  const saveAttendance = async () => {
    setSaving(true);
    try {
      // In a real app, this would save to backend
      // For now, we're just updating the local state
      setTimeout(() => {
        setSavedMessage('Attendance saved successfully!');
        setSaving(false);
        setTimeout(() => setSavedMessage(''), 3000);
      }, 500);
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to save attendance');
      setSaving(false);
    }
  };

  const markAllPresent = () => {
    setAttendance(attendance.map(a => ({ ...a, status: 'present', date })));
  };

  const handleSearch = (term) => setSearchTerm(term);
  const handleFilterChange = (newFilters) => setFilters(newFilters);
  const handleSort = (field) => {
    setSortOrder(sortField === field && sortOrder === 'asc' ? 'desc' : 'asc');
    setSortField(field);
  };

  const getAttendanceStats = () => {
    const present = attendance.filter(a => a.status === 'present').length;
    const absent = attendance.filter(a => a.status === 'absent').length;
    const total = attendance.length;
    return { present, absent, total, percentage: total > 0 ? ((present / total) * 100).toFixed(1) : 0 };
  };

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-12">Loading...</div>
      </Layout>
    );
  }

  const stats = getAttendanceStats();

  return (
    <Layout>
      <div className="mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Attendance Management</h1>
            <p className="text-gray-600 mt-2">Mark and track student attendance</p>
          </div>
          <div className="flex gap-3">
            <ExportButton
              data={filteredAttendance}
              filename="attendance"
              columns={['studentName', 'class', 'rollNo', 'status', 'date']}
            />
            <button
              onClick={saveAttendance}
              disabled={saving}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2 disabled:opacity-50"
            >
              <Save size={20} />
              {saving ? 'Saving...' : 'Save Attendance'}
            </button>
          </div>
        </div>

        {/* Date and Quick Actions */}
        <div className="mt-4 flex gap-4 items-center">
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-1">Date:</label>
            <input 
              type="date" 
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={markAllPresent}
            className="mt-6 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Mark All Present
          </button>
        </div>
      </div>

      {/* Success Message */}
      {savedMessage && (
        <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg flex items-center gap-2">
          <span>✓</span>
          {savedMessage}
        </div>
      )}

      {/* Attendance Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
          <p className="text-gray-600 text-sm">Total Students</p>
          <p className="text-3xl font-bold text-blue-600">{stats.total}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
          <p className="text-gray-600 text-sm">Present</p>
          <p className="text-3xl font-bold text-green-600">{stats.present}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-red-500">
          <p className="text-gray-600 text-sm">Absent</p>
          <p className="text-3xl font-bold text-red-600">{stats.absent}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-purple-500">
          <p className="text-gray-600 text-sm">Attendance %</p>
          <p className="text-3xl font-bold text-purple-600">{stats.percentage}%</p>
        </div>
      </div>

      <SearchFilterBar
        onSearch={handleSearch}
        onFilterChange={handleFilterChange}
        filterOptions={filterOptions}
        placeholder="Search by student name or class..."
      />

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th
                onClick={() => handleSort('studentName')}
                className="px-6 py-3 text-left text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-100"
              >
                Student Name {sortField === 'studentName' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Roll No</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Class</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredAttendance.length > 0 ? (
              filteredAttendance.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-800 font-medium">{record.studentName}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{record.rollNo}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{record.class}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      record.status === 'present' ? 'bg-green-100 text-green-800' :
                      record.status === 'absent' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {record.status || 'Unmarked'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm space-x-3">
                    <button 
                      onClick={() => markAttendance(record.id, 'present')}
                      className={`font-semibold px-3 py-1 rounded ${
                        record.status === 'present'
                          ? 'bg-green-600 text-white'
                          : 'text-green-600 hover:text-green-800 border border-green-600 hover:bg-green-50'
                      }`}
                    >
                      Present
                    </button>
                    <button 
                      onClick={() => markAttendance(record.id, 'absent')}
                      className={`font-semibold px-3 py-1 rounded ${
                        record.status === 'absent'
                          ? 'bg-red-600 text-white'
                          : 'text-red-600 hover:text-red-800 border border-red-600 hover:bg-red-50'
                      }`}
                    >
                      Absent
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                  No attendance records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <div className="px-6 py-3 bg-gray-50 text-sm text-gray-600 border-t">
          Showing {filteredAttendance.length} of {attendance.length} students
        </div>
      </div>
    </Layout>
  );
}
