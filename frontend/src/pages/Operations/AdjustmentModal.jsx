import React, { useState } from 'react';
import { X } from 'lucide-react';
import Button from '../../components/Button/Button';
import Input from '../../components/Input/Input';
import { useLocations, useProducts } from '../../hooks/useInventory';
import api from '../../services/api';
import { useQueryClient } from '@tanstack/react-query';

const AdjustmentModal = ({ onClose }) => {
  const { data: locations } = useLocations();
  const { data: products } = useProducts();
  const queryClient = useQueryClient();

  const [productId, setProductId] = useState('');
  const [locationId, setLocationId] = useState('');
  const [newQty, setNewQty] = useState(0);
  const [reason, setReason] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/stock/adjust', { 
        productId, 
        locationId, 
        newQty: Number(newQty), 
        reason: reason.trim() 
      });
      queryClient.invalidateQueries(['adjustments']);
      queryClient.invalidateQueries(['stocks']);
      queryClient.invalidateQueries(['products']);
      queryClient.invalidateQueries(['dashboard']);
      onClose();
    } catch (err) {
      alert('Error creating adjustment: ' + err.message);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '500px' }}>
        <div className="modal-header">
          <h3>Inventory Adjustment</h3>
          <button className="close-btn" onClick={onClose}><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-item full">
              <label className="input-label">Product</label>
              <select 
                className="custom-select"
                value={productId}
                onChange={e => setProductId(e.target.value)}
                required
              >
                <option value="">Select Product</option>
                {products?.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div className="form-item full">
              <label className="input-label">Location</label>
              <select 
                className="custom-select"
                value={locationId}
                onChange={e => setLocationId(e.target.value)}
                required
              >
                <option value="">Select Location</option>
                {locations?.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
              </select>
            </div>
            <div className="form-item full">
              <Input 
                label="New Quantity" 
                type="number" 
                value={newQty}
                onChange={e => {
                  const val = e.target.value === '' ? 0 : parseInt(e.target.value);
                  setNewQty(isNaN(val) ? 0 : val);
                }}
                required
              />
            </div>
            <div className="form-item full">
              <Input 
                label="Reason" 
                placeholder="e.g. Damage, Miscount" 
                value={reason}
                onChange={e => setReason(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="modal-footer">
            <Button variant="secondary" type="button" onClick={onClose}>Cancel</Button>
            <Button variant="primary" type="submit">Complete Adjustment</Button>
          </div>
        </form>
      </div>
      <style>{`
        .custom-select {
          width: 100%;
          padding: 8px 12px;
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          font-size: 14px;
          background-color: white;
          outline: none;
        }
      `}</style>
    </div>
  );
};

export default AdjustmentModal;
