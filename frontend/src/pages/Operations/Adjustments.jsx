import React, { useState } from 'react';
import { 
  ClipboardCheck, 
  Plus, 
  Search, 
  AlertCircle, 
  History,
  CheckCircle,
  XCircle,
  Package
} from 'lucide-react';
import Table from '../../components/Table/Table';
import Button from '../../components/Button/Button';
import Card from '../../components/Card/Card';
import './Adjustments.css';

import { useAdjustments } from '../../hooks/useInventory';
import api from '../../services/api';
import AdjustmentModal from './AdjustmentModal';

const Adjustments = () => {
  const [showModal, setShowModal] = useState(false);
  const { data: adjustmentsData, isLoading } = useAdjustments();

  const adjustments = adjustmentsData || [];

  const columns = [
    { key: 'id', title: 'ADJ ID', render: (val) => val.substring(0, 8).toUpperCase() },
    { key: 'product', title: 'Product', render: (val) => (
      <div className="product-info">
        <Package size={14} />
        <span>{val.name}</span>
      </div>
    )},
    { key: 'location', title: 'Location', render: (val) => val.name },
    { key: 'previousQty', title: 'Book Qty' },
    { key: 'newQty', title: 'Counted' },
    { key: 'diff', title: 'Diff', render: (_, row) => {
      const diff = row.newQty - row.previousQty;
      return (
        <span className={diff < 0 ? 'text-danger' : (diff > 0 ? 'text-success' : '')}>
          {diff > 0 ? `+${diff}` : diff}
        </span>
      );
    }},
    { key: 'reason', title: 'Reason' },
    { key: 'createdAt', title: 'Date', render: (val) => new Date(val).toLocaleDateString() },
  ];

  return (
    <div className="adjustments-page">
      <div className="page-header">
        <div className="page-title-group">
          <h1>Inventory Adjustments</h1>
          <p className="page-description">Manual stock corrections and cycle count audits.</p>
        </div>
        <div className="page-actions">
          <Button icon={Plus} onClick={() => setShowModal(true)}>New Adjustment</Button>
        </div>
      </div>

      <div className="adjustment-alerts">
        <div className="alert-card warning">
          <AlertCircle size={20} />
          <div className="alert-content">
            <span className="alert-title">Pending Approvals</span>
            <p className="alert-text">3 adjustments require your immediate review.</p>
          </div>
          <Button variant="secondary" size="sm">Review Now</Button>
        </div>
      </div>

      <Card noPadding>
        <Table columns={columns} data={adjustments} isLoading={isLoading} />
      </Card>

      {showModal && <AdjustmentModal onClose={() => setShowModal(false)} />}
    </div>
  );
};

export default Adjustments;
