
const db = require('../config/database');

class TimeSlot {
  // Get available time slots
  static async getAvailableSlots(restaurantId, date) {
    try {
      const [rows] = await db.query(
        `SELECT * FROM time_slots 
         WHERE restaurant_id = ? 
         AND slot_date = ? 
         AND available_seats > 0 
         AND is_available = TRUE
         ORDER BY slot_time`,
        [restaurantId, date]
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Check slot availability
  static async checkAvailability(restaurantId, date, time, requiredSeats) {
    try {
      const [rows] = await db.query(
        `SELECT available_seats FROM time_slots 
         WHERE restaurant_id = ? 
         AND slot_date = ? 
         AND slot_time = ? 
         AND is_available = TRUE`,
        [restaurantId, date, time]
      );
      
      if (rows.length === 0) return false;
      return rows[0].available_seats >= requiredSeats;
    } catch (error) {
      throw error;
    }
  }

  // Create time slot
  static async create(restaurantId, date, time, availableSeats) {
    try {
      const [result] = await db.query(
        `INSERT INTO time_slots (restaurant_id, slot_date, slot_time, available_seats)
         VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE available_seats = ?`,
        [restaurantId, date, time, availableSeats, availableSeats]
      );
      return result.insertId || result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = TimeSlot;