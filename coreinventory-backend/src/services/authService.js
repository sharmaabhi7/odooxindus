const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { jwtSecret, jwtExpiresIn } = require('../config');
const prisma = require('../database/prisma');
const { sendWelcomeEmail, sendOTP } = require('../email/emailService');
const RESET_OTP_EXPIRY_MINUTES = 5;

/**
 * Generate a 6-digit OTP
 */
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

/**
 * Sign JWT token embedding tenantId, userId, role
 */
const signToken = (user) =>
  jwt.sign(
    { id: user.id, tenantId: user.tenantId, role: user.role, email: user.email },
    jwtSecret,
    { expiresIn: jwtExpiresIn }
  );

/**
 * Register a new tenant + admin user (company onboarding)
 */
const registerTenant = async ({ companyName, slug, adminName, adminEmail, password }) => {
  const hashedPassword = await bcrypt.hash(password, 12);

  const result = await prisma.$transaction(async (tx) => {
    // Check slug uniqueness
    const existingTenant = await tx.tenant.findUnique({ where: { slug } });
    if (existingTenant) throw Object.assign(new Error('Company slug already taken'), { statusCode: 409 });

    // Create tenant
    const tenant = await tx.tenant.create({
      data: { companyName, slug },
    });

    // Create admin user
    const user = await tx.user.create({
      data: {
        tenantId: tenant.id,
        name: adminName,
        email: adminEmail,
        password: hashedPassword,
        role: 'inventory_manager',
      },
    });

    return { tenant, user };
  });

  // Send welcome email (non-blocking)
  sendWelcomeEmail({ to: adminEmail, name: adminName, companyName });

  const token = signToken(result.user);
  return { token, user: _safeUser(result.user), tenant: result.tenant };
};

/**
 * Login user
 */
const login = async ({ email, password, slug }) => {
  // Find tenant first
  const tenant = await prisma.tenant.findUnique({ where: { slug } });
  if (!tenant) throw Object.assign(new Error('Company not found'), { statusCode: 404 });

  // Find user within tenant
  const user = await prisma.user.findUnique({
    where: { tenantId_email: { tenantId: tenant.id, email } },
  });
  if (!user) throw Object.assign(new Error('Invalid credentials'), { statusCode: 401 });

  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) throw Object.assign(new Error('Invalid credentials'), { statusCode: 401 });

  const token = signToken(user);
  return { token, user: _safeUser(user), tenant };
};

/**
 * Resolve user for password reset by slug+email or unique email
 */
const _resolveResetUser = async ({ email, slug }) => {
  if (slug) {
    const tenant = await prisma.tenant.findUnique({ where: { slug } });
    if (!tenant) throw Object.assign(new Error('Company not found'), { statusCode: 404 });
    const user = await prisma.user.findUnique({ where: { tenantId_email: { tenantId: tenant.id, email } } });
    if (!user) throw Object.assign(new Error('No account found with this email'), { statusCode: 404 });
    return { user, tenant };
  }

  const users = await prisma.user.findMany({
    where: { email },
    include: { tenant: true },
    take: 2,
  });

  if (users.length === 0) throw Object.assign(new Error('No account found with this email'), { statusCode: 404 });
  if (users.length > 1) {
    throw Object.assign(new Error('Multiple companies found for this email. Please provide your company slug.'), { statusCode: 409 });
  }

  return { user: users[0], tenant: users[0].tenant };
};

/**
 * Request password reset OTP
 */
const requestPasswordReset = async ({ email, slug }) => {
  const { user, tenant } = await _resolveResetUser({ email, slug });
  const otp = generateOTP();
  const otpExpiry = new Date(Date.now() + RESET_OTP_EXPIRY_MINUTES * 60 * 1000);

  await prisma.user.update({
    where: { id: user.id },
    data: { otpCode: otp, otpExpiry },
  });

  await sendOTP({ to: email, name: user.name, otp, expiresMinutes: RESET_OTP_EXPIRY_MINUTES });
  return {
    email,
    slug: tenant.slug,
    expiresAt: otpExpiry.toISOString(),
    expiresInSeconds: RESET_OTP_EXPIRY_MINUTES * 60,
  };
};

/**
 * Verify OTP for password reset
 */
const verifyResetOtp = async ({ email, slug, otp }) => {
  const { user, tenant } = await _resolveResetUser({ email, slug });
  if (!user || !user.otpCode) throw Object.assign(new Error('Invalid or expired OTP'), { statusCode: 400 });
  if (user.otpCode !== otp) throw Object.assign(new Error('Incorrect OTP'), { statusCode: 400 });
  if (new Date() > user.otpExpiry) throw Object.assign(new Error('OTP has expired'), { statusCode: 400 });
  return {
    email,
    slug: tenant.slug,
    verified: true,
    expiresAt: user.otpExpiry.toISOString(),
  };
};

/**
 * Reset password after OTP verification
 */
const resetPassword = async ({ email, slug, otp, newPassword }) => {
  const { user, tenant } = await _resolveResetUser({ email, slug });
  if (!user || !user.otpCode) throw Object.assign(new Error('Invalid or expired OTP'), { statusCode: 400 });
  if (user.otpCode !== otp) throw Object.assign(new Error('Incorrect OTP'), { statusCode: 400 });
  if (new Date() > user.otpExpiry) throw Object.assign(new Error('OTP has expired'), { statusCode: 400 });
  const hashedPassword = await bcrypt.hash(newPassword, 12);

  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashedPassword, otpCode: null, otpExpiry: null },
  });

  return { email, slug: tenant.slug, message: 'Password reset successful' };
};

/**
 * Get logged-in user profile
 */
const getProfile = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { tenant: true },
  });
  if (!user) throw Object.assign(new Error('User not found'), { statusCode: 404 });
  return _safeUser(user);
};

/**
 * Update profile
 */
const updateProfile = async (userId, { name }) => {
  const user = await prisma.user.update({
    where: { id: userId },
    data: { name },
  });
  return _safeUser(user);
};

/**
 * Add a user to an existing tenant (manager only)
 */
const addUser = async ({ tenantId, name, email, password, role }) => {
  const hashedPassword = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: { tenantId, name, email, password: hashedPassword, role },
  });
  sendWelcomeEmail({ to: email, name });
  return _safeUser(user);
};

// Strip password from user object
const _safeUser = (user) => {
  const { password, otpCode, otpExpiry, ...safe } = user;
  return safe;
};

module.exports = {
  registerTenant,
  login,
  requestPasswordReset,
  verifyResetOtp,
  resetPassword,
  getProfile,
  updateProfile,
  addUser,
};
