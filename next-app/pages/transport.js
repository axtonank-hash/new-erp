import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import SearchFilterBar from '@/components/SearchFilterBar';
import ExportButton from '@/components/ExportButton';
import axios from 'axios';
import { Plus, Truck, MapPin, Users } from 'lucide-react';
import { processData, getUniqueValues } from '@/lib/searchUtils';

export default function Transport() {
  const [routes, setRoutes] = useState([]);
  const [filteredRoutes, setFilteredRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({});
  const [sortField, setSortField] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [filterOptions, setFilterOptions] = useState({});
  const [formData, setFormData] = useState({
    name: '',
    routeNumber: '',
    driver: '',
    vehicle: '',
    timing: '',
    fee: '',
  });
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    fetchRoutes();
  }, []);

  useEffect(() => {
    const processed = processData(
      routes,
      searchTerm,
      ['name', 'driver', 'vehicle', 'routeNumber'],
      filters,
      sortField,
      sortOrder
    );
    setFilteredRoutes(processed);
  }, [routes, searchTerm, filters, sortField, sortOrder]);

  useEffect(() => {
    if (routes.length > 0) {
      const statuses = getUniqueValues(routes, 'status');
      setFilterOptions({ status: statuses });
    }
  }, [routes]);

  const fetchRoutes = async () => {
    try {
      const response = await axios.get('/api/transport');
      setRoutes(response.data.data);
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

  const handleAddRoute = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/transport', formData);
      setRoutes([...routes, response.data.data]);
      setFormData({ name: '', routeNumber: '', driver: '', vehicle: '', timing: '', fee: '' });
      setShowForm(false);
      alert('Route added successfully!');
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to add route');
    }
  };

  const handleSearch = (term) => setSearchTerm(term);
  const handleFilterChange = (newFilters) => setFilters(newFilters);
  const handleSort = (field) => {
    setSortOrder(sortField === field && sortOrder === 'asc' ? 'desc' : 'asc');
    setSortField(field);
  };

  const getTransportStats = () => {
    const totalRoutes = routes.length;
    const activeRoutes = routes.filter(r => r.status === 'Active').length;
    const totalStudents = routes.reduce((sum, r) => sum + (r.students || 0), 0);
    
    return { totalRoutes, activeRoutes, totalStudents };
  };

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-12">Loading...</div>
      </Layout>
    );
  }

  const stats = getTransportStats();

  return (
    <Layout>
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Transport Management</h1>
          <p className="text-gray-600 mt-2">Manage bus routes and student assignments</p>
        </div>
        <div className="flex gap-3">
          <ExportButton
            data={filteredRoutes}
            filename="transport-routes"
            columns={['name', 'routeNumber', 'driver', 'vehicle', 'students', 'status']}
          />
          <button 
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus size={20} />
            Add Route
          </button>
        </div>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Add New Transport Route</h2>
          <form onSubmit={handleAddRoute}>
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                name="name"
                placeholder="Route Name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                name="routeNumber"
                placeholder="Route Number"
                value={formData.routeNumber}
                onChange={handleInputChange}
                required
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                name="driver"
                placeholder="Driver Name"
                value={formData.driver}
                onChange={handleInputChange}
                required
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                name="vehicle"
                placeholder="Vehicle Number"
                value={formData.vehicle}
                onChange={handleInputChange}
                required
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                name="timing"
                placeholder="Timing (e.g., 7:00 AM - 8:00 AM)"
                value={formData.timing}
                onChange={handleInputChange}
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="number"
                name="fee"
                placeholder="Monthly Fee (₹)"
                value={formData.fee}
                onChange={handleInputChange}
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-2 mt-4">
              <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
                Add Route
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

      {/* Transport Statistics */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
          <p className="text-gray-600 text-sm">Total Routes</p>
          <p className="text-3xl font-bold text-blue-600">{stats.totalRoutes}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
          <p className="text-gray-600 text-sm">Active Routes</p>
          <p className="text-3xl font-bold text-green-600">{stats.activeRoutes}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-purple-500">
          <p className="text-gray-600 text-sm">Total Students</p>
          <p className="text-3xl font-bold text-purple-600">{stats.totalStudents}</p>
        </div>
      </div>

      <SearchFilterBar
        onSearch={handleSearch}
        onFilterChange={handleFilterChange}
        filterOptions={filterOptions}
        placeholder="Search by route name, driver, or vehicle..."
      />

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th
                onClick={() => handleSort('name')}
                className="px-6 py-3 text-left text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-100"
              >
                Route Name {sortField === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Route #</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Driver</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Vehicle</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Students</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredRoutes.length > 0 ? (
              filteredRoutes.map((route) => (
                <tr key={route.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-800 font-medium flex items-center gap-2">
                    <Truck size={18} className="text-blue-600" />
                    {route.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{route.routeNumber}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{route.driver}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{route.vehicle}</td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Users size={16} className="text-purple-600" />
                      <span className="font-semibold">{route.students}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      route.status === 'Active' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {route.status}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                  No routes found
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <div className="px-6 py-3 bg-gray-50 text-sm text-gray-600 border-t">
          Showing {filteredRoutes.length} of {routes.length} routes
        </div>
      </div>
    </Layout>
  );
}
