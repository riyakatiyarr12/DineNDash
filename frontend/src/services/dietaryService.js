import api from '../utils/api';

const dietaryService = {
  // Get all dietary preferences
  getAll: async () => {
    const response = await api.get('/dietary-preferences');
    return response.data;
  }
};

export default dietaryService;