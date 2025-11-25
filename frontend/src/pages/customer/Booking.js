import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import restaurantService from '../../services/restaurantService';
import bookingService from '../../services/bookingService';
import dietaryService from '../../services/dietaryService';
import './Booking.css';

const Booking = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [restaurant, setRestaurant] = useState(null);
    const [menu, setMenu] = useState({});
    const [dietaryPreferences, setDietaryPreferences] = useState([]);
    const [timeSlots, setTimeSlots] = useState([]);

    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [bookingData, setBookingData] = useState({
        booking_date: '',
        booking_time: '',
        number_of_seats: 2,
        dietary_preference_id: '',
        special_requests: '',
        menu_items: []
    });

    useEffect(() => {
        fetchInitialData();
    }, [id]);

    useEffect(() => {
        if (bookingData.booking_date) {
            fetchTimeSlots();
        }
    }, [bookingData.booking_date]);

    const fetchInitialData = async () => {
        try {
            const [restaurantRes, menuRes, dietaryRes] = await Promise.all([
                restaurantService.getById(id),
                restaurantService.getMenu(id),
                dietaryService.getAll()
            ]);

            setRestaurant(restaurantRes.data.restaurant);
            setMenu(menuRes.data.menu);
            setDietaryPreferences(dietaryRes.data.preferences);
        } catch (err) {
            setError('Failed to load booking information');
        }
    };

    const fetchTimeSlots = async () => {
        try {
            const response = await restaurantService.getTimeSlots(id, bookingData.booking_date);
            setTimeSlots(response.data.slots);
        } catch (err) {
            setError('Failed to load time slots');
        }
    };

    const getMinDate = () => {
        const today = new Date();
        return today.toISOString().split('T')[0];
    };

    const getMaxDate = () => {
        const maxDate = new Date();
        maxDate.setDate(maxDate.getDate() + 7);
        return maxDate.toISOString().split('T')[0];
    };

    const handleInputChange = (e) => {
        setBookingData({
            ...bookingData,
            [e.target.name]: e.target.value
        });
    };

    const toggleMenuItem = (itemId, price) => {
        const existingItem = bookingData.menu_items.find(item => item.menu_item_id === itemId);

        if (existingItem) {
            setBookingData({
                ...bookingData,
                menu_items: bookingData.menu_items.filter(item => item.menu_item_id !== itemId)
            });
        } else {
            setBookingData({
                ...bookingData,
                menu_items: [...bookingData.menu_items, { menu_item_id: itemId, quantity: 1, price }]
            });
        }
    };

    const updateMenuItemQuantity = (itemId, quantity) => {
        setBookingData({
            ...bookingData,
            menu_items: bookingData.menu_items.map(item =>
                item.menu_item_id === itemId ? { ...item, quantity: parseInt(quantity) } : item
            )
        });
    };

    const validateStep = () => {
        if (step === 1) {
            if (!bookingData.booking_date || !bookingData.booking_time) {
                setError('Please select date and time');
                return false;
            }
        }
        setError('');
        return true;
    };
    const handleNext = () => {
        if (validateStep()) {
            setStep(step + 1);
        }
    };
    const handleBack = () => {
        setStep(step - 1);
        setError('');
    };
    const handleSubmit = async () => {
        setLoading(true);
        setError('');
        try {
            const submissionData = {
                restaurant_id: parseInt(id),
                ...bookingData,
                dietary_preference_id: bookingData.dietary_preference_id || null
            };

            const response = await bookingService.create(submissionData);

            if (response.success) {
                navigate('/customer/my-bookings', {
                    state: { message: 'Booking created successfully! Waiting for admin approval.' }
                });
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create booking');
        } finally {
            setLoading(false);
        }
    };
    if (!restaurant) {
        return <div className="loading">Loading...</div>;
    }
    return (
        <div className="booking-page">
            <div className="booking-container">
                {/* Restaurant Info Header */}
                <div className="booking-header">
                    <h2>{restaurant.name}</h2>
                    <p>{restaurant.cuisine_type} • {restaurant.address}</p>
                </div>
                {/* Progress Steps */}
                <div className="booking-steps">
                    <div className={`step ${step >= 1 ? 'active' : ''}`}>
                        <div className="step-number">1</div>
                        <div className="step-label">Date & Time</div>
                    </div>
                    <div className={`step ${step >= 2 ? 'active' : ''}`}>
                        <div className="step-number">2</div>
                        <div className="step-label">Guests & Preferences</div>
                    </div>
                    <div className={`step ${step >= 3 ? 'active' : ''}`}>
                        <div className="step-number">3</div>
                        <div className="step-label">Menu (Optional)</div>
                    </div>
                    <div className={`step ${step >= 4 ? 'active' : ''}`}>
                        <div className="step-number">4</div>
                        <div className="step-label">Confirm</div>
                    </div>
                </div>

                {error && <div className="alert alert-error">{error}</div>}

                {/* Step 1: Date & Time */}
                {step === 1 && (
                    <div className="booking-step">
                        <h3>Select Date & Time</h3>

                        <div className="form-group">
                            <label>Booking Date</label>
                            <input
                                type="date"
                                name="booking_date"
                                value={bookingData.booking_date}
                                onChange={handleInputChange}
                                min={getMinDate()}
                                max={getMaxDate()}
                                className="form-input"
                                required
                            />
                            <small>You can book up to 7 days in advance</small>
                        </div>

                        {bookingData.booking_date && timeSlots.length > 0 && (
                            <div className="form-group">
                                <label>Available Time Slots</label>
                                <div className="time-slots-grid">
                                    {timeSlots.map((slot) => (
                                        <button
                                            key={slot.id}
                                            type="button"
                                            className={`time-slot ${bookingData.booking_time === slot.slot_time ? 'selected' : ''}`}
                                            onClick={() => setBookingData({ ...bookingData, booking_time: slot.slot_time })}
                                        >
                                            {slot.slot_time.slice(0, 5)}
                                            <span className="seats-available">{slot.available_seats} seats</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {bookingData.booking_date && timeSlots.length === 0 && (
                            <p className="no-slots">No available time slots for this date</p>
                        )}

                        <button
                            className="btn-next"
                            onClick={handleNext}
                            disabled={!bookingData.booking_date || !bookingData.booking_time}
                        >
                            Next
                        </button>
                    </div>
                )}

                {/* Step 2: Guests & Preferences */}
                {step === 2 && (
                    <div className="booking-step">
                        <h3>Guests & Dietary Preferences</h3>

                        <div className="form-group">
                            <label>Number of Guests</label>
                            <select
                                name="number_of_seats"
                                value={bookingData.number_of_seats}
                                onChange={handleInputChange}
                                className="form-input"
                            >
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                                    <option key={num} value={num}>{num} Guest{num > 1 ? 's' : ''}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Dietary Preferences (Optional)</label>
                            <select
                                name="dietary_preference_id"
                                value={bookingData.dietary_preference_id}
                                onChange={handleInputChange}
                                className="form-input"
                            >
                                <option value="">None</option>
                                {dietaryPreferences.map(pref => (
                                    <option key={pref.id} value={pref.id}>{pref.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Special Requests (Optional)</label>
                            <textarea
                                name="special_requests"
                                value={bookingData.special_requests}
                                onChange={handleInputChange}
                                className="form-textarea"
                                rows="4"
                                placeholder="Any special requirements or requests..."
                            />
                        </div>

                        <div className="button-group">
                            <button className="btn-back" onClick={handleBack}>Back</button>
                            <button className="btn-next" onClick={handleNext}>Next</button>
                        </div>
                    </div>
                )}

                {/* Step 3: Menu Selection */}
                {step === 3 && (
                    <div className="booking-step">
                        <h3>Pre-order Menu (Optional)</h3>
                        <p className="step-description">Select items you'd like to order</p>

                        {Object.entries(menu).map(([category, items]) => (
                            <div key={category} className="menu-category-booking">
                                <h4>{category.replace('_', ' ').toUpperCase()}</h4>
                                <div className="menu-items-booking">
                                    {items.map(item => {
                                        const selectedItem = bookingData.menu_items.find(mi => mi.menu_item_id === item.id);
                                        return (
                                            <div key={item.id} className="menu-item-booking">
                                                <div className="item-info-booking">
                                                    <input
                                                        type="checkbox"
                                                        checked={!!selectedItem}
                                                        onChange={() => toggleMenuItem(item.id, item.price)}
                                                    />
                                                    <div>
                                                        <h5>{item.name}</h5>
                                                        <p>{item.description}</p>
                                                        <span className="item-price-booking">₹{item.price}</span>
                                                    </div>
                                                </div>
                                                {selectedItem && (
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        value={selectedItem.quantity}
                                                        onChange={(e) => updateMenuItemQuantity(item.id, e.target.value)}
                                                        className="quantity-input"
                                                    />
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}

                        <div className="button-group">
                            <button className="btn-back" onClick={handleBack}>Back</button>
                            <button className="btn-next" onClick={handleNext}>Next</button>
                        </div>
                    </div>
                )}

                {/* Step 4: Confirmation */}
                {step === 4 && (
                    <div className="booking-step">
                        <h3>Confirm Your Booking</h3>

                        <div className="confirmation-details">
                            <div className="detail-row">
                                <strong>Restaurant:</strong>
                                <span>{restaurant.name}</span>
                            </div>
                            <div className="detail-row">
                                <strong>Date:</strong>
                                <span>{new Date(bookingData.booking_date).toLocaleDateString('en-IN', {
                                    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                                })}</span>
                            </div>
                            <div className="detail-row">
                                <strong>Time:</strong>
                                <span>{bookingData.booking_time.slice(0, 5)}</span>
                            </div>
                            <div className="detail-row">
                                <strong>Guests:</strong>
                                <span>{bookingData.number_of_seats}</span>
                            </div>
                            {bookingData.dietary_preference_id && (
                                <div className="detail-row">
                                    <strong>Dietary Preference:</strong>
                                    <span>{dietaryPreferences.find(p => p.id === parseInt(bookingData.dietary_preference_id))?.name}</span>
                                </div>
                            )}
                            {bookingData.special_requests && (
                                <div className="detail-row">
                                    <strong>Special Requests:</strong>
                                    <span>{bookingData.special_requests}</span>
                                </div>
                            )}
                        </div>

                        {bookingData.menu_items.length > 0 && (
                            <div className="selected-menu-items">
                                <h4>Pre-ordered Items:</h4>
                                {bookingData.menu_items.map(item => {
                                    const menuItem = Object.values(menu).flat().find(mi => mi.id === item.menu_item_id);
                                    return (
                                        <div key={item.menu_item_id} className="selected-item">
                                            <span>{menuItem?.name} x {item.quantity}</span>
                                            <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        <div className="important-note">
                            <strong>Note:</strong> Payment will be made at the restaurant. Your booking is subject to admin approval.
                        </div>

                        <div className="button-group">
                            <button className="btn-back" onClick={handleBack}>Back</button>
                            <button
                                className="btn-confirm"
                                onClick={handleSubmit}
                                disabled={loading}
                            >
                                {loading ? 'Submitting...' : 'Confirm Booking'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
export default Booking;