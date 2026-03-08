const ApiError = require('../utils/ApiError');

/**
 * Express middleware factory that validates req.body (or req.query)
 * against a Joi schema and passes a clean ApiError to next() on failure.
 *
 * @param {Joi.Schema} schema
 * @param {'body'|'query'|'params'} source
 */
const validate = (schema, source = 'body') => (req, res, next) => {
  const { error, value } = schema.validate(req[source], {
    abortEarly: false,   // collect ALL errors, not just the first
    stripUnknown: true,  // remove keys not in schema (prevents injection)
    convert: true,
  });

  if (error) {
    const details = error.details.map((d) => ({
      field: d.path.join('.'),
      message: d.message.replace(/['"]/g, ''),
    }));
    return next(ApiError.badRequest('Validation failed', details));
  }

  // Replace raw input with validated + coerced values
  req[source] = value;
  next();
};

module.exports = validate;
