import React, { useState, useEffect } from 'react';
import analyticsService from '../../services/analyticsService';
import './RestaurantAnalytics.css'; const RestaurantAnalytics = ({ restaurantId }) => {
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedPeriod, setSelectedPeriod] = useState(30); useEffect(() => {
        fetchAnalytics();
    }, [restaurantId, selectedPeriod]); const fetchAnalytics = async () => {
        setLoading(true);
        try {
            const response = await analyticsService.getRestaurantBusyTimes(restaurantId, selectedPeriod);
            setAnalytics(response.data);
        } catch (err) {
            console.error('Failed to load analytics:', err);
        } finally {
            setLoading(false);
        }
    }; const getBusyLevelColor = (level) => {
        switch (level) {
            case 'High':
                return '#e53e3e';
            case 'Medium':
                return '#f59e0b';
            case 'Low':
                return '#48bb78';
            default:
                return '#cbd5e0';
        }
    }; const getBusyLevelIcon = (level) => {
        switch (level) {
            case 'High':
                return '🔴';
            case 'Medium':
                return '🟡';
            case 'Low':
                return '🟢';
            default:
                return '⚪';
        }
    };
    if (loading) {
        return <div className="analytics-loading">Loading analytics...</div>;
    } if (!analytics) {
        return null;
    } return (
        <div className="restaurant-analytics">
            <div className="analytics-header">
                <h3>Restaurant Busy Times</h3>
                <select
                    value={selectedPeriod}
                    onChange={(e) => setSelectedPeriod(parseInt(e.target.value))}
                    className="period-select"
                >
                    <option value={7}>Last 7 days</option>
                    <option value={30}>Last 30 days</option>
                    <option value={60}>Last 60 days</option>
                </select>
            </div>
            <p className="analytics-description">
                Based on {analytics.period_days} days of booking data
            </p>
            {/* Hourly Pattern */}
            <div className="analytics-section">
                <h4>Hourly Patterns</h4>
                <div className="busy-times-grid">
                    {analytics.hourly_pattern.map((slot) => (
                        <div
                            key={slot.hour}
                            className="busy-time-slot"
                            style={{ borderColor: getBusyLevelColor(slot.busy_level) }}
                        >
                            <div className="slot-time">{slot.hour_display}</div>
                            <div className="slot-level">
                                <span>{getBusyLevelIcon(slot.busy_level)}</span>
                                <span>{slot.busy_level}</span>
                            </div>
                            <div className="slot-count">{slot.booking_count} bookings</div>
                        </div>
                    ))}
                </div>
            </div>
            {/* Day-wise Pattern */}
            {analytics.day_wise_pattern && analytics.day_wise_pattern.length > 0 && (
                <div className="analytics-section">
                    <h4>Day-wise Patterns</h4>
                    <div className="day-wise-grid">
                        {analytics.day_wise_pattern.map((day) => (
                            <div key={day.day_name} className="day-card">
                                <div className="day-name">{day.day_name}</div>
                                <div className="day-bookings">{day.booking_count} bookings</div>
                                <div className="day-seats">{day.total_seats} seats</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            {/* Insights */}
            {analytics.insights && (
                <div className="insights-section">
                    <h4>Insights</h4>
                    <div className="insights-grid">
                        {analytics.insights.busiest_hour !== null && (
                            <div className="insight-card">
                                <div className="insight-icon">📈</div>
                                <div className="insight-content">
                                    <div className="insight-label">Busiest Hour</div>
                                    <div className="insight-value">
                                        {analytics.insights.busiest_hour}:00 - {analytics.insights.busiest_hour + 1}:00
                                    </div>
                                </div>
                            </div>
                        )}
                        {analytics.insights.quietest_hour !== null && (
                            <div className="insight-card">
                                <div className="insight-icon">📉</div>
                                <div className="insight-content">
                                    <div className="insight-label">Quietest Hour</div>
                                    <div className="insight-value">
                                        {analytics.insights.quietest_hour}:00 - {analytics.insights.quietest_hour + 1}:00
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}; export default RestaurantAnalytics;