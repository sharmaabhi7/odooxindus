import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar/Navbar';
import './Layout.css';

const Layout = () => {
  return (
    <div className="app-layout">
      <Navbar />
      <main className="main-content">
        <div className="content-container">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
