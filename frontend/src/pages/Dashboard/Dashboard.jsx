import React from 'react';
import { 
  Plus, 
  ArrowUpRight, 
  ArrowDownLeft, 
  AlertCircle, 
  Clock, 
  Package 
} from 'lucide-react';
import Card from '../../components/Card/Card';
import Table from '../../components/Table/Table';
import Button from '../../components/Button/Button';
import './Dashboard.css';

import { useDashboard } from '../../hooks/useInventory';

const Dashboard = () => {
  const { data, isLoading, error } = useDashboard();

  if (isLoading) return <div className="loading-state">Loading dashboard...</div>;
  if (error) return <div className="error-state">Error loading dashboard</div>;

  const { kpis: stats, recentMovements } = data;

  const kpiCards = [
    { title: 'Products in Stock', value: stats.totalProducts, icon: Package, color: 'blue' },
    { title: 'Low Stock Items', value: stats.lowStockCount, icon: AlertCircle, color: 'amber' },
    { title: 'Pending Receipts', value: stats.pendingReceipts, icon: Clock, color: 'green' },
    { title: 'Pending Deliveries', value: stats.pendingDeliveries, icon: ArrowUpRight, color: 'indigo' },
  ];

  const movements = recentMovements.map(m => ({
    id: m.id.substring(0, 8),
    product: m.product.name,
    type: m.movementType.replace('_', ' ').toUpperCase(),
    qty: m.quantityChange > 0 ? `+${m.quantityChange}` : String(m.quantityChange),
    status: 'Completed',
    date: new Date(m.createdAt).toLocaleDateString()
  }));

  const columns = [
    { key: 'id', title: 'ID' },
    { key: 'product', title: 'Product' },
    { key: 'type', title: 'Type', render: (val) => (
      <span className={`badge badge-${val.toLowerCase()}`}>{val}</span>
    )},
    { key: 'qty', title: 'Quantity', render: (val) => (
      <span style={{ fontWeight: 600, color: String(val).startsWith('+') ? 'var(--success)' : (String(val).startsWith('-') ? 'var(--danger)' : 'inherit') }}>
        {String(val)}
      </span>
    )},
    { key: 'status', title: 'Status', render: (val) => (
      <span className={`status-pill status-${val.toLowerCase().replace(' ', '-')}`}>{val}</span>
    )},
    { key: 'date', title: 'Date' },
  ];

  return (
    <div className="dashboard">
      <div className="page-header">
        <div className="page-title-group">
          <h1>Inventory Overview</h1>
          <p className="page-description">Monitor and manage your warehouse operations in real-time.</p>
        </div>
        <div className="page-actions">
          <Button variant="secondary">Download Report</Button>
          <Button icon={Plus}>Add Movement</Button>
        </div>
      </div>

      <div className="stats-grid">
        {kpiCards.map((kpi, idx) => (
          <Card key={idx} className="stat-card">
            <div className="stat-card-inner">
              <div className={`stat-icon icon-${kpi.color}`}>
                <kpi.icon size={24} />
              </div>
              <div className="stat-data">
                <span className="stat-label">{kpi.title}</span>
                <span className="stat-value">{kpi.value}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="dashboard-content">
        <Card title="Recent Inventory Movements" subtitle="Track the latest changes in your stock across all locations.">
          <Table columns={columns} data={movements} />
          <div className="card-view-all">
            <Button variant="ghost" size="sm">View all movements →</Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
