import React, { useState, useEffect } from 'react';
import adminService from '../../services/adminService';
import './Analytics.css';

const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [platformStats, setPlatformStats] = useState(null);
  const [bookingTrends, setBookingTrends] = useState([]);
  const [peakHours, setPeakHours] = useState([]);
  const [topRestaurants, setTopRestaurants] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  
  const [trendsPeriod, setTrendsPeriod] = useState('daily');
  const [trendsLimit, setTrendsLimit] = useState(30);
  const [revenuePeriod, setRevenuePeriod] = useState('monthly');
  const [peakHoursDays, setPeakHoursDays] = useState(30);

  useEffect(() => {
    fetchAllAnalytics();
  }, []);

  useEffect(() => {
    fetchBookingTrends();
  }, [trendsPeriod, trendsLimit]);

  useEffect(() => {
    fetchRevenueAnalytics();
  }, [revenuePeriod]);

  useEffect(() => {
    fetchPeakHours();
  }, [peakHoursDays]);

  const fetchAllAnalytics = async () => {
    setLoading(true);
    setError('');
    try {
      const [statsRes, trendsRes, peakRes, restaurantsRes, revenueRes] = await Promise.all([
        adminService.getPlatformStats(),
        adminService.getBookingTrends(trendsPeriod, trendsLimit),
        adminService.getPeakHours(peakHoursDays),
        adminService.getTopRestaurants(10),
        adminService.getRevenueAnalytics(revenuePeriod, 12)
      ]);

      setPlatformStats(statsRes.data.stats);
      setBookingTrends(trendsRes.data.trends);
      setPeakHours(peakRes.data.peak_hours);
      setTopRestaurants(restaurantsRes.data.restaurants);
      setRevenueData(revenueRes.data.revenue);
    } catch (err) {
      setError('Failed to load analytics data');
      console.error('Analytics error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchBookingTrends = async () => {
    try {
      const response = await adminService.getBookingTrends(trendsPeriod, trendsLimit);
      setBookingTrends(response.data.trends);
    } catch (err) {
      console.error('Failed to fetch booking trends:', err);
    }
  };

  const fetchPeakHours = async () => {
    try {
      const response = await adminService.getPeakHours(peakHoursDays);
      setPeakHours(response.data.peak_hours);
    } catch (err) {
      console.error('Failed to fetch peak hours:', err);
    }
  };

  const fetchRevenueAnalytics = async () => {
    try {
      const response = await adminService.getRevenueAnalytics(revenuePeriod, 12);
      setRevenueData(response.data.revenue);
    } catch (err) {
      console.error('Failed to fetch revenue analytics:', err);
    }
  };

  if (loading) {
    return <div className="loading">Loading analytics...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="admin-analytics-page">
      <div className="analytics-container">
        <div className="page-header">
          <h1>Platform Analytics</h1>
          <p>Comprehensive insights and performance metrics</p>
        </div>

        {/* Platform Overview Stats */}
        {platformStats && (
          <div className="stats-overview">
            <div className="stat-card-analytics stat-primary">
              <div className="stat-icon-analytics">👥</div>
              <div className="stat-details">
                <div className="stat-value-analytics">{platformStats.total_customers}</div>
                <div className="stat-label-analytics">Total Customers</div>
              </div>
            </div>

            <div className="stat-card-analytics stat-success">
              <div className="stat-icon-analytics">🍽️</div>
              <div className="stat-details">
                <div className="stat-value-analytics">{platformStats.total_restaurants}</div>
                <div className="stat-label-analytics">Active Restaurants</div>
              </div>
            </div>

            <div className="stat-card-analytics stat-warning">
              <div className="stat-icon-analytics">📅</div>
              <div className="stat-details">
                <div className="stat-value-analytics">{platformStats.total_bookings}</div>
                <div className="stat-label-analytics">Total Bookings</div>
              </div>
            </div>

            <div className="stat-card-analytics stat-info">
              <div className="stat-icon-analytics">⭐</div>
              <div className="stat-details">
                <div className="stat-value-analytics">{platformStats.avg_platform_rating}</div>
                <div className="stat-label-analytics">Platform Rating</div>
              </div>
            </div>
          </div>
        )}

        {/* Booking Trends */}
        <div className="analytics-section">
          <div className="section-header">
            <h2>Booking Trends</h2>
            <div className="section-controls">
              <select
                value={trendsPeriod}
                onChange={(e) => setTrendsPeriod(e.target.value)}
                className="analytics-select"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
              <select
                value={trendsLimit}
                onChange={(e) => setTrendsLimit(parseInt(e.target.value))}
                className="analytics-select"
              >
                <option value={7}>Last 7</option>
                <option value={14}>Last 14</option>
                <option value={30}>Last 30</option>
                <option value={60}>Last 60</option>
              </select>
            </div>
          </div>

          <div className="chart-container">
            <div className="trends-chart">
              {bookingTrends.map((trend, index) => {
                const maxBookings = Math.max(...bookingTrends.map(t => t.total_bookings));
                const heightPercentage = (trend.total_bookings / maxBookings) * 100;

                return (
                  <div key={index} className="trend-bar-group">
                    <div className="trend-bars">
                      <div 
                        className="trend-bar trend-bar-approved"
                        style={{ height: `${(trend.approved / maxBookings) * 100}%` }}
                        title={`Approved: ${trend.approved}`}
                      />
                      <div 
                        className="trend-bar trend-bar-pending"
                        style={{ height: `${(trend.pending / maxBookings) * 100}%` }}
                        title={`Pending: ${trend.pending}`}
                      />
                      <div 
                        className="trend-bar trend-bar-rejected"
                        style={{ height: `${(trend.rejected / maxBookings) * 100}%` }}
                        title={`Rejected: ${trend.rejected}`}
                      />
                    </div>
                    <div className="trend-label">{trend.period}</div>
                    <div className="trend-total">{trend.total_bookings}</div>
                  </div>
                );
              })}
            </div>
            <div className="chart-legend">
              <div className="legend-item">
                <span className="legend-color legend-approved"></span>
                <span>Approved</span>
              </div>
              <div className="legend-item">
                <span className="legend-color legend-pending"></span>
                <span>Pending</span>
              </div>
              <div className="legend-item">
                <span className="legend-color legend-rejected"></span>
                <span>Rejected</span>
              </div>
            </div>
          </div>
        </div>

        {/* Revenue Analytics */}
        <div className="analytics-section">
          <div className="section-header">
            <h2>Revenue Analytics</h2>
            <select
              value={revenuePeriod}
              onChange={(e) => setRevenuePeriod(e.target.value)}
              className="analytics-select"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>

          <div className="revenue-grid">
            {revenueData.map((revenue, index) => {
              const revenueValue = parseFloat(revenue.estimated_revenue) || 0;
              return (
                <div key={index} className="revenue-card">
                  <div className="revenue-period">{revenue.period}</div>
                  <div className="revenue-amount">₹{revenueValue.toLocaleString('en-IN')}</div>
                  <div className="revenue-meta">
                    <span>{revenue.total_bookings} bookings</span>
                    <span>{revenue.unique_customers} customers</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Peak Hours */}
        <div className="analytics-section">
          <div className="section-header">
            <h2>Peak Booking Hours</h2>
            <select
              value={peakHoursDays}
              onChange={(e) => setPeakHoursDays(parseInt(e.target.value))}
              className="analytics-select"
            >
              <option value={7}>Last 7 days</option>
              <option value={30}>Last 30 days</option>
              <option value={60}>Last 60 days</option>
            </select>
          </div>

          <div className="peak-hours-grid">
            {peakHours.slice(0, 10).map((hour, index) => (
              <div key={index} className="peak-hour-card">
                <div className="peak-rank">#{index + 1}</div>
                <div className="peak-time">{hour.time_range}</div>
                <div className="peak-count">{hour.booking_count} bookings</div>
                <div className="peak-seats">{hour.total_seats} seats</div>
                <div className="peak-party">{hour.avg_party_size} avg party</div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Restaurants */}
        <div className="analytics-section">
          <div className="section-header">
            <h2>Top Performing Restaurants</h2>
          </div>

          <div className="top-restaurants-table">
            <table>
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Restaurant</th>
                  <th>Cuisine</th>
                  <th>Total Bookings</th>
                  <th>Approved</th>
                  <th>Unique Customers</th>
                  <th>Reviews</th>
                  <th>Rating</th>
                </tr>
              </thead>
              <tbody>
                {topRestaurants.map((restaurant, index) => (
                  <tr key={restaurant.id}>
                    <td>
                      <div className="rank-badge">#{index + 1}</div>
                    </td>
                    <td>
                      <strong>{restaurant.name}</strong>
                    </td>
                    <td>
                      <span className="cuisine-tag">{restaurant.cuisine_type}</span>
                    </td>
                    <td>{restaurant.total_bookings}</td>
                    <td>
                      <span className="approved-count">{restaurant.approved_bookings}</span>
                    </td>
                    <td>{restaurant.unique_customers}</td>
                    <td>{restaurant.total_reviews}</td>
                    <td>
                      <div className="rating-display">
                        ⭐ {restaurant.avg_review_rating || 'N/A'}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Status Distribution */}
        {platformStats && (
          <div className="analytics-section">
            <div className="section-header">
              <h2>Booking Status Distribution</h2>
            </div>

            <div className="status-distribution">
              <div className="status-item">
                <div className="status-chart-bar status-bar-pending" 
                     style={{ width: `${(platformStats.pending_bookings / platformStats.total_bookings) * 100}%` }}>
                </div>
                <div className="status-info">
                  <span className="status-label">Pending</span>
                  <span className="status-value">{platformStats.pending_bookings}</span>
                  <span className="status-percent">
                    {((platformStats.pending_bookings / platformStats.total_bookings) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>

              <div className="status-item">
                <div className="status-chart-bar status-bar-approved" 
                     style={{ width: `${(platformStats.approved_bookings / platformStats.total_bookings) * 100}%` }}>
                </div>
                <div className="status-info">
                  <span className="status-label">Approved</span>
                  <span className="status-value">{platformStats.approved_bookings}</span>
                  <span className="status-percent">
                    {((platformStats.approved_bookings / platformStats.total_bookings) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>

              <div className="status-item">
                <div className="status-chart-bar status-bar-completed" 
                     style={{ width: `${(platformStats.completed_bookings / platformStats.total_bookings) * 100}%` }}>
                </div>
                <div className="status-info">
                  <span className="status-label">Completed</span>
                  <span className="status-value">{platformStats.completed_bookings}</span>
                  <span className="status-percent">
                    {((platformStats.completed_bookings / platformStats.total_bookings) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Analytics;