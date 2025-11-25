const { param, query, validationResult } = require('express-validator');

// Validation for restaurant ID
const restaurantIdValidation = [
  param('restaurantId')
    .isInt()
    .withMessage('Restaurant ID must be a valid number')
];

// Validation for days parameter
const daysValidation = [
  query('days')
    .optional()
    .isInt({ min: 1, max: 365 })
    .withMessage('Days must be between 1 and 365')
];

// Validation for period parameter
const periodValidation = [
  query('period')
    .optional()
    .isIn(['daily', 'weekly', 'monthly'])
    .withMessage('Period must be daily, weekly, or monthly')
];

// Validation for limit parameter
const limitValidation = [
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
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
  restaurantIdValidation,
  daysValidation,
  periodValidation,
  limitValidation,
  handleValidationErrors
};