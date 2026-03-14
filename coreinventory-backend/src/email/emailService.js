const nodemailer = require('nodemailer');
const { smtp } = require('../config');
const { otpTemplate } = require('./templates/otp');
const { welcomeTemplate } = require('./templates/welcome');
const { lowStockTemplate } = require('./templates/lowStock');
const { receiptTemplate } = require('./templates/receipt');
const { deliveryTemplate } = require('./templates/delivery');

// Create reusable SMTP transporter
const transporter = nodemailer.createTransport({
  host: smtp.host,
  port: smtp.port,
  secure: smtp.secure,
  auth: {
    user: smtp.user,
    pass: smtp.pass,
  },
});

/**
 * Core send function - all email functions delegate to this
 */
const sendEmail = async ({ to, subject, html }) => {
  try {
    const info = await transporter.sendMail({
      from: smtp.from,
      to,
      subject,
      html,
    });
    console.log(`[Email] Sent to ${to}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error('[Email] Failed to send:', err.message);
    // Don't throw - email failures should not break business flows
    return { success: false, error: err.message };
  }
};

/**
 * Send OTP for password reset
 */
const sendOTP = async ({ to, name, otp }) => {
  return sendEmail({
    to,
    subject: 'CoreInventory - Password Reset OTP',
    html: otpTemplate({ name, otp }),
  });
};

/**
 * Send welcome email on registration
 */
const sendWelcomeEmail = async ({ to, name, companyName }) => {
  return sendEmail({
    to,
    subject: `Welcome to CoreInventory, ${name}!`,
    html: welcomeTemplate({ name, companyName }),
  });
};

/**
 * Send low stock alert to inventory managers
 */
const sendLowStockAlert = async ({ to, products }) => {
  return sendEmail({
    to,
    subject: 'CoreInventory - Low Stock Alert',
    html: lowStockTemplate({ products }),
  });
};

/**
 * Send receipt confirmation
 */
const sendReceiptConfirmation = async ({ to, receiptId, supplierName, itemCount }) => {
  return sendEmail({
    to,
    subject: `CoreInventory - Receipt #${receiptId} Validated`,
    html: receiptTemplate({ receiptId, supplierName, itemCount }),
  });
};

/**
 * Send delivery confirmation
 */
const sendDeliveryConfirmation = async ({ to, deliveryId, customerName, itemCount }) => {
  return sendEmail({
    to,
    subject: `CoreInventory - Delivery #${deliveryId} Confirmed`,
    html: deliveryTemplate({ deliveryId, customerName, itemCount }),
  });
};

module.exports = {
  sendEmail,
  sendOTP,
  sendWelcomeEmail,
  sendLowStockAlert,
  sendReceiptConfirmation,
  sendDeliveryConfirmation,
};
