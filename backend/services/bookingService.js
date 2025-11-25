const Booking = require('../models/Booking');
const TimeSlot = require('../models/TimeSlot');
const Restaurant = require('../models/Restaurant');
const MenuItem = require('../models/MenuItem');

class BookingService {
  // Validate booking request
  static async validateBooking(bookingData) {
    const { restaurant_id, booking_date, booking_time, number_of_seats, menu_items } = bookingData;

    // Check restaurant exists
    const restaurant = await Restaurant.findById(restaurant_id);
    if (!restaurant) {
      throw new Error('Restaurant not found');
    }

    // Validate date
    const selectedDate = new Date(booking_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      throw new Error('Cannot book for past dates');
    }

    // Check 7-day limit
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 7);
    maxDate.setHours(23, 59, 59, 999);

    if (selectedDate > maxDate) {
      throw new Error('Cannot book more than 7 days in advance');
    }

    // Check seat availability
    const isAvailable = await TimeSlot.checkAvailability(
      restaurant_id,
      booking_date,
      booking_time,
      number_of_seats
    );

    if (!isAvailable) {
      throw new Error('Not enough seats available for the selected time slot');
    }

    // Validate menu items if provided
    if (menu_items && menu_items.length > 0) {
      for (const item of menu_items) {
        const menuItem = await MenuItem.findById(item.menu_item_id);
        if (!menuItem) {
          throw new Error(`Menu item with ID ${item.menu_item_id} not found`);
        }
        if (menuItem.restaurant_id !== restaurant_id) {
          throw new Error(`Menu item ${menuItem.name} does not belong to this restaurant`);
        }
        if (!menuItem.is_available) {
          throw new Error(`Menu item ${menuItem.name} is not available`);
        }
      }
    }

    return true;
  }

  // Calculate total price from menu items
  static async calculateTotalPrice(menu_items) {
    let total = 0;
    
    for (const item of menu_items) {
      const menuItem = await MenuItem.findById(item.menu_item_id);
      if (menuItem) {
        total += parseFloat(menuItem.price) * item.quantity;
      }
    }

    return total.toFixed(2);
  }
}

module.exports = BookingService;