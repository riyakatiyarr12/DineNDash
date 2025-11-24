const db = require('../config/database');

class Restaurant {
  // Get all restaurants
  static async findAll(filters = {}) {
    try {
      let query = 'SELECT * FROM restaurants WHERE is_active = TRUE';
      const params = [];

      if (filters.cuisine_type) {
        query += ' AND cuisine_type = ?';
        params.push(filters.cuisine_type);
      }

      if (filters.city) {
        query += ' AND city = ?';
        params.push(filters.city);
      }

      if (filters.price_range) {
        query += ' AND price_range = ?';
        params.push(filters.price_range);
      }

      query += ' ORDER BY rating DESC, name ASC';

      const [rows] = await db.query(query, params);
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Get restaurant by ID
  static async findById(id) {
    try {
      const [rows] = await db.query(
        'SELECT * FROM restaurants WHERE id = ? AND is_active = TRUE',
        [id]
      );
      return rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  // Search restaurants
  static async search(searchTerm) {
    try {
      const [rows] = await db.query(
        `SELECT * FROM restaurants 
         WHERE is_active = TRUE 
         AND (name LIKE ? OR description LIKE ? OR cuisine_type LIKE ?)
         ORDER BY rating DESC`,
        [`%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`]
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Restaurant;