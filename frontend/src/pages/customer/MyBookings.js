import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import bookingService from '../../services/bookingService';
import './MyBookings.css';

const MyBookings = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancellingId, setCancellingId] = useState(null);

  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      // Clear the message after showing it
      window.history.replaceState({}, document.title);
    }
    fetchBookings();
  }, []);

  useEffect(() => {
    filterBookings();
  }, [statusFilter, bookings]);

  const fetchBookings = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await bookingService.getMyBookings();
      setBookings(response.data.bookings);
    } catch (err) {
      setError('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const filterBookings = () => {
    if (statusFilter === 'all') {
      setFilteredBookings(bookings);
    } else {
      setFilteredBookings(bookings.filter(b => b.status === statusFilter));
    }
  };

  const handleViewDetails = async (bookingId) => {
    try {
      const response = await bookingService.getById(bookingId);
      setSelectedBooking(response.data.booking);
      setShowDetailsModal(true);
    } catch (err) {
      setError('Failed to load booking details');
    }
  };

  const handleCancelBooking = async () => {
    if (!cancellingId) return;

    try {
      const response = await bookingService.cancel(cancellingId);
      if (response.success) {
        setSuccessMessage('Booking cancelled successfully');
        setShowCancelModal(false);
        setCancellingId(null);
        fetchBookings();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to cancel booking');
      setShowCancelModal(false);
    }
  };

  const openCancelModal = (bookingId) => {
    setCancellingId(bookingId);
    setShowCancelModal(true);
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      pending: 'status-pending',
      approved: 'status-approved',
      rejected: 'status-rejected',
      cancelled: 'status-cancelled',
      completed: 'status-completed'
    };

    return (
      <span className={`status-badge ${statusClasses[status]}`}>
        {status.toUpperCase()}
      </span>
    );
  };

  const canCancelBooking = (booking) => {
    return booking.status === 'pending' || booking.status === 'approved';
  };

  const canReviewBooking = (booking) => {
    return booking.status === 'approved' || booking.status === 'completed';
  };

  return (
    <div className="my-bookings-page">
      <div className="bookings-container">
        <div className="bookings-header">
          <h1>My Bookings</h1>
          <button 
            className="btn-new-booking"
            onClick={() => navigate('/customer/restaurants')}
          >
            + New Booking
          </button>
        </div>

        {successMessage && (
          <div className="alert alert-success">
            {successMessage}
            <button onClick={() => setSuccessMessage('')}>×</button>
          </div>
        )}

        {error && (
          <div className="alert alert-error">
            {error}
            <button onClick={() => setError('')}>×</button>
          </div>
        )}

        {/* Status Filter */}
        <div className="filter-tabs">
          <button 
            className={`filter-tab ${statusFilter === 'all' ? 'active' : ''}`}
            onClick={() => setStatusFilter('all')}
          >
            All ({bookings.length})
          </button>
          <button 
            className={`filter-tab ${statusFilter === 'pending' ? 'active' : ''}`}
            onClick={() => setStatusFilter('pending')}
          >
            Pending ({bookings.filter(b => b.status === 'pending').length})
          </button>
          <button 
            className={`filter-tab ${statusFilter === 'approved' ? 'active' : ''}`}
            onClick={() => setStatusFilter('approved')}
          >
            Approved ({bookings.filter(b => b.status === 'approved').length})
          </button>
          <button 
            className={`filter-tab ${statusFilter === 'completed' ? 'active' : ''}`}
            onClick={() => setStatusFilter('completed')}
          >
            Completed ({bookings.filter(b => b.status === 'completed').length})
          </button>
        </div>

        {/* Bookings List */}
        {loading ? (
          <div className="loading">Loading your bookings...</div>
        ) : filteredBookings.length === 0 ? (
          <div className="no-bookings">
            <div className="no-bookings-icon">📅</div>
            <h3>No bookings found</h3>
            <p>Start exploring restaurants and make your first reservation!</p>
            <button 
              className="btn-browse"
              onClick={() => navigate('/customer/restaurants')}
            >
              Browse Restaurants
            </button>
          </div>
        ) : (
          <div className="bookings-list">
            {filteredBookings.map((booking) => (
              <div key={booking.id} className="booking-card">
                <div className="booking-main">
                  <img 
                    src={booking.restaurant_image || 'https://via.placeholder.com/150'}
                    alt={booking.restaurant_name}
                    className="booking-image"
                  />
                  
                  <div className="booking-info">
                    <div className="booking-title">
                      <h3>{booking.restaurant_name}</h3>
                      {getStatusBadge(booking.status)}
                    </div>

                    <div className="booking-details">
                      <div className="detail-item">
                        <span className="detail-icon">📅</span>
                        <span>{new Date(booking.booking_date).toLocaleDateString('en-IN', {
                          weekday: 'short',
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}</span>
                      </div>

                      <div className="detail-item">
                        <span className="detail-icon">🕒</span>
                        <span>{booking.booking_time.slice(0, 5)}</span>
                      </div>

                      <div className="detail-item">
                        <span className="detail-icon">👥</span>
                        <span>{booking.number_of_seats} Guest{booking.number_of_seats > 1 ? 's' : ''}</span>
                      </div>

                      <div className="detail-item">
                        <span className="detail-icon">🔖</span>
                        <span>{booking.booking_reference}</span>
                      </div>
                    </div>

                    {booking.special_requests && (
                      <div className="special-requests">
                        <strong>Special Requests:</strong> {booking.special_requests}
                      </div>
                    )}
                  </div>
                </div>

                <div className="booking-actions">
                  <button 
                    className="btn-action btn-details"
                    onClick={() => handleViewDetails(booking.id)}
                  >
                    View Details
                  </button>

                  {canReviewBooking(booking) && (
                    <button 
                      className="btn-action btn-review"
                      onClick={() => navigate('/customer/my-reviews', { state: { bookingId: booking.id } })}
                    >
                      Write Review
                    </button>
                  )}

                  {canCancelBooking(booking) && (
                    <button 
                      className="btn-action btn-cancel"
                      onClick={() => openCancelModal(booking.id)}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Booking Details Modal */}
      {showDetailsModal && selectedBooking && (
        <div className="modal-overlay" onClick={() => setShowDetailsModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Booking Details</h2>
              <button className="modal-close" onClick={() => setShowDetailsModal(false)}>×</button>
            </div>

            <div className="modal-body">
              <div className="detail-section">
                <h3>{selectedBooking.restaurant_name}</h3>
                <p>{selectedBooking.restaurant_address}</p>
              </div>

              <div className="detail-section">
                <div className="detail-grid">
                  <div>
                    <strong>Booking Reference:</strong>
                    <p>{selectedBooking.booking_reference}</p>
                  </div>
                  <div>
                    <strong>Status:</strong>
                    <p>{getStatusBadge(selectedBooking.status)}</p>
                  </div>
                  <div>
                    <strong>Date:</strong>
                    <p>{new Date(selectedBooking.booking_date).toLocaleDateString('en-IN', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}</p>
                  </div>
                  <div>
                    <strong>Time:</strong>
                    <p>{selectedBooking.booking_time.slice(0, 5)}</p>
                  </div>
                  <div>
                    <strong>Guests:</strong>
                    <p>{selectedBooking.number_of_seats}</p>
                  </div>
                  {selectedBooking.dietary_preference && (
                    <div>
                      <strong>Dietary Preference:</strong>
                      <p>{selectedBooking.dietary_preference}</p>
                    </div>
                  )}
                </div>
              </div>

              {selectedBooking.special_requests && (
                <div className="detail-section">
                  <strong>Special Requests:</strong>
                  <p>{selectedBooking.special_requests}</p>
                </div>
              )}

              {selectedBooking.menu_items && selectedBooking.menu_items.length > 0 && (
                <div className="detail-section">
                  <strong>Pre-ordered Items:</strong>
                  <div className="menu-items-list">
                    {selectedBooking.menu_items.map((item, index) => (
                      <div key={index} className="menu-item-detail">
                        <span>{item.name} x {item.quantity}</span>
                        <span>₹{(item.price_at_booking * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedBooking.admin_notes && (
                <div className="detail-section admin-notes">
                  <strong>Admin Notes:</strong>
                  <p>{selectedBooking.admin_notes}</p>
                </div>
              )}

              <div className="detail-section">
                <small className="text-muted">
                  Booked on: {new Date(selectedBooking.created_at).toLocaleString('en-IN')}
                </small>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {showCancelModal && (
        <div className="modal-overlay" onClick={() => setShowCancelModal(false)}>
          <div className="modal-content modal-small" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Cancel Booking</h2>
              <button className="modal-close" onClick={() => setShowCancelModal(false)}>×</button>
            </div>

            <div className="modal-body">
              <p>Are you sure you want to cancel this booking?</p>
              <p className="warning-text">This action cannot be undone.</p>
            </div>

            <div className="modal-footer">
              <button 
                className="btn-modal btn-secondary"
                onClick={() => setShowCancelModal(false)}
              >
                No, Keep It
              </button>
              <button 
                className="btn-modal btn-danger"
                onClick={handleCancelBooking}
              >
                Yes, Cancel Booking
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBookings;