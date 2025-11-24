const User = require('../models/User');
const { hashPassword, comparePassword } = require('../utils/passwordHash');
const { generateToken } = require('../utils/jwt');
const { successResponse, errorResponse } = require('../utils/responseHandler');

// @desc    Register new customer
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return errorResponse(res, 400, 'Email already registered');
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const userId = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
      role: 'customer'
    });

    // Get created user (without password)
    const user = await User.findById(userId);

    // Generate token
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role
    });

    return successResponse(res, 201, 'Registration successful', {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      },
      token
    });

  } catch (error) {
    console.error('Registration error:', error);
    return errorResponse(res, 500, 'Registration failed. Please try again.');
  }
};

// @desc    Login user (customer or admin)
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findByEmail(email);
    if (!user) {
      return errorResponse(res, 401, 'Invalid email or password');
    }

    // Check if account is active
    if (!user.is_active) {
      return errorResponse(res, 403, 'Your account has been deactivated. Please contact support.');
    }

    // Compare password
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      return errorResponse(res, 401, 'Invalid email or password');
    }

    // Generate token
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role
    });

    return successResponse(res, 200, 'Login successful', {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      },
      token
    });

  } catch (error) {
    console.error('Login error:', error);
    return errorResponse(res, 500, 'Login failed. Please try again.');
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return errorResponse(res, 404, 'User not found');
    }

    return successResponse(res, 200, 'Profile retrieved successfully', {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        created_at: user.created_at
      }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    return errorResponse(res, 500, 'Failed to retrieve profile');
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const { name, phone } = req.body;
    const updateData = {};

    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;

    const updated = await User.update(req.user.id, updateData);

    if (!updated) {
      return errorResponse(res, 400, 'Failed to update profile');
    }

    const user = await User.findById(req.user.id);

    return successResponse(res, 200, 'Profile updated successfully', {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Update profile error:', error);
    return errorResponse(res, 500, 'Failed to update profile');
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return errorResponse(res, 400, 'Current password and new password are required');
    }

    if (newPassword.length < 6) {
      return errorResponse(res, 400, 'New password must be at least 6 characters long');
    }

    // Get user with password
    const user = await User.findByEmail(req.user.email);

    // Verify current password
    const isPasswordValid = await comparePassword(currentPassword, user.password);
    if (!isPasswordValid) {
      return errorResponse(res, 401, 'Current password is incorrect');
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update password
    await User.update(req.user.id, { password: hashedPassword });

    return successResponse(res, 200, 'Password changed successfully');

  } catch (error) {
    console.error('Change password error:', error);
    return errorResponse(res, 500, 'Failed to change password');
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword
}; 