# 🍽️ DineNDash - Restaurant Reservation System

A full-stack restaurant reservation platform with customer and admin portals, featuring booking management, reviews with verification, and comprehensive analytics.

![DineNDash](https://img.shields.io/badge/Version-1.0.0-blue)
![Node](https://img.shields.io/badge/Node-14%2B-green)
![React](https://img.shields.io/badge/React-18.2-blue)
![MySQL](https://img.shields.io/badge/MySQL-8.0-orange)

---

## 📋 Table of Contents

- [Features](#features)
- [Technology Stack](#technology-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Database Setup](#database-setup)
- [Running the Application](#running-the-application)
- [API Testing](#api-testing)
- [Default Credentials](#default-credentials)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)

---

## ✨ Features

### Customer Features
- ✅ User Registration & Authentication (JWT-based)
- ✅ Browse restaurants with filters (cuisine, price, search)
- ✅ View restaurant details, menus, and reviews
- ✅ Book tables with date/time selection (7-day advance limit)
- ✅ Select number of seats and dietary preferences
- ✅ Pre-order menu items
- ✅ View and manage bookings
- ✅ Cancel bookings
- ✅ Submit reviews (only for approved bookings)
- ✅ View restaurant analytics (busy times)

### Admin Features
- ✅ Admin Authentication
- ✅ Dashboard with platform statistics
- ✅ View all bookings with filters
- ✅ Approve/Reject booking requests
- ✅ Comprehensive analytics dashboard
  - Booking trends
  - Peak hours analysis
  - Top restaurants
  - Revenue analytics
- ✅ Manage customer reviews

### System Features
- ✅ Role-based access control (Customer/Admin)
- ✅ Real-time seat availability checking
- ✅ Booking verification for reviews
- ✅ Automatic rating calculation
- ✅ Responsive design (mobile-friendly)

---

## 🛠️ Technology Stack

### Backend
- **Node.js** (v14+)
- **Express.js** - Web framework
- **MySQL** (v8.0+) - Database
- **MySQL2** - MySQL client
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Express Validator** - Input validation
- **Morgan** - Logging
- **CORS** - Cross-origin resource sharing

### Frontend
- **React.js** (v18.2)
- **React Router DOM** - Routing
- **Axios** - HTTP client
- **Context API** - State management
- **CSS3** - Styling

---

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v14.0.0 or higher)
- **npm** (v6.0.0 or higher)
- **MySQL** (v8.0 or higher)
- **Git**

### Check Versions
```bash
node --version
npm --version
mysql --version
git --version
```

---

## 🚀 Installation

### 1. Clone the Repository
```bash
git clone <your-repository-url>
cd DineNDash
```

### 2. Install Backend Dependencies
```bash
cd backend
npm install
```

### 3. Install Frontend Dependencies
```bash
cd ../frontend
npm install
```

---

## 🗄️ Database Setup

### 1. Create MySQL Database
Login to MySQL:
```bash
mysql -u root -p
```

Create database:
```sql
CREATE DATABASE dinendash;
EXIT;
```

### 2. Configure Backend Environment
```bash
cd backend
cp .env.example .env
```

Edit `.env` file with your MySQL credentials:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=dinendash
JWT_SECRET=your_secure_jwt_secret_key
```

### 3. Run Database Setup Script
This will create all tables and insert seed data:
```bash
cd backend
node database/setup.js
```

You should see:
```
✅ Database connected
✅ Schema created
✅ Seed data inserted
🎉 Database setup completed successfully!
```

### 4. Generate Time Slots
Create available time slots for restaurants:
```bash
node scripts/generateSlots.js
```

---

## 🏃‍♂️ Running the Application

### Development Mode

#### Start Backend Server
```bash
cd backend
npm run dev
```
Server will start at: `http://localhost:5000`

#### Start Frontend Application
Open a new terminal:
```bash
cd frontend
npm start
```
Application will open at: `http://localhost:3000`

### Production Mode

#### Backend
```bash
cd backend
npm start
```

#### Frontend
```bash
cd frontend
npm run build
# Serve the build folder with a static server
```

---

## 🧪 API Testing

### Using Postman

1. Import Postman collections from `backend/postman/` folder:
   - `DineNDash_Auth.postman_collection.json`
   - `DineNDash_Restaurants.postman_collection.json`
   - `DineNDash_Bookings.postman_collection.json`
   - `DineNDash_Reviews.postman_collection.json`
   - `DineNDash_Analytics.postman_collection.json`

2. Set base URL variable: `http://localhost:5000/api`

3. Test endpoints in order:
   - Authentication
   - Restaurants
   - Bookings
   - Reviews
   - Analytics

### Using cURL

#### Register
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "phone": "9876543216"
  }'
```

#### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

---

## 🔑 Default Credentials

### Admin Account
- **Email:** `admin@dinendash.com`
- **Password:** `password123`

### Customer Account
- **Email:** `john@example.com`
- **Password:** `password123`

**⚠️ Important:** Change these credentials in production!

---

## 📂 Project Structure
```
DineNDash/
├── backend/
│   ├── config/
│   │   └── database.js          # MySQL connection
│   ├── controllers/
│   │   ├── authController.js    # Authentication logic
│   │   ├── bookingController.js # Booking management
│   │   ├── restaurantController.js
│   │   ├── reviewController.js
│   │   ├── analyticsController.js
│   │   └── dietaryController.js
│   ├── middleware/
│   │   ├── authMiddleware.js    # JWT verification
│   │   └── errorHandler.js      # Global error handler
│   ├── models/
│   │   ├── User.js
│   │   ├── Restaurant.js
│   │   ├── Booking.js
│   │   ├── MenuItem.js
│   │   ├── TimeSlot.js
│   │   ├── Review.js
│   │   └── DietaryPreference.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── bookingRoutes.js
│   │   ├── restaurantRoutes.js
│   │   ├── reviewRoutes.js
│   │   ├── analyticsRoutes.js
│   │   └── dietaryRoutes.js
│   ├── services/
│   │   ├── bookingService.js    # Business logic
│   │   ├── reviewService.js
│   │   └── analyticsService.js
│   ├── utils/
│   │   ├── jwt.js               # JWT utilities
│   │   ├── passwordHash.js      # Password hashing
│   │   ├── responseHandler.js   # Response formatter
│   │   └── timeSlotGenerator.js # Time slot utilities
│   ├── validators/
│   │   ├── authValidator.js
│   │   ├── bookingValidator.js
│   │   ├── restaurantValidator.js
│   │   ├── reviewValidator.js
│   │   └── analyticsValidator.js
│   ├── database/
│   │   ├── schema.sql            # Database schema
│   │   ├── seeds.sql             # Seed data
│   │   ├── setup.js              # Setup script
│   │   └── ER_DIAGRAM.md         # Database diagram
│   ├── scripts/
│   │   └── generateSlots.js     # Time slot generator
│   ├── postman/
│   │   └── *.postman_collection.json
│   ├── .env.example
│   ├── .gitignore
│   ├── package.json
│   └── server.js                # Entry point
│
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── Layout/
│   │   │   │   ├── Navbar.js
│   │   │   │   ├── Navbar.css
│   │   │   │   ├── Footer.js
│   │   │   │   └── Footer.css
│   │   │   └── customer/
│   │   │       ├── RestaurantReviews.js
│   │   │       ├── RestaurantReviews.css
│   │   │       ├── RestaurantAnalytics.js
│   │   │       └── RestaurantAnalytics.css
│   │   ├── contexts/
│   │   │   └── AuthContext.js   # Auth state management
│   │   ├── pages/
│   │   │   ├── Login.js
│   │   │   ├── Register.js
│   │   │   ├── Auth.css
│   │   │   ├── customer/
│   │   │   │   ├── Restaurants.js
│   │   │   │   ├── Restaurants.css
│   │   │   │   ├── RestaurantDetail.js
│   │   │   │   ├── RestaurantDetail.css
│   │   │   │   ├── Booking.js
│   │   │   │   ├── Booking.css
│   │   │   │   ├── MyBookings.js
│   │   │   │   ├── MyBookings.css
│   │   │   │   ├── MyReviews.js
│   │   │   │   └── MyReviews.css
│   │   │   └── admin/
│   │   │       ├── Dashboard.js
│   │   │       ├── Dashboard.css
│   │   │       ├── Bookings.js
│   │   │       ├── Bookings.css
│   │   │       ├── Analytics.js
│   │   │       ├── Analytics.css
│   │   │       ├── Reviews.js
│   │   │       └── Reviews.css
│   │   ├── routes/
│   │   │   ├── ProtectedRoute.js
│   │   │   └── PublicRoute.js
│   │   ├── services/
│   │   │   ├── authService.js
│   │   │   ├── restaurantService.js
│   │   │   ├── bookingService.js
│   │   │   ├── reviewService.js
│   │   │   ├── dietaryService.js
│   │   │   ├── analyticsService.js
│   │   │   └── adminService.js
│   │   ├── utils/
│   │   │   └── api.js           # Axios configuration
│   │   ├── App.js               # Main component
│   │   ├── App.css
│   │   ├── index.js
│   │   └── index.css
│   ├── .env.example
│   ├── .gitignore
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints

#### Register Customer
```http
POST /auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "9876543210"
}
```

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Get Profile
```http
GET /auth/me
Authorization: Bearer <token>
```

### Restaurant Endpoints

#### Get All Restaurants
```http
GET /restaurants
GET /restaurants?cuisine_type=Italian
GET /restaurants?search=sushi
```

#### Get Restaurant Details
```http
GET /restaurants/:id
```

#### Get Restaurant Menu
```http
GET /restaurants/:id/menu
GET /restaurants/:id/menu?category=main_course
```

#### Get Time Slots
```http
GET /restaurants/:id/timeslots?date=2024-12-01
```

### Booking Endpoints (Customer)

#### Create Booking
```http
POST /bookings
Authorization: Bearer <customer_token>
Content-Type: application/json

{
  "restaurant_id": 1,
  "booking_date": "2024-12-01",
  "booking_time": "19:00:00",
  "number_of_seats": 4,
  "dietary_preference_id": 1,
  "special_requests": "Window seat",
  "menu_items": [
    { "menu_item_id": 1, "quantity": 2 }
  ]
}
```

#### Get My Bookings
```http
GET /bookings/my-bookings
Authorization: Bearer <customer_token>
```

#### Cancel Booking
```http
PUT /bookings/:id/cancel
Authorization: Bearer <customer_token>
```

### Booking Endpoints (Admin)

#### Get All Bookings
```http
GET /bookings
Authorization: Bearer <admin_token>
GET /bookings?status=pending
GET /bookings?restaurant_id=1
```

#### Approve Booking
```http
PUT /bookings/:id/approve
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "admin_notes": "Approved"
}
```

#### Reject Booking
```http
PUT /bookings/:id/reject
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "admin_notes": "Fully booked"
}
```

### Review Endpoints

#### Submit Review
```http
POST /reviews
Authorization: Bearer <customer_token>
Content-Type: application/json

{
  "booking_id": 1,
  "rating": 5,
  "comment": "Excellent experience!"
}
```

#### Get Reviews by Restaurant
```http
GET /reviews/restaurant/:restaurantId
GET /reviews/restaurant/:restaurantId?rating=5
```

### Analytics Endpoints

#### Get Restaurant Busy Times (Public)
```http
GET /analytics/restaurant/:restaurantId/busy-times
GET /analytics/restaurant/:restaurantId/busy-times?days=30
```

#### Get Platform Stats (Admin)
```http
GET /analytics/platform-stats
Authorization: Bearer <admin_token>
```

#### Get Admin Dashboard
```http
GET /analytics/admin-dashboard
Authorization: Bearer <admin_token>
```

---

## 🚀 Deployment

### Backend Deployment (Heroku Example)

#### 1. Install Heroku CLI
```bash
npm install -g heroku
```

#### 2. Login to Heroku
```bash
heroku login
```

#### 3. Create Heroku App
```bash
cd backend
heroku create dinendash-api
```

#### 4. Add MySQL Database
```bash
heroku addons:create cleardb:ignite
```

#### 5. Get Database URL
```bash
heroku config | grep CLEARDB_DATABASE_URL
```

#### 6. Set Environment Variables
```bash
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your_production_secret
heroku config:set CORS_ORIGIN=https://your-frontend-url.com
```

#### 7. Deploy
```bash
git add .
git commit -m "Deploy to Heroku"
git push heroku main
```

#### 8. Run Database Setup
```bash
heroku run node database/setup.js
heroku run node scripts/generateSlots.js
```

### Frontend Deployment (Vercel Example)

#### 1. Install Vercel CLI
```bash
npm install -g vercel
```

#### 2. Configure Environment
Create `.env.production`:
```env
REACT_APP_API_URL=https://your-heroku-app.herokuapp.com/api
```

#### 3. Build
```bash
cd frontend
npm run build
```

#### 4. Deploy
```bash
vercel --prod
```

### Alternative: Railway Deployment

#### Backend
1. Connect GitHub repository to Railway
2. Add MySQL database
3. Set environment variables
4. Deploy automatically

#### Frontend
1. Connect to Netlify/Vercel
2. Set build command: `npm run build`
3. Set publish directory: `build`
4. Add environment variables
5. Deploy

---

## 🐛 Troubleshooting

### Common Issues

#### 1. Database Connection Failed
```
Error: ER_ACCESS_DENIED_ERROR
```
**Solution:**
- Check MySQL credentials in `.env`
- Ensure MySQL server is running
- Verify user has correct permissions

#### 2. Port Already in Use
```
Error: EADDRINUSE: address already in use :::5000
```
**Solution:**
```bash
# Find process using port
lsof -i :5000
# Kill process
kill -9 <PID>
```

#### 3. JWT Token Invalid
```
Error: Invalid or expired token
```
**Solution:**
- Check JWT_SECRET in `.env`
- Re-login to get new token
- Check token expiration time

#### 4. CORS Error
```
Access-Control-Allow-Origin error
```
**Solution:**
- Check CORS_ORIGIN in backend `.env`
- Ensure frontend URL matches
- Restart backend server

#### 5. Database Schema Issues
```
Error: Table doesn't exist
```
**Solution:**
```bash
# Re-run setup script
cd backend
node database/setup.js
```

#### 6. Time Slots Not Available
**Solution:**
```bash
cd backend
node scripts/generateSlots.js
```

### Reset Everything

If you need to start fresh:
```bash
# Drop and recreate database
mysql -u root -p -e "DROP DATABASE dinendash; CREATE DATABASE dinendash;"

# Re-run setup
cd backend
node database/setup.js
node scripts/generateSlots.js

# Clear browser localStorage
# Open browser console and run:
localStorage.clear()
```

---

## 🧪 Testing Checklist

### Pre-Deployment Testing

#### Backend API Tests
- [ ] All endpoints respond correctly
- [ ] Authentication works (register/login)
- [ ] JWT tokens are validated
- [ ] Role-based access control works
- [ ] Input validation catches errors
- [ ] Database operations successful
- [ ] Error messages are clear

#### Frontend Tests
- [ ] All pages load correctly
- [ ] Navigation works
- [ ] Forms validate input
- [ ] Protected routes redirect
- [ ] API calls succeed
- [ ] Loading states display
- [ ] Error messages show
- [ ] Responsive on mobile

#### User Flow Tests
**Customer Flow:**
- [ ] Register new account
- [ ] Login successfully
- [ ] Browse restaurants
- [ ] Filter and search work
- [ ] View restaurant details
- [ ] Create booking
- [ ] View my bookings
- [ ] Cancel booking
- [ ] Submit review
- [ ] View analytics

**Admin Flow:**
- [ ] Login as admin
- [ ] View dashboard
- [ ] See pending bookings
- [ ] Approve booking
- [ ] Reject booking
- [ ] View analytics
- [ ] Filter data
- [ ] View reviews

---

## 📝 Environment Variables Reference

### Backend Variables
| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `PORT` | Server port | No | 5000 |
| `NODE_ENV` | Environment | Yes | development |
| `DB_HOST` | MySQL host | Yes | localhost |
| `DB_USER` | MySQL user | Yes | root |
| `DB_PASSWORD` | MySQL password | Yes | - |
| `DB_NAME` | Database name | Yes | dinendash |
| `DB_PORT` | MySQL port | No | 3306 |
| `JWT_SECRET` | JWT secret key | Yes | - |
| `JWT_EXPIRE` | Token expiration | No | 7d |
| `CORS_ORIGIN` | Frontend URL | Yes | http://localhost:3000 |

### Frontend Variables
| Variable | Description | Required |
|----------|-------------|----------|
| `REACT_APP_API_URL` | Backend API URL | Yes |

---

## 📊 Database Schema Summary

### Tables
1. **users** - User accounts (customers & admins)
2. **restaurants** - Restaurant information
3. **time_slots** - Available booking slots
4. **menu_items** - Restaurant menu items
5. **dietary_preferences** - Dietary options
6. **bookings** - Reservation records
7. **booking_menu_items** - Pre-ordered items
8. **reviews** - Customer reviews

### Key Relationships
- Users → Bookings (1:N)
- Restaurants → Bookings (1:N)
- Restaurants → Menu Items (1:N)
- Bookings → Reviews (1:1)
- Bookings → Booking Menu Items (1:N)

---

## 🔒 Security Best Practices

### Production Checklist
- [ ] Change default admin password
- [ ] Use strong JWT secret (64+ characters)
- [ ] Enable HTTPS
- [ ] Set secure CORS origins
- [ ] Use environment variables
- [ ] Enable rate limiting
- [ ] Sanitize user inputs
- [ ] Use prepared statements (already implemented)
- [ ] Keep dependencies updated
- [ ] Monitor error logs

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 👥 Authors

- Kanchi Katiyar (riyakatiyarr12)

---

## 🙏 Acknowledgments

- Express.js community
- React.js community
- MySQL documentation
- All contributors

---

## 🎯 Future Enhancements

- [ ] Email notifications
- [ ] SMS alerts
- [ ] Payment gateway integration
- [ ] Table management system
- [ ] Loyalty points system
- [ ] Multi-restaurant chains support
- [ ] Mobile app (React Native)
- [ ] Real-time chat support
- [ ] Social media integration
- [ ] Advanced reporting

---
