const { body, param, validationResult } = require('express-validator');

// Validation for submitting review
const submitReviewValidation = [
  body('booking_id')
    .isInt()
    .withMessage('Booking ID must be a valid number'),

  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),

  body('comment')
    .optional()
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Comment must be between 10 and 1000 characters')
];

// Validation for updating review
const updateReviewValidation = [
  param('id')
    .isInt()
    .withMessage('Review ID must be a valid number'),

  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),

  body('comment')
    .optional()
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Comment must be between 10 and 1000 characters')
];

// Validation for review ID
const reviewIdValidation = [
  param('id')
    .isInt()
    .withMessage('Review ID must be a valid number')
];

// Validation for restaurant ID
const restaurantIdValidation = [
  param('restaurantId')
    .isInt()
    .withMessage('Restaurant ID must be a valid number')
];

// Validation for booking ID
const bookingIdValidation = [
  param('bookingId')
    .isInt()
    .withMessage('Booking ID must be a valid number')
];

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.path || err.param,
        message: err.msg
      }))
    });
  }

  next();
};

module.exports = {
  submitReviewValidation,
  updateReviewValidation,
  reviewIdValidation,
  restaurantIdValidation,
  bookingIdValidation,
  handleValidationErrors
};