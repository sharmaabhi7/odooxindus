const deliveryTemplate = ({ deliveryId, customerName, itemCount }) => `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><style>
  body { font-family: 'Segoe UI', sans-serif; background: #f5f5f5; margin: 0; padding: 20px; }
  .card { background: #fff; max-width: 480px; margin: 0 auto; border-radius: 12px; padding: 40px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
  .logo { font-size: 24px; font-weight: 700; color: #4F46E5; margin-bottom: 24px; }
  .success { background: #EFF6FF; border-left: 4px solid #3B82F6; padding: 12px 16px; border-radius: 6px; color: #1D4ED8; font-weight: 600; margin-bottom: 24px; }
  .detail { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
  .label { color: #6B7280; font-size: 14px; }
  .value { font-weight: 600; color: #111; }
  .footer { margin-top: 32px; font-size: 12px; color: #999; }
</style></head>
<body>
  <div class="card">
    <div class="logo">CoreInventory</div>
    <div class="success">📦 Delivery Confirmed</div>
    <div class="detail"><span class="label">Delivery ID</span><span class="value">#${deliveryId.slice(0, 8).toUpperCase()}</span></div>
    <div class="detail"><span class="label">Customer</span><span class="value">${customerName}</span></div>
    <div class="detail"><span class="label">Items Shipped</span><span class="value">${itemCount} line item(s)</span></div>
    <p style="color:#555;margin-top:16px">Stock has been decremented and the delivery is logged in the ledger.</p>
    <div class="footer">CoreInventory &mdash; Inventory Management Platform</div>
  </div>
</body>
</html>
`;

module.exports = { deliveryTemplate };
