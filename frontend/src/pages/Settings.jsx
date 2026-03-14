import React from 'react';
import { Save } from 'lucide-react';

export default function Settings() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account and system preferences.</p>
      </div>

      <div className="grid gap-6">
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
          <div className="p-6 border-b border-border">
            <h3 className="text-lg font-medium">Company Profile</h3>
            <p className="text-sm text-muted-foreground">This information will be displayed on reports.</p>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Company Name</label>
                <input type="text" defaultValue="CoreInventory Demo" className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm focus-[var(--ring)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Contact Email</label>
                <input type="email" defaultValue="admin@coreinventory.demo" className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
              </div>
            </div>
            <div className="pt-4 flex justify-end">
              <button className="bg-primary text-primary-foreground flex gap-2 items-center px-4 py-2 rounded-md hover:bg-primary/90 text-sm font-medium transition-colors">
                <Save className="h-4 w-4" />
                Save Changes
              </button>
            </div>
          </div>
        </div>
        
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
          <div className="p-6 border-b border-border">
            <h3 className="text-lg font-medium">Application Preferences</h3>
            <p className="text-sm text-muted-foreground">Customize your experience.</p>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <label className="text-sm font-medium">Dark Mode toggle in next update</label>
                <p className="text-sm text-muted-foreground">For now, system preference is respected.</p>
              </div>
              <div className="h-6 w-11 rounded-full bg-muted border-2 border-transparent"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
