const { verifyToken } = require('../utils/jwt');
const { errorResponse } = require('../utils/responseHandler');
const User = require('../models/User');

// Verify JWT token and authenticate user
const authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errorResponse(res, 401, 'Access denied. No token provided.');
    }

    const token = authHeader.split(' ')[1];

    // Verify token
    const decoded = verifyToken(token);
    
    // Get user from database
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return errorResponse(res, 401, 'Invalid token. User not found.');
    }

    if (!user.is_active) {
      return errorResponse(res, 403, 'Your account has been deactivated.');
    }

    // Attach user to request object
    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    };

    next();
  } catch (error) {
    return errorResponse(res, 401, 'Invalid or expired token.');
  }
};

// Check if user is admin
const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return errorResponse(res, 403, 'Access denied. Admin privileges required.');
  }
  next();
};

// Check if user is customer
const isCustomer = (req, res, next) => {
  if (req.user.role !== 'customer') {
    return errorResponse(res, 403, 'Access denied. Customer privileges required.');
  }
  next();
};

module.exports = {
  authenticate,
  isAdmin,
  isCustomer
};