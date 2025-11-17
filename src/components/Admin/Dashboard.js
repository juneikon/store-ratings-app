import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../../config';

const AdminDashboard = () => {
  const [stats, setStats] = useState({});
  const [activeTab, setActiveTab] = useState('stats');
  const [users, setUsers] = useState([]);
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [statsRes, usersRes, storesRes] = await Promise.all([
        axios.get('${API_BASE_URL}/api/admin/dashboard'),
        axios.get('${API_BASE_URL}/api/admin/users'),
        axios.get('${API_BASE_URL}/api/admin/stores')
      ]);

      setStats(statsRes.data);
      setUsers(usersRes.data);
      setStores(storesRes.data);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.address.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter ? user.role === roleFilter : true;
    return matchesSearch && matchesRole;
  });

  const filteredStores = stores.filter(store =>
    store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    store.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    store.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="container">Loading...</div>;
  }

  return (
    <div className="dashboard">
      <h1>Admin Dashboard</h1>
      <p>Manage users, stores, and platform analytics</p>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Users</h3>
          <div className="number">{stats.totalUsers}</div>
        </div>
        <div className="stat-card">
          <h3>Total Stores</h3>
          <div className="number">{stats.totalStores}</div>
        </div>
        <div className="stat-card">
          <h3>Total Ratings</h3>
          <div className="number">{stats.totalRatings}</div>
        </div>
      </div>

      <div className="tabs">
        <button 
          className={`tab-button ${activeTab === 'stats' ? 'active' : ''}`}
          onClick={() => setActiveTab('stats')}
        >
          Statistics
        </button>
        <button 
          className={`tab-button ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          Users ({users.length})
        </button>
        <button 
          className={`tab-button ${activeTab === 'stores' ? 'active' : ''}`}
          onClick={() => setActiveTab('stores')}
        >
          Stores ({stores.length})
        </button>
      </div>

      {activeTab === 'users' && (
        <div>
          <div className="search-filter">
            <input
              type="text"
              placeholder="Search users by name, email, or address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select 
              value={roleFilter} 
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="">All Roles</option>
              <option value="admin">Admin</option>
              <option value="user">User</option>
              <option value="store_owner">Store Owner</option>
            </select>
          </div>

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Address</th>
                  <th>Role</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(user => (
                  <tr key={user.id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>{user.address}</td>
                    <td>
                      <span className={`role-badge role-${user.role}`}>
                        {user.role}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredUsers.length === 0 && (
              <div className="no-data">No users found</div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'stores' && (
        <div>
          <div className="search-filter">
            <input
              type="text"
              placeholder="Search stores by name, email, or address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Address</th>
                  <th>Owner</th>
                  <th>Rating</th>
                </tr>
              </thead>
              <tbody>
                {filteredStores.map(store => (
                  <tr key={store.id}>
                    <td>{store.name}</td>
                    <td>{store.email}</td>
                    <td>{store.address}</td>
                    <td>{store.owner_name}</td>
                    <td className="rating-stars">
                      ⭐ {parseFloat(store.average_rating).toFixed(1)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredStores.length === 0 && (
              <div className="no-data">No stores found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;