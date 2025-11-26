import api from '../utils/api';

const adminService = {
  // Get all bookings with filters
  getAllBookings: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.restaurant_id) params.append('restaurant_id', filters.restaurant_id);
    if (filters.date) params.append('date', filters.date);

    const response = await api.get(`/bookings?${params.toString()}`);
    return response.data;
  },

  // Get pending bookings count
  getPendingCount: async () => {
    const response = await api.get('/bookings/pending/count');
    return response.data;
  },

  // Approve booking
  approveBooking: async (bookingId, notes = '') => {
    const response = await api.put(`/bookings/${bookingId}/approve`, {
      admin_notes: notes
    });
    return response.data;
  },

  // Reject booking
  rejectBooking: async (bookingId, notes) => {
    const response = await api.put(`/bookings/${bookingId}/reject`, {
      admin_notes: notes
    });
    return response.data;
  },

  // Get platform statistics
  getPlatformStats: async () => {
    const response = await api.get('/analytics/platform-stats');
    return response.data;
  },

  // Get admin dashboard overview
  getDashboardOverview: async () => {
    const response = await api.get('/analytics/admin-dashboard');
    return response.data;
  },

  // Get booking trends
  getBookingTrends: async (period = 'daily', limit = 30) => {
    const response = await api.get(`/analytics/booking-trends?period=${period}&limit=${limit}`);
    return response.data;
  },

  // Get peak hours
  getPeakHours: async (days = 30) => {
    const response = await api.get(`/analytics/peak-hours?days=${days}`);
    return response.data;
  },

  // Get top restaurants
  getTopRestaurants: async (limit = 10) => {
    const response = await api.get(`/analytics/top-restaurants?limit=${limit}`);
    return response.data;
  },

  // Get revenue analytics
  getRevenueAnalytics: async (period = 'daily', limit = 30) => {
    const response = await api.get(`/analytics/revenue?period=${period}&limit=${limit}`);
    return response.data;
  },

  // Get all reviews
  getAllReviews: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.restaurant_id) params.append('restaurant_id', filters.restaurant_id);
    if (filters.rating) params.append('rating', filters.rating);

    const response = await api.get(`/reviews?${params.toString()}`);
    return response.data;
  }
};

export default adminService;