const express = require('express');
const router = express.Router();
const {
  getAllRestaurants,
  getRestaurantById,
  getRestaurantMenu,
  getAvailableTimeSlots,
  getCuisineTypes,
  getCities
} = require('../controllers/restaurantController');
const {
  timeSlotValidation,
  restaurantIdValidation,
  handleValidationErrors
} = require('../validators/restaurantValidator');

// Public routes
router.get('/cuisines', getCuisineTypes);
router.get('/cities', getCities);
router.get('/', getAllRestaurants);
router.get('/:id', restaurantIdValidation, handleValidationErrors, getRestaurantById);
router.get('/:id/menu', restaurantIdValidation, handleValidationErrors, getRestaurantMenu);
router.get('/:id/timeslots', timeSlotValidation, handleValidationErrors, getAvailableTimeSlots);

module.exports = router;