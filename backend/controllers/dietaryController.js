const DietaryPreference = require('../models/DietaryPreference');
const { successResponse, errorResponse } = require('../utils/responseHandler');

// @desc    Get all dietary preferences
// @route   GET /api/dietary-preferences
// @access  Public
const getAllDietaryPreferences = async (req, res) => {
  try {
    const preferences = await DietaryPreference.findAll();

    return successResponse(res, 200, 'Dietary preferences retrieved successfully', {
      count: preferences.length,
      preferences
    });

  } catch (error) {
    console.error('Get dietary preferences error:', error);
    return errorResponse(res, 500, 'Failed to retrieve dietary preferences');
  }
};

module.exports = {
  getAllDietaryPreferences
};