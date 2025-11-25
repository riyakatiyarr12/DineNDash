const express = require('express');
const router = express.Router();
const {
  getRestaurantBusyTimes,
  getPlatformStats,
  getBookingTrends,
  getPeakHours,
  getTopRestaurants,
  getPopularMenuItems,
  getRevenueAnalytics,
  getCustomerBehavior,
  getDietaryPreferencesStats,
  getRestaurantAnalytics,
  getAdminDashboard
} = require('../controllers/analyticsController');
const {
  restaurantIdValidation,
  daysValidation,
  periodValidation,
  limitValidation,
  handleValidationErrors
} = require('../validators/analyticsValidator');
const { authenticate, isAdmin } = require('../middleware/authMiddleware');

// Public routes (Customer accessible)
router.get(
  '/restaurant/:restaurantId/busy-times',
  restaurantIdValidation,
  daysValidation,
  handleValidationErrors,
  getRestaurantBusyTimes
);

// Admin routes
router.get('/admin-dashboard', authenticate, isAdmin, getAdminDashboard);

router.get('/platform-stats', authenticate, isAdmin, getPlatformStats);

router.get(
  '/booking-trends',
  authenticate,
  isAdmin,
  periodValidation,
  limitValidation,
  handleValidationErrors,
  getBookingTrends
);

router.get(
  '/peak-hours',
  authenticate,
  isAdmin,
  daysValidation,
  handleValidationErrors,
  getPeakHours
);

router.get(
  '/top-restaurants',
  authenticate,
  isAdmin,
  limitValidation,
  handleValidationErrors,
  getTopRestaurants
);

router.get(
  '/popular-items',
  authenticate,
  isAdmin,
  limitValidation,
  handleValidationErrors,
  getPopularMenuItems
);

router.get(
  '/revenue',
  authenticate,
  isAdmin,
  periodValidation,
  limitValidation,
  handleValidationErrors,
  getRevenueAnalytics
);

router.get('/customer-behavior', authenticate, isAdmin, getCustomerBehavior);

router.get('/dietary-stats', authenticate, isAdmin, getDietaryPreferencesStats);

router.get(
  '/restaurant/:restaurantId/stats',
  authenticate,
  isAdmin,
  restaurantIdValidation,
  daysValidation,
  handleValidationErrors,
  getRestaurantAnalytics
);

module.exports = router;