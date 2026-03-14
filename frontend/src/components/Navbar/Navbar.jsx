import React from 'react';
import { 
  Box, 
  Search, 
  Bell, 
  User, 
  ChevronDown, 
  LayoutDashboard, 
  Package, 
  Truck, 
  ArrowLeftRight, 
  History,
  Settings
} from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import './Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-left">
          <div className="navbar-brand">
            <div className="brand-icon">
              <Box size={24} color="white" fill="white" />
            </div>
            <span className="brand-name">CoreInventory</span>
          </div>

          <div className="navbar-links">
            <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <LayoutDashboard size={18} />
              <span>Dashboard</span>
            </NavLink>
            <NavLink to="/products" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <Package size={18} />
              <span>Products</span>
            </NavLink>
            <NavLink to="/stock" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <LayoutDashboard size={18} />
              <span>Stock</span>
            </NavLink>
            <div className="nav-dropdown">
              <div className="nav-item">
                <Truck size={18} />
                <span>Operations</span>
                <ChevronDown size={14} />
              </div>
              <div className="dropdown-content">
                <NavLink to="/operations/receipts">Receipts</NavLink>
                <NavLink to="/operations/deliveries">Delivery Orders</NavLink>
                <NavLink to="/operations/transfers">Internal Transfers</NavLink>
                <NavLink to="/operations/adjustments">Inventory Adjustments</NavLink>
              </div>
            </div>
            <NavLink to="/history" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <History size={18} />
              <span>Ledger</span>
            </NavLink>

            <div className="nav-dropdown">
              <div className="nav-item">
                <Settings size={18} />
                <span>Config</span>
                <ChevronDown size={14} />
              </div>
              <div className="dropdown-content">
                <NavLink to="/warehouses">Warehouses</NavLink>
                <NavLink to="/locations">Locations</NavLink>
              </div>
            </div>

            <NavLink to="/reports" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <Settings size={18} />
              <span>Reports</span>
            </NavLink>
          </div>
        </div>

        <div className="navbar-right">
          <div className="navbar-search">
            <Search size={18} className="search-icon" />
            <input type="text" placeholder="Search…" />
            <div className="search-shortcut">⌘K</div>
          </div>
          
          <div className="navbar-actions">
            <button className="action-btn">
              <Bell size={20} />
              <span className="notification-dot"></span>
            </button>
            <button className="action-btn">
              <Settings size={20} />
            </button>
            <div className="user-profile-menu">
              <div className="user-profile">
                <div className="avatar">JD</div>
                <ChevronDown size={14} color="var(--text-secondary)" />
              </div>
              <div className="profile-dropdown">
                <div className="dropdown-user-info">
                  <span className="user-name">John Doe</span>
                  <span className="user-email">john@example.com</span>
                </div>
                <div className="dropdown-divider"></div>
                <NavLink to="/profile" className="dropdown-item">My Profile</NavLink>
                <NavLink to="/settings" className="dropdown-item">Account Settings</NavLink>
                <div className="dropdown-divider"></div>
                <button className="dropdown-item logout-btn" onClick={handleLogout}>
                  <Box size={14} />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
