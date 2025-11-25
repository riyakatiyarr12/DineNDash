const Booking = require('../models/Booking');
const BookingService = require('../services/bookingService');
const { successResponse, errorResponse } = require('../utils/responseHandler');

// @desc    Create new booking
// @route   POST /api/bookings
// @access  Private (Customer)
const createBooking = async (req, res) => {
  try {
    const {
      restaurant_id,
      booking_date,
      booking_time,
      number_of_seats,
      dietary_preference_id,
      special_requests,
      menu_items // Array: [{ menu_item_id, quantity }]
    } = req.body;

    const user_id = req.user.id;

    // Validate booking
    try {
      await BookingService.validateBooking({
        restaurant_id,
        booking_date,
        booking_time,
        number_of_seats,
        menu_items
      });
    } catch (validationError) {
      return errorResponse(res, 400, validationError.message);
    }

    // Prepare menu items with prices
    let menuItemsWithPrices = [];
    if (menu_items && menu_items.length > 0) {
      const MenuItem = require('../models/MenuItem');
      menuItemsWithPrices = await Promise.all(
        menu_items.map(async (item) => {
          const menuItem = await MenuItem.findById(item.menu_item_id);
          return {
            menu_item_id: item.menu_item_id,
            quantity: item.quantity,
            price: menuItem.price
          };
        })
      );
    }

    // Generate booking reference
    const booking_reference = Booking.generateReference();

    // Create booking
    const bookingId = await Booking.create({
      booking_reference,
      user_id,
      restaurant_id,
      booking_date,
      booking_time,
      number_of_seats,
      dietary_preference_id: dietary_preference_id || null,
      special_requests: special_requests || null,
      menu_items: menuItemsWithPrices
    });

    // Get created booking with details
    const booking = await Booking.findById(bookingId);

    return successResponse(res, 201, 'Booking created successfully. Waiting for admin approval.', {
      booking
    });

  } catch (error) {
    console.error('Create booking error:', error);
    return errorResponse(res, 500, 'Failed to create booking. Please try again.');
  }
};

// @desc    Get user's bookings
// @route   GET /api/bookings/my-bookings
// @access  Private (Customer)
const getMyBookings = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { status } = req.query;

    let bookings = await Booking.findByUserId(user_id);

    // Filter by status if provided
    if (status) {
      bookings = bookings.filter(b => b.status === status);
    }

    return successResponse(res, 200, 'Bookings retrieved successfully', {
      count: bookings.length,
      bookings
    });

  } catch (error) {
    console.error('Get my bookings error:', error);
    return errorResponse(res, 500, 'Failed to retrieve bookings');
  }
};

// @desc    Get booking by ID
// @route   GET /api/bookings/:id
// @access  Private
const getBookingById = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findById(id);

    if (!booking) {
      return errorResponse(res, 404, 'Booking not found');
    }

    // Check authorization (user can only see their own bookings, admin can see all)
    if (req.user.role !== 'admin' && booking.user_id !== req.user.id) {
      return errorResponse(res, 403, 'Access denied');
    }

    // Get menu items for this booking
    const db = require('../config/database');
    const [menuItems] = await db.query(
      `SELECT bmi.*, mi.name, mi.category, mi.description
       FROM booking_menu_items bmi
       JOIN menu_items mi ON bmi.menu_item_id = mi.id
       WHERE bmi.booking_id = ?`,
      [id]
    );

    return successResponse(res, 200, 'Booking retrieved successfully', {
      booking: {
        ...booking,
        menu_items: menuItems
      }
    });

  } catch (error) {
    console.error('Get booking error:', error);
    return errorResponse(res, 500, 'Failed to retrieve booking');
  }
};

// @desc    Get all bookings (Admin)
// @route   GET /api/bookings
// @access  Private (Admin)
const getAllBookings = async (req, res) => {
  try {
    const { status, restaurant_id, date } = req.query;

    const filters = {};
    if (status) filters.status = status;
    if (restaurant_id) filters.restaurant_id = restaurant_id;
    if (date) filters.date = date;

    const bookings = await Booking.findAll(filters);

    return successResponse(res, 200, 'Bookings retrieved successfully', {
      count: bookings.length,
      bookings
    });

  } catch (error) {
    console.error('Get all bookings error:', error);
    return errorResponse(res, 500, 'Failed to retrieve bookings');
  }
};

// @desc    Approve booking (Admin)
// @route   PUT /api/bookings/:id/approve
// @access  Private (Admin)
const approveBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { admin_notes } = req.body;
    const admin_id = req.user.id;

    const booking = await Booking.findById(id);

    if (!booking) {
      return errorResponse(res, 404, 'Booking not found');
    }

    if (booking.status !== 'pending') {
      return errorResponse(res, 400, `Cannot approve booking with status: ${booking.status}`);
    }

    // Update booking status
    const updated = await Booking.updateStatus(id, 'approved', admin_id, admin_notes);

    if (!updated) {
      return errorResponse(res, 400, 'Failed to approve booking');
    }

    const updatedBooking = await Booking.findById(id);

    return successResponse(res, 200, 'Booking approved successfully', {
      booking: updatedBooking
    });

  } catch (error) {
    console.error('Approve booking error:', error);
    return errorResponse(res, 500, 'Failed to approve booking');
  }
};

// @desc    Reject booking (Admin)
// @route   PUT /api/bookings/:id/reject
// @access  Private (Admin)
const rejectBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { admin_notes } = req.body;
    const admin_id = req.user.id;

    const booking = await Booking.findById(id);

    if (!booking) {
      return errorResponse(res, 404, 'Booking not found');
    }

    if (booking.status !== 'pending') {
      return errorResponse(res, 400, `Cannot reject booking with status: ${booking.status}`);
    }

    if (!admin_notes) {
      return errorResponse(res, 400, 'Admin notes are required when rejecting a booking');
    }

    // Restore seats to time slot
    const db = require('../config/database');
    await db.query(
      `UPDATE time_slots 
       SET available_seats = available_seats + ? 
       WHERE restaurant_id = ? AND slot_date = ? AND slot_time = ?`,
      [booking.number_of_seats, booking.restaurant_id, booking.booking_date, booking.booking_time]
    );

    // Update booking status
    const updated = await Booking.updateStatus(id, 'rejected', admin_id, admin_notes);

    if (!updated) {
      return errorResponse(res, 400, 'Failed to reject booking');
    }

    const updatedBooking = await Booking.findById(id);

    return successResponse(res, 200, 'Booking rejected successfully', {
      booking: updatedBooking
    });

  } catch (error) {
    console.error('Reject booking error:', error);
    return errorResponse(res, 500, 'Failed to reject booking');
  }
};

// @desc    Cancel booking (Customer)
// @route   PUT /api/bookings/:id/cancel
// @access  Private (Customer)
const cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;

    const booking = await Booking.findById(id);

    if (!booking) {
      return errorResponse(res, 404, 'Booking not found');
    }

    // Check if user owns this booking
    if (booking.user_id !== user_id) {
      return errorResponse(res, 403, 'Access denied');
    }

    if (booking.status === 'cancelled') {
      return errorResponse(res, 400, 'Booking is already cancelled');
    }

    if (booking.status === 'completed') {
      return errorResponse(res, 400, 'Cannot cancel completed booking');
    }

    // Restore seats to time slot
    const db = require('../config/database');
    await db.query(
      `UPDATE time_slots 
       SET available_seats = available_seats + ? 
       WHERE restaurant_id = ? AND slot_date = ? AND slot_time = ?`,
      [booking.number_of_seats, booking.restaurant_id, booking.booking_date, booking.booking_time]
    );

    // Update booking status
    const updated = await Booking.updateStatus(id, 'cancelled', null, 'Cancelled by customer');

    if (!updated) {
      return errorResponse(res, 400, 'Failed to cancel booking');
    }

    const updatedBooking = await Booking.findById(id);

    return successResponse(res, 200, 'Booking cancelled successfully', {
      booking: updatedBooking
    });

  } catch (error) {
    console.error('Cancel booking error:', error);
    return errorResponse(res, 500, 'Failed to cancel booking');
  }
};

// @desc    Get pending bookings count (Admin)
// @route   GET /api/bookings/pending/count
// @access  Private (Admin)
const getPendingBookingsCount = async (req, res) => {
  try {
    const db = require('../config/database');
    const [result] = await db.query(
      'SELECT COUNT(*) as count FROM bookings WHERE status = "pending"'
    );

    return successResponse(res, 200, 'Pending bookings count retrieved', {
      count: result[0].count
    });

  } catch (error) {
    console.error('Get pending count error:', error);
    return errorResponse(res, 500, 'Failed to retrieve pending bookings count');
  }
};

module.exports = {
  createBooking,
  getMyBookings,
  getBookingById,
  getAllBookings,
  approveBooking,
  rejectBooking,
  cancelBooking,
  getPendingBookingsCount
};