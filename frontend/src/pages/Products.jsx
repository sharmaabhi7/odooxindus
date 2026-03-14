import React, { useState, useEffect } from 'react';
import { productService } from '../services/productService';
import { Search, Plus, Filter, MoreHorizontal, Edit, Trash } from 'lucide-react';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        // Fallback mock
        const mockProducts = [
          { id: '1', name: 'Wireless Router', sku: 'NET-WR-01', category: 'Networking', stock: 45, unit: 'pcs' },
          { id: '2', name: 'Cat6 Cable 100m', sku: 'CBL-C6-100', category: 'Cables', stock: 120, unit: 'roll' },
          { id: '3', name: 'Server Rack 42U', sku: 'RCK-42U-01', category: 'Hardware', stock: 8, unit: 'pcs' },
          { id: '4', name: 'Optical Transceiver', sku: 'OPT-TR-10G', category: 'Networking', stock: 65, unit: 'pcs' },
        ];
        
        try {
          const res = await productService.getProducts();
          setProducts(res.data || res);
        } catch (e) {
          setProducts(mockProducts);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 flex flex-col h-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Products</h1>
          <p className="text-muted-foreground mt-1">Manage your inventory items and catalogs.</p>
        </div>
        <button className="bg-primary text-primary-foreground flex gap-2 items-center px-4 py-2 rounded-md hover:bg-primary/90 text-sm font-medium transition-colors">
          <Plus className="h-4 w-4" />
          Add Product
        </button>
      </div>
      
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name, SKU..."
            className="w-full pl-9 pr-4 py-2 h-10 rounded-md border border-input bg-transparent text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="flex items-center gap-2 border border-input bg-background/50 px-4 py-2 h-10 rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground sm:w-auto w-full justify-center">
          <Filter className="h-4 w-4" />
          Filters
        </button>
      </div>

      <div className="rounded-md border bg-card shadow-sm flex-1 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase bg-muted/50 border-b">
              <tr>
                <th className="px-6 py-4 font-medium">SKU</th>
                <th className="px-6 py-4 font-medium">Name</th>
                <th className="px-6 py-4 font-medium">Category</th>
                <th className="px-6 py-4 font-medium text-right">Stock</th>
                <th className="px-6 py-4 font-medium text-center">Unit</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-muted-foreground">Loading products...</td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-muted-foreground">No products found.</td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr key={product.id} className="border-b transition-colors hover:bg-muted/50">
                    <td className="px-6 py-4 font-medium">{product.sku}</td>
                    <td className="px-6 py-4">{product.name}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-secondary/10 text-secondary-foreground">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className={product.stock < 15 ? "text-destructive font-bold" : "text-primary font-medium"}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center text-muted-foreground">{product.unit}</td>
                    <td className="px-6 py-4 text-right space-x-2 flex justify-end">
                      <button className="h-8 w-8 rounded-md hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button className="h-8 w-8 rounded-md hover:bg-destructive/10 flex items-center justify-center text-destructive hover:text-destructive/80">
                        <Trash className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
