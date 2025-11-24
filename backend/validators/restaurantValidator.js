const { query, param, validationResult } = require('express-validator');

// Validation for getting time slots
const timeSlotValidation = [
  param('id')
    .isInt()
    .withMessage('Restaurant ID must be a valid number'),
  
  query('date')
    .notEmpty()
    .withMessage('Date is required')
    .isDate()
    .withMessage('Invalid date format (use YYYY-MM-DD)')
];

// Validation for restaurant ID
const restaurantIdValidation = [
  param('id')
    .isInt()
    .withMessage('Restaurant ID must be a valid number')
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
  timeSlotValidation,
  restaurantIdValidation,
  handleValidationErrors
};