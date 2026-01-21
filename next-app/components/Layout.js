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
    { name: 'Teachers', path: '/teachers', icon: '👨‍🏫' },
    { name: 'Attendance', path: '/attendance', icon: '✓' },
    { name: 'Exams', path: '/exams', icon: '📚' },
    { name: 'Fees', path: '/fees', icon: '💰' },
    { name: 'Library', path: '/library', icon: '📖' },
    { name: 'Transport', path: '/transport', icon: '🚌' },
    { name: 'HR', path: '/hr', icon: '👥' },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-gray-800 text-white transition-all duration-300 overflow-hidden`}
      >
        <div className="p-4 flex items-center justify-between">
          {sidebarOpen && <h1 className="font-bold text-xl">GegoK12</h1>}
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
        <div className="bg-white shadow-sm px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-800">
            Welcome, {user?.name || 'User'}
          </h2>
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
