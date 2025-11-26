# 🧪 DineNDash Testing Guide

Comprehensive testing documentation for DineNDash.

---

## Table of Contents

- [Testing Setup](#testing-setup)
- [Manual Testing](#manual-testing)
- [API Testing](#api-testing)
- [User Flow Testing](#user-flow-testing)
- [Performance Testing](#performance-testing)
- [Security Testing](#security-testing)

---

## Testing Setup

### Prerequisites
```bash
# Ensure development environment is running
cd backend && npm run dev
cd frontend && npm start
```

### Test Data
Use the seeded data from `backend/database/seeds.sql`:
- Admin: `admin@dinendash.com` / `password123`
- Customer: `john@example.com` / `password123`

---

## Manual Testing

### Backend API Tests

#### 1. Health Check
```bash
curl http://localhost:5000/api/health
```
**Expected:** HTTP 200, health status message

#### 2. Authentication Flow
```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "testuser@test.com",
    "password": "test123",
    "phone": "9876543299"
  }'

# Expected: 201, user object + token

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@test.com",
    "password": "test123"
  }'

# Expected: 200, user object + token
```

#### 3. Restaurant Endpoints
```bash
# Get all restaurants
curl http://localhost:5000/api/restaurants

# Get restaurant by ID
curl http://localhost:5000/api/restaurants/1

# Get menu
curl http://localhost:5000/api/restaurants/1/menu

# Get time slots
curl "http://localhost:5000/api/restaurants/1/timeslots?date=2024-12-15"
```

#### 4. Booking Flow (Customer)
```bash
# Set your customer token
TOKEN="your_customer_jwt_token"

# Create booking
curl -X POST http://localhost:5000/api/bookings \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "restaurant_id": 1,
    "booking_date": "2024-12-15",
    "booking_time": "19:00:00",
    "number_of_seats": 2,
    "dietary_preference_id": 1
  }'

# Expected: 201, booking created

# Get my bookings
curl -X GET http://localhost:5000/api/bookings/my-bookings \
  -H "Authorization: Bearer $TOKEN"

# Expected: 200, list of bookings
```

#### 5. Admin Actions
```bash
# Set your admin token
ADMIN_TOKEN="your_admin_jwt_token"

# Get all bookings
curl -X GET http://localhost:5000/api/bookings \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Approve booking
curl -X PUT http://localhost:5000/api/bookings/1/approve \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"admin_notes": "Approved"}'

# Expected: 200, booking approved
```

---

## API Testing

### Using Postman

#### Import Collections
1. Open Postman
2. Import → File → Select all `.postman_collection.json` files from `backend/postman/`
3. Set environment variable `base_url` = `http://localhost:5000/api`

#### Test Sequence
1. **Authentication Collection**
   - Register Customer ✓
   - Login Customer (save token) ✓
   - Login Admin (save token) ✓
   - Get Profile ✓

2. **Restaurants Collection**
   - Get All Restaurants ✓
   - Filter by Cuisine ✓
   - Search Restaurants ✓
   - Get Restaurant Details ✓
   - Get Menu ✓
   - Get Time Slots ✓

3. **Bookings Collection** (Customer)
   - Create Booking ✓
   - Get My Bookings ✓
   - View Booking Details ✓
   - Cancel Booking ✓

4. **Bookings Collection** (Admin)
   - Get All Bookings ✓
   - Filter by Status ✓
   - Approve Booking ✓
   - Reject Booking ✓

5. **Reviews Collection**
   - Submit Review ✓
   - Get My Reviews ✓
   - Get Restaurant Reviews ✓

6. **Analytics Collection**
   - Get Restaurant Busy Times ✓
   - Get Platform Stats (Admin) ✓
   - Get Dashboard Overview (Admin) ✓

---

## User Flow Testing

### Customer Journey

#### Test Case 1: New User Registration and Booking
**Steps:**
1. Navigate to `http://localhost:3000`
2. Click "Register"
3. Fill form:
   - Name: "Test Customer"
   - Email: "customer@test.com"
   - Password: "test123"
   - Phone: "9876543288"
4. Click "Register"
5. **Expected:** Redirect to restaurants page
6. Search for "Italian"
7. Click on "The Italian Corner"
8. Click "Book a Table"
9. Select date (tomorrow)
10. Select time slot
11. Select 2 guests
12. Add special requests: "Window seat"
13. Click "Confirm Booking"
14. **Expected:** Success message, redirect to My Bookings
15. **Verify:** Booking status = "Pending"

**Pass Criteria:**
- ✓ Registration successful
- ✓ Auto-login after registration
- ✓ Booking created
- ✓ Booking appears in My Bookings
- ✓ Status shows as "Pending"

#### Test Case 2: Submit Review After Approved Booking
**Prerequisites:** Have an approved booking

**Steps:**
1. Login as customer
2. Go to "My Reviews"
3. See booking in "Pending Review" section
4. Click "Review"
5. Select 5 stars
6. Write comment (min 10 chars): "Excellent experience!"
7. Click "Submit Review"
8. **Expected:** Success message
9. Navigate to restaurant detail page
10. Click "Reviews" tab
11. **Verify:** Review appears

**Pass Criteria:**
- ✓ Review form validates (min 10 chars)
- ✓ Review submitted successfully
- ✓ Review appears on restaurant page
- ✓ Rating updates restaurant average

### Admin Journey

#### Test Case 3: Admin Approval Workflow
**Steps:**
1. Login as admin (`admin@dinendash.com` / `password123`)
2. **Expected:** Redirect to admin dashboard
3. Check "Pending Approvals" section
4. Click "Review Now"
5. **Expected:** Navigate to bookings page with pending filter
6. Click "View" on first booking
7. Review booking details
8. Click "Approve"
9. Add admin notes: "Table prepared"
10. Click "Confirm Approval"
11. **Expected:** Success message
12. **Verify:** Booking status = "Approved"

**Pass Criteria:**
- ✓ Dashboard shows pending count
- ✓ Booking details load correctly
- ✓ Approval process works
- ✓ Status updates immediately
- ✓ Customer can see approved status

#### Test Case 4: View Analytics
**Steps:**
1. Login as admin
2. Navigate to "Analytics"
3. **Verify:** All sections load
   - Platform stats
   - Booking trends chart
   - Revenue analytics
   - Peak hours
   - Top restaurants
4. Change trend period to "Weekly"
5. **Expected:** Chart updates
6. Change revenue period to "Monthly"
7. **Expected:** Data updates

**Pass Criteria:**
- ✓ All analytics load without errors
- ✓ Charts render correctly
- ✓ Filters work properly
- ✓ Data is accurate

---

## Performance Testing

### Load Testing with Apache Bench

#### Test 1: Health Endpoint
```bash
ab -n 1000 -c 10 http://localhost:5000/api/health
```
**Expected:**
- Requests per second: > 100
- Failed requests: 0
- Time per request: < 100ms

#### Test 2: Restaurant Listing
```bash
ab -n 500 -c 10 http://localhost:5000/api/restaurants
```
**Expected:**
- Requests per second: > 50
- Failed requests: 0
- Time per request: < 200ms

#### Test 3: Authenticated Endpoint
```bash
ab -n 100 -c 5 -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/bookings/my-bookings
```
**Expected:**
- Requests per second: > 30
- Failed requests: 0
- Time per request: < 300ms

### Database Performance

#### Check Query Performance
```sql
-- Enable query profiling
SET profiling = 1;

-- Run queries
SELECT * FROM restaurants WHERE is_active = TRUE;
SELECT * FROM bookings WHERE status = 'pending';

-- Show profiles
SHOW PROFILES;
```

**Expected:** All queries < 0.1 seconds

#### Check Indexes
```sql
SHOW INDEX FROM bookings;
SHOW INDEX FROM restaurants;
SHOW INDEX FROM reviews;
```

**Verify:** All foreign keys are indexed

---

## Security Testing

### Authentication Tests

#### Test 1: Invalid Token
```bash
curl -X GET http://localhost:5000/api/bookings/my-bookings \
  -H "Authorization: Bearer invalid_token"
```
**Expected:** HTTP 401, "Invalid or expired token"

#### Test 2: Missing Token
```bash
curl -X GET http://localhost:5000/api/bookings/my-bookings
```
**Expected:** HTTP 401, "Access denied. No token provided."

#### Test 3: Role-Based Access
```bash
# Customer trying to access admin endpoint
curl -X GET http://localhost:5000/api/bookings \
  -H "Authorization: Bearer CUSTOMER_TOKEN"
```
**Expected:** HTTP 403, "Access denied. Admin privileges required."

### Input Validation Tests

#### Test 1: SQL Injection Prevention
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@dinendash.com OR 1=1--",
    "password": "anything"
  }'
```
**Expected:** HTTP 401, login fails (prepared statements prevent SQL injection)

#### Test 2: XSS Prevention
```bash
curl -X POST http://localhost:5000/api/reviews \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "booking_id": 1,
    "rating": 5,
    "comment": "<script>alert(\"XSS\")</script>"
  }'
```
**Expected:** Review created, but script tags sanitized in database

#### Test 3: Invalid Date Format
```bash
curl -X POST http://localhost:5000/api/bookings 
  -H "Authorization: Bearer TOKEN" 
  -H "Content-Type: application/json" 
  -d '{
    "restaurant_id": 1,
    "booking_date": "not-a-date",
    "booking_time": "19:00:00",
    "number_of_seats": 2
  }'
  **Expected:** HTTP 400, validation error

---

## Browser Testing

### Cross-Browser Compatibility

Test on:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Chrome
- [ ] Mobile Safari

**Features to Test:**
- Login/Registration
- Restaurant browsing
- Booking flow
- Review submission
- Admin dashboard
- Responsive design

### Responsive Testing

Test breakpoints:
- [ ] Mobile: 320px - 480px
- [ ] Tablet: 768px - 1024px
- [ ] Desktop: 1024px+

---

## Automated Testing (Future Enhancement)

### Backend Unit Tests (Jest)
```javascript
// Example: authController.test.js
describe('Auth Controller', () => {
  test('should register new user', async () => {
    // Test implementation
  });
  
  test('should login with valid credentials', async () => {
    // Test implementation
  });
});
```

### Frontend Unit Tests (React Testing Library)
```javascript
// Example: Login.test.js
describe('Login Component', () => {
  test('renders login form', () => {
    // Test implementation
  });
  
  test('submits form with valid data', () => {
    // Test implementation
  });
});
```

---

## Test Results Template
Test Run: YYYY-MM-DD
Environment

Node Version: X.X.X
MySQL Version: X.X.X
Browser: Chrome XX

Backend API Tests

Health Check: ✓ PASS
Authentication: ✓ PASS
Restaurants: ✓ PASS
Bookings: ✓ PASS
Reviews: ✓ PASS
Analytics: ✓ PASS

Frontend Tests

Registration: ✓ PASS
Login: ✓ PASS
Booking Flow: ✓ PASS
Review Submission: ✓ PASS
Admin Dashboard: ✓ PASS

Performance Tests

Load Test (Health): ✓ PASS (120 req/s)
Load Test (Restaurants): ✓ PASS (65 req/s)
Database Queries: ✓ PASS (< 0.1s)

Security Tests

Authentication: ✓ PASS
Authorization: ✓ PASS
Input Validation: ✓ PASS
SQL Injection: ✓ PASS

Issues Found

None

Notes
All tests passed successfully.

---

**Testing Checklist:**
- [ ] All API endpoints tested
- [ ] User flows completed
- [ ] Security tests passed
- [ ] Performance acceptable
- [ ] Cross-browser compatible
- [ ] Mobile responsive
- [ ] Admin features working
- [ ] Customer features working
- [ ] Error handling verified
- [ ] Documentation updated

---

**Last Updated:** November 2025
