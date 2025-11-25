import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';
import PublicRoute from './routes/PublicRoute';

// Layout
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

// Auth Pages
import Login from './pages/Login';
import Register from './pages/Register';

// Customer Pages
import Restaurants from './pages/customer/Restaurants';
import RestaurantDetail from './pages/customer/RestaurantDetail';
import Booking from './pages/customer/Booking';
import MyBookings from './pages/customer/MyBookings';

// Placeholder components (will be built in next modules)
const CustomerReviews = () => <div style={{padding: '2rem'}}><h1>Customer - My Reviews (Coming in Module 10)</h1></div>;
const AdminDashboard = () => <div style={{padding: '2rem'}}><h1>Admin - Dashboard (Coming in Module 11)</h1></div>;
const AdminBookings = () => <div style={{padding: '2rem'}}><h1>Admin - Bookings (Coming in Module 11)</h1></div>;
const AdminAnalytics = () => <div style={{padding: '2rem'}}><h1>Admin - Analytics (Coming in Module 11)</h1></div>;

function App() {
  return (
    <Router>
      <AuthProvider>
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <Navbar />
          
          <main style={{ flex: 1 }}>
            <Routes>
              {/* Public Routes */}
              <Route 
                path="/login" 
                element={
                  <PublicRoute>
                    <Login />
                  </PublicRoute>
                } 
              />
              <Route 
                path="/register" 
                element={
                  <PublicRoute>
                    <Register />
                  </PublicRoute>
                } 
              />

              {/* Customer Routes */}
              <Route 
                path="/customer/restaurants" 
                element={
                  <ProtectedRoute requiredRole="customer">
                    <Restaurants />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/customer/restaurant/:id" 
                element={
                  <ProtectedRoute requiredRole="customer">
                    <RestaurantDetail />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/customer/booking/:id" 
                element={
                  <ProtectedRoute requiredRole="customer">
                    <Booking />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/customer/my-bookings" 
                element={
                  <ProtectedRoute requiredRole="customer">
                    <MyBookings />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/customer/my-reviews" 
                element={
                  <ProtectedRoute requiredRole="customer">
                    <CustomerReviews />
                  </ProtectedRoute>
                } 
              />

              {/* Admin Routes */}
              <Route 
                path="/admin/dashboard" 
                element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/bookings" 
                element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminBookings />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/analytics" 
                element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminAnalytics />
                  </ProtectedRoute>
                } 
              />

              {/* Default redirect */}
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </main>

          <Footer />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;