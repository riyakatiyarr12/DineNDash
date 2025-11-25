import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import reviewService from '../../services/reviewService';
import bookingService from '../../services/bookingService';
import './MyReviews.css';

const MyReviews = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [eligibleBookings, setEligibleBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [reviewForm, setReviewForm] = useState({
    booking_id: '',
    rating: 5,
    comment: ''
  });

  useEffect(() => {
    fetchReviews();
    fetchEligibleBookings();

    // Check if redirected from bookings with bookingId
    if (location.state?.bookingId) {
      openReviewModal(location.state.bookingId);
    }
  }, []);

  const fetchReviews = async () => {
    try {
      const response = await reviewService.getMyReviews();
      setReviews(response.data.reviews);
    } catch (err) {
      setError('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const fetchEligibleBookings = async () => {
    try {
      const response = await bookingService.getMyBookings();
      // Filter approved/completed bookings
      const eligible = response.data.bookings.filter(
        b => b.status === 'approved' || b.status === 'completed'
      );
      setEligibleBookings(eligible);
    } catch (err) {
      console.error('Failed to load bookings:', err);
    }
  };

  const openReviewModal = (bookingId = null) => {
    if (bookingId) {
      const booking = eligibleBookings.find(b => b.id === bookingId);
      setSelectedBooking(booking);
      setReviewForm({
        booking_id: bookingId,
        rating: 5,
        comment: ''
      });
    }
    setShowReviewModal(true);
  };

  const closeReviewModal = () => {
    setShowReviewModal(false);
    setSelectedBooking(null);
    setReviewForm({
      booking_id: '',
      rating: 5,
      comment: ''
    });
  };

  const handleRatingChange = (rating) => {
    setReviewForm({ ...reviewForm, rating });
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setError('');

    if (reviewForm.comment.length < 10) {
      setError('Comment must be at least 10 characters long');
      return;
    }

    try {
      const response = await reviewService.submit(reviewForm);
      if (response.success) {
        setSuccessMessage('Review submitted successfully!');
        setShowReviewModal(false);
        fetchReviews();
        fetchEligibleBookings();
        setTimeout(() => setSuccessMessage(''), 5000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit review');
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) {
      return;
    }

    try {
      await reviewService.delete(reviewId);
      setSuccessMessage('Review deleted successfully');
      fetchReviews();
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (err) {
      setError('Failed to delete review');
    }
  };

  const renderStars = (rating, interactive = false, onRatingChange = null) => {
    return (
      <div className="stars">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`star ${star <= rating ? 'filled' : ''} ${interactive ? 'interactive' : ''}`}
            onClick={() => interactive && onRatingChange && onRatingChange(star)}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  // Filter out bookings that already have reviews
  const reviewedBookingIds = reviews.map(r => r.booking_id);
  const unreviewed = eligibleBookings.filter(b => !reviewedBookingIds.includes(b.id));

  return (
    <div className="my-reviews-page">
      <div className="reviews-container">
        <div className="reviews-header">
          <h1>My Reviews</h1>
          {unreviewed.length > 0 && (
            <button 
              className="btn-write-review"
              onClick={() => openReviewModal()}
            >
              + Write Review
            </button>
          )}
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

        {/* Unreviewed Bookings */}
        {unreviewed.length > 0 && (
          <div className="unreviewed-section">
            <h2>Bookings Pending Review</h2>
            <div className="unreviewed-grid">
              {unreviewed.map((booking) => (
                <div key={booking.id} className="unreviewed-card">
                  <img 
                    src={booking.restaurant_image || 'https://via.placeholder.com/100'}
                    alt={booking.restaurant_name}
                  />
                  <div className="unreviewed-info">
                    <h3>{booking.restaurant_name}</h3>
                    <p>{new Date(booking.booking_date).toLocaleDateString('en-IN')}</p>
                  </div>
                  <button 
                    className="btn-review-now"
                    onClick={() => openReviewModal(booking.id)}
                  >
                    Review
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* My Reviews */}
        {loading ? (
          <div className="loading">Loading your reviews...</div>
        ) : reviews.length === 0 ? (
          <div className="no-reviews">
            <div className="no-reviews-icon">⭐</div>
            <h3>No reviews yet</h3>
            <p>Share your dining experiences by writing reviews!</p>
          </div>
        ) : (
          <div className="reviews-section">
            <h2>My Reviews ({reviews.length})</h2>
            <div className="reviews-list">
              {reviews.map((review) => (
                <div key={review.id} className="review-card">
                  <div className="review-header-card">
                    <img 
                      src={review.restaurant_image || 'https://via.placeholder.com/80'}
                      alt={review.restaurant_name}
                      className="review-restaurant-img"
                    />
                    <div className="review-header-info">
                      <h3>{review.restaurant_name}</h3>
                      {renderStars(review.rating)}
                      <p className="review-date">
                        Reviewed on {new Date(review.created_at).toLocaleDateString('en-IN', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="review-content">
                    <p>{review.comment}</p>
                  </div>

                  <div className="review-actions">
                    <button 
                      className="btn-delete-review"
                      onClick={() => handleDeleteReview(review.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Write Review Modal */}
      {showReviewModal && (
        <div className="modal-overlay" onClick={closeReviewModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Write a Review</h2>
              <button className="modal-close" onClick={closeReviewModal}>×</button>
            </div>

            <form onSubmit={handleSubmitReview}>
              <div className="modal-body">
                {/* Booking Selection */}
                {!selectedBooking ? (
                  <div className="form-group">
                    <label>Select Booking</label>
                    <select
                      value={reviewForm.booking_id}
                      onChange={(e) => {
                        const bookingId = parseInt(e.target.value);
                        const booking = unreviewed.find(b => b.id === bookingId);
                        setSelectedBooking(booking);
                        setReviewForm({ ...reviewForm, booking_id: bookingId });
                      }}
                      className="form-input"
                      required
                    >
                      <option value="">Choose a booking...</option>
                      {unreviewed.map(booking => (
                        <option key={booking.id} value={booking.id}>
                          {booking.restaurant_name} - {new Date(booking.booking_date).toLocaleDateString('en-IN')}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div className="selected-booking">
                    <img 
                      src={selectedBooking.restaurant_image || 'https://via.placeholder.com/80'}
                      alt={selectedBooking.restaurant_name}
                    />
                    <div>
                      <h3>{selectedBooking.restaurant_name}</h3>
                      <p>{new Date(selectedBooking.booking_date).toLocaleDateString('en-IN')}</p>
                    </div>
                  </div>
                )}

                {/* Rating */}
                <div className="form-group">
                  <label>Your Rating</label>
                  <div className="rating-selector">
                    {renderStars(reviewForm.rating, true, handleRatingChange)}
                    <span className="rating-text">
                      {reviewForm.rating} {reviewForm.rating === 1 ? 'star' : 'stars'}
                    </span>
                  </div>
                </div>

                {/* Comment */}
                <div className="form-group">
                  <label>Your Review</label>
                  <textarea
                    value={reviewForm.comment}
                    onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                    className="form-textarea"
                    rows="6"
                    placeholder="Share your experience... (minimum 10 characters)"
                    required
                  />
                  <small>{reviewForm.comment.length} characters</small>
                </div>
              </div>

              <div className="modal-footer">
                <button 
                  type="button"
                  className="btn-modal btn-secondary"
                  onClick={closeReviewModal}
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="btn-modal btn-primary"
                  disabled={!reviewForm.booking_id || reviewForm.comment.length < 10}
                >
                  Submit Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyReviews;