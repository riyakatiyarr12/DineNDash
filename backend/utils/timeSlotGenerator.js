const TimeSlot = require('../models/TimeSlot');
const Restaurant = require('../models/Restaurant');

// Generate time slots for a restaurant for the next 7 days
const generateTimeSlotsForRestaurant = async (restaurantId) => {
  try {
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      throw new Error('Restaurant not found');
    }

    const openingTime = restaurant.opening_time; // e.g., "11:00:00"
    const closingTime = restaurant.closing_time; // e.g., "23:00:00"
    const totalSeats = restaurant.total_seats;

    // Generate slots for next 7 days
    for (let dayOffset = 0; dayOffset <= 7; dayOffset++) {
      const date = new Date();
      date.setDate(date.getDate() + dayOffset);
      const dateString = date.toISOString().split('T')[0];

      // Generate time slots (30-minute intervals)
      const slots = generateTimeSlots(openingTime, closingTime);

      for (const timeSlot of slots) {
        await TimeSlot.create(restaurantId, dateString, timeSlot, totalSeats);
      }
    }

    console.log(`✅ Time slots generated for restaurant ${restaurantId}`);
  } catch (error) {
    console.error('Error generating time slots:', error);
    throw error;
  }
};

// Helper function to generate time slots between opening and closing time
const generateTimeSlots = (openingTime, closingTime) => {
  const slots = [];
  const [openHour, openMinute] = openingTime.split(':').map(Number);
  const [closeHour, closeMinute] = closingTime.split(':').map(Number);

  let currentHour = openHour;
  let currentMinute = openMinute;

  while (
    currentHour < closeHour ||
    (currentHour === closeHour && currentMinute < closeMinute)
  ) {
    const timeString = `${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}:00`;
    slots.push(timeString);

    // Add 30 minutes
    currentMinute += 30;
    if (currentMinute >= 60) {
      currentMinute = 0;
      currentHour += 1;
    }
  }

  return slots;
};

// Generate time slots for all restaurants
const generateTimeSlotsForAllRestaurants = async () => {
  try {
    const restaurants = await Restaurant.findAll();
    
    for (const restaurant of restaurants) {
      await generateTimeSlotsForRestaurant(restaurant.id);
    }

    console.log('✅ Time slots generated for all restaurants');
  } catch (error) {
    console.error('Error generating time slots for all restaurants:', error);
    throw error;
  }
};

module.exports = {
  generateTimeSlotsForRestaurant,
  generateTimeSlotsForAllRestaurants,
  generateTimeSlots
};