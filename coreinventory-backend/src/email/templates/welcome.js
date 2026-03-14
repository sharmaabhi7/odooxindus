const welcomeTemplate = ({ name, companyName }) => `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><style>
  body { font-family: 'Segoe UI', sans-serif; background: #f5f5f5; margin: 0; padding: 20px; }
  .card { background: #fff; max-width: 480px; margin: 0 auto; border-radius: 12px; padding: 40px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
  .logo { font-size: 24px; font-weight: 700; color: #4F46E5; margin-bottom: 24px; }
  h2 { color: #111; margin-bottom: 8px; }
  p { color: #555; line-height: 1.6; }
  .badge { display: inline-block; background: #4F46E5; color: white; padding: 8px 20px; border-radius: 99px; font-size: 14px; font-weight: 600; margin-top: 16px; }
  .footer { margin-top: 32px; font-size: 12px; color: #999; }
</style></head>
<body>
  <div class="card">
    <div class="logo">CoreInventory</div>
    <h2>Welcome aboard, ${name}! 🎉</h2>
    <p>Your account for <strong>${companyName}</strong> has been created successfully.</p>
    <p>You can now log in and start managing your inventory in real time.</p>
    <div class="footer">CoreInventory &mdash; Inventory Management Platform</div>
  </div>
</body>
</html>
`;

module.exports = { welcomeTemplate };
