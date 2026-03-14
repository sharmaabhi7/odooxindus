import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import Button from '../../components/Button/Button';
import Input from '../../components/Input/Input';
import api from '../../services/api';
import { useQueryClient } from '@tanstack/react-query';

import { useCategories, useLocations } from '../../hooks/useInventory';

const ProductModal = ({ onClose, product }) => {
  const queryClient = useQueryClient();
  const { data: categories } = useCategories();
  const { data: locations } = useLocations();
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [categoryError, setCategoryError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    categoryId: '',
    unit: 'Units',
    reorderLevel: 10,
    initialQuantity: 0,
    initialLocationId: ''
  });

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        sku: product.sku || '',
        categoryId: product.categoryId || '',
        unit: product.unit || 'Units',
        reorderLevel: product.reorderLevel || 10
      });
    }
  }, [product]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (product) {
        const updateData = {
          name: formData.name,
          sku: formData.sku,
          categoryId: formData.categoryId,
          unit: formData.unit,
          reorderLevel: formData.reorderLevel,
        };
        await api.put(`/products/${product.id}`, updateData);
      } else {
        await api.post('/products', formData);
      }
      queryClient.invalidateQueries(['products']);
      onClose();
    } catch (err) {
      alert(`Error ${product ? 'updating' : 'creating'} product: ` + err.message);
    }
  };

  const handleCreateCategory = async () => {
    setCategoryError('');
    const name = newCategoryName.trim();
    if (!name) {
      setCategoryError('Category name is required');
      return;
    }
    setIsCreatingCategory(true);
    try {
      const { data } = await api.post('/categories', { name });
      const createdCategory = data.data;
      queryClient.invalidateQueries(['categories']);
      setFormData(prev => ({ ...prev, categoryId: createdCategory.id }));
      setNewCategoryName('');
    } catch (err) {
      setCategoryError(err.response?.data?.message || 'Failed to create category');
    } finally {
      setIsCreatingCategory(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '500px' }}>
        <div className="modal-header">
          <h3>{product ? 'Edit Product' : 'Add New Product'}</h3>
          <button className="close-btn" onClick={onClose}><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
            <Input 
              label="Product Name" 
              required
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
            />
            <Input 
              label="SKU" 
              required
              value={formData.sku}
              onChange={e => setFormData({...formData, sku: e.target.value})}
            />
            <div className="form-item full">
              <label className="input-label">Category</label>
              <select 
                className="custom-select"
                value={formData.categoryId}
                onChange={e => setFormData({...formData, categoryId: e.target.value})}
              >
                <option value="">Select Category</option>
                {categories?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <div className="category-create-row">
                <input
                  className="custom-select"
                  placeholder="New category name"
                  value={newCategoryName}
                  onChange={e => setNewCategoryName(e.target.value)}
                />
                <Button type="button" variant="secondary" size="sm" onClick={handleCreateCategory} disabled={isCreatingCategory}>
                  {isCreatingCategory ? 'Adding...' : 'Add'}
                </Button>
              </div>
              {categoryError && <p className="category-create-error">{categoryError}</p>}
            </div>
            <Input 
              label="Unit" 
              value={formData.unit}
              onChange={e => setFormData({...formData, unit: e.target.value})}
            />
            <Input 
              label="Reorder Level" 
              type="number"
              value={formData.reorderLevel}
              onChange={e => {
                const val = e.target.value === '' ? 0 : parseInt(e.target.value);
                setFormData({...formData, reorderLevel: isNaN(val) ? 0 : val});
              }}
            />

            {!product && (
              <div className="initial-stock-section" style={{ marginTop: '20px', padding: '16px', backgroundColor: 'var(--bg-muted)', borderRadius: 'var(--radius-md)' }}>
                <h4 style={{ margin: '0 0 12px 0', fontSize: '14px' }}>Initial Stock (Optional)</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <Input 
                    label="Initial Quantity" 
                    type="number"
                    value={formData.initialQuantity}
                    onChange={e => {
                      const val = e.target.value === '' ? 0 : parseInt(e.target.value);
                      setFormData({...formData, initialQuantity: isNaN(val) ? 0 : val});
                    }}
                  />
                  <div className="form-item">
                    <label className="input-label">Stock Location</label>
                    <select 
                      className="custom-select"
                      value={formData.initialLocationId}
                      onChange={e => setFormData({...formData, initialLocationId: e.target.value})}
                      required={formData.initialQuantity > 0}
                    >
                      <option value="">Select Location</option>
                      {locations?.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="modal-footer">
            <Button variant="secondary" type="button" onClick={onClose}>Cancel</Button>
            <Button variant="primary" type="submit">{product ? 'Update Product' : 'Create Product'}</Button>
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
        .category-create-row {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 8px;
          margin-top: 8px;
          align-items: center;
        }
        .category-create-error {
          margin-top: 6px;
          font-size: 12px;
          color: var(--danger);
        }
      `}</style>
    </div>
  );
};

export default ProductModal;
