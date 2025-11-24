const db = require('../config/database');

class Booking {
    // Create new booking
    static async create(bookingData) {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            const {
                booking_reference,
                user_id,
                restaurant_id,
                booking_date,
                booking_time,
                number_of_seats,
                dietary_preference_id,
                special_requests,
                menu_items // Array of { menu_item_id, quantity, price }
            } = bookingData;

            // Insert booking
            const [bookingResult] = await connection.query(
                `INSERT INTO bookings 
        (booking_reference, user_id, restaurant_id, booking_date, booking_time, 
         number_of_seats, dietary_preference_id, special_requests, status) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
                [booking_reference, user_id, restaurant_id, booking_date, booking_time,
                    number_of_seats, dietary_preference_id, special_requests]
            );

            const bookingId = bookingResult.insertId;

            // Insert menu items if provided
            if (menu_items && menu_items.length > 0) {
                const menuItemsValues = menu_items.map(item =>
                    [bookingId, item.menu_item_id, item.quantity, item.price]
                );

                await connection.query(
                    `INSERT INTO booking_menu_items 
          (booking_id, menu_item_id, quantity, price_at_booking) 
          VALUES ?`,
                    [menuItemsValues]
                );
            }

            // Update time slot availability
            await connection.query(
                `UPDATE time_slots 
         SET available_seats = available_seats - ? 
         WHERE restaurant_id = ? AND slot_date = ? AND slot_time = ?`,
                [number_of_seats, restaurant_id, booking_date, booking_time]
            );

            await connection.commit();
            return bookingId;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    // Get booking by ID
    static async findById(id) {
        try {
            const [rows] = await db.query(
                `SELECT b.*, u.name as user_name, u.email as user_email, u.phone as user_phone,
                r.name as restaurant_name, r.address as restaurant_address,
                dp.name as dietary_preference
         FROM bookings b
         LEFT JOIN users u ON b.user_id = u.id
         LEFT JOIN restaurants r ON b.restaurant_id = r.id
         LEFT JOIN dietary_preferences dp ON b.dietary_preference_id = dp.id
         WHERE b.id = ?`,
                [id]
            );
            return rows[0] || null;
        } catch (error) {
            throw error;
        }
    }

    // Get user bookings
    static async findByUserId(userId) {
        try {
            const [rows] = await db.query(
                `SELECT b.*, r.name as restaurant_name, r.image_url as restaurant_image,
                r.address as restaurant_address, r.cuisine_type
         FROM bookings b
         LEFT JOIN restaurants r ON b.restaurant_id = r.id
         WHERE b.user_id = ?
         ORDER BY b.booking_date DESC, b.booking_time DESC`,
                [userId]
            );
            return rows;
        } catch (error) {
            throw error;
        }
    }

    // Get all bookings (admin)
    static async findAll(filters = {}) {
        try {
            let query = `
        SELECT b.*, u.name as user_name, u.email as user_email, u.phone as user_phone,
               r.name as restaurant_name, r.cuisine_type
        FROM bookings b
        LEFT JOIN users u ON b.user_id = u.id
        LEFT JOIN restaurants r ON b.restaurant_id = r.id
        WHERE 1=1
      `;
            const params = [];

            if (filters.status) {
                query += ' AND b.status = ?';
                params.push(filters.status);
            }

            if (filters.restaurant_id) {
                query += ' AND b.restaurant_id = ?';
                params.push(filters.restaurant_id);
            }

            if (filters.date) {
                query += ' AND b.booking_date = ?';
                params.push(filters.date);
            }

            query += ' ORDER BY b.booking_date DESC, b.booking_time DESC';

            const [rows] = await db.query(query, params);
            return rows;
        } catch (error) {
            throw error;
        }
    }
    // Update booking status
    static async updateStatus(id, status, adminId = null, adminNotes = null) {
        try {
            const [result] = await db.query(
                `UPDATE bookings           
                SET status = ?, 
                    approved_by = ?, 
                    approved_at = ?, 
                    admin_notes = ? 
                WHERE id = ?`,
                [status, adminId, status === 'approved' ? new Date() : null, adminNotes, id]
            );
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    }
    // Generate unique booking reference
    static generateReference() {
        const timestamp = Date.now().toString(36).toUpperCase();
        const random = Math.random().toString(36).substring(2, 6).toUpperCase();
        return `BK${ timestamp }${ random }`;
    }
}
module.exports = Booking;