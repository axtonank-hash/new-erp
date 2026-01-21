import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import SearchFilterBar from '@/components/SearchFilterBar';
import ExportButton from '@/components/ExportButton';
import axios from 'axios';
import { Plus, Eye, BarChart3 } from 'lucide-react';
import { processData, getUniqueValues } from '@/lib/searchUtils';

export default function Exams() {
  const [exams, setExams] = useState([]);
  const [filteredExams, setFilteredExams] = useState([]);
  const [testScores, setTestScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedExam, setSelectedExam] = useState(null);
  const [showScores, setShowScores] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({});
  const [sortField, setSortField] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [filterOptions, setFilterOptions] = useState({});
  const [formData, setFormData] = useState({
    name: '',
    date: '',
    subject: '',
    class: '',
    maxMarks: '',
    durationMinutes: '',
    examType: '',
  });
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    fetchExams();
    fetchTestScores();
  }, []);

  useEffect(() => {
    const processed = processData(
      exams,
      searchTerm,
      ['name', 'subject', 'class', 'examType'],
      filters,
      sortField,
      sortOrder
    );
    setFilteredExams(processed);
  }, [exams, searchTerm, filters, sortField, sortOrder]);

  useEffect(() => {
    if (exams.length > 0) {
      const subjects = getUniqueValues(exams, 'subject');
      const classes = getUniqueValues(exams, 'class');
      const types = getUniqueValues(exams, 'examType');
      setFilterOptions({ subject: subjects, class: classes, examType: types });
    }
  }, [exams]);

  const fetchExams = async () => {
    try {
      const response = await axios.get('/api/exams');
      setExams(response.data.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTestScores = async () => {
    try {
      const response = await axios.get('/api/exams/scores');
      setTestScores(response.data.data || []);
    } catch (error) {
      console.error('Error fetching scores:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleAddExam = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/exams', formData);
      setExams([...exams, response.data.data]);
      setFormData({ name: '', date: '', subject: '', class: '', maxMarks: '', durationMinutes: '', examType: '' });
      setShowForm(false);
      alert('Exam created successfully!');
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to add exam');
    }
  };

  const viewScores = (exam) => {
    setSelectedExam(exam);
    setShowScores(true);
  };

  const getExamScores = (examId) => {
    return testScores.filter(score => score.examId === examId);
  };

  const handleSearch = (term) => setSearchTerm(term);
  const handleFilterChange = (newFilters) => setFilters(newFilters);
  const handleSort = (field) => {
    setSortOrder(sortField === field && sortOrder === 'asc' ? 'desc' : 'asc');
    setSortField(field);
  };

  const calculateExamStats = (examId) => {
    const scores = getExamScores(examId);
    if (scores.length === 0) return { average: 0, highest: 0, lowest: 0, passing: 0 };
    
    const averageScore = scores.reduce((sum, s) => sum + s.score, 0) / scores.length;
    const highestScore = Math.max(...scores.map(s => s.score));
    const lowestScore = Math.min(...scores.map(s => s.score));
    const passingCount = scores.filter(s => s.percentage >= 40).length;
    
    return {
      average: averageScore.toFixed(2),
      highest: highestScore,
      lowest: lowestScore,
      passing: passingCount,
      total: scores.length
    };
  };

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-12">Loading...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Exams Management</h1>
          <p className="text-gray-600 mt-2">Manage exams and view test results</p>
        </div>
        <div className="flex gap-3">
          <ExportButton
            data={filteredExams}
            filename="exams"
            columns={['name', 'date', 'subject', 'class', 'maxMarks', 'examType', 'status']}
          />
          <button 
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus size={20} />
            Add Exam
          </button>
        </div>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Create New Exam</h2>
          <form onSubmit={handleAddExam}>
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                name="name"
                placeholder="Exam Name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                required
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                name="subject"
                placeholder="Subject"
                value={formData.subject}
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
                type="number"
                name="maxMarks"
                placeholder="Max Marks"
                value={formData.maxMarks}
                onChange={handleInputChange}
                required
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="number"
                name="durationMinutes"
                placeholder="Duration (minutes)"
                value={formData.durationMinutes}
                onChange={handleInputChange}
                required
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                name="examType"
                value={formData.examType}
                onChange={handleInputChange}
                required
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Exam Type</option>
                <option value="Unit Test">Unit Test</option>
                <option value="Mid Term">Mid Term</option>
                <option value="Final">Final</option>
                <option value="Practice">Practice</option>
              </select>
            </div>
            <div className="flex gap-2 mt-4">
              <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
                Create Exam
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

      {showScores && selectedExam && (
        <div className="bg-white rounded-lg shadow p-6 mb-8 border-l-4 border-blue-500">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-2xl font-semibold">{selectedExam.name} - Results</h2>
              <p className="text-gray-600">{selectedExam.subject} | {selectedExam.class}</p>
            </div>
            <button
              onClick={() => setShowScores(false)}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ✕
            </button>
          </div>

          {/* Stats Summary */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6 p-4 bg-gray-50 rounded">
            {(() => {
              const stats = calculateExamStats(selectedExam.id);
              return (
                <>
                  <div className="text-center">
                    <p className="text-gray-600 text-sm">Average</p>
                    <p className="text-2xl font-bold text-blue-600">{stats.average}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-600 text-sm">Highest</p>
                    <p className="text-2xl font-bold text-green-600">{stats.highest}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-600 text-sm">Lowest</p>
                    <p className="text-2xl font-bold text-red-600">{stats.lowest}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-600 text-sm">Passing</p>
                    <p className="text-2xl font-bold text-purple-600">{stats.passing}/{stats.total}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-600 text-sm">Pass Rate</p>
                    <p className="text-2xl font-bold text-indigo-600">
                      {stats.total > 0 ? ((stats.passing / stats.total) * 100).toFixed(0) : 0}%
                    </p>
                  </div>
                </>
              );
            })()}
          </div>

          {/* Scores Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left">Student Name</th>
                  <th className="px-4 py-2 text-left">Score</th>
                  <th className="px-4 py-2 text-left">Percentage</th>
                  <th className="px-4 py-2 text-left">Grade</th>
                  <th className="px-4 py-2 text-left">Remarks</th>
                </tr>
              </thead>
              <tbody>
                {getExamScores(selectedExam.id).length > 0 ? (
                  getExamScores(selectedExam.id).map((score) => (
                    <tr key={score.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-2">{score.studentName}</td>
                      <td className="px-4 py-2 font-semibold">
                        {score.score}/{selectedExam.maxMarks}
                      </td>
                      <td className="px-4 py-2">
                        <div className="w-full bg-gray-200 rounded h-6 flex items-center overflow-hidden">
                          <div
                            className={`h-full flex items-center justify-center text-white text-xs font-bold ${
                              score.percentage >= 80 ? 'bg-green-500' :
                              score.percentage >= 60 ? 'bg-yellow-500' :
                              'bg-red-500'
                            }`}
                            style={{ width: `${Math.min(score.percentage, 100)}%` }}
                          >
                            {score.percentage}%
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-2">
                        <span className={`px-3 py-1 rounded font-semibold text-white ${
                          score.grade === 'A+' || score.grade === 'A' ? 'bg-green-600' :
                          score.grade === 'B' ? 'bg-blue-600' :
                          score.grade === 'C' ? 'bg-yellow-600' :
                          'bg-red-600'
                        }`}>
                          {score.grade}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-gray-700">{score.remarks}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-4 py-8 text-center text-gray-500">
                      No test scores available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <SearchFilterBar
        onSearch={handleSearch}
        onFilterChange={handleFilterChange}
        filterOptions={filterOptions}
        placeholder="Search by exam name or subject..."
      />

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th
                onClick={() => handleSort('name')}
                className="px-6 py-3 text-left text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-100"
              >
                Exam Name {sortField === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th
                onClick={() => handleSort('date')}
                className="px-6 py-3 text-left text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-100"
              >
                Date {sortField === 'date' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Subject</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Class</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Marks</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Type</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredExams.length > 0 ? (
              filteredExams.map((exam) => (
                <tr key={exam.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-800 font-medium">{exam.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{exam.date}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{exam.subject}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{exam.class}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{exam.maxMarks}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-semibold">
                      {exam.examType}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      exam.status === 'completed' ? 'bg-green-100 text-green-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {exam.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm space-x-2">
                    <button
                      onClick={() => viewScores(exam)}
                      className="text-blue-600 hover:text-blue-800 font-semibold inline-flex items-center gap-1"
                    >
                      <BarChart3 size={16} />
                      Results
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                  No exams found
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <div className="px-6 py-3 bg-gray-50 text-sm text-gray-600 border-t">
          Showing {filteredExams.length} of {exams.length} exams
        </div>
      </div>
    </Layout>
  );
}
