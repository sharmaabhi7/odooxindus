const { errorResponse } = require('../utils/response');

/**
 * Middleware to validate that tenantId exists in the request context.
 * Should be placed AFTER authMiddleware - this is just a safety net.
 */
const tenantMiddleware = (req, res, next) => {
  if (!req.tenantId) {
    return errorResponse(res, 'Tenant context missing', 400);
  }
  next();
};

module.exports = tenantMiddleware;
