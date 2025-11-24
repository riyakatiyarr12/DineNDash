-- DineNDash Database Schema
-- Drop existing tables if they exist (in correct order due to foreign keys)
DROP TABLE IF EXISTS reviews;
DROP TABLE IF EXISTS booking_menu_items;
DROP TABLE IF EXISTS bookings;
DROP TABLE IF EXISTS time_slots;
DROP TABLE IF EXISTS menu_items;
DROP TABLE IF EXISTS dietary_preferences;
DROP TABLE IF EXISTS restaurants;
DROP TABLE IF EXISTS users;

-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(15) NOT NULL,
    role ENUM('customer', 'admin') DEFAULT 'customer',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- RESTAURANTS TABLE
-- ============================================
CREATE TABLE restaurants (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    address VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    phone VARCHAR(15) NOT NULL,
    email VARCHAR(100),
    cuisine_type VARCHAR(100) NOT NULL,
    price_range ENUM('$', '$$', '$$$', '$$$$') DEFAULT '$$',
    opening_time TIME NOT NULL,
    closing_time TIME NOT NULL,
    total_seats INT NOT NULL DEFAULT 50,
    image_url VARCHAR(500),
    rating DECIMAL(3,2) DEFAULT 0.00,
    total_reviews INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_cuisine (cuisine_type),
    INDEX idx_city (city),
    INDEX idx_rating (rating)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- TIME_SLOTS TABLE
-- ============================================
CREATE TABLE time_slots (
    id INT PRIMARY KEY AUTO_INCREMENT,
    restaurant_id INT NOT NULL,
    slot_date DATE NOT NULL,
    slot_time TIME NOT NULL,
    available_seats INT NOT NULL,
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
    UNIQUE KEY unique_slot (restaurant_id, slot_date, slot_time),
    INDEX idx_date (slot_date),
    INDEX idx_restaurant_date (restaurant_id, slot_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- MENU_ITEMS TABLE
-- ============================================
CREATE TABLE menu_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    restaurant_id INT NOT NULL,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    category ENUM('appetizer', 'main_course', 'dessert', 'beverage', 'special') NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    is_vegetarian BOOLEAN DEFAULT FALSE,
    is_vegan BOOLEAN DEFAULT FALSE,
    is_gluten_free BOOLEAN DEFAULT FALSE,
    image_url VARCHAR(500),
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
    INDEX idx_restaurant (restaurant_id),
    INDEX idx_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- DIETARY_PREFERENCES TABLE
-- ============================================
CREATE TABLE dietary_preferences (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) UNIQUE NOT NULL,
    description VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- BOOKINGS TABLE
-- ============================================
CREATE TABLE bookings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    booking_reference VARCHAR(20) UNIQUE NOT NULL,
    user_id INT NOT NULL,
    restaurant_id INT NOT NULL,
    booking_date DATE NOT NULL,
    booking_time TIME NOT NULL,
    number_of_seats INT NOT NULL,
    dietary_preference_id INT,
    special_requests TEXT,
    status ENUM('pending', 'approved', 'rejected', 'cancelled', 'completed') DEFAULT 'pending',
    admin_notes TEXT,
    approved_by INT,
    approved_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
    FOREIGN KEY (dietary_preference_id) REFERENCES dietary_preferences(id) ON DELETE SET NULL,
    FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user (user_id),
    INDEX idx_restaurant (restaurant_id),
    INDEX idx_status (status),
    INDEX idx_booking_date (booking_date),
    INDEX idx_reference (booking_reference)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- BOOKING_MENU_ITEMS (Junction Table)
-- ============================================
CREATE TABLE booking_menu_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    booking_id INT NOT NULL,
    menu_item_id INT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    price_at_booking DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    FOREIGN KEY (menu_item_id) REFERENCES menu_items(id) ON DELETE CASCADE,
    UNIQUE KEY unique_booking_item (booking_id, menu_item_id),
    INDEX idx_booking (booking_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- REVIEWS TABLE
-- ============================================
CREATE TABLE reviews (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    restaurant_id INT NOT NULL,
    booking_id INT NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    UNIQUE KEY unique_booking_review (booking_id),
    INDEX idx_restaurant (restaurant_id),
    INDEX idx_rating (rating)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- Create a trigger to update restaurant rating
-- ============================================
DELIMITER //

CREATE TRIGGER update_restaurant_rating_after_insert
AFTER INSERT ON reviews
FOR EACH ROW
BEGIN
    UPDATE restaurants
    SET rating = (
        SELECT ROUND(AVG(rating), 2)
        FROM reviews
        WHERE restaurant_id = NEW.restaurant_id
    ),
    total_reviews = (
        SELECT COUNT(*)
        FROM reviews
        WHERE restaurant_id = NEW.restaurant_id
    )
    WHERE id = NEW.restaurant_id;
END//

CREATE TRIGGER update_restaurant_rating_after_update
AFTER UPDATE ON reviews
FOR EACH ROW
BEGIN
    UPDATE restaurants
    SET rating = (
        SELECT ROUND(AVG(rating), 2)
        FROM reviews
        WHERE restaurant_id = NEW.restaurant_id
    )
    WHERE id = NEW.restaurant_id;
END//

CREATE TRIGGER update_restaurant_rating_after_delete
AFTER DELETE ON reviews
FOR EACH ROW
BEGIN
    UPDATE restaurants
    SET rating = COALESCE((
        SELECT ROUND(AVG(rating), 2)
        FROM reviews
        WHERE restaurant_id = OLD.restaurant_id
    ), 0),
    total_reviews = (
        SELECT COUNT(*)
        FROM reviews
        WHERE restaurant_id = OLD.restaurant_id
    )
    WHERE id = OLD.restaurant_id;
END//

DELIMITER ;