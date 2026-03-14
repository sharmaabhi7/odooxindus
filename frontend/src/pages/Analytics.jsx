import React from 'react';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';

export default function Analytics() {
  const movementData = [
    { name: 'Mon', in: 120, out: 80 },
    { name: 'Tue', in: 60, out: 95 },
    { name: 'Wed', in: 150, out: 110 },
    { name: 'Thu', in: 80, out: 120 },
    { name: 'Fri', in: 90, out: 140 },
    { name: 'Sat', in: 40, out: 60 },
    { name: 'Sun', in: 30, out: 50 },
  ];

  const warehouseUtilization = [
    { name: 'Main HQ', value: 75 },
    { name: 'East Side', value: 45 },
    { name: 'West Side', value: 90 },
    { name: 'North Dist', value: 30 },
  ];

  const COLORS = ['#7C3AED', '#A78BFA', '#F472B6', '#38BDF8'];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground mt-1">Deep dive into your inventory data.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Movement Chart */}
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
          <div className="space-y-1 mb-6">
            <h3 className="font-semibold leading-none tracking-tight">Weekly Movement</h3>
            <p className="text-sm text-muted-foreground">Stock-in vs Stock-out</p>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={movementData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip cursor={{ fill: 'hsl(var(--muted))' }} contentStyle={{ backgroundColor: 'hsl(var(--background))', borderColor: 'hsl(var(--border))', borderRadius: '0.5rem' }} />
                <Legend />
                <Bar dataKey="in" name="Stock In" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="out" name="Stock Out" fill="hsl(var(--secondary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Utilization Chart */}
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
          <div className="space-y-1 mb-6">
            <h3 className="font-semibold leading-none tracking-tight">Warehouse Utilization</h3>
            <p className="text-sm text-muted-foreground">Ocupation percentage by location</p>
          </div>
          <div className="h-[300px] w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={warehouseUtilization}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {warehouseUtilization.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', borderColor: 'hsl(var(--border))', borderRadius: '0.5rem' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
