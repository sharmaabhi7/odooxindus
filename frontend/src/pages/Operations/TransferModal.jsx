import React, { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import Button from '../../components/Button/Button';
import Input from '../../components/Input/Input';
import { useLocations, useProducts } from '../../hooks/useInventory';
import api from '../../services/api';
import { useQueryClient } from '@tanstack/react-query';

const TransferModal = ({ onClose }) => {
  const { data: locations } = useLocations();
  const { data: products } = useProducts();
  const queryClient = useQueryClient();

  const [sourceLocationId, setSourceLocationId] = useState('');
  const [destinationLocationId, setDestinationLocationId] = useState('');
  const [items, setItems] = useState([{ productId: '', quantity: 1 }]);

  const addItem = () => setItems([...items, { productId: '', quantity: 1 }]);
  const removeItem = (index) => setItems(items.filter((_, i) => i !== index));
  
  const updateItem = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = field === 'quantity' ? parseInt(value) : value;
    setItems(newItems);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (sourceLocationId === destinationLocationId) {
      alert('Source and destination locations must be different.');
      return;
    }
    try {
      await api.post('/transfers', { 
        sourceLocationId, 
        destinationLocationId, 
        items: items.map(i => ({
          productId: i.productId,
          quantity: Number(i.quantity)
        }))
      });
      queryClient.invalidateQueries(['transfers']);
      onClose();
    } catch (err) {
      alert('Error creating transfer: ' + err.message);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '800px' }}>
        <div className="modal-header">
          <h3>New Internal Transfer</h3>
          <button className="close-btn" onClick={onClose}><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
              <div className="form-item">
                <label className="input-label">Source Location</label>
                <select 
                  className="custom-select"
                  value={sourceLocationId}
                  onChange={e => setSourceLocationId(e.target.value)}
                  required
                >
                  <option value="">Select Source</option>
                  {locations?.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                </select>
              </div>
              <div className="form-item">
                <label className="input-label">Destination Location</label>
                <select 
                  className="custom-select"
                  value={destinationLocationId}
                  onChange={e => setDestinationLocationId(e.target.value)}
                  required
                >
                  <option value="">Select Destination</option>
                  {locations?.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                </select>
              </div>
            </div>

            <div className="items-section">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h4 style={{ margin: 0 }}>Transfer Items</h4>
                <Button type="button" variant="secondary" size="sm" onClick={addItem} icon={Plus}>Add Item</Button>
              </div>

              {items.map((item, index) => (
                <div key={index} className="item-row" style={{ display: 'grid', gridTemplateColumns: '1fr 120px 40px', gap: '12px', marginBottom: '12px', alignItems: 'end' }}>
                  <div className="form-item">
                    <label className="input-label">Product</label>
                    <select 
                      className="custom-select"
                      value={item.productId}
                      onChange={e => updateItem(index, 'productId', e.target.value)}
                      required
                    >
                      <option value="">Select Product</option>
                      {products?.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </div>
                  <Input 
                    label="Qty" 
                    type="number" 
                    value={item.quantity} 
                    onChange={e => updateItem(index, 'quantity', e.target.value)}
                    required
                  />
                  <Button 
                    type="button" 
                    variant="ghost" 
                    onClick={() => removeItem(index)} 
                    style={{ color: 'var(--danger)', padding: '8px' }}
                    disabled={items.length === 1}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              ))}
            </div>
          </div>
          <div className="modal-footer">
            <Button variant="secondary" type="button" onClick={onClose}>Cancel</Button>
            <Button variant="primary" type="submit">Create Transfer</Button>
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
        .custom-select:focus {
          border-color: var(--primary);
          box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.1);
        }
      `}</style>
    </div>
  );
};

export default TransferModal;
