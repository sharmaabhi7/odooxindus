const router = require('express').Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/authMiddleware');
const tenantMiddleware = require('../middleware/tenantMiddleware');

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);

// Routes requiring auth (for OTP — user must be in context)
router.post('/forgot-password', authenticate, tenantMiddleware, authController.forgotPassword);
router.post('/reset-password', authenticate, tenantMiddleware, authController.resetPassword);

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
