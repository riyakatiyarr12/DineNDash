const express = require('express');
const router = express.Router();
const {
  createBooking,
  getMyBookings,
  getBookingById,
  getAllBookings,
  approveBooking,
  rejectBooking,
  cancelBooking,
  getPendingBookingsCount
} = require('../controllers/bookingController');
const {
  createBookingValidation,
  bookingIdValidation,
  adminNotesValidation,
  handleValidationErrors
} = require('../validators/bookingValidator');
const { authenticate, isAdmin, isCustomer } = require('../middleware/authMiddleware');

// Customer routes
router.post(
  '/',
  authenticate,
  isCustomer,
  createBookingValidation,
  handleValidationErrors,
  createBooking
);

router.get('/my-bookings', authenticate, isCustomer, getMyBookings);

router.put(
  '/:id/cancel',
  authenticate,
  isCustomer,
  bookingIdValidation,
  handleValidationErrors,
  cancelBooking
);

// Admin routes
router.get('/pending/count', authenticate, isAdmin, getPendingBookingsCount);

router.get('/', authenticate, isAdmin, getAllBookings);

router.put(
  '/:id/approve',
  authenticate,
  isAdmin,
  bookingIdValidation,
  adminNotesValidation,
  handleValidationErrors,
  approveBooking
);

router.put(
  '/:id/reject',
  authenticate,
  isAdmin,
  bookingIdValidation,
  adminNotesValidation,
  handleValidationErrors,
  rejectBooking
);

// Shared routes (both customer and admin)
router.get(
  '/:id',
  authenticate,
  bookingIdValidation,
  handleValidationErrors,
  getBookingById
);

module.exports = router;