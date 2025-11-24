const db = require('../config/database');

class User {
  // Find user by email
  static async findByEmail(email) {
    try {
      const [rows] = await db.query(
        'SELECT * FROM users WHERE email = ?',
        [email]
      );
      return rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  // Find user by ID
  static async findById(id) {
    try {
      const [rows] = await db.query(
        'SELECT id, name, email, phone, role, is_active, created_at FROM users WHERE id = ?',
        [id]
      );
      return rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  // Create new user
  static async create(userData) {
    try {
      const { name, email, password, phone, role = 'customer' } = userData;
      const [result] = await db.query(
        'INSERT INTO users (name, email, password, phone, role) VALUES (?, ?, ?, ?, ?)',
        [name, email, password, phone, role]
      );
      return result.insertId;
    } catch (error) {
      throw error;
    }
  }

  // Update user
  static async update(id, userData) {
    try {
      const fields = [];
      const values = [];

      Object.keys(userData).forEach(key => {
        if (userData[key] !== undefined) {
          fields.push(`${key} = ?`);
          values.push(userData[key]);
        }
      });

      values.push(id);

      const [result] = await db.query(
        `UPDATE users SET ${fields.join(', ')} WHERE id = ?`,
        values
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Get all customers
  static async getAllCustomers() {
    try {
      const [rows] = await db.query(
        'SELECT id, name, email, phone, created_at FROM users WHERE role = "customer" ORDER BY created_at DESC'
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = User;