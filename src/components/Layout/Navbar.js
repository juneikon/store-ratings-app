import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getDashboardLink = () => {
    if (!user) return '/';
    switch (user.role) {
      case 'admin': return '/admin/dashboard';
      case 'store_owner': return '/store-owner/dashboard';
      default: return '/user/dashboard';
    }
  };

  return (
    <nav className="navbar">
      <div className="nav-brand">
        <Link to="/">🏪 Store Ratings</Link>
      </div>
      
      <div className="nav-links">
        {isAuthenticated ? (
          <>
            <span>Welcome, {user.name}</span>
            <Link to={getDashboardLink()}>Dashboard</Link>
            <Link to="/change-password">Change Password</Link>
            <button onClick={handleLogout} className="logout-btn">
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;