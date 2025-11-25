import api from '../utils/api';

const analyticsService = {
  // Get restaurant busy times (Customer)
  getRestaurantBusyTimes: async (restaurantId, days = 30) => {
    const response = await api.get(`/analytics/restaurant/${restaurantId}/busy-times?days=${days}`);
    return response.data;
  }
};

export default analyticsService;