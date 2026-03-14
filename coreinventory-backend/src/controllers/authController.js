const authService = require('../services/authService');
const { successResponse, errorResponse } = require('../utils/response');
const { body } = require('express-validator');
const { validate } = require('../utils/validators');

// ─── Validation Rules ─────────────────────────────────────────────────

const registerRules = [
  body('companyName').notEmpty().trim(),
  body('slug').notEmpty().trim().isSlug().withMessage('Slug must be URL-friendly'),
  body('adminName').notEmpty().trim(),
  body('adminEmail').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
];

const loginRules = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
  body('slug').notEmpty(),
];

// ─── Handlers ─────────────────────────────────────────────────────────

const register = [
  ...registerRules,
  validate,
  async (req, res, next) => {
    try {
      const result = await authService.registerTenant(req.body);
      return successResponse(res, result, 'Tenant registered successfully', 201);
    } catch (err) { next(err); }
  },
];

const login = [
  ...loginRules,
  validate,
  async (req, res, next) => {
    try {
      const result = await authService.login(req.body);
      return successResponse(res, result, 'Login successful');
    } catch (err) { next(err); }
  },
];

const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return errorResponse(res, 'Email is required', 400);
    const result = await authService.requestPasswordReset({ email, tenantId: req.tenantId });
    return successResponse(res, result, 'OTP sent');
  } catch (err) { next(err); }
};

const resetPassword = async (req, res, next) => {
  try {
    const { email, otp, newPassword } = req.body;
    const result = await authService.resetPassword({ email, tenantId: req.tenantId, otp, newPassword });
    return successResponse(res, result, 'Password reset successful');
  } catch (err) { next(err); }
};

const getProfile = async (req, res, next) => {
  try {
    const profile = await authService.getProfile(req.user.id);
    return successResponse(res, profile);
  } catch (err) { next(err); }
};

const updateProfile = async (req, res, next) => {
  try {
    const { name } = req.body;
    const updated = await authService.updateProfile(req.user.id, { name });
    return successResponse(res, updated, 'Profile updated');
  } catch (err) { next(err); }
};

const addUser = [
  body('name').notEmpty(),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('role').isIn(['inventory_manager', 'warehouse_staff']),
  validate,
  async (req, res, next) => {
    try {
      const user = await authService.addUser({ tenantId: req.tenantId, ...req.body });
      return successResponse(res, user, 'User created', 201);
    } catch (err) { next(err); }
  },
];

module.exports = { register, login, forgotPassword, resetPassword, getProfile, updateProfile, addUser };
