import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import Table from '../components/Table/Table';
import Card from '../components/Card/Card';
import Button from '../components/Button/Button';
import { Warehouse as WarehouseIcon, Plus, MapPin } from 'lucide-react';

const Warehouses = () => {
  const { data: warehouses, isLoading } = useQuery({
    queryKey: ['warehouses'],
    queryFn: async () => {
      const { data } = await api.get('/warehouses');
      return data.data;
    },
  });

  const columns = [
    { key: 'name', title: 'Warehouse Name', render: (val) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <WarehouseIcon size={18} />
        <span style={{ fontWeight: 600 }}>{val}</span>
      </div>
    )},
    { key: 'code', title: 'Code' },
    { key: 'address', title: 'Address' },
    { key: '_count', title: 'Locations', render: (val) => val?.locations || 0 },
  ];

  return (
    <div className="warehouses-page">
      <div className="page-header">
        <div className="page-title-group">
          <h1>Warehouses</h1>
          <p className="page-description">Manage physical storage facilities.</p>
        </div>
        <div className="page-actions">
          <Button icon={Plus}>Add Warehouse</Button>
        </div>
      </div>
      <Card noPadding>
        <Table columns={columns} data={warehouses || []} isLoading={isLoading} />
      </Card>
    </div>
  );
};

export default Warehouses;
