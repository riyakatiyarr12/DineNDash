const AnalyticsService = require('../services/analyticsService');
const { successResponse, errorResponse } = require('../utils/responseHandler');

// @desc    Get restaurant busy times (Customer)
// @route   GET /api/analytics/restaurant/:restaurantId/busy-times
// @access  Public
const getRestaurantBusyTimes = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const { days } = req.query;
    const daysBack = days ? parseInt(days) : 30;

    const busyTimes = await AnalyticsService.getRestaurantBusyTimes(restaurantId, daysBack);
    const dayWisePattern = await AnalyticsService.getDayWisePattern(restaurantId, daysBack);

    // Categorize hours
    const categorized = busyTimes.map(hour => {
      let category = 'Low';
      if (hour.booking_count >= 10) category = 'High';
      else if (hour.booking_count >= 5) category = 'Medium';

      return {
        ...hour,
        hour_display: `${hour.hour}:00 - ${hour.hour + 1}:00`,
        busy_level: category
      };
    });

    return successResponse(res, 200, 'Restaurant busy times retrieved successfully', {
      restaurant_id: restaurantId,
      period_days: daysBack,
      hourly_pattern: categorized,
      day_wise_pattern: dayWisePattern,
      insights: {
        busiest_hour: busyTimes.length > 0 ? busyTimes[0].hour : null,
        quietest_hour: busyTimes.length > 0 ? busyTimes[busyTimes.length - 1].hour : null
      }
    });

  } catch (error) {
    console.error('Get busy times error:', error);
    return errorResponse(res, 500, 'Failed to retrieve busy times');
  }
};

// @desc    Get platform statistics (Admin)
// @route   GET /api/analytics/platform-stats
// @access  Private (Admin)
const getPlatformStats = async (req, res) => {
  try {
    const stats = await AnalyticsService.getPlatformStats();

    return successResponse(res, 200, 'Platform statistics retrieved successfully', {
      stats
    });

  } catch (error) {
    console.error('Get platform stats error:', error);
    return errorResponse(res, 500, 'Failed to retrieve platform statistics');
  }
};

// @desc    Get booking trends (Admin)
// @route   GET /api/analytics/booking-trends
// @access  Private (Admin)
const getBookingTrends = async (req, res) => {
  try {
    const { period, limit } = req.query;
    const trendPeriod = period || 'daily';
    const trendLimit = limit ? parseInt(limit) : 30;

    const trends = await AnalyticsService.getBookingTrends(trendPeriod, trendLimit);

    return successResponse(res, 200, 'Booking trends retrieved successfully', {
      period: trendPeriod,
      data_points: trends.length,
      trends
    });

  } catch (error) {
    console.error('Get booking trends error:', error);
    return errorResponse(res, 500, 'Failed to retrieve booking trends');
  }
};

// @desc    Get peak hours analysis (Admin)
// @route   GET /api/analytics/peak-hours
// @access  Private (Admin)
const getPeakHours = async (req, res) => {
  try {
    const { days } = req.query;
    const daysBack = days ? parseInt(days) : 30;

    const peakHours = await AnalyticsService.getPeakHours(daysBack);

    // Add formatted time ranges
    const formatted = peakHours.map(hour => ({
      ...hour,
      time_range: `${hour.hour}:00 - ${hour.hour + 1}:00`
    }));

    return successResponse(res, 200, 'Peak hours analysis retrieved successfully', {
      period_days: daysBack,
      peak_hours: formatted
    });

  } catch (error) {
    console.error('Get peak hours error:', error);
    return errorResponse(res, 500, 'Failed to retrieve peak hours');
  }
};

// @desc    Get top restaurants (Admin)
// @route   GET /api/analytics/top-restaurants
// @access  Private (Admin)
const getTopRestaurants = async (req, res) => {
  try {
    const { limit } = req.query;
    const resultLimit = limit ? parseInt(limit) : 10;

    const restaurants = await AnalyticsService.getTopRestaurants(resultLimit);

    return successResponse(res, 200, 'Top restaurants retrieved successfully', {
      count: restaurants.length,
      restaurants
    });

  } catch (error) {
    console.error('Get top restaurants error:', error);
    return errorResponse(res, 500, 'Failed to retrieve top restaurants');
  }
};

// @desc    Get popular menu items (Admin)
// @route   GET /api/analytics/popular-items
// @access  Private (Admin)
const getPopularMenuItems = async (req, res) => {
  try {
    const { limit } = req.query;
    const resultLimit = limit ? parseInt(limit) : 10;

    const items = await AnalyticsService.getPopularMenuItems(resultLimit);

    return successResponse(res, 200, 'Popular menu items retrieved successfully', {
      count: items.length,
      items
    });

  } catch (error) {
    console.error('Get popular items error:', error);
    return errorResponse(res, 500, 'Failed to retrieve popular items');
  }
};

// @desc    Get revenue analytics (Admin)
// @route   GET /api/analytics/revenue
// @access  Private (Admin)
const getRevenueAnalytics = async (req, res) => {
  try {
    const { period, limit } = req.query;
    const revenuePeriod = period || 'daily';
    const revenueLimit = limit ? parseInt(limit) : 30;

    const revenue = await AnalyticsService.getRevenueAnalytics(revenuePeriod, revenueLimit);

    // Calculate totals
    const totals = revenue.reduce((acc, item) => ({
      total_bookings: acc.total_bookings + item.total_bookings,
      total_revenue: acc.total_revenue + (parseFloat(item.estimated_revenue) || 0)
    }), { total_bookings: 0, total_revenue: 0 });

    return successResponse(res, 200, 'Revenue analytics retrieved successfully', {
      period: revenuePeriod,
      data_points: revenue.length,
      totals: {
        total_bookings: totals.total_bookings,
        estimated_revenue: totals.total_revenue.toFixed(2)
      },
      revenue
    });

  } catch (error) {
    console.error('Get revenue analytics error:', error);
    return errorResponse(res, 500, 'Failed to retrieve revenue analytics');
  }
};

// @desc    Get customer behavior analytics (Admin)
// @route   GET /api/analytics/customer-behavior
// @access  Private (Admin)
const getCustomerBehavior = async (req, res) => {
  try {
    const behavior = await AnalyticsService.getCustomerBehavior();

    // Categorize customers
    const categorized = behavior.map(customer => {
      let category = 'Occasional';
      if (customer.total_bookings >= 10) category = 'VIP';
      else if (customer.total_bookings >= 5) category = 'Regular';

      return {
        ...customer,
        customer_category: category
      };
    });

    return successResponse(res, 200, 'Customer behavior analytics retrieved successfully', {
      total_customers: categorized.length,
      customers: categorized
    });

  } catch (error) {
    console.error('Get customer behavior error:', error);
    return errorResponse(res, 500, 'Failed to retrieve customer behavior');
  }
};

// @desc    Get dietary preferences statistics (Admin)
// @route   GET /api/analytics/dietary-stats
// @access  Private (Admin)
const getDietaryPreferencesStats = async (req, res) => {
  try {
    const stats = await AnalyticsService.getDietaryPreferencesStats();

    return successResponse(res, 200, 'Dietary preferences statistics retrieved successfully', {
      preferences: stats
    });

  } catch (error) {
    console.error('Get dietary stats error:', error);
    return errorResponse(res, 500, 'Failed to retrieve dietary statistics');
  }
};

// @desc    Get restaurant-specific analytics (Admin)
// @route   GET /api/analytics/restaurant/:restaurantId/stats
// @access  Private (Admin)
const getRestaurantAnalytics = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const { days } = req.query;
    const daysBack = days ? parseInt(days) : 30;

    const analytics = await AnalyticsService.getRestaurantAnalytics(restaurantId, daysBack);
    const busyTimes = await AnalyticsService.getRestaurantBusyTimes(restaurantId, daysBack);
    const dayPattern = await AnalyticsService.getDayWisePattern(restaurantId, daysBack);

    return successResponse(res, 200, 'Restaurant analytics retrieved successfully', {
      restaurant_id: restaurantId,
      period_days: daysBack,
      overview: analytics,
      busy_times: busyTimes,
      day_pattern: dayPattern
    });

  } catch (error) {
    console.error('Get restaurant analytics error:', error);
    return errorResponse(res, 500, 'Failed to retrieve restaurant analytics');
  }
};

// @desc    Get admin dashboard overview (Admin)
// @route   GET /api/analytics/admin-dashboard
// @access  Private (Admin)
const getAdminDashboard = async (req, res) => {
  try {
    const platformStats = await AnalyticsService.getPlatformStats();
    const recentTrends = await AnalyticsService.getBookingTrends('daily', 7);
    const topRestaurants = await AnalyticsService.getTopRestaurants(5);
    const peakHours = await AnalyticsService.getPeakHours(7);

    return successResponse(res, 200, 'Admin dashboard data retrieved successfully', {
      platform_stats: platformStats,
      recent_trends: recentTrends,
      top_restaurants: topRestaurants,
      peak_hours: peakHours.slice(0, 5)
    });

  } catch (error) {
    console.error('Get admin dashboard error:', error);
    return errorResponse(res, 500, 'Failed to retrieve dashboard data');
  }
};

module.exports = {
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
};