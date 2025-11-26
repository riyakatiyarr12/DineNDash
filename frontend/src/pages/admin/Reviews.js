import React, { useState, useEffect } from 'react';
import adminService from '../../services/adminService';
import restaurantService from '../../services/restaurantService';
import './Reviews.css';

const Reviews = () => {
    const [reviews, setReviews] = useState([]);
    const [restaurants, setRestaurants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [filters, setFilters] = useState({
        restaurant_id: '',
        rating: ''
    });

    useEffect(() => {
        fetchRestaurants();
        fetchReviews();
    }, [filters]);

    const fetchRestaurants = async () => {
        try {
            const response = await restaurantService.getAll();
            setRestaurants(response.data.restaurants);
        } catch (err) {
            console.error('Failed to fetch restaurants:', err);
        }
    };

    const fetchReviews = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await adminService.getAllReviews(filters);
            setReviews(response.data.reviews);
        } catch (err) {
            setError('Failed to load reviews');
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters({ ...filters, [name]: value });
    };

    const renderStars = (rating) => {
        return (
            <div className="stars-display-admin">
                {[1, 2, 3, 4, 5].map((star) => (
                    <span key={star} className={`star ${star <= rating ? 'filled' : ''}`}>
                        ⭐
                    </span>
                ))}
            </div>
        );
    };

    return (
        <div className="admin-reviews-page">
            <div className="reviews-admin-container">
                <div className="page-header">
                    <h1>Customer Reviews</h1>
                    <p>Monitor and manage all customer reviews</p>
                </div>

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
                        <select
                            name="rating"
                            value={filters.rating}
                            onChange={handleFilterChange}
                            className="filter-select"
                        >
                            <option value="">All Ratings</option>
                            <option value="5">5 Stars</option>
                            <option value="4">4 Stars</option>
                            <option value="3">3 Stars</option>
                            <option value="2">2 Stars</option>
                            <option value="1">1 Star</option>
                        </select>

                        {(filters.restaurant_id || filters.rating) && (
                            <button
                                className="btn-clear-filters"
                                onClick={() => setFilters({ restaurant_id: '', rating: '' })}
                            >
                                Clear Filters
                            </button>
                        )}
                    </div>
                </div>

                {/* Reviews List */}
                {loading ? (
                    <div className="loading">Loading reviews...</div>
                ) : reviews.length === 0 ? (
                    <div className="no-reviews">
                        <div className="no-reviews-icon">⭐</div>
                        <h3>No reviews found</h3>
                        <p>Try adjusting your filters</p>
                    </div>
                ) : (
                    <div className="reviews-admin-grid">
                        {reviews.map((review) => (
                            <div key={review.id} className="review-admin-card">
                                <div className="review-admin-header">
                                    <div className="reviewer-details">
                                        <div className="reviewer-avatar-admin">
                                            {review.user_name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <div className="reviewer-name-admin">{review.user_name}</div>
                                            <div className="reviewer-email-admin">{review.user_email}</div>
                                        </div>
                                    </div>
                                    {renderStars(review.rating)}
                                </div>

                                <div className="review-admin-body">
                                    <div className="restaurant-info-review">
                                        <strong>{review.restaurant_name}</strong>
                                    </div>
                                    <p className="review-comment-admin">{review.comment}</p>
                                </div>

                                <div className="review-admin-footer">
                                    <span className="booking-ref-review">
                                        Booking: {review.booking_reference}
                                    </span>
                                    <span className="review-date-admin">
                                        {new Date(review.created_at).toLocaleDateString('en-IN', {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric'
                                        })}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Statistics */}
                {reviews.length > 0 && (
                    <div className="reviews-stats">
                        <h3>Reviews Statistics</h3>
                        <div className="stats-grid-reviews">
                            <div className="stat-box">
                                <div className="stat-number">{reviews.length}</div>
                                <div className="stat-text">Total Reviews</div>
                            </div>
                            <div className="stat-box">
                                <div className="stat-number">
                                    {(reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(2)}
                                </div>
                                <div className="stat-text">Average Rating</div>
                            </div>
                            <div className="stat-box">
                                <div className="stat-number">
                                    {reviews.filter(r => r.rating === 5).length}
                                </div>
                                <div className="stat-text">5-Star Reviews</div>
                            </div>
                            <div className="stat-box">
                                <div className="stat-number">
                                    {new Set(reviews.map(r => r.restaurant_id)).size}
                                </div>
                                <div className="stat-text">Restaurants Reviewed</div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
export default Reviews;