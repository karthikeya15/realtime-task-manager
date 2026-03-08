const mongoose = require('mongoose');
const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');

/**
 * Converts known library errors into typed ApiErrors before the final handler.
 */
const normalizeError = (err) => {
  // Mongoose CastError (e.g., invalid ObjectId in URL param)
  if (err instanceof mongoose.Error.CastError) {
    return ApiError.badRequest(`Invalid value for field: ${err.path}`);
  }

  // Mongoose ValidationError
  if (err instanceof mongoose.Error.ValidationError) {
    const details = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    return ApiError.badRequest('Validation failed', details);
  }

  // MongoDB duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0];
    return ApiError.conflict(`${field} already exists`);
  }

  // JWT errors are handled in auth middleware; pass-through here
  return err;
};

/**
 * Global Express error-handling middleware.
 * Must have exactly 4 params so Express recognises it as an error handler.
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  const normalized = normalizeError(err);

  const statusCode = normalized.statusCode || 500;
  const isOperational = normalized.isOperational || false;

  // Log non-operational (unexpected) errors with full stack
  if (!isOperational) {
    logger.error(`[Unhandled Error] ${err.message}`, { stack: err.stack, url: req.originalUrl });
  }

  const response = {
    success: false,
    status: normalized.status || 'error',
    message: isOperational ? normalized.message : 'An unexpected error occurred',
  };

  if (normalized.details) {
    response.details = normalized.details;
  }

  // Include stack trace in development only
  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};

module.exports = errorHandler;
