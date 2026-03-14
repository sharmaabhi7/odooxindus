import React, { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import Button from '../../components/Button/Button';
import Input from '../../components/Input/Input';
import { useSuppliers, useLocations, useProducts } from '../../hooks/useInventory';
import api from '../../services/api';
import { useQueryClient } from '@tanstack/react-query';

const ReceiptModal = ({ onClose }) => {
  const { data: suppliers } = useSuppliers();
  const { data: locations } = useLocations();
  const { data: products } = useProducts();
  const queryClient = useQueryClient();

  const [supplierId, setSupplierId] = useState('');
  const [items, setItems] = useState([{ productId: '', locationId: '', quantity: 1 }]);
  const [newSupplier, setNewSupplier] = useState({ name: '', email: '', phone: '' });
  const [isCreatingSupplier, setIsCreatingSupplier] = useState(false);
  const [supplierError, setSupplierError] = useState('');

  const addItem = () => setItems([...items, { productId: '', locationId: '', quantity: 1 }]);
  const removeItem = (index) => setItems(items.filter((_, i) => i !== index));
  
  const updateItem = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = field === 'quantity' ? parseInt(value) : value;
    setItems(newItems);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Ensure supplierId is null if empty string (to avoid Prisma/UUID errors)
      const payload = { 
        supplierId: supplierId || null, 
        items: items.map(i => ({
          productId: i.productId,
          locationId: i.locationId,
          quantity: Number(i.quantity)
        }))
      };
      await api.post('/receipts', payload);
      queryClient.invalidateQueries(['receipts']);
      onClose();
    } catch (err) {
      const msg = err.response?.data?.errors?.map(e => e.msg).join(', ') || err.message;
      alert('Error creating receipt: ' + msg);
    }
  };

  const handleCreateSupplier = async () => {
    setSupplierError('');
    if (!newSupplier.name.trim()) {
      setSupplierError('Supplier name is required');
      return;
    }
    setIsCreatingSupplier(true);
    try {
      const { data } = await api.post('/suppliers', {
        name: newSupplier.name.trim(),
        email: newSupplier.email.trim() || undefined,
        phone: newSupplier.phone.trim() || undefined,
      });
      const created = data.data;
      setSupplierId(created.id);
      setNewSupplier({ name: '', email: '', phone: '' });
      queryClient.invalidateQueries(['suppliers']);
    } catch (err) {
      setSupplierError(err.response?.data?.message || 'Unable to create supplier');
    } finally {
      setIsCreatingSupplier(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '600px' }}>
        <div className="modal-header">
          <h3>Create Receipt</h3>
          <button className="close-btn" onClick={onClose}><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
            <div className="form-item full">
              <label className="input-label">Supplier</label>
              <select 
                className="custom-select" 
                value={supplierId} 
                onChange={e => setSupplierId(e.target.value)}
                required
              >
                <option value="">Select Supplier</option>
                {suppliers?.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
              <div className="supplier-create-grid">
                <input
                  className="custom-select"
                  placeholder="New supplier name"
                  value={newSupplier.name}
                  onChange={(e) => setNewSupplier((prev) => ({ ...prev, name: e.target.value }))}
                />
                <input
                  className="custom-select"
                  placeholder="Supplier email"
                  value={newSupplier.email}
                  onChange={(e) => setNewSupplier((prev) => ({ ...prev, email: e.target.value }))}
                />
                <input
                  className="custom-select"
                  placeholder="Supplier phone"
                  value={newSupplier.phone}
                  onChange={(e) => setNewSupplier((prev) => ({ ...prev, phone: e.target.value }))}
                />
                <Button type="button" variant="secondary" size="sm" onClick={handleCreateSupplier} disabled={isCreatingSupplier}>
                  {isCreatingSupplier ? 'Adding...' : 'Add Supplier'}
                </Button>
              </div>
              {supplierError && <p className="input-error">{supplierError}</p>}
            </div>

            <div className="items-section" style={{ marginTop: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h4 style={{ margin: 0 }}>Items</h4>
                <Button type="button" variant="secondary" size="sm" onClick={addItem} icon={Plus}>Add Item</Button>
              </div>

              {items.map((item, index) => (
                <div key={index} className="item-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 80px 40px', gap: '8px', marginBottom: '12px', alignItems: 'end' }}>
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
                  <div className="form-item">
                    <label className="input-label">Location</label>
                    <select 
                      className="custom-select"
                      value={item.locationId}
                      onChange={e => updateItem(index, 'locationId', e.target.value)}
                      required
                    >
                      <option value="">Select Location</option>
                      {locations?.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
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
            <Button variant="primary" type="submit">Create Draft</Button>
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
        .supplier-create-grid {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr auto;
          gap: 8px;
          margin-top: 10px;
          align-items: center;
        }
        @media (max-width: 900px) {
          .supplier-create-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default ReceiptModal;
