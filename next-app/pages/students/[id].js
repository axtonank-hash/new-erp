import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import axios from 'axios';
import { ArrowLeft, Mail, Phone, MapPin, BookOpen, User, Calendar, FileText } from 'lucide-react';
import Link from 'next/link';

export default function StudentProfile() {
  const router = useRouter();
  const { id } = router.query;
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;

    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    fetchStudent();
  }, [id]);

  const fetchStudent = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/students/${id}`);
      setStudent(response.data.data || response.data);
    } catch (error) {
      console.error('Error fetching student:', error);
      setError('Failed to load student profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading student profile...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !student) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Link href="/students" className="flex items-center text-blue-600 hover:text-blue-800 mb-6">
            <ArrowLeft size={20} className="mr-2" />
            Back to Students
          </Link>
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-600 font-semibold">{error || 'Student not found'}</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Back Button */}
        <Link href="/students" className="flex items-center text-blue-600 hover:text-blue-800 mb-6">
          <ArrowLeft size={20} className="mr-2" />
          Back to Students
        </Link>

        {/* Header Card */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-8 text-white mb-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">{student.name}</h1>
              <p className="text-blue-100 text-lg">Student ID: {student.enrollmentNumber}</p>
            </div>
            <div className="bg-white bg-opacity-20 rounded-full p-4">
              <User size={48} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Information */}
          <div className="lg:col-span-2">
            {/* Contact Information */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <Mail size={20} className="mr-2 text-blue-600" />
                Contact Information
              </h2>
              <div className="space-y-4">
                <div className="border-b pb-3">
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="text-gray-800 font-semibold">{student.email}</p>
                </div>
                {student.phone && (
                  <div className="border-b pb-3">
                    <p className="text-sm text-gray-600">Phone</p>
                    <p className="text-gray-800 font-semibold flex items-center">
                      <Phone size={16} className="mr-2" />
                      {student.phone}
                    </p>
                  </div>
                )}
                {student.address && (
                  <div className="pb-3">
                    <p className="text-sm text-gray-600">Address</p>
                    <p className="text-gray-800 font-semibold flex items-start">
                      <MapPin size={16} className="mr-2 mt-0.5 flex-shrink-0" />
                      {student.address}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Academic Information */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <BookOpen size={20} className="mr-2 text-blue-600" />
                Academic Information
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <p className="text-sm text-gray-600 mb-1">Class</p>
                  <p className="text-lg font-bold text-gray-800">{student.class}</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <p className="text-sm text-gray-600 mb-1">Section</p>
                  <p className="text-lg font-bold text-gray-800">{student.section || 'N/A'}</p>
                </div>
                <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                  <p className="text-sm text-gray-600 mb-1">Roll Number</p>
                  <p className="text-lg font-bold text-gray-800">{student.rollNumber || 'N/A'}</p>
                </div>
                <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                  <p className="text-sm text-gray-600 mb-1">Status</p>
                  <p className={`text-lg font-bold ${
                    student.status === 'active' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {student.status || 'Active'}
                  </p>
                </div>
              </div>
            </div>

            {/* Additional Details */}
            {(student.dateOfBirth || student.parentName || student.parentPhone) && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                  <FileText size={20} className="mr-2 text-blue-600" />
                  Personal Details
                </h2>
                <div className="space-y-4">
                  {student.dateOfBirth && (
                    <div className="border-b pb-3">
                      <p className="text-sm text-gray-600 flex items-center mb-1">
                        <Calendar size={16} className="mr-2" />
                        Date of Birth
                      </p>
                      <p className="text-gray-800 font-semibold">
                        {new Date(student.dateOfBirth).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                  {student.parentName && (
                    <div className="border-b pb-3">
                      <p className="text-sm text-gray-600 mb-1">Parent/Guardian Name</p>
                      <p className="text-gray-800 font-semibold">{student.parentName}</p>
                    </div>
                  )}
                  {student.parentPhone && (
                    <div className="pb-3">
                      <p className="text-sm text-gray-600 mb-1">Parent Contact</p>
                      <p className="text-gray-800 font-semibold">{student.parentPhone}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Quick Stats */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Quick Stats</h3>
              <div className="space-y-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-xs text-gray-600 uppercase">Enrollment</p>
                  <p className="text-2xl font-bold text-blue-600">{student.enrollmentNumber}</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <p className="text-xs text-gray-600 uppercase">Current Class</p>
                  <p className="text-2xl font-bold text-green-600">{student.class}</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Actions</h3>
              <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition mb-2">
                Send Message
              </button>
              <button className="w-full bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 transition">
                View Attendance
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
