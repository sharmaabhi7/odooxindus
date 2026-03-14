const lowStockTemplate = ({ products }) => {
  const rows = products
    .map(
      (p) => `
    <tr>
      <td style="padding:10px 12px;border-bottom:1px solid #eee">${p.name}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #eee">${p.sku}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #eee;color:#EF4444;font-weight:600">${p.quantity}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #eee">${p.reorderLevel}</td>
    </tr>`
    )
    .join('');

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><style>
  body { font-family: 'Segoe UI', sans-serif; background: #f5f5f5; margin: 0; padding: 20px; }
  .card { background: #fff; max-width: 600px; margin: 0 auto; border-radius: 12px; padding: 40px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
  .logo { font-size: 24px; font-weight: 700; color: #4F46E5; margin-bottom: 24px; }
  .alert { background: #FEF2F2; border-left: 4px solid #EF4444; padding: 12px 16px; border-radius: 6px; color: #B91C1C; font-weight: 600; margin-bottom: 24px; }
  table { width: 100%; border-collapse: collapse; }
  th { background: #F3F4F6; padding: 10px 12px; text-align: left; font-size: 13px; color: #6B7280; }
  .footer { margin-top: 32px; font-size: 12px; color: #999; }
</style></head>
<body>
  <div class="card">
    <div class="logo">CoreInventory</div>
    <div class="alert">⚠️ Low Stock Alert — Action Required</div>
    <p style="color:#555">The following products have fallen below their reorder levels:</p>
    <table>
      <thead><tr><th>Product</th><th>SKU</th><th>Current Qty</th><th>Reorder Level</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <p style="color:#555;margin-top:20px">Please create replenishment receipts for these items immediately.</p>
    <div class="footer">CoreInventory &mdash; Inventory Management Platform</div>
  </div>
</body>
</html>
`;
};

module.exports = { lowStockTemplate };
