const authService = require('../services/authService');
const { successResponse } = require('../utils/response');
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

const forgotPasswordRules = [
  body('email').isEmail().normalizeEmail(),
  body('slug').optional().trim().isSlug().withMessage('Slug must be URL-friendly'),
];

const verifyOtpRules = [
  body('email').isEmail().normalizeEmail(),
  body('slug').optional().trim().isSlug().withMessage('Slug must be URL-friendly'),
  body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
];

const resetPasswordRules = [
  ...verifyOtpRules,
  body('newPassword').isLength({ min: 8 }),
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

const forgotPassword = [
  ...forgotPasswordRules,
  validate,
  async (req, res, next) => {
    try {
      const { email, slug } = req.body;
      const result = await authService.requestPasswordReset({ email, slug });
      return successResponse(res, result, 'OTP sent');
    } catch (err) { next(err); }
  },
];

const resendPasswordOtp = [
  ...forgotPasswordRules,
  validate,
  async (req, res, next) => {
    try {
      const { email, slug } = req.body;
      const result = await authService.requestPasswordReset({ email, slug });
      return successResponse(res, result, 'OTP resent');
    } catch (err) { next(err); }
  },
];

const verifyPasswordOtp = [
  ...verifyOtpRules,
  validate,
  async (req, res, next) => {
    try {
      const { email, slug, otp } = req.body;
      const result = await authService.verifyResetOtp({ email, slug, otp });
      return successResponse(res, result, 'OTP verified');
    } catch (err) { next(err); }
  },
];

const resetPassword = [
  ...resetPasswordRules,
  validate,
  async (req, res, next) => {
    try {
      const { email, slug, otp, newPassword } = req.body;
      const result = await authService.resetPassword({ email, slug, otp, newPassword });
      return successResponse(res, result, 'Password reset successful');
    } catch (err) { next(err); }
  },
];

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

module.exports = {
  register,
  login,
  forgotPassword,
  resendPasswordOtp,
  verifyPasswordOtp,
  resetPassword,
  getProfile,
  updateProfile,
  addUser,
};
