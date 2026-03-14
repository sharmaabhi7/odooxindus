import React from 'react';
import { useMoveHistory } from '../hooks/useInventory';
import Table from '../components/Table/Table';
import Card from '../components/Card/Card';

const MoveHistory = () => {
  const { data: history, isLoading } = useMoveHistory();

  const columns = [
    { key: 'createdAt', title: 'Date', render: (val) => new Date(val).toLocaleString() },
    { key: 'product', title: 'Product', render: (val) => val.name },
    { key: 'movementType', title: 'Type', render: (val) => (
      <span className={`status-badge status-${val.toLowerCase().replace('_', '-')}`}>
        {val.replace('_', ' ').toUpperCase()}
      </span>
    )},
    { key: 'location', title: 'Location', render: (val) => (
      <span>{val.warehouse.name} / {val.name}</span>
    )},
    { key: 'quantityChange', title: 'Quantity', render: (val) => (
      <span style={{ fontWeight: 600, color: val > 0 ? 'var(--success)' : 'var(--danger)' }}>
        {val > 0 ? `+${val}` : val}
      </span>
    )},
    { key: 'referenceId', title: 'Reference', render: (val) => (
      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{val?.substring(0, 8)}</span>
    )},
  ];

  return (
    <div className="move-history-page">
      <div className="page-header">
        <div className="page-title-group">
          <h1>Move History</h1>
          <p className="page-description">Complete audit trail of all inventory movements.</p>
        </div>
      </div>
      
      <Card noPadding>
        <Table columns={columns} data={history || []} isLoading={isLoading} />
      </Card>
    </div>
  );
};

export default MoveHistory;
