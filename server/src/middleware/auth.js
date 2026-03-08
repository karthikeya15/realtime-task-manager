const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const config = require('../config');

/**
 * Authenticate — verifies the Bearer JWT and attaches req.user.
 */
const authenticate = catchAsync(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(ApiError.unauthorized('No token provided'));
  }

  const token = authHeader.split(' ')[1];

  let decoded;
  try {
    decoded = jwt.verify(token, config.jwt.secret);
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return next(ApiError.unauthorized('Token expired'));
    }
    return next(ApiError.unauthorized('Invalid token'));
  }

  const user = await User.findById(decoded.id).select('-password');
  if (!user || !user.isActive) {
    return next(ApiError.unauthorized('User not found or deactivated'));
  }

  req.user = user;
  next();
});

/**
 * Authorize — gates a route to specific roles within a project.
 * Expects req.project to be set by a prior middleware (requireProjectMember).
 */
const authorize = (...roles) => (req, res, next) => {
  if (!req.project) {
    return next(ApiError.internal('authorize() called without requireProjectMember()'));
  }

  const userId = req.user._id.toString();
  if (req.project.owner.toString() === userId) return next(); // owners always pass

  const role = req.project.getMemberRole(userId);
  if (!role || !roles.includes(role)) {
    return next(ApiError.forbidden('Insufficient permissions'));
  }
  next();
};

module.exports = { authenticate, authorize };
