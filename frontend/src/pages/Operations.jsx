import React, { useState } from 'react';
import { DownloadCloud, FilePlus, Truck, ArrowRightLeft, History } from 'lucide-react';

export default function Operations() {
  const [activeTab, setActiveTab] = useState('receipts');

  const tabs = [
    { id: 'receipts', name: 'Receipts', icon: DownloadCloud },
    { id: 'deliveries', name: 'Deliveries', icon: Truck },
    { id: 'transfers', name: 'Internal Transfers', icon: ArrowRightLeft },
    { id: 'ledger', name: 'Stock Ledger', icon: History },
  ];

  return (
    <div className="space-y-6 flex flex-col h-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Operations</h1>
          <p className="text-muted-foreground mt-1">Manage stock movements and history.</p>
        </div>
        <button className="bg-primary text-primary-foreground flex gap-2 items-center px-4 py-2 rounded-md hover:bg-primary/90 text-sm font-medium transition-colors">
          <FilePlus className="h-4 w-4" />
          New {tabs.find(t => t.id === activeTab)?.name.split(' ')[0]}
        </button>
      </div>

      <div className="w-full border-b border-border">
        <nav className="flex space-x-8" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:border-muted-foreground/30 hover:text-foreground'
              }`}
              aria-current={activeTab === tab.id ? 'page' : undefined}
            >
              <tab.icon className={`mr-2 h-4 w-4 ${activeTab === tab.id ? 'text-primary' : 'text-muted-foreground'}`} />
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      <div className="rounded-md border bg-card shadow-sm flex-1 p-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">{tabs.find(t => t.id === activeTab)?.name}</h3>
          <p className="text-sm text-muted-foreground">
            View and manage all {activeTab} here. Use the New button to create a new record.
          </p>
          
          <div className="h-64 border-2 border-dashed border-border rounded-xl flex items-center justify-center mt-4 bg-muted/20">
            <div className="text-center space-y-2">
              <p className="text-muted-foreground font-medium">No {activeTab} found</p>
              <p className="text-sm text-muted-foreground">Create a new record to get started.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
