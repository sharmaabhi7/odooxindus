const router = require('express').Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/authMiddleware');
const tenantMiddleware = require('../middleware/tenantMiddleware');

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.post('/resend-password-otp', authController.resendPasswordOtp);
router.post('/verify-password-otp', authController.verifyPasswordOtp);
router.post('/reset-password', authController.resetPassword);

// Protected profile routes
router.get('/profile', authenticate, tenantMiddleware, authController.getProfile);
router.put('/profile', authenticate, tenantMiddleware, authController.updateProfile);

// User management (managers only)
router.post(
  '/users',
  authenticate,
  tenantMiddleware,
  require('../middleware/authMiddleware').authorize(['inventory_manager']),
  authController.addUser
);

module.exports = router;
