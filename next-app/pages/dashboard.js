import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import { DashboardStats, QuickActions, SimpleBarChart, RecentActivity } from '@/components/DashboardStats';
import axios from 'axios';
import { UserPlus, FileText, DollarSign, Calendar } from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    pendingAdmissions: 0,
    pendingFees: 0,
    paidFees: 0,
    attendanceRate: 0,
  });
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Fetch from all endpoints to build analytics
      const [studentsRes, teachersRes, admissionsRes, feesRes] = await Promise.all([
        axios.get('/api/students'),
        axios.get('/api/teachers'),
        axios.get('/api/admissions'),
        axios.get('/api/fees'),
      ]);

      const students = studentsRes.data.data || [];
      const teachers = teachersRes.data.data || [];
      const admissions = admissionsRes.data.data || [];
      const fees = feesRes.data.data || [];

      const pendingAdmissions = admissions.filter(a => a.status === 'pending').length;
      const pendingFees = fees
        .filter(f => f.status === 'pending')
        .reduce((sum, f) => sum + (f.amount || 0), 0);
      const paidFees = fees
        .filter(f => f.status === 'paid')
        .reduce((sum, f) => sum + (f.amount || 0), 0);

      setStats({
        totalStudents: students.length,
        totalTeachers: teachers.length,
        pendingAdmissions,
        pendingFees,
        paidFees,
        attendanceRate: 85, // Mock value
        students,
        teachers,
        admissions,
        fees,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      label: 'Add Student',
      icon: <UserPlus className="mx-auto" size={24} />,
      onClick: () => router.push('/students'),
    },
    {
      label: 'View Fees',
      icon: <DollarSign className="mx-auto" size={24} />,
      onClick: () => router.push('/fees'),
    },
    {
      label: 'Admissions',
      icon: <FileText className="mx-auto" size={24} />,
      onClick: () => router.push('/admissions'),
    },
    {
      label: 'Attendance',
      icon: <Calendar className="mx-auto" size={24} />,
      onClick: () => router.push('/attendance'),
    },
  ];

  const classDistribution = stats.students
    ? [
        {
          label: '10A',
          count: stats.students.filter(s => s.class === '10A').length,
          percentage: Math.round(
            (stats.students.filter(s => s.class === '10A').length / stats.students.length) * 100
          ) || 0,
          color: 'bg-blue-600',
        },
        {
          label: '10B',
          count: stats.students.filter(s => s.class === '10B').length,
          percentage: Math.round(
            (stats.students.filter(s => s.class === '10B').length / stats.students.length) * 100
          ) || 0,
          color: 'bg-green-600',
        },
        {
          label: '9',
          count: stats.students.filter(s => s.class === '9').length,
          percentage: Math.round(
            (stats.students.filter(s => s.class === '9').length / stats.students.length) * 100
          ) || 0,
          color: 'bg-purple-600',
        },
      ]
    : [];

  const recentActivities = [
    {
      title: 'New Student Admitted',
      description: 'John Doe added to class 10A',
      timestamp: '2 hours ago',
      icon: <UserPlus size={18} className="text-blue-600" />,
    },
    {
      title: 'Fee Payment Received',
      description: '₹5,000 from Jane Smith',
      timestamp: '1 day ago',
      icon: <DollarSign size={18} className="text-green-600" />,
    },
    {
      title: 'Admission Request',
      description: 'New admission request pending',
      timestamp: '3 days ago',
      icon: <FileText size={18} className="text-yellow-600" />,
    },
  ];

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-12">Loading dashboard...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome to GegoK12 School ERP - Overview and key metrics</p>
      </div>

      {/* Key Stats */}
      <DashboardStats
        totalStudents={stats.totalStudents}
        totalTeachers={stats.totalTeachers}
        pendingAdmissions={stats.pendingAdmissions}
        pendingFees={stats.pendingFees}
        paidFees={stats.paidFees}
        attendanceRate={stats.attendanceRate}
        trends={{ students: 12, teachers: 5 }}
      />

      {/* Quick Actions */}
      <QuickActions actions={quickActions} />

      {/* Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <SimpleBarChart
          title="Students by Class"
          data={classDistribution}
        />
        <RecentActivity items={recentActivities} />
      </div>

      {/* Fee Analysis */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-6">Fee Collection Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <p className="text-2xl font-bold text-yellow-600">₹{stats.pendingFees}</p>
            <p className="text-sm text-yellow-700 mt-2">Pending Collections</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
            <p className="text-2xl font-bold text-green-600">₹{stats.paidFees}</p>
            <p className="text-sm text-green-700 mt-2">Collected</p>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-2xl font-bold text-blue-600">
              {stats.paidFees + stats.pendingFees > 0
                ? Math.round((stats.paidFees / (stats.paidFees + stats.pendingFees)) * 100)
                : 0}
              %
            </p>
            <p className="text-sm text-blue-700 mt-2">Collection Rate</p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
      </div>
    </Layout>
  );
}

function StatCard({ title, value, icon, color }) {
  const colors = {
    blue: 'bg-blue-100 border-blue-300',
    green: 'bg-green-100 border-green-300',
    yellow: 'bg-yellow-100 border-yellow-300',
    purple: 'bg-purple-100 border-purple-300'
  };

  return (
    <div className={`${colors[color]} border rounded-lg p-6`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm">{title}</p>
          <p className="text-3xl font-bold text-gray-800 mt-2">{value}</p>
        </div>
        <div className="text-4xl opacity-50">{icon}</div>
      </div>
    </div>
  );
}

function QuickAccessCard({ title, icon, href }) {
  return (
    <a href={href} className="block">
      <div className="bg-white rounded-lg shadow hover:shadow-lg transition p-6 cursor-pointer">
        <div className="flex items-center space-x-4">
          <span className="text-4xl">{icon}</span>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
            <p className="text-gray-600 text-sm">Manage {title.toLowerCase()}</p>
          </div>
        </div>
      </div>
    </a>
  );
}
