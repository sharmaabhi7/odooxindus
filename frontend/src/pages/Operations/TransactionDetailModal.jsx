import React from 'react';
import { X, Printer } from 'lucide-react';
import Button from '../../components/Button/Button';

const titleByType = {
  receipt: 'Receipt Details',
  delivery: 'Delivery Details',
  transfer: 'Transfer Details',
  adjustment: 'Adjustment Details',
};

const TransactionDetailModal = ({ type, transaction, onClose }) => {
  if (!transaction) return null;

  const items = type === 'adjustment'
    ? [{
      id: transaction.id,
      quantity: transaction.newQty,
      product: transaction.product,
      location: transaction.location,
      previousQty: transaction.previousQty,
      reason: transaction.reason,
    }]
    : (transaction.items || []);
  const totalUnits = items.reduce((sum, item) => sum + Number(item.quantity || 0), 0);

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="txn-detail-title">
      <div className="modal-content" style={{ maxWidth: '860px' }}>
        <div className="modal-header">
          <h3 id="txn-detail-title">{titleByType[type] || 'Transaction Details'}</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Button type="button" variant="secondary" size="sm" icon={Printer} onClick={() => window.print()}>
              Print
            </Button>
            <button className="close-btn" onClick={onClose} aria-label="Close transaction details">
              <X size={20} />
            </button>
          </div>
        </div>
        <div className="modal-body" style={{ maxHeight: '72vh', overflowY: 'auto' }}>
          <div className="txn-meta-grid">
            <div className="txn-meta-card"><span>ID</span><strong>{transaction.id}</strong></div>
            <div className="txn-meta-card"><span>Status</span><strong>{transaction.status || 'N/A'}</strong></div>
            <div className="txn-meta-card"><span>Created</span><strong>{transaction.createdAt ? new Date(transaction.createdAt).toLocaleString() : 'N/A'}</strong></div>
            <div className="txn-meta-card"><span>Validated</span><strong>{transaction.validatedAt ? new Date(transaction.validatedAt).toLocaleString() : 'Not yet'}</strong></div>
            <div className="txn-meta-card"><span>Total Items</span><strong>{items.length}</strong></div>
            <div className="txn-meta-card"><span>Total Units</span><strong>{totalUnits}</strong></div>
          </div>

          {type === 'receipt' && (
            <div className="txn-meta-row">
              <span>Supplier:</span>
              <strong>{transaction.supplier?.name || 'Manual Receipt'}</strong>
            </div>
          )}
          {type === 'delivery' && (
            <div className="txn-meta-row">
              <span>Customer:</span>
              <strong>{transaction.customerName}</strong>
            </div>
          )}
          {type === 'transfer' && (
            <div className="txn-meta-row">
              <span>Route:</span>
              <strong>{transaction.sourceLocation?.name} → {transaction.destinationLocation?.name}</strong>
            </div>
          )}
          {type === 'adjustment' && (
            <div className="txn-meta-row">
              <span>Difference:</span>
              <strong>{Number(transaction.newQty || 0) - Number(transaction.previousQty || 0)}</strong>
            </div>
          )}

          {transaction.notes && (
            <div className="txn-notes">
              <span>Notes</span>
              <p>{transaction.notes}</p>
            </div>
          )}

          <div className="txn-items-section">
            <h4>Line Items</h4>
            <table className="txn-items-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Location</th>
                  <th>{type === 'adjustment' ? 'Counted Qty' : 'Quantity'}</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    <td>{item.product?.name || item.productId}</td>
                    <td>
                      {type === 'transfer'
                        ? `${transaction.sourceLocation?.name || 'Source'} → ${transaction.destinationLocation?.name || 'Destination'}`
                        : item.location?.name || item.locationId}
                    </td>
                    <td>{item.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <style>{`
        .txn-meta-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 12px;
          margin-bottom: 16px;
        }
        .txn-meta-card {
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          padding: 10px 12px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .txn-meta-card span {
          font-size: 12px;
          color: var(--text-secondary);
        }
        .txn-meta-card strong {
          font-size: 13px;
          word-break: break-word;
        }
        .txn-meta-row {
          display: flex;
          gap: 8px;
          margin-bottom: 12px;
          font-size: 14px;
        }
        .txn-notes {
          margin-bottom: 16px;
        }
        .txn-notes span {
          font-size: 12px;
          color: var(--text-secondary);
          display: block;
          margin-bottom: 4px;
        }
        .txn-notes p {
          margin: 0;
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          padding: 10px;
          font-size: 13px;
        }
        .txn-items-section h4 {
          margin-bottom: 10px;
        }
        .txn-items-table {
          width: 100%;
          border-collapse: collapse;
        }
        .txn-items-table th,
        .txn-items-table td {
          border: 1px solid var(--border);
          padding: 8px 10px;
          font-size: 13px;
          text-align: left;
        }
        .txn-items-table th {
          background: var(--bg-soft);
        }
        @media (max-width: 768px) {
          .txn-meta-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default TransactionDetailModal;
