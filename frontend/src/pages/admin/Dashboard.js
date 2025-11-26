import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import adminService from '../../services/adminService';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await adminService.getDashboardOverview();
      setOverview(response.data);
    } catch (err) {
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  const stats = overview?.platform_stats || {};

  return (
    <div className="admin-dashboard">
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1>Admin Dashboard</h1>
          <p>Welcome back! Here's what's happening today.</p>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card stat-primary">
            <div className="stat-icon">👥</div>
            <div className="stat-info">
              <div className="stat-value">{stats.total_customers || 0}</div>
              <div className="stat-label">Total Customers</div>
            </div>
          </div>

          <div className="stat-card stat-success">
            <div className="stat-icon">🍽️</div>
            <div className="stat-info">
              <div className="stat-value">{stats.total_restaurants || 0}</div>
              <div className="stat-label">Active Restaurants</div>
            </div>
          </div>

          <div className="stat-card stat-warning">
            <div className="stat-icon">📅</div>
            <div className="stat-info">
              <div className="stat-value">{stats.total_bookings || 0}</div>
              <div className="stat-label">Total Bookings</div>
            </div>
          </div>

          <div className="stat-card stat-danger">
            <div className="stat-icon">⏳</div>
            <div className="stat-info">
              <div className="stat-value">{stats.pending_bookings || 0}</div>
              <div className="stat-label">Pending Approval</div>
            </div>
          </div>

          <div className="stat-card stat-info">
            <div className="stat-icon">✅</div>
            <div className="stat-info">
              <div className="stat-value">{stats.approved_bookings || 0}</div>
              <div className="stat-label">Approved</div>
            </div>
          </div>

          <div className="stat-card stat-dark">
            <div className="stat-icon">✔️</div>
            <div className="stat-info">
              <div className="stat-value">{stats.completed_bookings || 0}</div>
              <div className="stat-label">Completed</div>
            </div>
          </div>

          <div className="stat-card stat-review">
            <div className="stat-icon">⭐</div>
            <div className="stat-info">
              <div className="stat-value">{stats.total_reviews || 0}</div>
              <div className="stat-label">Total Reviews</div>
            </div>
          </div>

          <div className="stat-card stat-rating">
            <div className="stat-icon">📊</div>
            <div className="stat-info">
              <div className="stat-value">{stats.avg_platform_rating || '0.00'}</div>
              <div className="stat-label">Avg Rating</div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        {stats.pending_bookings > 0 && (
          <div className="quick-actions">
            <div className="action-card action-urgent">
              <div className="action-content">
                <h3>⚠️ Pending Approvals</h3>
                <p>You have {stats.pending_bookings} booking{stats.pending_bookings > 1 ? 's' : ''} waiting for approval</p>
              </div>
              <button 
                className="btn-action-primary"
                onClick={() => navigate('/admin/bookings?status=pending')}
              >
                Review Now
              </button>
            </div>
          </div>
        )}

        {/* Recent Trends */}
        {overview?.recent_trends && overview.recent_trends.length > 0 && (
          <div className="dashboard-section">
            <h2>Recent Booking Trends (Last 7 Days)</h2>
            <div className="trends-table">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Total</th>
                    <th>Approved</th>
                    <th>Pending</th>
                    <th>Rejected</th>
                    <th>Cancelled</th>
                  </tr>
                </thead>
                <tbody>
                  {overview.recent_trends.map((trend, index) => (
                    <tr key={index}>
                      <td>{trend.period}</td>
                      <td><strong>{trend.total_bookings}</strong></td>
                      <td><span className="badge badge-success">{trend.approved}</span></td>
                      <td><span className="badge badge-warning">{trend.pending}</span></td>
                      <td><span className="badge badge-danger">{trend.rejected}</span></td>
                      <td><span className="badge badge-secondary">{trend.cancelled}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Top Restaurants */}
        {overview?.top_restaurants && overview.top_restaurants.length > 0 && (
          <div className="dashboard-section">
            <h2>Top Performing Restaurants</h2>
            <div className="restaurants-grid">
              {overview.top_restaurants.map((restaurant) => (
                <div key={restaurant.id} className="restaurant-stat-card">
                  <div className="restaurant-stat-header">
                    <h3>{restaurant.name}</h3>
                    <span className="cuisine-badge">{restaurant.cuisine_type}</span>
                  </div>
                  <div className="restaurant-stats">
                    <div className="stat-item">
                      <span className="stat-icon-small">📅</span>
                      <span>{restaurant.total_bookings} bookings</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-icon-small">⭐</span>
                      <span>{restaurant.rating || 'N/A'} ({restaurant.total_reviews} reviews)</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-icon-small">👥</span>
                      <span>{restaurant.unique_customers} customers</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Peak Hours */}
        {overview?.peak_hours && overview.peak_hours.length > 0 && (
          <div className="dashboard-section">
            <h2>Peak Booking Hours</h2>
            <div className="peak-hours-grid">
              {overview.peak_hours.map((hour, index) => (
                <div key={index} className="peak-hour-card">
                  <div className="hour-rank">#{index + 1}</div>
                  <div className="hour-time">{hour.hour}:00</div>
                  <div className="hour-bookings">{hour.booking_count} bookings</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Navigation Cards */}
        <div className="nav-cards">
          <div className="nav-card" onClick={() => navigate('/admin/bookings')}>
            <div className="nav-icon">📋</div>
            <h3>Manage Bookings</h3>
            <p>View and manage all restaurant bookings</p>
          </div>

          <div className="nav-card" onClick={() => navigate('/admin/analytics')}>
            <div className="nav-icon">📊</div>
            <h3>Analytics</h3>
            <p>View detailed platform analytics</p>
          </div>

          <div className="nav-card" onClick={() => navigate('/admin/reviews')}>
            <div className="nav-icon">⭐</div>
            <h3>Reviews</h3>
            <p>Manage customer reviews</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;