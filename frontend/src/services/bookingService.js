import api from '../utils/api';

const bookingService = {
  // Create booking
  create: async (bookingData) => {
    const response = await api.post('/bookings', bookingData);
    return response.data;
  },

  // Get my bookings
  getMyBookings: async (status = null) => {
    const url = status 
      ? `/bookings/my-bookings?status=${status}`
      : '/bookings/my-bookings';
    const response = await api.get(url);
    return response.data;
  },

  // Get booking by ID
  getById: async (id) => {
    const response = await api.get(`/bookings/${id}`);
    return response.data;
  },

  // Cancel booking
  cancel: async (id) => {
    const response = await api.put(`/bookings/${id}/cancel`);
    return response.data;
  }
};

export default bookingService;