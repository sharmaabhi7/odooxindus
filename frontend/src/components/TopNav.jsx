import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Package, LayoutDashboard, Truck, Warehouse, BarChart3, Settings, User } from 'lucide-react';
import { cn } from '../utils/utils';
import useAuthStore from '../store/authStore';

export default function TopNav() {
  const { pathname } = useLocation();
  const { user, logout } = useAuthStore();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Products', path: '/products', icon: Package },
    { name: 'Operations', path: '/operations', icon: Truck },
    { name: 'Warehouses', path: '/warehouses', icon: Warehouse },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6 md:gap-10">
          <Link to="/" className="flex items-center space-x-2">
            <span className="inline-block font-bold text-xl text-primary">CoreInventory</span>
          </Link>
          <nav className="hidden md:flex gap-6">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center text-sm font-medium transition-colors hover:text-foreground/80",
                  pathname.startsWith(item.path) ? "text-foreground" : "text-foreground/60"
                )}
              >
                <item.icon className="mr-2 h-4 w-4" />
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
        
        <div className="flex items-center justify-end space-x-4">
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm font-medium hidden sm:inline-block">
              {user?.name || 'Profile'}
            </span>
          </div>
          <button 
            onClick={logout}
            className="text-sm font-medium text-destructive hover:text-destructive/80"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
