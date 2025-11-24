javascript
const db = require('../config/database');

class DietaryPreference {
  // Get all dietary preferences
  static async findAll() {
    try {
      const [rows] = await db.query(
        'SELECT * FROM dietary_preferences ORDER BY name'
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Get by ID
  static async findById(id) {
    try {
      const [rows] = await db.query(
        'SELECT * FROM dietary_preferences WHERE id = ?',
        [id]
      );
      return rows[0] || null;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = DietaryPreference;