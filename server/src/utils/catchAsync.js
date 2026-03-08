/**
 * Wraps async route handlers to forward unhandled promise rejections
 * to the Express global error handler — eliminating try/catch boilerplate.
 */
const catchAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = catchAsync;
