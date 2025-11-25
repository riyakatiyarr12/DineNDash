import React, { useState, useEffect } from 'react';
import reviewService from '../../services/reviewService';
import './RestaurantReviews.css';

const RestaurantReviews = ({ restaurantId }) => {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ratingFilter, setRatingFilter] = useState(null);

  useEffect(() => {
    fetchReviews();
  }, [restaurantId, ratingFilter]);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const response = await reviewService.getByRestaurant(restaurantId, ratingFilter);
      setReviews(response.data.reviews);
      setStats({
        total: response.data.total_reviews,
        average: response.data.average_rating,
        distribution: response.data.rating_distribution
      });
    } catch (err) {
      console.error('Failed to load reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating) => {
    return (
      <div className="stars-display">
        {[1, 2, 3, 4, 5].map((star) => (
          <span key={star} className={`star ${star <= rating ? 'filled' : ''}`}>
            ★
          </span>
        ))}
      </div>
    );
  };

  const renderRatingBar = (count, total) => {
    const percentage = total > 0 ? (count / total) * 100 : 0;
    return (
      <div className="rating-bar">
        <div className="rating-bar-fill" style={{ width: `${percentage}%` }}></div>
      </div>
    );
  };

  if (loading) {
    return <div className="reviews-loading">Loading reviews...</div>;
  }

  return (
    <div className="restaurant-reviews">
      {stats && stats.total > 0 ? (
        <>
          {/* Rating Summary */}
          <div className="rating-summary">
            <div className="average-rating">
              <div className="rating-number">{stats.average}</div>
              {renderStars(Math.round(stats.average))}
              <div className="total-reviews">{stats.total} reviews</div>
            </div>

            <div className="rating-distribution">
              {[5, 4, 3, 2, 1].map((rating) => (
                <div 
                  key={rating} 
                  className="distribution-row"
                  onClick={() => setRatingFilter(ratingFilter === rating ? null : rating)}
                  style={{ cursor: 'pointer' }}
                >
                  <span className="rating-label">{rating} ⭐</span>
                  {renderRatingBar(stats.distribution[rating], stats.total)}
                  <span className="rating-count">{stats.distribution[rating]}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Filter Info */}
          {ratingFilter && (
            <div className="filter-info">
              Showing {ratingFilter}-star reviews
              <button onClick={() => setRatingFilter(null)}>Clear filter</button>
            </div>
          )}

          {/* Reviews List */}
          <div className="reviews-display-list">
            {reviews.length === 0 ? (
              <p className="no-filtered-reviews">No reviews found for this filter</p>
            ) : (
              reviews.map((review) => (
                <div key={review.id} className="review-item">
                  <div className="review-header-display">
                    <div className="reviewer-info">
                      <div className="reviewer-avatar">
                        {review.user_name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="reviewer-name">{review.user_name}</div>
                        <div className="review-date-display">
                          {new Date(review.created_at).toLocaleDateString('en-IN', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </div>
                      </div>
                    </div>
                    {renderStars(review.rating)}
                  </div>
                  <div className="review-comment">{review.comment}</div>
                </div>
              ))
            )}
          </div>
        </>
      ) : (
        <div className="no-reviews-yet">
          <p>No reviews yet. Be the first to review!</p>
        </div>
      )}
    </div>
  );
};

export default RestaurantReviews;