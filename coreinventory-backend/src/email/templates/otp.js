const otpTemplate = ({ name, otp, expiresMinutes = 5 }) => `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><style>
  body { font-family: 'Segoe UI', sans-serif; background: #f5f5f5; margin: 0; padding: 20px; }
  .card { background: #fff; max-width: 480px; margin: 0 auto; border-radius: 12px; padding: 40px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
  .logo { font-size: 24px; font-weight: 700; color: #4F46E5; margin-bottom: 24px; }
  h2 { color: #111; margin-bottom: 8px; }
  p { color: #555; line-height: 1.6; }
  .otp-box { font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #4F46E5; background: #EEF2FF; padding: 16px 24px; border-radius: 8px; text-align: center; margin: 24px 0; }
  .footer { margin-top: 32px; font-size: 12px; color: #999; }
</style></head>
<body>
  <div class="card">
    <div class="logo">CoreInventory</div>
    <h2>Password Reset Request</h2>
    <p>Hi ${name},</p>
    <p>You requested to reset your password. Use the OTP below. It expires in ${expiresMinutes} minutes.</p>
    <div class="otp-box">${otp}</div>
    <p>If you didn't request this, please ignore this email.</p>
    <div class="footer">CoreInventory &mdash; Inventory Management Platform</div>
  </div>
</body>
</html>
`;

module.exports = { otpTemplate };
