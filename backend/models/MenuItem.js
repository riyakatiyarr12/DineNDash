
const db = require('../config/database');

class MenuItem {
  // Get menu items by restaurant
  static async findByRestaurantId(restaurantId) {
    try {
      const [rows] = await db.query(
        `SELECT * FROM menu_items 
         WHERE restaurant_id = ? AND is_available = TRUE
         ORDER BY category, name`,
        [restaurantId]
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Get menu item by ID
  static async findById(id) {
    try {
      const [rows] = await db.query(
        'SELECT * FROM menu_items WHERE id = ?',
        [id]
      );
      return rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  // Get menu items by category
  static async findByCategory(restaurantId, category) {
    try {
      const [rows] = await db.query(
        `SELECT * FROM menu_items 
         WHERE restaurant_id = ? AND category = ? AND is_available = TRUE
         ORDER BY name`,
        [restaurantId, category]
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = MenuItem;