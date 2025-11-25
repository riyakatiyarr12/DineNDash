import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import restaurantService from '../../services/restaurantService';
import './Restaurants.css';

const Restaurants = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [cuisines, setCuisines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    search: '',
    cuisine_type: '',
    price_range: ''
  });

  const navigate = useNavigate();

  useEffect(() => {
    fetchCuisines();
    fetchRestaurants();
  }, []);

  const fetchCuisines = async () => {
    try {
      const response = await restaurantService.getCuisines();
      setCuisines(response.data.cuisines);
    } catch (err) {
      console.error('Error fetching cuisines:', err);
    }
  };

  const fetchRestaurants = async (currentFilters = filters) => {
    setLoading(true);
    setError('');
    try {
      const response = await restaurantService.getAll(currentFilters);
      setRestaurants(response.data.restaurants);
    } catch (err) {
      setError('Failed to load restaurants');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const newFilters = {
      ...filters,
      [e.target.name]: e.target.value
    };
    setFilters(newFilters);
    fetchRestaurants(newFilters);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchRestaurants();
  };

  const handleViewDetails = (id) => {
    navigate(`/customer/restaurant/${id}`);
  };

  return (
    <div className="restaurants-page">
      <div className="restaurants-header">
        <h1>Discover Restaurants</h1>
        <p>Find and book your perfect dining experience</p>
      </div>

      {/* Search and Filters */}
      <div className="filters-section">
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            name="search"
            placeholder="Search restaurants, cuisines..."
            value={filters.search}
            onChange={handleFilterChange}
            className="search-input"
          />
          <button type="submit" className="search-btn">Search</button>
        </form>

        <div className="filters">
          <select
            name="cuisine_type"
            value={filters.cuisine_type}
            onChange={handleFilterChange}
            className="filter-select"
          >
            <option value="">All Cuisines</option>
            {cuisines.map((cuisine) => (
              <option key={cuisine} value={cuisine}>
                {cuisine}
              </option>
            ))}
          </select>

          <select
            name="price_range"
            value={filters.price_range}
            onChange={handleFilterChange}
            className="filter-select"
          >
            <option value="">All Prices</option>
            <option value="$">$ - Budget</option>
            <option value="$$">$$ - Moderate</option>
            <option value="$$$">$$$ - Expensive</option>
            <option value="$$$$">$$$$ - Fine Dining</option>
          </select>
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="loading">Loading restaurants...</div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : (
        <div className="restaurants-grid">
          {restaurants.length === 0 ? (
            <div className="no-results">
              <p>No restaurants found matching your criteria</p>
            </div>
          ) : (
            restaurants.map((restaurant) => (
              <div key={restaurant.id} className="restaurant-card">
                <div className="restaurant-image">
                  <img 
                    src={restaurant.image_url || 'https://via.placeholder.com/400x300'} 
                    alt={restaurant.name}
                  />
                  <div className="price-badge">{restaurant.price_range}</div>
                </div>

                <div className="restaurant-info">
                  <h3>{restaurant.name}</h3>
                  <p className="cuisine">{restaurant.cuisine_type}</p>
                  <p className="description">{restaurant.description}</p>

                  <div className="restaurant-meta">
                    <div className="rating">
                      ⭐ {restaurant.rating || 'New'} 
                      {restaurant.total_reviews > 0 && (
                        <span> ({restaurant.total_reviews})</span>
                      )}
                    </div>
                    <div className="location">📍 {restaurant.city}</div>
                  </div>

                  <div className="restaurant-timing">
                    🕒 {restaurant.opening_time.slice(0, 5)} - {restaurant.closing_time.slice(0, 5)}
                  </div>

                  <button 
                    className="btn-view-details"
                    onClick={() => handleViewDetails(restaurant.id)}
                  >
                    View Details & Book
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default Restaurants;