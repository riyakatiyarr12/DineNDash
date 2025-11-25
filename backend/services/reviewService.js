const Review = require('../models/Review');
const Booking = require('../models/Booking');

class ReviewService {
  // Validate if user can leave a review
  static async validateReview(userId, bookingId) {
    // Check if booking exists
    const booking = await Booking.findById(bookingId);
    
    if (!booking) {
      throw new Error('Booking not found');
    }

    // Check if booking belongs to user
    if (booking.user_id !== userId) {
      throw new Error('You can only review your own bookings');
    }

    // Check if booking is approved
    if (booking.status !== 'approved') {
      throw new Error('Only approved bookings can be reviewed');
    }

    // Check if booking date has passed (optional - uncomment if needed)
    // const bookingDateTime = new Date(`${booking.booking_date} ${booking.booking_time}`);
    // if (bookingDateTime > new Date()) {
    //   throw new Error('Cannot review future bookings');
    // }

    // Check if review already exists
    const canReview = await Review.canUserReview(userId, bookingId);
    if (!canReview) {
      throw new Error('You have already reviewed this booking');
    }

    return booking;
  }
}

module.exports = ReviewService;