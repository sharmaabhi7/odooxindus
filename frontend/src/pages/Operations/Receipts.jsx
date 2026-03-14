import React, { useState } from 'react';
import { 
  Plus, 
  Calendar, 
  User, 
  ChevronRight, 
  CheckCircle2,
  Clock,
  Printer
} from 'lucide-react';
import Table from '../../components/Table/Table';
import Button from '../../components/Button/Button';
import Card from '../../components/Card/Card';
import './Receipts.css';
import ReceiptModal from './ReceiptModal';
import TransactionDetailModal from './TransactionDetailModal';

import { useReceipts } from '../../hooks/useInventory';
import api from '../../services/api';
import { useQueryClient } from '@tanstack/react-query';

const Receipts = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const { data: receiptsData, isLoading } = useReceipts();
  const queryClient = useQueryClient();

  const handleValidate = async (id) => {
    try {
      await api.post(`/receipts/${id}/validate`);
      queryClient.invalidateQueries(['receipts']);
      queryClient.invalidateQueries(['dashboard']);
      queryClient.invalidateQueries(['stocks']);
      queryClient.invalidateQueries(['products']);
      alert('Receipt validated successfully! Stock updated.');
    } catch (err) {
      alert('Validation failed: ' + (err.response?.data?.message || err.message));
    }
  };

  const receipts = receiptsData || [];
  const toProcessCount = receipts.filter((receipt) => receipt.status === 'draft').length;
  const receivedTodayUnits = receipts
    .filter((receipt) => receipt.status === 'validated' && new Date(receipt.validatedAt || receipt.createdAt).toDateString() === new Date().toDateString())
    .reduce((sum, receipt) => sum + (receipt.items || []).reduce((qty, item) => qty + Number(item.quantity || 0), 0), 0);

  const handleOpenDetails = async (receiptId) => {
    try {
      const { data } = await api.get(`/receipts/${receiptId}`);
      setSelectedReceipt(data.data);
    } catch (err) {
      alert('Failed to load receipt details: ' + (err.response?.data?.message || err.message));
    }
  };

  const columns = [
    { key: 'id', title: 'Receipt ID', render: (val) => <span className="receipt-id">{val ? val.substring(0, 8).toUpperCase() : 'NEW'}</span> },
    { key: 'supplier', title: 'Supplier', render: (val) => (
      <div className="supplier-info">
        <User size={14} />
        <span>{val?.name || 'Manual Receipt'}</span>
      </div>
    )},
    { key: 'createdAt', title: 'Date', render: (val) => (
      <div className="date-info">
        <Calendar size={14} />
        <span>{val ? new Date(val).toLocaleDateString() : 'N/A'}</span>
      </div>
    )},
    { key: 'status', title: 'Status', render: (val) => (
      <span className={`status-badge status-${val ? val.toLowerCase() : 'unknown'}`}>{val || 'Unknown'}</span>
    )},
    { key: 'actions', title: '', render: (_, row) => (
      <div style={{ display: 'flex', gap: '8px' }}>
        {row.status === 'draft' && (
          <Button size="sm" variant="primary" onClick={(e) => { e.stopPropagation(); handleValidate(row.id); }}>Validate</Button>
        )}
        <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleOpenDetails(row.id); }}>
          <ChevronRight size={18} />
        </Button>
      </div>
    )},
  ];

  return (
    <div className="receipts-page">
      <div className="page-header">
        <div className="page-title-group">
          <h1>Receipts</h1>
          <p className="page-description">Incoming shipments and supplier deliveries.</p>
        </div>
        <div className="page-actions">
          <Button variant="secondary" icon={Printer} onClick={() => window.print()}>Print</Button>
          <Button icon={Plus} onClick={() => setShowModal(true)}>Create Receipt</Button>
        </div>
      </div>

      <div className="receipts-stats">
        <div className="compact-stat">
          <div className="compact-stat-icon icon-blue"><Clock size={20} /></div>
          <div>
            <span className="compact-stat-label">To Process</span>
            <span className="compact-stat-value">{toProcessCount}</span>
          </div>
        </div>
        <div className="compact-stat">
          <div className="compact-stat-icon icon-green"><CheckCircle2 size={20} /></div>
          <div>
            <span className="compact-stat-label">Received Today</span>
            <span className="compact-stat-value">{receivedTodayUnits} units</span>
          </div>
        </div>
      </div>

      <Card noPadding>
        <Table columns={columns} data={receipts} isLoading={isLoading} onRowClick={(row) => handleOpenDetails(row.id)} />
      </Card>

      {showModal && <ReceiptModal onClose={() => setShowModal(false)} />}
      {selectedReceipt && <TransactionDetailModal type="receipt" transaction={selectedReceipt} onClose={() => setSelectedReceipt(null)} />}
    </div>
  );
};

export default Receipts;
