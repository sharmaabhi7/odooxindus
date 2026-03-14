import React, { useEffect, useState } from 'react';
import { dashboardService } from '../services/dashboardService';
import { Package, AlertTriangle, Truck, ArrowRightLeft } from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar, Legend
} from 'recharts';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    lowStockItems: 0,
    outOfStockItems: 0,
    pendingReceipts: 0,
    pendingDeliveries: 0,
    internalTransfers: 0
  });
  
  const [trendData, setTrendData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Fallback mock data if API is not ready
        const mockStats = {
          totalProducts: 1245,
          lowStockItems: 42,
          outOfStockItems: 12,
          pendingReceipts: 8,
          pendingDeliveries: 15,
          internalTransfers: 3
        };
        const mockTrendData = [
          { name: 'Jan', stock: 4000 },
          { name: 'Feb', stock: 3000 },
          { name: 'Mar', stock: 2000 },
          { name: 'Apr', stock: 2780 },
          { name: 'May', stock: 1890 },
          { name: 'Jun', stock: 2390 },
          { name: 'Jul', stock: 3490 },
        ];
        
        try {
          // Attempt real fetch
          const realStats = await dashboardService.getStats();
          const realTrend = await dashboardService.getInventoryTrend();
          setStats(realStats);
          setTrendData(realTrend);
        } catch (e) {
          // Use mock if fails
          setStats(mockStats);
          setTrendData(mockTrendData);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) return <div>Loading dashboard...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Overview of your inventory and operations.</p>
      </div>
      
      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <KpiCard title="Total Products" value={stats.totalProducts} icon={Package} color="text-blue-500" />
        <KpiCard title="Low Stock" value={stats.lowStockItems} icon={AlertTriangle} color="text-amber-500" />
        <KpiCard title="Out of Stock" value={stats.outOfStockItems} icon={AlertTriangle} color="text-red-500" />
        <KpiCard title="Pending Receipts" value={stats.pendingReceipts} icon={Truck} color="text-green-500" />
        <KpiCard title="Pending Deliveries" value={stats.pendingDeliveries} icon={Truck} color="text-purple-500" />
        <KpiCard title="Internal Transfers" value={stats.internalTransfers} icon={ArrowRightLeft} color="text-gray-500" />
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm col-span-4 p-6 hidden sm:block">
          <div className="space-y-1 mb-4">
            <h3 className="font-semibold leading-none tracking-tight">Inventory Trend</h3>
            <p className="text-sm text-muted-foreground">Overall stock levels over time</p>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: 'hsl(var(--background))', borderColor: 'hsl(var(--border))', borderRadius: '0.5rem' }}
                />
                <Line type="monotone" dataKey="stock" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4, fill: "hsl(var(--primary))" }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm col-span-3 p-6 hidden sm:block">
          <div className="space-y-1 mb-4">
            <h3 className="font-semibold leading-none tracking-tight">Product Movement</h3>
            <p className="text-sm text-muted-foreground">In vs out last 7 days</p>
          </div>
          <div className="h-[300px] w-full items-center justify-center flex text-muted-foreground">
            {/* Additional chart can be added here */}
            Select a product to view specific movements.
          </div>
        </div>
      </div>
    </div>
  );
}

function KpiCard({ title, value, icon: Icon, color }) {
  return (
    <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 flex flex-col items-center text-center sm:items-start sm:text-left hover:border-primary/50 transition-colors">
      <div className="flex w-full items-center justify-between space-y-0 pb-2">
        <h3 className="tracking-tight text-sm font-medium">{title}</h3>
        <Icon className={`h-4 w-4 ${color}`} />
      </div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  );
}
