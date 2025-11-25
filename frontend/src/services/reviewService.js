import api from '../utils/api';

const reviewService = {
  // Submit review
  submit: async (reviewData) => {
    const response = await api.post('/reviews', reviewData);
    return response.data;
  },

  // Get my reviews
  getMyReviews: async () => {
    const response = await api.get('/reviews/my-reviews');
    return response.data;
  },

  // Get reviews by restaurant
  getByRestaurant: async (restaurantId, rating = null) => {
    const url = rating 
      ? `/reviews/restaurant/${restaurantId}?rating=${rating}`
      : `/reviews/restaurant/${restaurantId}`;
    const response = await api.get(url);
    return response.data;
  },

  // Check if can review
  canReview: async (bookingId) => {
    const response = await api.get(`/reviews/can-review/${bookingId}`);
    return response.data;
  },

  // Update review
  update: async (reviewId, reviewData) => {
    const response = await api.put(`/reviews/${reviewId}`, reviewData);
    return response.data;
  },

  // Delete review
  delete: async (reviewId) => {
    const response = await api.delete(`/reviews/${reviewId}`);
    return response.data;
  }
};

export default reviewService;