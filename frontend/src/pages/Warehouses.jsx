import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import Table from '../components/Table/Table';
import Card from '../components/Card/Card';
import Button from '../components/Button/Button';
import Input from '../components/Input/Input';
import { useWarehouses } from '../hooks/useInventory';
import { Warehouse as WarehouseIcon, Plus, X } from 'lucide-react';
import './Warehouses.css';

const Warehouses = () => {
  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    contactInfo: '',
    storageCapacity: '',
    operationalHours: '',
  });
  const [errors, setErrors] = useState({});
  const { data: warehouses, isLoading } = useWarehouses();
  const queryClient = useQueryClient();

  const validateField = (name, value) => {
    if (name === 'name' && !value.trim()) return 'Warehouse name is required';
    if (name === 'address' && !value.trim()) return 'Location address is required';
    if (name === 'contactInfo' && !value.trim()) return 'Contact information is required';
    if (name === 'operationalHours' && !value.trim()) return 'Operational hours are required';
    if (name === 'storageCapacity') {
      if (!value.toString().trim()) return 'Storage capacity is required';
      if (Number(value) <= 0) return 'Storage capacity must be greater than zero';
    }
    return '';
  };

  const validateForm = () => {
    const nextErrors = {};
    Object.keys(formData).forEach((key) => {
      const error = validateField(key, formData[key]);
      if (error) nextErrors[key] = error;
    });
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const createWarehouseMutation = useMutation({
    mutationFn: async (payload) => {
      const { data } = await api.post('/warehouses', payload);
      return data.data;
    },
    onSuccess: (createdWarehouse) => {
      queryClient.setQueryData(['warehouses'], (current = []) => [createdWarehouse, ...current]);
      queryClient.invalidateQueries({ queryKey: ['warehouses'] });
      setShowModal(false);
      setMessage({ type: 'success', text: 'Warehouse created successfully.' });
      setFormData({
        name: '',
        address: '',
        contactInfo: '',
        storageCapacity: '',
        operationalHours: '',
      });
      setErrors({});
    },
    onError: (err) => {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to create warehouse' });
    },
  });

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: validateField(field, value) }));
  };

  const handleCreateWarehouse = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    if (!validateForm()) return;
    createWarehouseMutation.mutate({
      name: formData.name.trim(),
      address: formData.address.trim(),
      contactInfo: formData.contactInfo.trim(),
      storageCapacity: Number(formData.storageCapacity),
      operationalHours: formData.operationalHours.trim(),
    });
  };

  const columns = [
    { key: 'name', title: 'Warehouse Name', render: (val) => (
      <div className="warehouse-name-cell">
        <WarehouseIcon size={18} />
        <span style={{ fontWeight: 600 }}>{val}</span>
      </div>
    )},
    { key: 'address', title: 'Address' },
    { key: 'contactInfo', title: 'Contact Info' },
    { key: 'storageCapacity', title: 'Capacity', render: (val) => `${Number(val).toLocaleString()} units` },
    { key: 'operationalHours', title: 'Operational Hours' },
    { key: 'locations', title: 'Locations', render: (val) => val?.length || 0 },
  ];

  return (
    <div className="warehouses-page">
      {message.text && (
        <div className={`warehouse-notice ${message.type}`} role="status" aria-live="polite">
          {message.text}
        </div>
      )}

      <div className="page-header">
        <div className="page-title-group">
          <h1>Warehouses</h1>
          <p className="page-description">Manage physical storage facilities.</p>
        </div>
        <div className="page-actions">
          <Button icon={Plus} onClick={() => setShowModal(true)}>Add Warehouse</Button>
        </div>
      </div>
      <Card noPadding>
        <Table columns={columns} data={warehouses || []} isLoading={isLoading} />
      </Card>

      {showModal && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="add-warehouse-title">
          <div className="modal-content warehouse-modal-content">
            <div className="modal-header">
              <div>
                <h3 id="add-warehouse-title">Add Warehouse</h3>
                <p className="warehouse-modal-subtitle">Create a new storage facility with full operational details.</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setShowModal(false)} aria-label="Close add warehouse modal">
                <X size={18} />
              </Button>
            </div>

            <form onSubmit={handleCreateWarehouse}>
              <div className="modal-body">
                <div className="warehouse-form-grid">
                  <Input
                    label="Warehouse Name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    error={errors.name}
                    placeholder="Main Distribution Center"
                    required
                  />
                  <Input
                    label="Storage Capacity"
                    type="number"
                    min="1"
                    value={formData.storageCapacity}
                    onChange={(e) => handleInputChange('storageCapacity', e.target.value)}
                    error={errors.storageCapacity}
                    placeholder="5000"
                    required
                  />
                  <div className="warehouse-form-full">
                    <Input
                      label="Location Address"
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      error={errors.address}
                      placeholder="45 Industrial Road, Springfield"
                      required
                    />
                  </div>
                  <Input
                    label="Contact Information"
                    value={formData.contactInfo}
                    onChange={(e) => handleInputChange('contactInfo', e.target.value)}
                    error={errors.contactInfo}
                    placeholder="+1 555 000 1111"
                    required
                  />
                  <Input
                    label="Operational Hours"
                    value={formData.operationalHours}
                    onChange={(e) => handleInputChange('operationalHours', e.target.value)}
                    error={errors.operationalHours}
                    placeholder="Mon-Sat, 08:00 - 20:00"
                    required
                  />
                </div>
              </div>
              <div className="modal-footer">
                <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createWarehouseMutation.isPending}>
                  {createWarehouseMutation.isPending ? 'Saving...' : 'Create Warehouse'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Warehouses;
