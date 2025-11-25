const express = require('express');
const router = express.Router();
const {
  submitReview,
  getReviewsByRestaurant,
  getMyReviews,
  checkCanReview,
  updateReview,
  deleteReview,
  getAllReviews
} = require('../controllers/reviewController');
const {
  submitReviewValidation,
  updateReviewValidation,
  reviewIdValidation,
  restaurantIdValidation,
  bookingIdValidation,
  handleValidationErrors
} = require('../validators/reviewValidator');
const { authenticate, isAdmin, isCustomer } = require('../middleware/authMiddleware');

// Public routes
router.get(
  '/restaurant/:restaurantId',
  restaurantIdValidation,
  handleValidationErrors,
  getReviewsByRestaurant
);

// Customer routes
router.post(
  '/',
  authenticate,
  isCustomer,
  submitReviewValidation,
  handleValidationErrors,
  submitReview
);

router.get('/my-reviews', authenticate, isCustomer, getMyReviews);

router.get(
  '/can-review/:bookingId',
  authenticate,
  isCustomer,
  bookingIdValidation,
  handleValidationErrors,
  checkCanReview
);

router.put(
  '/:id',
  authenticate,
  isCustomer,
  updateReviewValidation,
  handleValidationErrors,
  updateReview
);

router.delete(
  '/:id',
  authenticate,
  isCustomer,
  reviewIdValidation,
  handleValidationErrors,
  deleteReview
);

// Admin routes
router.get('/', authenticate, isAdmin, getAllReviews);

module.exports = router;