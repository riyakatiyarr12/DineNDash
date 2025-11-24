javascript
const db = require('../config/database');

class Review {
  // Create review
  static async create(reviewData) {
    try {
      const { user_id, restaurant_id, booking_id, rating, comment } = reviewData;
      
      const [result] = await db.query(
        `INSERT INTO reviews (user_id, restaurant_id, booking_id, rating, comment)
         VALUES (?, ?, ?, ?, ?)`,
        [user_id, restaurant_id, booking_id, rating, comment]
      );
      return result.insertId;
    } catch (error) {
      throw error;
    }
  }

  // Get reviews by restaurant
  static async findByRestaurantId(restaurantId) {
    try {
      const [rows] = await db.query(
        `SELECT r.*, u.name as user_name
         FROM reviews r
         LEFT JOIN users u ON r.user_id = u.id
         WHERE r.restaurant_id = ?
         ORDER BY r.created_at DESC`,
        [restaurantId]
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Check if user can review (has approved booking)
  static async canUserReview(userId, bookingId) {
    try {
      const [rows] = await db.query(
        `SELECT b.id FROM bookings b
         WHERE b.id = ? 
         AND b.user_id = ? 
         AND b.status = 'approved'
         AND NOT EXISTS (
           SELECT 1 FROM reviews r WHERE r.booking_id = b.id
         )`,
        [bookingId, userId]
      );
      return rows.length > 0;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Review;