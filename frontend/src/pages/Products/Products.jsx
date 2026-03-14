import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  FileDown, 
  PackageSearch,
  Edit2,
  Trash2
} from 'lucide-react';
import Table from '../../components/Table/Table';
import Button from '../../components/Button/Button';
import Input from '../../components/Input/Input';
import Card from '../../components/Card/Card';
import './Products.css';

import { useProducts } from '../../hooks/useInventory';
import { useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';

import ProductModal from './ProductModal';

const Products = () => {
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const { data: productsData, isLoading } = useProducts();
  const queryClient = useQueryClient();

  const products = productsData || [];

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;
    try {
      await api.delete(`/products/${id}`);
      queryClient.invalidateQueries(['products']);
    } catch (err) {
      alert('Error deleting product: ' + err.message);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setShowModal(true);
  };

  const columns = [
    { key: 'name', title: 'Product Name', render: (val) => (
      <div className="product-cell">
        <div className="product-avatar"><PackageSearch size={18} /></div>
        <div className="product-info">
          <span className="product-name">{val}</span>
        </div>
      </div>
    )},
    { key: 'sku', title: 'SKU' },
    { key: 'category', title: 'Category', render: (val) => val?.name || 'Uncategorized' },
    { key: 'unit', title: 'Unit' },
    { key: 'stock', title: 'Stock Quantity', render: (val, row) => (
      <span className={`stock-qty ${val <= row.reorderLevel ? 'text-danger' : ''}`}>{val || 0}</span>
    )},
    { key: 'status', title: 'Status', render: (val) => {
      const status = val || 'Active';
      return (
        <span className={`status-badge status-${status.toLowerCase().replace(' ', '-')}`}>
          {status}
        </span>
      );
    }},
    { key: 'actions', title: 'Actions', render: (_, row) => (
      <div className="table-actions">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => handleEdit(row)}
          title="Edit"
        >
          <Edit2 size={16} color="var(--primary)" />
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => handleDelete(row.id, row.name)}
          title="Delete"
        >
          <Trash2 size={16} color="var(--danger)" />
        </Button>
      </div>
    )},
  ];

  return (
    <div className="products-page">
      <div className="page-header">
        <div className="page-title-group">
          <h1>Product Catalog</h1>
          <p className="page-description">Manage your inventory products and stock levels.</p>
        </div>
        <div className="page-actions">
          <Button variant="secondary" icon={FileDown}>Export</Button>
          <Button icon={Plus} onClick={() => {
            setEditingProduct(null);
            setShowModal(true);
          }}>Add Product</Button>
        </div>
      </div>

      <Card noPadding className="products-card">
        <div className="table-header-toolbar">
          <div className="tabs">
            <button 
              className={`tab ${activeTab === 'all' ? 'active' : ''}`}
              onClick={() => setActiveTab('all')}
            >
              All Products
            </button>
            <button 
              className={`tab ${activeTab === 'active' ? 'active' : ''}`}
              onClick={() => setActiveTab('active')}
            >
              Low Stock
            </button>
            <button 
              className={`tab ${activeTab === 'archived' ? 'active' : ''}`}
              onClick={() => setActiveTab('archived')}
            >
              Out of Stock
            </button>
          </div>
          
          <div className="toolbar-actions">
            <div className="toolbar-search">
              <Search size={16} />
              <input type="text" placeholder="Filter by name, SKU..." />
            </div>
            <Button variant="secondary" size="sm" icon={Filter}>Filters</Button>
          </div>
        </div>

        <Table columns={columns} data={products} isLoading={isLoading} />
        
        <div className="table-footer">
          <span className="results-count">Showing {products.length} products</span>
          <div className="pagination">
            <Button variant="secondary" size="sm" disabled>Previous</Button>
            <div className="page-numbers">
              <span className="active">1</span>
            </div>
            <Button variant="secondary" size="sm" disabled>Next</Button>
          </div>
        </div>
      </Card>

      {showModal && (
        <ProductModal 
          product={editingProduct} 
          onClose={() => {
            setShowModal(false);
            setEditingProduct(null);
          }} 
        />
      )}
    </div>
  );
};

export default Products;
