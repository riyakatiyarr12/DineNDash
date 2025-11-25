const db = require('../config/database');

class AnalyticsService {
  // Get restaurant busy times based on historical bookings
  static async getRestaurantBusyTimes(restaurantId, daysBack = 30) {
    const [busyTimes] = await db.query(
      `SELECT 
        HOUR(booking_time) as hour,
        COUNT(*) as booking_count,
        SUM(number_of_seats) as total_seats_booked,
        AVG(number_of_seats) as avg_seats_per_booking
       FROM bookings
       WHERE restaurant_id = ?
       AND status IN ('approved', 'completed')
       AND booking_date >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
       GROUP BY HOUR(booking_time)
       ORDER BY hour`,
      [restaurantId, daysBack]
    );

    return busyTimes;
  }

  // Get day-wise booking pattern
  static async getDayWisePattern(restaurantId, daysBack = 30) {
    const [pattern] = await db.query(
      `SELECT 
        DAYNAME(booking_date) as day_name,
        DAYOFWEEK(booking_date) as day_number,
        COUNT(*) as booking_count,
        SUM(number_of_seats) as total_seats
       FROM bookings
       WHERE restaurant_id = ?
       AND status IN ('approved', 'completed')
       AND booking_date >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
       GROUP BY day_name, day_number
       ORDER BY day_number`,
      [restaurantId, daysBack]
    );

    return pattern;
  }

  // Admin: Overall platform statistics
  static async getPlatformStats() {
    const [stats] = await db.query(`
      SELECT 
        (SELECT COUNT(*) FROM users WHERE role = 'customer') as total_customers,
        (SELECT COUNT(*) FROM restaurants WHERE is_active = TRUE) as total_restaurants,
        (SELECT COUNT(*) FROM bookings) as total_bookings,
        (SELECT COUNT(*) FROM bookings WHERE status = 'pending') as pending_bookings,
        (SELECT COUNT(*) FROM bookings WHERE status = 'approved') as approved_bookings,
        (SELECT COUNT(*) FROM bookings WHERE status = 'completed') as completed_bookings,
        (SELECT COUNT(*) FROM reviews) as total_reviews,
        (SELECT ROUND(AVG(rating), 2) FROM reviews) as avg_platform_rating
    `);

    return stats[0];
  }

  // Admin: Booking trends over time
  static async getBookingTrends(period = 'daily', limit = 30) {
    let dateFormat;
    let intervalDays;

    switch (period) {
      case 'daily':
        dateFormat = '%Y-%m-%d';
        intervalDays = limit;
        break;
      case 'weekly':
        dateFormat = '%Y-%u';
        intervalDays = limit * 7;
        break;
      case 'monthly':
        dateFormat = '%Y-%m';
        intervalDays = limit * 30;
        break;
      default:
        dateFormat = '%Y-%m-%d';
        intervalDays = 30;
    }

    const [trends] = await db.query(
      `SELECT 
        DATE_FORMAT(booking_date, ?) as period,
        COUNT(*) as total_bookings,
        SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected,
        SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled,
        SUM(number_of_seats) as total_seats_booked
       FROM bookings
       WHERE booking_date >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
       GROUP BY period
       ORDER BY period DESC
       LIMIT ?`,
      [dateFormat, intervalDays, limit]
    );

    return trends;
  }

  // Admin: Peak hours analysis
  static async getPeakHours(daysBack = 30) {
    const [peakHours] = await db.query(
      `SELECT 
        HOUR(booking_time) as hour,
        COUNT(*) as booking_count,
        SUM(number_of_seats) as total_seats,
        ROUND(AVG(number_of_seats), 1) as avg_party_size,
        GROUP_CONCAT(DISTINCT DAYNAME(booking_date)) as popular_days
       FROM bookings
       WHERE status IN ('approved', 'completed')
       AND booking_date >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
       GROUP BY hour
       ORDER BY booking_count DESC`,
      [daysBack]
    );

    return peakHours;
  }

  // Admin: Top restaurants by bookings
  static async getTopRestaurants(limit = 10) {
    const [restaurants] = await db.query(
      `SELECT 
        r.id,
        r.name,
        r.cuisine_type,
        r.rating,
        COUNT(b.id) as total_bookings,
        SUM(CASE WHEN b.status = 'approved' THEN 1 ELSE 0 END) as approved_bookings,
        SUM(b.number_of_seats) as total_seats_booked,
        COUNT(DISTINCT b.user_id) as unique_customers,
        COUNT(rv.id) as total_reviews,
        ROUND(AVG(rv.rating), 2) as avg_review_rating
       FROM restaurants r
       LEFT JOIN bookings b ON r.id = b.restaurant_id
       LEFT JOIN reviews rv ON r.id = rv.restaurant_id
       WHERE r.is_active = TRUE
       GROUP BY r.id
       ORDER BY total_bookings DESC
       LIMIT ?`,
      [limit]
    );

    return restaurants;
  }

  // Admin: Popular menu items
  static async getPopularMenuItems(limit = 10) {
    const [items] = await db.query(
      `SELECT 
        mi.id,
        mi.name,
        mi.category,
        mi.price,
        r.name as restaurant_name,
        COUNT(bmi.id) as order_count,
        SUM(bmi.quantity) as total_quantity,
        SUM(bmi.price_at_booking * bmi.quantity) as total_revenue
       FROM menu_items mi
       JOIN booking_menu_items bmi ON mi.id = bmi.menu_item_id
       JOIN restaurants r ON mi.restaurant_id = r.id
       GROUP BY mi.id
       ORDER BY order_count DESC
       LIMIT ?`,
      [limit]
    );

    return items;
  }

  // Admin: Revenue analytics (estimated - based on menu items)
  static async getRevenueAnalytics(period = 'daily', limit = 30) {
    let dateFormat;
    let intervalDays;

    switch (period) {
      case 'daily':
        dateFormat = '%Y-%m-%d';
        intervalDays = limit;
        break;
      case 'weekly':
        dateFormat = '%Y-%u';
        intervalDays = limit * 7;
        break;
      case 'monthly':
        dateFormat = '%Y-%m';
        intervalDays = limit * 30;
        break;
      default:
        dateFormat = '%Y-%m-%d';
        intervalDays = 30;
    }

    const [revenue] = await db.query(
      `SELECT 
        DATE_FORMAT(b.booking_date, ?) as period,
        COUNT(DISTINCT b.id) as total_bookings,
        SUM(bmi.price_at_booking * bmi.quantity) as estimated_revenue,
        COUNT(DISTINCT b.restaurant_id) as active_restaurants,
        COUNT(DISTINCT b.user_id) as unique_customers
       FROM bookings b
       LEFT JOIN booking_menu_items bmi ON b.id = bmi.booking_id
       WHERE b.booking_date >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
       AND b.status IN ('approved', 'completed')
       GROUP BY period
       ORDER BY period DESC
       LIMIT ?`,
      [dateFormat, intervalDays, limit]
    );

    return revenue;
  }

  // Admin: Customer behavior analytics
  static async getCustomerBehavior() {
    const [behavior] = await db.query(`
      SELECT 
        u.id,
        u.name,
        u.email,
        COUNT(b.id) as total_bookings,
        SUM(CASE WHEN b.status = 'completed' THEN 1 ELSE 0 END) as completed_bookings,
        SUM(CASE WHEN b.status = 'cancelled' THEN 1 ELSE 0 END) as cancelled_bookings,
        COUNT(rv.id) as total_reviews,
        ROUND(AVG(rv.rating), 2) as avg_rating_given,
        MAX(b.booking_date) as last_booking_date,
        DATEDIFF(CURDATE(), MAX(b.booking_date)) as days_since_last_booking
       FROM users u
       LEFT JOIN bookings b ON u.id = b.user_id
       LEFT JOIN reviews rv ON u.id = rv.user_id
       WHERE u.role = 'customer'
       GROUP BY u.id
       HAVING total_bookings > 0
       ORDER BY total_bookings DESC
       LIMIT 50
    `);

    return behavior;
  }

  // Admin: Dietary preferences statistics
  static async getDietaryPreferencesStats() {
    const [stats] = await db.query(`
      SELECT 
        dp.name as preference,
        COUNT(b.id) as booking_count,
        ROUND((COUNT(b.id) * 100.0 / (SELECT COUNT(*) FROM bookings WHERE dietary_preference_id IS NOT NULL)), 2) as percentage
       FROM dietary_preferences dp
       LEFT JOIN bookings b ON dp.id = b.dietary_preference_id
       GROUP BY dp.id
       ORDER BY booking_count DESC
    `);

    return stats;
  }

  // Restaurant-specific analytics (for restaurant owners - future use)
  static async getRestaurantAnalytics(restaurantId, daysBack = 30) {
    const [analytics] = await db.query(
      `SELECT 
        COUNT(b.id) as total_bookings,
        SUM(CASE WHEN b.status = 'approved' THEN 1 ELSE 0 END) as approved,
        SUM(CASE WHEN b.status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN b.status = 'rejected' THEN 1 ELSE 0 END) as rejected,
        SUM(CASE WHEN b.status = 'cancelled' THEN 1 ELSE 0 END) as cancelled,
        SUM(b.number_of_seats) as total_seats_booked,
        COUNT(DISTINCT b.user_id) as unique_customers,
        COUNT(rv.id) as total_reviews,
        ROUND(AVG(rv.rating), 2) as avg_rating,
        (SELECT SUM(bmi.price_at_booking * bmi.quantity) 
         FROM booking_menu_items bmi 
         JOIN bookings b2 ON bmi.booking_id = b2.id 
         WHERE b2.restaurant_id = ? 
         AND b2.booking_date >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
         AND b2.status IN ('approved', 'completed')) as estimated_revenue
       FROM bookings b
       LEFT JOIN reviews rv ON b.restaurant_id = rv.restaurant_id
       WHERE b.restaurant_id = ?
       AND b.booking_date >= DATE_SUB(CURDATE(), INTERVAL ? DAY)`,
      [restaurantId, daysBack, restaurantId, daysBack]
    );

    return analytics[0];
  }
}

module.exports = AnalyticsService;