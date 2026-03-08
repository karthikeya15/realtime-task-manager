const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const config = require('../config');

/**
 * Signs an access token for a given user id.
 */
const signAccessToken = (userId) =>
  jwt.sign({ id: userId }, config.jwt.secret, { expiresIn: config.jwt.expiresIn });

/**
 * Signs a long-lived refresh token.
 */
const signRefreshToken = (userId) =>
  jwt.sign({ id: userId }, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiresIn,
  });

/**
 * Registers a new user and returns tokens.
 */
const register = async ({ name, email, password }) => {
  const existing = await User.findOne({ email });
  if (existing) throw ApiError.conflict('Email already registered');

  const user = await User.create({ name, email, password });

  const accessToken = signAccessToken(user._id);
  const refreshToken = signRefreshToken(user._id);

  return { user, accessToken, refreshToken };
};

/**
 * Authenticates a user by email/password.
 */
const login = async ({ email, password }) => {
  // Must explicitly select password because the field is select:false
  const user = await User.findOne({ email }).select('+password');
  if (!user || !user.isActive) throw ApiError.unauthorized('Invalid credentials');

  const isMatch = await user.comparePassword(password);
  if (!isMatch) throw ApiError.unauthorized('Invalid credentials');

  // Update lastSeen without triggering full save hooks
  await User.findByIdAndUpdate(user._id, { lastSeen: new Date() });

  const accessToken = signAccessToken(user._id);
  const refreshToken = signRefreshToken(user._id);

  return { user, accessToken, refreshToken };
};

/**
 * Exchanges a valid refresh token for a new access token.
 */
const refreshAccessToken = async (refreshToken) => {
  let decoded;
  try {
    decoded = jwt.verify(refreshToken, config.jwt.refreshSecret);
  } catch {
    throw ApiError.unauthorized('Invalid or expired refresh token');
  }

  const user = await User.findById(decoded.id);
  if (!user || !user.isActive) throw ApiError.unauthorized('User not found');

  return { accessToken: signAccessToken(user._id) };
};

module.exports = { register, login, refreshAccessToken };
