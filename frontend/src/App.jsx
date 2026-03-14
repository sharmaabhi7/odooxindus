import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard/Dashboard';
import Products from './pages/Products/Products';
import Receipts from './pages/Operations/Receipts';
import Deliveries from './pages/Operations/Deliveries';
import Transfers from './pages/Operations/Transfers';
import Adjustments from './pages/Operations/Adjustments';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import Stocks from './pages/Stocks';
import MoveHistory from './pages/MoveHistory';
import Warehouses from './pages/Warehouses';
import Locations from './pages/Locations';
import Card from './components/Card/Card';

const Reports = () => (
  <div className="reports-page">
    <div className="page-header">
      <div className="page-title-group">
        <h1>Inventory Reports</h1>
        <p className="page-description">Deep dive into your inventory data and performance.</p>
      </div>
    </div>
    <div className="reports-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px' }}>
      <Card title="Stock Aging Report" subtitle="Analyze how long items have been in stock."></Card>
      <Card title="ABC Analysis" subtitle="Categorize products based on inventory value."></Card>
      <Card title="Warehouse Utilization" subtitle="Monitor space efficiency across locations."></Card>
      <Card title="Turnover Rate" subtitle="Calculate how often stock is sold or used."></Card>
    </div>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="products" element={<Products />} />
          <Route path="stock" element={<Stocks />} />
          <Route path="history" element={<MoveHistory />} />
          <Route path="warehouses" element={<Warehouses />} />
          <Route path="locations" element={<Locations />} />
          <Route path="operations">
            <Route path="receipts" element={<Receipts />} />
            <Route path="deliveries" element={<Deliveries />} />
            <Route path="transfers" element={<Transfers />} />
            <Route path="adjustments" element={<Adjustments />} />
          </Route>
          <Route path="reports" element={<Reports />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
