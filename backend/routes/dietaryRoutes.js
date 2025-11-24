const express = require('express');
const router = express.Router();
const { getAllDietaryPreferences } = require('../controllers/dietaryController');

// Public route
router.get('/', getAllDietaryPreferences);

module.exports = router;