import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import adminService from '../../services/adminService';
import restaurantService from '../../services/restaurantService';
import bookingService from '../../services/bookingService';
import './Bookings.css';

const Bookings = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [bookings, setBookings] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [filters, setFilters] = useState({
    status: searchParams.get('status') || '',
    restaurant_id: '',
    date: ''
  });

  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionType, setActionType] = useState(''); // 'approve' or 'reject'
  const [adminNotes, setAdminNotes] = useState('');
  const [processingAction, setProcessingAction] = useState(false);

  useEffect(() => {
    fetchRestaurants();
    fetchBookings();
  }, [filters]);

  const fetchRestaurants = async () => {
    try {
      const response = await restaurantService.getAll();
      setRestaurants(response.data.restaurants);
    } catch (err) {
      console.error('Failed to fetch restaurants:', err);
    }
  };

  const fetchBookings = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await adminService.getAllBookings(filters);
      setBookings(response.data.bookings);
    } catch (err) {
      setError('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
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

  const openActionModal = (booking, type) => {
    setSelectedBooking(booking);
    setActionType(type);
    setAdminNotes('');
    setShowActionModal(true);
  };

  const closeActionModal = () => {
    setShowActionModal(false);
    setSelectedBooking(null);
    setActionType('');
    setAdminNotes('');
  };

  const handleAction = async () => {
    if (!selectedBooking) return;

    if (actionType === 'reject' && !adminNotes.trim()) {
      setError('Please provide a reason for rejection');
      return;
    }

    setProcessingAction(true);
    setError('');

    try {
      let response;
      if (actionType === 'approve') {
        response = await adminService.approveBooking(selectedBooking.id, adminNotes);
      } else {
        response = await adminService.rejectBooking(selectedBooking.id, adminNotes);
      }

      if (response.success) {
        setSuccessMessage(`Booking ${actionType === 'approve' ? 'approved' : 'rejected'} successfully`);
        closeActionModal();
        fetchBookings();
        setTimeout(() => setSuccessMessage(''), 5000);
      }
    } catch (err) {
      setError(err.response?.data?.message || `Failed to ${actionType} booking`);
    } finally {
      setProcessingAction(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      pending: 'status-badge-pending',
      approved: 'status-badge-approved',
      rejected: 'status-badge-rejected',
      cancelled: 'status-badge-cancelled',
      completed: 'status-badge-completed'
    };

    return (
      <span className={`status-badge ${statusClasses[status]}`}>
        {status.toUpperCase()}
      </span>
    );
  };

  const canTakeAction = (booking) => {
    return booking.status === 'pending';
  };

  return (
    <div className="admin-bookings-page">
      <div className="bookings-container">
        <div className="page-header">
          <h1>Manage Bookings</h1>
          <p>Review and manage all restaurant bookings</p>
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

        {/* Filters */}
        <div className="filters-section">
          <div className="filters-row">
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="filter-select"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="cancelled">Cancelled</option>
              <option value="completed">Completed</option>
            </select>

            <select
              name="restaurant_id"
              value={filters.restaurant_id}
              onChange={handleFilterChange}
              className="filter-select"
            >
              <option value="">All Restaurants</option>
              {restaurants.map((restaurant) => (
                <option key={restaurant.id} value={restaurant.id}>
                  {restaurant.name}
                </option>
              ))}
            </select>

            <input
              type="date"
              name="date"
              value={filters.date}
              onChange={handleFilterChange}
              className="filter-input"
              placeholder="Filter by date"
            />

            {(filters.status || filters.restaurant_id || filters.date) && (
              <button
                className="btn-clear-filters"
                onClick={() => setFilters({ status: '', restaurant_id: '', date: '' })}
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Bookings Table */}
        {loading ? (
          <div className="loading">Loading bookings...</div>
        ) : bookings.length === 0 ? (
          <div className="no-bookings">
            <div className="no-bookings-icon">📋</div>
            <h3>No bookings found</h3>
            <p>Try adjusting your filters</p>
          </div>
        ) : (
          <div className="bookings-table-container">
            <table className="bookings-table">
              <thead>
                <tr>
                  <th>Booking ID</th>
                  <th>Customer</th>
                  <th>Restaurant</th>
                  <th>Date & Time</th>
                  <th>Guests</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr key={booking.id}>
                    <td>
                      <span className="booking-ref">{booking.booking_reference}</span>
                    </td>
                    <td>
                      <div className="customer-info">
                        <div className="customer-name">{booking.user_name}</div>
                        <div className="customer-contact">{booking.user_email}</div>
                        <div className="customer-contact">{booking.user_phone}</div>
                      </div>
                    </td>
                    <td>
                      <div className="restaurant-info">
                        <div className="restaurant-name">{booking.restaurant_name}</div>
                        <div className="restaurant-cuisine">{booking.cuisine_type}</div>
                      </div>
                    </td>
                    <td>
                      <div className="datetime-info">
                        <div className="date">
                          {new Date(booking.booking_date).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </div>
                        <div className="time">{booking.booking_time.slice(0, 5)}</div>
                      </div>
                    </td>
                    <td>
                      <span className="guests-count">{booking.number_of_seats}</span>
                    </td>
                    <td>{getStatusBadge(booking.status)}</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn-action btn-view"
                          onClick={() => handleViewDetails(booking.id)}
                        >
                          View
                        </button>
                        {canTakeAction(booking) && (
                          <>
                            <button
                              className="btn-action btn-approve"
                              onClick={() => openActionModal(booking, 'approve')}
                            >
                              Approve
                            </button>
                            <button
                              className="btn-action btn-reject"
                              onClick={() => openActionModal(booking, 'reject')}
                            >
                              Reject
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Booking Details Modal */}
      {showDetailsModal && selectedBooking && (
        <div className="modal-overlay" onClick={() => setShowDetailsModal(false)}>
          <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Booking Details</h2>
              <button className="modal-close" onClick={() => setShowDetailsModal(false)}>×</button>
            </div>

            <div className="modal-body">
              <div className="detail-section">
                <div className="detail-row-flex">
                  <div className="detail-col">
                    <strong>Booking Reference:</strong>
                    <p>{selectedBooking.booking_reference}</p>
                  </div>
                  <div className="detail-col">
                    <strong>Status:</strong>
                    <p>{getStatusBadge(selectedBooking.status)}</p>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h3>Restaurant Information</h3>
                <p><strong>{selectedBooking.restaurant_name}</strong></p>
                <p>{selectedBooking.restaurant_address}</p>
              </div>

              <div className="detail-section">
                <h3>Customer Information</h3>
                <div className="detail-grid">
                  <div>
                    <strong>Name:</strong>
                    <p>{selectedBooking.user_name}</p>
                  </div>
                  <div>
                    <strong>Email:</strong>
                    <p>{selectedBooking.user_email}</p>
                  </div>
                  <div>
                    <strong>Phone:</strong>
                    <p>{selectedBooking.user_phone}</p>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h3>Booking Details</h3>
                <div className="detail-grid">
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
                <div className="detail-section admin-notes-section">
                  <strong>Admin Notes:</strong>
                  <p>{selectedBooking.admin_notes}</p>
                </div>
              )}

              <div className="detail-section">
                <small className="text-muted">
                  Booked on: {new Date(selectedBooking.created_at).toLocaleString('en-IN')}
                </small>
                {selectedBooking.approved_at && (
                  <small className="text-muted">
                    <br />Approved on: {new Date(selectedBooking.approved_at).toLocaleString('en-IN')}
                  </small>
                )}
              </div>
            </div>

            {canTakeAction(selectedBooking) && (
              <div className="modal-footer">
                <button
                  className="btn-modal btn-approve-modal"
                  onClick={() => {
                    setShowDetailsModal(false);
                    openActionModal(selectedBooking, 'approve');
                  }}
                >
                  Approve Booking
                </button>
                <button
                  className="btn-modal btn-reject-modal"
                  onClick={() => {
                    setShowDetailsModal(false);
                    openActionModal(selectedBooking, 'reject');
                  }}
                >
                  Reject Booking
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Action Confirmation Modal */}
      {showActionModal && selectedBooking && (
        <div className="modal-overlay" onClick={closeActionModal}>
          <div className="modal-content modal-small" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{actionType === 'approve' ? 'Approve' : 'Reject'} Booking</h2>
              <button className="modal-close" onClick={closeActionModal}>×</button>
            </div>

            <div className="modal-body">
              <div className="booking-summary">
                <p><strong>Booking:</strong> {selectedBooking.booking_reference}</p>
                <p><strong>Customer:</strong> {selectedBooking.user_name}</p>
                <p><strong>Restaurant:</strong> {selectedBooking.restaurant_name}</p>
                <p><strong>Date:</strong> {new Date(selectedBooking.booking_date).toLocaleDateString('en-IN')}</p>
              </div>

              <div className="form-group">
                <label>
                  Admin Notes {actionType === 'reject' && <span className="required">*</span>}
                </label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  className="form-textarea"
                  rows="4"
                  placeholder={
                    actionType === 'approve'
                      ? 'Optional notes for the customer...'
                      : 'Please provide a reason for rejection...'
                  }
                  required={actionType === 'reject'}
                />
              </div>

              {actionType === 'approve' && (
                <div className="confirmation-message">
                  <p>✅ This will confirm the booking and notify the customer.</p>
                </div>
              )}

              {actionType === 'reject' && (
                <div className="warning-message">
                  <p>⚠️ This will reject the booking and restore seat availability.</p>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button
                className="btn-modal btn-secondary"
                onClick={closeActionModal}
                disabled={processingAction}
              >
                Cancel
              </button>
              <button
                className={`btn-modal ${actionType === 'approve' ? 'btn-approve-modal' : 'btn-reject-modal'}`}
                onClick={handleAction}
                disabled={processingAction || (actionType === 'reject' && !adminNotes.trim())}
              >
                {processingAction ? 'Processing...' : `Confirm ${actionType === 'approve' ? 'Approval' : 'Rejection'}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Bookings;