const Restaurant = require('../models/Restaurant');
const MenuItem = require('../models/MenuItem');
const TimeSlot = require('../models/TimeSlot');
const { successResponse, errorResponse } = require('../utils/responseHandler');

// @desc    Get all restaurants with filters
// @route   GET /api/restaurants
// @access  Public
const getAllRestaurants = async (req, res) => {
  try {
    const { cuisine_type, city, price_range, search } = req.query;

    let restaurants;

    if (search) {
      restaurants = await Restaurant.search(search);
    } else {
      const filters = {};
      if (cuisine_type) filters.cuisine_type = cuisine_type;
      if (city) filters.city = city;
      if (price_range) filters.price_range = price_range;

      restaurants = await Restaurant.findAll(filters);
    }

    return successResponse(res, 200, 'Restaurants retrieved successfully', {
      count: restaurants.length,
      restaurants
    });

  } catch (error) {
    console.error('Get restaurants error:', error);
    return errorResponse(res, 500, 'Failed to retrieve restaurants');
  }
};

// @desc    Get restaurant by ID
// @route   GET /api/restaurants/:id
// @access  Public
const getRestaurantById = async (req, res) => {
  try {
    const { id } = req.params;

    const restaurant = await Restaurant.findById(id);

    if (!restaurant) {
      return errorResponse(res, 404, 'Restaurant not found');
    }

    return successResponse(res, 200, 'Restaurant retrieved successfully', {
      restaurant
    });

  } catch (error) {
    console.error('Get restaurant error:', error);
    return errorResponse(res, 500, 'Failed to retrieve restaurant');
  }
};

// @desc    Get menu items by restaurant
// @route   GET /api/restaurants/:id/menu
// @access  Public
const getRestaurantMenu = async (req, res) => {
  try {
    const { id } = req.params;
    const { category } = req.query;

    // Check if restaurant exists
    const restaurant = await Restaurant.findById(id);
    if (!restaurant) {
      return errorResponse(res, 404, 'Restaurant not found');
    }

    let menuItems;
    if (category) {
      menuItems = await MenuItem.findByCategory(id, category);
    } else {
      menuItems = await MenuItem.findByRestaurantId(id);
    }

    // Group by category
    const groupedMenu = menuItems.reduce((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push(item);
      return acc;
    }, {});

    return successResponse(res, 200, 'Menu retrieved successfully', {
      restaurant: {
        id: restaurant.id,
        name: restaurant.name
      },
      total_items: menuItems.length,
      menu: groupedMenu
    });

  } catch (error) {
    console.error('Get menu error:', error);
    return errorResponse(res, 500, 'Failed to retrieve menu');
  }
};

// @desc    Get available time slots for a restaurant
// @route   GET /api/restaurants/:id/timeslots
// @access  Public
const getAvailableTimeSlots = async (req, res) => {
  try {
    const { id } = req.params;
    const { date } = req.query;

    if (!date) {
      return errorResponse(res, 400, 'Date is required');
    }

    // Validate date format
    const selectedDate = new Date(date);
    if (isNaN(selectedDate.getTime())) {
      return errorResponse(res, 400, 'Invalid date format');
    }

    // Check if restaurant exists
    const restaurant = await Restaurant.findById(id);
    if (!restaurant) {
      return errorResponse(res, 404, 'Restaurant not found');
    }

    // Check date is not in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate < today) {
      return errorResponse(res, 400, 'Cannot book for past dates');
    }

    // Check date is within 7 days
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 7);
    maxDate.setHours(23, 59, 59, 999);
    if (selectedDate > maxDate) {
      return errorResponse(res, 400, 'Cannot book more than 7 days in advance');
    }

    const timeSlots = await TimeSlot.getAvailableSlots(id, date);

    return successResponse(res, 200, 'Time slots retrieved successfully', {
      restaurant: {
        id: restaurant.id,
        name: restaurant.name
      },
      date,
      available_slots: timeSlots.length,
      slots: timeSlots
    });

  } catch (error) {
    console.error('Get time slots error:', error);
    return errorResponse(res, 500, 'Failed to retrieve time slots');
  }
};

// @desc    Get unique cuisine types
// @route   GET /api/restaurants/cuisines
// @access  Public
const getCuisineTypes = async (req, res) => {
  try {
    const db = require('../config/database');
    const [cuisines] = await db.query(
      'SELECT DISTINCT cuisine_type FROM restaurants WHERE is_active = TRUE ORDER BY cuisine_type'
    );

    return successResponse(res, 200, 'Cuisine types retrieved successfully', {
      cuisines: cuisines.map(c => c.cuisine_type)
    });

  } catch (error) {
    console.error('Get cuisines error:', error);
    return errorResponse(res, 500, 'Failed to retrieve cuisine types');
  }
};

// @desc    Get unique cities
// @route   GET /api/restaurants/cities
// @access  Public
const getCities = async (req, res) => {
  try {
    const db = require('../config/database');
    const [cities] = await db.query(
      'SELECT DISTINCT city FROM restaurants WHERE is_active = TRUE ORDER BY city'
    );

    return successResponse(res, 200, 'Cities retrieved successfully', {
      cities: cities.map(c => c.city)
    });

  } catch (error) {
    console.error('Get cities error:', error);
    return errorResponse(res, 500, 'Failed to retrieve cities');
  }
};

module.exports = {
  getAllRestaurants,
  getRestaurantById,
  getRestaurantMenu,
  getAvailableTimeSlots,
  getCuisineTypes,
  getCities
};