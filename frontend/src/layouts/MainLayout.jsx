import React from 'react';
import { Outlet } from 'react-router-dom';
import TopNav from '../components/TopNav';

export default function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <TopNav />
      <main className="flex-1 container mx-auto p-4 md:p-6 lg:p-8">
        <Outlet />
      </main>
    </div>
  );
}
