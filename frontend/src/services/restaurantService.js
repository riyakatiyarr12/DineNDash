import api from '../utils/api';

const restaurantService = {
  // Get all restaurants with filters
  getAll: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.cuisine_type) params.append('cuisine_type', filters.cuisine_type);
    if (filters.city) params.append('city', filters.city);
    if (filters.price_range) params.append('price_range', filters.price_range);
    if (filters.search) params.append('search', filters.search);

    const response = await api.get(`/restaurants?${params.toString()}`);
    return response.data;
  },

  // Get restaurant by ID
  getById: async (id) => {
    const response = await api.get(`/restaurants/${id}`);
    return response.data;
  },

  // Get restaurant menu
  getMenu: async (id, category = null) => {
    const url = category 
      ? `/restaurants/${id}/menu?category=${category}`
      : `/restaurants/${id}/menu`;
    const response = await api.get(url);
    return response.data;
  },

  // Get available time slots
  getTimeSlots: async (id, date) => {
    const response = await api.get(`/restaurants/${id}/timeslots?date=${date}`);
    return response.data;
  },

  // Get cuisine types
  getCuisines: async () => {
    const response = await api.get('/restaurants/cuisines');
    return response.data;
  },

  // Get cities
  getCities: async () => {
    const response = await api.get('/restaurants/cities');
    return response.data;
  }
};

export default restaurantService;