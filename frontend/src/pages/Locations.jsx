import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import Table from '../components/Table/Table';
import Card from '../components/Card/Card';
import Button from '../components/Button/Button';
import Input from '../components/Input/Input';
import { useLocations, useWarehouses } from '../hooks/useInventory';
import { MapPin, Plus, X } from 'lucide-react';
import './Locations.css';

const Locations = () => {
  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [formData, setFormData] = useState({
    name: '',
    warehouseId: '',
    type: 'storage',
  });
  const [errors, setErrors] = useState({});
  const { data: locations, isLoading } = useLocations();
  const { data: warehouses } = useWarehouses();
  const queryClient = useQueryClient();

  const validateField = (field, value) => {
    if (field === 'name' && !value.trim()) return 'Location name is required';
    if (field === 'warehouseId' && !value) return 'Warehouse is required';
    return '';
  };

  const validateForm = () => {
    const nextErrors = {
      name: validateField('name', formData.name),
      warehouseId: validateField('warehouseId', formData.warehouseId),
    };
    const hasErrors = Object.values(nextErrors).some(Boolean);
    setErrors(nextErrors);
    return !hasErrors;
  };

  const createLocationMutation = useMutation({
    mutationFn: async (payload) => {
      const { data } = await api.post('/locations', payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
      setShowModal(false);
      setFormData({ name: '', warehouseId: '', type: 'storage' });
      setErrors({});
      setMessage({ type: 'success', text: 'Location created successfully.' });
    },
    onError: (err) => {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to create location' });
    },
  });

  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: validateField(field, value) }));
  };

  const handleCreateLocation = (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    if (!validateForm()) return;
    createLocationMutation.mutate({
      name: formData.name.trim(),
      warehouseId: formData.warehouseId,
      type: formData.type,
    });
  };

  const columns = [
    { key: 'name', title: 'Location Name', render: (val) => (
      <div className="location-name-cell">
        <MapPin size={18} />
        <span style={{ fontWeight: 600 }}>{val}</span>
      </div>
    )},
    { key: 'warehouse', title: 'Warehouse', render: (val) => val?.name },
    { key: 'type', title: 'Type', render: (val) => (
      <span className="location-type-badge">{(val || '').toUpperCase()}</span>
    )},
  ];

  return (
    <div className="locations-page">
      {message.text && (
        <div className={`location-notice ${message.type}`} role="status" aria-live="polite">
          {message.text}
        </div>
      )}

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
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="add-location-title">
          <div className="modal-content">
            <div className="modal-header">
              <h3 id="add-location-title">Add New Location</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowModal(false)} aria-label="Close add location modal">
                <X size={18} />
              </Button>
            </div>
            <form onSubmit={handleCreateLocation}>
              <div className="modal-body">
                <Input
                  label="Location Name"
                  value={formData.name}
                  onChange={(e) => handleFieldChange('name', e.target.value)}
                  error={errors.name}
                  placeholder="Rack C / Packing Zone / Bin A-12"
                  required
                />
                <div className="form-item full">
                  <label className="input-label">Warehouse</label>
                  <select
                    className={`custom-select ${errors.warehouseId ? 'has-error' : ''}`}
                    value={formData.warehouseId}
                    onChange={(e) => handleFieldChange('warehouseId', e.target.value)}
                    required
                  >
                    <option value="">Select Warehouse</option>
                    {warehouses?.map((warehouse) => (
                      <option key={warehouse.id} value={warehouse.id}>{warehouse.name}</option>
                    ))}
                  </select>
                  {errors.warehouseId && <p className="input-error">{errors.warehouseId}</p>}
                </div>
                <div className="form-item full">
                  <label className="input-label">Location Type</label>
                  <select
                    className="custom-select"
                    value={formData.type}
                    onChange={(e) => handleFieldChange('type', e.target.value)}
                  >
                    <option value="storage">Storage</option>
                    <option value="packing">Packing</option>
                    <option value="staging">Staging</option>
                    <option value="receiving">Receiving</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createLocationMutation.isPending}>
                  {createLocationMutation.isPending ? 'Saving...' : 'Create Location'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Locations;
