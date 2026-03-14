import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import Table from '../components/Table/Table';
import Card from '../components/Card/Card';
import Button from '../components/Button/Button';
import { MapPin, Plus } from 'lucide-react';

const Locations = () => {
  const { data: locations, isLoading } = useQuery({
    queryKey: ['locations'],
    queryFn: async () => {
      const { data } = await api.get('/locations');
      return data.data;
    },
  });

  const columns = [
    { key: 'name', title: 'Location Name', render: (val) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <MapPin size={18} />
        <span style={{ fontWeight: 600 }}>{val}</span>
      </div>
    )},
    { key: 'barcode', title: 'Barcode' },
    { key: 'warehouse', title: 'Warehouse', render: (val) => val?.name },
    { key: 'type', title: 'Type', render: (val) => (
      <span className={`status-badge`}>{val.toUpperCase()}</span>
    )},
  ];

  return (
    <div className="locations-page">
      <div className="page-header">
        <div className="page-title-group">
          <h1>Locations</h1>
          <p className="page-description">Manage internal bins, shelves, and zones.</p>
        </div>
        <div className="page-actions">
          <Button icon={Plus} onClick={() => setShowModal(true)}>Add Location</Button>
        </div>
      </div>
      <Card noPadding>
        <Table columns={columns} data={locations || []} isLoading={isLoading} />
      </Card>
      
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
             <div className="modal-header">
               <h3>Add New Location</h3>
               <button className="close-btn" onClick={() => setShowModal(false)}><Plus size={20} style={{ transform: 'rotate(45deg)' }} /></button>
             </div>
             <div className="modal-body">
               <p>Location creation is handled via the Warehouse configuration or direct Adjustment for now.</p>
             </div>
             <div className="modal-footer">
               <Button onClick={() => setShowModal(false)}>Close</Button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Locations;
