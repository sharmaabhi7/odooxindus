import React, { useState } from 'react';
import { 
  Plus, 
  MoreHorizontal,
  Printer
} from 'lucide-react';
import Table from '../../components/Table/Table';
import Button from '../../components/Button/Button';
import Card from '../../components/Card/Card';
import './Transfers.css';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import TransferModal from './TransferModal';
import TransactionDetailModal from './TransactionDetailModal';

const useTransfers = () => {
  return useQuery({
    queryKey: ['transfers'],
    queryFn: async () => {
      const { data } = await api.get('/transfers');
      return data.data.transfers;
    },
  });
};

const Transfers = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedTransfer, setSelectedTransfer] = useState(null);
  const { data: transfersData, isLoading } = useTransfers();
  const queryClient = useQueryClient();

  const handleValidate = async (id) => {
    try {
      await api.post(`/transfers/${id}/validate`);
      queryClient.invalidateQueries(['transfers']);
      queryClient.invalidateQueries(['dashboard']);
      queryClient.invalidateQueries(['stocks']);
      queryClient.invalidateQueries(['products']);
      alert('Transfer validated! Stock moved.');
    } catch (err) {
      alert('Validation failed: ' + (err.response?.data?.message || err.message));
    }
  };

  const transfers = transfersData || [];
  const activeTransfersCount = transfers.filter((transfer) => transfer.status !== 'cancelled').length;
  const pendingTransfersCount = transfers.filter((transfer) => transfer.status === 'draft').length;
  const recentLocations = Array.from(
    new Set(
      transfers.flatMap((transfer) => [
        transfer.sourceLocation?.name,
        transfer.destinationLocation?.name,
      ].filter(Boolean))
    )
  ).slice(0, 6);

  const handleOpenDetails = async (transferId) => {
    try {
      const { data } = await api.get(`/transfers/${transferId}`);
      setSelectedTransfer(data.data);
    } catch (err) {
      alert('Failed to load transfer details: ' + (err.response?.data?.message || err.message));
    }
  };

  const columns = [
    { key: 'id', title: 'Transfer ID', render: (val) => <span className="transfer-id">{val ? val.substring(0, 8).toUpperCase() : 'NEW'}</span> },
    { key: 'createdAt', title: 'Date', render: (val) => val ? new Date(val).toLocaleDateString() : 'N/A' },
    { key: 'status', title: 'Status', render: (val) => (
      <span className={`status-badge status-${val ? val.toLowerCase().replace(' ', '-') : 'unknown'}`}>{val || 'Unknown'}</span>
    )},
    { key: 'actions', title: '', render: (_, row) => (
      <div style={{ display: 'flex', gap: '8px' }}>
        {row.status === 'draft' && (
          <Button size="sm" variant="primary" onClick={(e) => { e.stopPropagation(); handleValidate(row.id); }}>Validate</Button>
        )}
        <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleOpenDetails(row.id); }}>
          <MoreHorizontal size={18} />
        </Button>
      </div>
    )},
  ];

  return (
    <div className="transfers-page">
      <div className="page-header">
        <div className="page-title-group">
          <h1>Internal Transfers</h1>
          <p className="page-description">Move stock between warehouses, zones, or bins.</p>
        </div>
        <div className="page-actions">
          <Button variant="secondary" icon={Printer} onClick={() => window.print()}>Print</Button>
          <Button icon={Plus} onClick={() => setShowModal(true)}>New Transfer</Button>
        </div>
      </div>

      <div className="transfers-layout">
        <div className="transfers-main">
          <Card noPadding>
            <Table columns={columns} data={transfers} isLoading={isLoading} onRowClick={(row) => handleOpenDetails(row.id)} />
          </Card>
        </div>
        
        {showModal && <TransferModal onClose={() => setShowModal(false)} />}
        <div className="transfers-aside">
          <Card title="Quick Stats">
            <div className="aside-stat">
              <span className="aside-stat-label">Total active transfers</span>
              <span className="aside-stat-value">{activeTransfersCount}</span>
            </div>
            <div className="aside-stat">
              <span className="aside-stat-label">Pending confirmation</span>
              <span className="aside-stat-value">{pendingTransfersCount}</span>
            </div>
          </Card>
          
          <Card title="Recent Locations" className="loc-card">
            <div className="recent-locs">
              {recentLocations.length > 0 ? recentLocations.map((loc) => (
                <div key={loc} className="loc-tag">{loc}</div>
              )) : <div className="loc-tag">No recent locations</div>}
            </div>
          </Card>
        </div>
      </div>
      {selectedTransfer && <TransactionDetailModal type="transfer" transaction={selectedTransfer} onClose={() => setSelectedTransfer(null)} />}
    </div>
  );
};

export default Transfers;
