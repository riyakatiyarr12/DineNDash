const dotenv = require('dotenv');
dotenv.config();

const { generateTimeSlotsForAllRestaurants } = require('../utils/timeSlotGenerator');

// Script to generate time slots
(async () => {
  try {
    console.log('🔄 Generating time slots for all restaurants...');
    await generateTimeSlotsForAllRestaurants();
    console.log('✅ Time slots generation completed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
})();