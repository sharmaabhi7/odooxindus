import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Truck, 
  User, 
  ExternalLink,
  PackageCheck,
  AlertTriangle,
  Printer
} from 'lucide-react';
import Table from '../../components/Table/Table';
import Button from '../../components/Button/Button';
import Card from '../../components/Card/Card';
import './Deliveries.css';

import { useDeliveries } from '../../hooks/useInventory';
import api from '../../services/api';
import { useQueryClient } from '@tanstack/react-query';
import DeliveryModal from './DeliveryModal';
import TransactionDetailModal from './TransactionDetailModal';

const Deliveries = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const { data: deliveriesData, isLoading } = useDeliveries();
  const queryClient = useQueryClient();

  const handleValidate = async (id) => {
    try {
      await api.post(`/deliveries/${id}/validate`);
      queryClient.invalidateQueries(['deliveries']);
      queryClient.invalidateQueries(['dashboard']);
      queryClient.invalidateQueries(['stocks']);
      queryClient.invalidateQueries(['products']);
      alert('Delivery validated! Stock decreased.');
    } catch (err) {
      alert('Validation failed: ' + (err.response?.data?.message || err.message));
    }
  };

  const deliveries = deliveriesData || [];
  const toShipCount = deliveries.filter((delivery) => delivery.status === 'draft').length;
  const deliveredTodayCount = deliveries.filter(
    (delivery) => delivery.status === 'validated' && new Date(delivery.validatedAt || delivery.createdAt).toDateString() === new Date().toDateString()
  ).length;
  const lateDeliveriesCount = deliveries.filter((delivery) => delivery.status === 'late').length;

  const handleOpenDetails = async (deliveryId) => {
    try {
      const { data } = await api.get(`/deliveries/${deliveryId}`);
      setSelectedDelivery(data.data);
    } catch (err) {
      alert('Failed to load delivery details: ' + (err.response?.data?.message || err.message));
    }
  };

  const columns = [
    { key: 'id', title: 'Delivery ID', render: (val) => <span className="delivery-id">{val ? val.substring(0, 8).toUpperCase() : 'NEW'}</span> },
    { key: 'customerName', title: 'Customer', render: (val) => (
      <div className="entity-info">
        <User size={14} />
        <span>{val}</span>
      </div>
    )},
    { key: 'createdAt', title: 'Date Created', render: (val) => val ? new Date(val).toLocaleDateString() : 'N/A' },
    { key: 'status', title: 'Status', render: (val) => (
      <span className={`status-badge status-${val ? val.toLowerCase() : 'unknown'}`}>{val || 'Unknown'}</span>
    )},
    { key: 'actions', title: '', render: (_, row) => (
      <div style={{ display: 'flex', gap: '8px' }}>
        {row.status === 'draft' && (
          <Button size="sm" variant="primary" onClick={(e) => { e.stopPropagation(); handleValidate(row.id); }}>Validate</Button>
        )}
        <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleOpenDetails(row.id); }}>
          <ExternalLink size={16} />
        </Button>
      </div>
    )},
  ];

  return (
    <div className="deliveries-page">
      <div className="page-header">
        <div className="page-title-group">
          <h1>Delivery Orders</h1>
          <p className="page-description">Manage and track outgoing shipments to customers.</p>
        </div>
        <div className="page-actions">
          <Button variant="secondary" icon={Printer} onClick={() => window.print()}>Print</Button>
          <Button icon={Plus} onClick={() => setShowModal(true)}>Create Delivery</Button>
        </div>
      </div>

      <div className="delivery-summary">
        <Card className="summary-card">
          <div className="summary-inner">
            <div className="summary-icon blue"><Truck size={24} /></div>
            <div>
              <span className="summary-label">To Ship</span>
              <span className="summary-value">{toShipCount}</span>
            </div>
          </div>
        </Card>
        <Card className="summary-card">
          <div className="summary-inner">
            <div className="summary-icon green"><PackageCheck size={24} /></div>
            <div>
              <span className="summary-label">Delivered Today</span>
              <span className="summary-value">{deliveredTodayCount}</span>
            </div>
          </div>
        </Card>
        <Card className="summary-card">
          <div className="summary-inner">
            <div className="summary-icon amber"><AlertTriangle size={24} /></div>
            <div>
              <span className="summary-label">Late Deliveries</span>
              <span className="summary-value">{lateDeliveriesCount}</span>
            </div>
          </div>
        </Card>
      </div>

      <Card noPadding>
        <div className="table-toolbar">
          <div className="search-box">
            <Search size={18} />
            <input type="text" placeholder="Filter deliveries…" />
          </div>
          <div className="filter-group">
            <Button variant="secondary" size="sm">Today</Button>
            <Button variant="secondary" size="sm">This Week</Button>
          </div>
        </div>
        <Table columns={columns} data={deliveries} isLoading={isLoading} onRowClick={(row) => handleOpenDetails(row.id)} />
      </Card>

      {showModal && <DeliveryModal onClose={() => setShowModal(false)} />}
      {selectedDelivery && <TransactionDetailModal type="delivery" transaction={selectedDelivery} onClose={() => setSelectedDelivery(null)} />}
    </div>
  );
};

export default Deliveries;
