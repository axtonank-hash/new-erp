import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import axios from 'axios';
import { ArrowLeft, Mail, Phone, MapPin, BookOpen, User, Calendar, Award, GraduationCap } from 'lucide-react';
import Link from 'next/link';

export default function TeacherProfile() {
  const router = useRouter();
  const { id } = router.query;
  const [teacher, setTeacher] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;

    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    fetchTeacher();
  }, [id]);

  const fetchTeacher = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/teachers/${id}`);
      setTeacher(response.data.data || response.data);
    } catch (error) {
      console.error('Error fetching teacher:', error);
      setError('Failed to load teacher profile');
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
            <p className="text-gray-600">Loading teacher profile...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !teacher) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Link href="/teachers" className="flex items-center text-blue-600 hover:text-blue-800 mb-6">
            <ArrowLeft size={20} className="mr-2" />
            Back to Teachers
          </Link>
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-600 font-semibold">{error || 'Teacher not found'}</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Back Button */}
        <Link href="/teachers" className="flex items-center text-blue-600 hover:text-blue-800 mb-6">
          <ArrowLeft size={20} className="mr-2" />
          Back to Teachers
        </Link>

        {/* Header Card */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-lg p-8 text-white mb-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">{teacher.name}</h1>
              <p className="text-purple-100 text-lg">{teacher.department || 'Department'}</p>
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
                <Mail size={20} className="mr-2 text-purple-600" />
                Contact Information
              </h2>
              <div className="space-y-4">
                <div className="border-b pb-3">
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="text-gray-800 font-semibold">{teacher.email}</p>
                </div>
                {teacher.phone && (
                  <div className="border-b pb-3">
                    <p className="text-sm text-gray-600">Phone</p>
                    <p className="text-gray-800 font-semibold flex items-center">
                      <Phone size={16} className="mr-2" />
                      {teacher.phone}
                    </p>
                  </div>
                )}
                {teacher.address && (
                  <div className="pb-3">
                    <p className="text-sm text-gray-600">Address</p>
                    <p className="text-gray-800 font-semibold flex items-start">
                      <MapPin size={16} className="mr-2 mt-0.5 flex-shrink-0" />
                      {teacher.address}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Professional Information */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <BookOpen size={20} className="mr-2 text-purple-600" />
                Professional Information
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                  <p className="text-sm text-gray-600 mb-1">Department</p>
                  <p className="text-lg font-bold text-gray-800">{teacher.department || 'N/A'}</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <p className="text-sm text-gray-600 mb-1">Qualification</p>
                  <p className="text-lg font-bold text-gray-800">{teacher.qualification || 'N/A'}</p>
                </div>
                {teacher.experience && (
                  <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                    <p className="text-sm text-gray-600 mb-1">Experience</p>
                    <p className="text-lg font-bold text-gray-800">{teacher.experience} years</p>
                  </div>
                )}
                {teacher.specialization && (
                  <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                    <p className="text-sm text-gray-600 mb-1">Specialization</p>
                    <p className="text-lg font-bold text-gray-800">{teacher.specialization}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Additional Details */}
            {(teacher.dateOfBirth || teacher.dateOfJoining || teacher.subjectsTeaching) && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                  <Award size={20} className="mr-2 text-purple-600" />
                  Additional Details
                </h2>
                <div className="space-y-4">
                  {teacher.dateOfBirth && (
                    <div className="border-b pb-3">
                      <p className="text-sm text-gray-600 flex items-center mb-1">
                        <Calendar size={16} className="mr-2" />
                        Date of Birth
                      </p>
                      <p className="text-gray-800 font-semibold">
                        {new Date(teacher.dateOfBirth).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                  {teacher.dateOfJoining && (
                    <div className="border-b pb-3">
                      <p className="text-sm text-gray-600 flex items-center mb-1">
                        <Calendar size={16} className="mr-2" />
                        Date of Joining
                      </p>
                      <p className="text-gray-800 font-semibold">
                        {new Date(teacher.dateOfJoining).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                  {teacher.subjectsTeaching && (
                    <div className="pb-3">
                      <p className="text-sm text-gray-600 flex items-center mb-1">
                        <GraduationCap size={16} className="mr-2" />
                        Subjects Teaching
                      </p>
                      <p className="text-gray-800 font-semibold">{teacher.subjectsTeaching}</p>
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
                <div className="bg-purple-50 rounded-lg p-4">
                  <p className="text-xs text-gray-600 uppercase">Department</p>
                  <p className="text-lg font-bold text-purple-600">{teacher.department || 'N/A'}</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-xs text-gray-600 uppercase">Qualification</p>
                  <p className="text-lg font-bold text-blue-600">{teacher.qualification || 'N/A'}</p>
                </div>
                {teacher.experience && (
                  <div className="bg-green-50 rounded-lg p-4">
                    <p className="text-xs text-gray-600 uppercase">Experience</p>
                    <p className="text-lg font-bold text-green-600">{teacher.experience}y</p>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Actions</h3>
              <button className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition mb-2">
                Send Message
              </button>
              <button className="w-full bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 transition">
                View Schedule
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
