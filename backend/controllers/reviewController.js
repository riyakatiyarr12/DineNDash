const Review = require('../models/Review');
const ReviewService = require('../services/reviewService');
const { successResponse, errorResponse } = require('../utils/responseHandler');

// @desc    Submit a review
// @route   POST /api/reviews
// @access  Private (Customer)
const submitReview = async (req, res) => {
  try {
    const { booking_id, rating, comment } = req.body;
    const user_id = req.user.id;

    // Validate review eligibility
    let booking;
    try {
      booking = await ReviewService.validateReview(user_id, booking_id);
    } catch (validationError) {
      return errorResponse(res, 400, validationError.message);
    }

    // Create review
    const reviewId = await Review.create({
      user_id,
      restaurant_id: booking.restaurant_id,
      booking_id,
      rating,
      comment: comment || null
    });

    // Get created review
    const db = require('../config/database');
    const [reviews] = await db.query(
      `SELECT r.*, u.name as user_name, res.name as restaurant_name
       FROM reviews r
       LEFT JOIN users u ON r.user_id = u.id
       LEFT JOIN restaurants res ON r.restaurant_id = res.id
       WHERE r.id = ?`,
      [reviewId]
    );

    return successResponse(res, 201, 'Review submitted successfully', {
      review: reviews[0]
    });

  } catch (error) {
    console.error('Submit review error:', error);
    return errorResponse(res, 500, 'Failed to submit review');
  }
};

// @desc    Get reviews by restaurant
// @route   GET /api/reviews/restaurant/:restaurantId
// @access  Public
const getReviewsByRestaurant = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const { rating } = req.query;

    let reviews = await Review.findByRestaurantId(restaurantId);

    // Filter by rating if provided
    if (rating) {
      reviews = reviews.filter(r => r.rating === parseInt(rating));
    }

    // Calculate rating distribution
    const ratingDistribution = {
      5: reviews.filter(r => r.rating === 5).length,
      4: reviews.filter(r => r.rating === 4).length,
      3: reviews.filter(r => r.rating === 3).length,
      2: reviews.filter(r => r.rating === 2).length,
      1: reviews.filter(r => r.rating === 1).length
    };

    // Calculate average rating
    const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
    const averageRating = reviews.length > 0 
      ? (totalRating / reviews.length).toFixed(2) 
      : 0;

    return successResponse(res, 200, 'Reviews retrieved successfully', {
      total_reviews: reviews.length,
      average_rating: parseFloat(averageRating),
      rating_distribution: ratingDistribution,
      reviews
    });

  } catch (error) {
    console.error('Get reviews error:', error);
    return errorResponse(res, 500, 'Failed to retrieve reviews');
  }
};

// @desc    Get user's reviews
// @route   GET /api/reviews/my-reviews
// @access  Private (Customer)
const getMyReviews = async (req, res) => {
  try {
    const user_id = req.user.id;

    const db = require('../config/database');
    const [reviews] = await db.query(
      `SELECT r.*, res.name as restaurant_name, res.image_url as restaurant_image,
              b.booking_reference, b.booking_date
       FROM reviews r
       LEFT JOIN restaurants res ON r.restaurant_id = res.id
       LEFT JOIN bookings b ON r.booking_id = b.id
       WHERE r.user_id = ?
       ORDER BY r.created_at DESC`,
      [user_id]
    );

    return successResponse(res, 200, 'Your reviews retrieved successfully', {
      count: reviews.length,
      reviews
    });

  } catch (error) {
    console.error('Get my reviews error:', error);
    return errorResponse(res, 500, 'Failed to retrieve your reviews');
  }
};

// @desc    Check if user can review a booking
// @route   GET /api/reviews/can-review/:bookingId
// @access  Private (Customer)
const checkCanReview = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const user_id = req.user.id;

    const canReview = await Review.canUserReview(user_id, bookingId);

    if (canReview) {
      return successResponse(res, 200, 'You can review this booking', {
        can_review: true
      });
    } else {
      return successResponse(res, 200, 'You cannot review this booking', {
        can_review: false,
        reason: 'Review already exists or booking not eligible'
      });
    }

  } catch (error) {
    console.error('Check can review error:', error);
    return errorResponse(res, 500, 'Failed to check review eligibility');
  }
};

// @desc    Update review
// @route   PUT /api/reviews/:id
// @access  Private (Customer)
const updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;
    const user_id = req.user.id;

    // Check if review exists and belongs to user
    const db = require('../config/database');
    const [reviews] = await db.query(
      'SELECT * FROM reviews WHERE id = ? AND user_id = ?',
      [id, user_id]
    );

    if (reviews.length === 0) {
      return errorResponse(res, 404, 'Review not found or access denied');
    }

    // Update review
    await db.query(
      'UPDATE reviews SET rating = ?, comment = ?, updated_at = NOW() WHERE id = ?',
      [rating, comment || null, id]
    );

    // Get updated review
    const [updatedReviews] = await db.query(
      `SELECT r.*, u.name as user_name, res.name as restaurant_name
       FROM reviews r
       LEFT JOIN users u ON r.user_id = u.id
       LEFT JOIN restaurants res ON r.restaurant_id = res.id
       WHERE r.id = ?`,
      [id]
    );

    return successResponse(res, 200, 'Review updated successfully', {
      review: updatedReviews[0]
    });

  } catch (error) {
    console.error('Update review error:', error);
    return errorResponse(res, 500, 'Failed to update review');
  }
};

// @desc    Delete review
// @route   DELETE /api/reviews/:id
// @access  Private (Customer)
const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;

    // Check if review exists and belongs to user
    const db = require('../config/database');
    const [reviews] = await db.query(
      'SELECT * FROM reviews WHERE id = ? AND user_id = ?',
      [id, user_id]
    );

    if (reviews.length === 0) {
      return errorResponse(res, 404, 'Review not found or access denied');
    }

    // Delete review
    await db.query('DELETE FROM reviews WHERE id = ?', [id]);

    return successResponse(res, 200, 'Review deleted successfully');

  } catch (error) {
    console.error('Delete review error:', error);
    return errorResponse(res, 500, 'Failed to delete review');
  }
};

// @desc    Get all reviews (Admin)
// @route   GET /api/reviews
// @access  Private (Admin)
const getAllReviews = async (req, res) => {
  try {
    const { restaurant_id, rating } = req.query;

    const db = require('../config/database');
    let query = `
      SELECT r.*, u.name as user_name, u.email as user_email,
             res.name as restaurant_name, b.booking_reference
      FROM reviews r
      LEFT JOIN users u ON r.user_id = u.id
      LEFT JOIN restaurants res ON r.restaurant_id = res.id
      LEFT JOIN bookings b ON r.booking_id = b.id
      WHERE 1=1
    `;
    const params = [];

    if (restaurant_id) {
      query += ' AND r.restaurant_id = ?';
      params.push(restaurant_id);
    }

    if (rating) {
      query += ' AND r.rating = ?';
      params.push(rating);
    }

    query += ' ORDER BY r.created_at DESC';

    const [reviews] = await db.query(query, params);

    return successResponse(res, 200, 'All reviews retrieved successfully', {
      count: reviews.length,
      reviews
    });

  } catch (error) {
    console.error('Get all reviews error:', error);
    return errorResponse(res, 500, 'Failed to retrieve reviews');
  }
};

module.exports = {
  submitReview,
  getReviewsByRestaurant,
  getMyReviews,
  checkCanReview,
  updateReview,
  deleteReview,
  getAllReviews
};