import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import restaurantService from '../../services/restaurantService';
import './RestaurantDetail.css';

const RestaurantDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState(null);
  const [menu, setMenu] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('about');

  useEffect(() => {
    fetchRestaurantDetails();
    fetchMenu();
  }, [id]);

  const fetchRestaurantDetails = async () => {
    try {
      const response = await restaurantService.getById(id);
      setRestaurant(response.data.restaurant);
    } catch (err) {
      setError('Failed to load restaurant details');
    } finally {
      setLoading(false);
    }
  };

  const fetchMenu = async () => {
    try {
      const response = await restaurantService.getMenu(id);
      setMenu(response.data.menu);
    } catch (err) {
      console.error('Error fetching menu:', err);
    }
  };

  const handleBookNow = () => {
    navigate(`/customer/booking/${id}`);
  };

  if (loading) {
    return <div className="loading">Loading restaurant details...</div>;
  }

  if (error || !restaurant) {
    return <div className="error-message">{error || 'Restaurant not found'}</div>;
  }

  return (
    <div className="restaurant-detail-page">
      {/* Header Section */}
      <div className="detail-header">
        <img 
          src={restaurant.image_url || 'https://via.placeholder.com/1200x400'} 
          alt={restaurant.name}
          className="header-image"
        />
        <div className="header-overlay">
          <div className="header-content">
            <h1>{restaurant.name}</h1>
            <p className="cuisine-type">{restaurant.cuisine_type}</p>
            <div className="header-meta">
              <span className="rating">⭐ {restaurant.rating || 'New'}</span>
              <span className="price-range">{restaurant.price_range}</span>
              <span className="location">📍 {restaurant.address}, {restaurant.city}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="detail-tabs">
        <button 
          className={`tab ${activeTab === 'about' ? 'active' : ''}`}
          onClick={() => setActiveTab('about')}
        >
          About
        </button>
        <button 
          className={`tab ${activeTab === 'menu' ? 'active' : ''}`}
          onClick={() => setActiveTab('menu')}
        >
          Menu
        </button>
      </div>

      {/* Content */}
      <div className="detail-content">
        {activeTab === 'about' && (
          <div className="about-section">
            <div className="info-card">
              <h2>About {restaurant.name}</h2>
              <p>{restaurant.description}</p>

              <div className="info-grid">
                <div className="info-item">
                  <strong>📞 Phone:</strong>
                  <span>{restaurant.phone}</span>
                </div>
                <div className="info-item">
                  <strong>📧 Email:</strong>
                  <span>{restaurant.email || 'Not provided'}</span>
                </div>
                <div className="info-item">
                  <strong>🕒 Opening Hours:</strong>
                  <span>{restaurant.opening_time.slice(0, 5)} - {restaurant.closing_time.slice(0, 5)}</span>
                </div>
                <div className="info-item">
                  <strong>💺 Total Seats:</strong>
                  <span>{restaurant.total_seats}</span>
                </div>
              </div>
            </div>

            <button className="btn-book-now" onClick={handleBookNow}>
              Book a Table
            </button>
          </div>
        )}

        {activeTab === 'menu' && (
          <div className="menu-section">
            {Object.keys(menu).length === 0 ? (
              <p>Menu not available</p>
            ) : (
              Object.entries(menu).map(([category, items]) => (
                <div key={category} className="menu-category">
                  <h3>{category.replace('_', ' ').toUpperCase()}</h3>
                  <div className="menu-items">
                    {items.map((item) => (
                      <div key={item.id} className="menu-item">
                        <div className="item-info">
                          <h4>{item.name}</h4>
                          <p>{item.description}</p>
                          <div className="item-tags">
                            {item.is_vegetarian && <span className="tag veg">🌱 Veg</span>}
                            {item.is_vegan && <span className="tag vegan">🥬 Vegan</span>}
                            {item.is_gluten_free && <span className="tag gf">🌾 Gluten Free</span>}
                          </div>
                        </div>
                        <div className="item-price">₹{item.price}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RestaurantDetail;