const { errorResponse } = require('../utils/response');

/**
 * Global error handler - must be last middleware in Express chain
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  console.error('[Error]', err);

  // Prisma known errors
  if (err.code === 'P2002') {
    return errorResponse(res, 'A record with this value already exists', 409);
  }
  if (err.code === 'P2025') {
    return errorResponse(res, 'Record not found', 404);
  }
  if (err.code === 'P2003') {
    return errorResponse(res, 'Foreign key constraint failed', 400);
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';
  return errorResponse(res, message, statusCode);
};

/**
 * 404 handler
 */
const notFound = (req, res) => {
  return errorResponse(res, `Route ${req.method} ${req.originalUrl} not found`, 404);
};

module.exports = { errorHandler, notFound };
