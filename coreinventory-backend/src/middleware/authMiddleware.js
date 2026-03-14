const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config');
const { errorResponse } = require('../utils/response');
const prisma = require('../database/prisma');

/**
 * Verifies JWT token and attaches decoded user + tenantId to req
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errorResponse(res, 'Authorization token missing', 401);
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, jwtSecret);

    // Attach user data to request
    req.user = {
      id: decoded.id,
      tenantId: decoded.tenantId,
      role: decoded.role,
      email: decoded.email,
    };
    req.tenantId = decoded.tenantId;

    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return errorResponse(res, 'Token expired', 401);
    }
    return errorResponse(res, 'Invalid token', 401);
  }
};

/**
 * Role-based access control: pass allowed roles as array
 * Usage: authorize(['inventory_manager'])
 */
const authorize = (roles = []) => {
  return (req, res, next) => {
    if (!req.user) return errorResponse(res, 'Unauthorized', 401);
    if (!roles.includes(req.user.role)) {
      return errorResponse(res, 'Forbidden: insufficient permissions', 403);
    }
    next();
  };
};

module.exports = { authenticate, authorize };
