/**
 * Standardized API response envelope.
 * Every success response follows: { success, message, data, meta? }
 */
class ApiResponse {
  static success(res, data = null, message = 'Success', statusCode = 200, meta = null) {
    const body = { success: true, message, data };
    if (meta) body.meta = meta;
    return res.status(statusCode).json(body);
  }

  static created(res, data, message = 'Created successfully') {
    return ApiResponse.success(res, data, message, 201);
  }

  static paginated(res, data, pagination, message = 'Success') {
    return ApiResponse.success(res, data, message, 200, { pagination });
  }

  static noContent(res) {
    return res.status(204).send();
  }
}

module.exports = ApiResponse;
