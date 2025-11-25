const { body, param, validationResult } = require('express-validator');

// Validation for creating booking
const createBookingValidation = [
  body('restaurant_id')
    .isInt()
    .withMessage('Restaurant ID must be a valid number'),

  body('booking_date')
    .notEmpty()
    .withMessage('Booking date is required')
    .isDate()
    .withMessage('Invalid date format (use YYYY-MM-DD)'),

  body('booking_time')
    .notEmpty()
    .withMessage('Booking time is required')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/)
    .withMessage('Invalid time format (use HH:MM:SS)'),

  body('number_of_seats')
    .isInt({ min: 1, max: 20 })
    .withMessage('Number of seats must be between 1 and 20'),

  body('dietary_preference_id')
    .optional()
    .isInt()
    .withMessage('Dietary preference ID must be a valid number'),

  body('special_requests')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Special requests must not exceed 500 characters'),

  body('menu_items')
    .optional()
    .isArray()
    .withMessage('Menu items must be an array'),

  body('menu_items.*.menu_item_id')
    .if(body('menu_items').exists())
    .isInt()
    .withMessage('Menu item ID must be a valid number'),

  body('menu_items.*.quantity')
    .if(body('menu_items').exists())
    .isInt({ min: 1 })
    .withMessage('Quantity must be at least 1')
];

// Validation for booking ID
const bookingIdValidation = [
  param('id')
    .isInt()
    .withMessage('Booking ID must be a valid number')
];

// Validation for approve/reject
const adminNotesValidation = [
  body('admin_notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Admin notes must not exceed 500 characters')
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
  createBookingValidation,
  bookingIdValidation,
  adminNotesValidation,
  handleValidationErrors
};