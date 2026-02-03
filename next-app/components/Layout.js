import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Menu, LogOut } from 'lucide-react';

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: '📊' },
    { name: 'Admissions', path: '/admissions', icon: '📝' },
    { name: 'Students', path: '/students', icon: '👨‍🎓' },
    { name: 'Faculty', path: '/teachers', icon: '👨‍⚕️' },
    { name: 'Attendance', path: '/attendance', icon: '✓' },
    { name: 'Clinical Exams', path: '/exams', icon: '🔬' },
    { name: 'Lab Work', path: '/fees', icon: '🧪' },
    { name: 'Library', path: '/library', icon: '📖' },
    { name: 'Practicums', path: '/transport', icon: '🏥' },
    { name: 'Administration', path: '/hr', icon: '⚙️' },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-gradient-to-b from-blue-900 to-blue-800 text-white transition-all duration-300 overflow-hidden`}
      >
        <div className="p-4 flex items-center justify-between">
          {sidebarOpen && (
            <div>
              <h1 className="font-bold text-lg">College Portal</h1>
              <p className="text-xs text-blue-200 font-semibold">Nursing & Pharmacy</p>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-gray-700 rounded"
          >
            <Menu size={20} />
          </button>
        </div>

        <nav className="mt-8">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className={`flex items-center space-x-4 px-4 py-3 hover:bg-gray-700 transition block ${
                router.pathname === item.path ? 'bg-gray-700' : ''
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              {sidebarOpen && <span>{item.name}</span>}
            </Link>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 border-b-2 border-blue-900 shadow px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-blue-900">
              Welcome, {user?.name || 'User'}
            </h2>
            <p className="text-xs text-blue-700 font-semibold">Nursing & Pharmacy College Management System</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 text-red-600 hover:text-red-700 font-semibold"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-6">{children}</div>
      </div>
    </div>
  );
}
