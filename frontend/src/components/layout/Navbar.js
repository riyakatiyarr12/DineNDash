import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          🍽️ DineNDash
        </Link>

        <div className="navbar-menu">
          {isAuthenticated ? (
            <>
              <span className="navbar-user">
                Welcome, {user?.name} ({user?.role})
              </span>
              
              {user?.role === 'customer' && (
                <>
                  <Link to="/customer/restaurants" className="navbar-link">
                    Restaurants
                  </Link>
                  <Link to="/customer/my-bookings" className="navbar-link">
                    My Bookings
                  </Link>
                  <Link to="/customer/my-reviews" className="navbar-link">
                    My Reviews
                  </Link>
                </>
              )}

              {user?.role === 'admin' && (
                <>
                  <Link to="/admin/dashboard" className="navbar-link">
                    Dashboard
                  </Link>
                  <Link to="/admin/bookings" className="navbar-link">
                    Bookings
                  </Link>
                  <Link to="/admin/analytics" className="navbar-link">
                    Analytics
                  </Link>
                </>
              )}

              <button onClick={handleLogout} className="navbar-btn-logout">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="navbar-link">
                Login
              </Link>
              <Link to="/register" className="navbar-btn-register">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;