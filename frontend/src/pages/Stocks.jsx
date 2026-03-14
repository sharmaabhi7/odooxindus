import React from 'react';
import { useStocks } from '../hooks/useInventory';
import Table from '../components/Table/Table';
import Card from '../components/Card/Card';
import { Package, AlertCircle, Info } from 'lucide-react';

const Stocks = () => {
  const { data: stocks, isLoading } = useStocks();

  const columns = [
    { key: 'name', title: 'Product', render: (val, row) => (
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span style={{ fontWeight: 600 }}>{val}</span>
        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{row.sku}</span>
      </div>
    )},
    { key: 'categoryName', title: 'Category', render: (val) => val || 'Uncategorized' },
    { key: 'onHand', title: 'On Hand', render: (val) => (
      <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{val}</span>
    )},
    { key: 'reserved', title: 'Reserved', render: (val) => (
      <span style={{ color: 'var(--text-secondary)' }}>{val}</span>
    )},
    { key: 'freeToUse', title: 'Free to Use', render: (val, row) => {
      const isLow = val <= row.reorderLevel;
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ 
            fontWeight: 700, 
            color: isLow ? 'var(--danger)' : 'var(--success)',
            padding: '2px 8px',
            backgroundColor: isLow ? '#fee2e2' : '#dcfce7',
            borderRadius: '4px'
          }}>
            {val}
          </span>
          {isLow && <AlertCircle size={14} color="var(--danger)" />}
        </div>
      );
    }},
    { key: 'reorderLevel', title: 'Reorder Level' },
  ];

  return (
    <div className="stocks-page">
      <div className="page-header">
        <div className="page-title-group">
          <h1>Inventory Stock</h1>
          <p className="page-description">Real-time view of your stock levels across all locations.</p>
        </div>
      </div>
      
      <Card noPadding>
        <Table columns={columns} data={stocks || []} isLoading={isLoading} />
      </Card>
    </div>
  );
};

export default Stocks;
