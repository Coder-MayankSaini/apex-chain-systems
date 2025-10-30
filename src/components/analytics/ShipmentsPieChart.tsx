import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useAnalytics } from '@/hooks/useAnalytics';
import ChartContainer from './ChartContainer';
import { Package2, Truck, Clock, CheckCircle } from 'lucide-react';

interface ShipmentsPieChartProps {
  timeRange: string;
}

const ShipmentsPieChart: React.FC<ShipmentsPieChartProps> = ({ timeRange }) => {
  const { data, isLoading, error } = useAnalytics('shipments', timeRange);

  if (isLoading) return <ChartContainer isLoading />;
  if (error || !data?.shipments) return <ChartContainer error="Failed to load shipment data" />;
  
  // Ensure shipments data is valid
  if (!Array.isArray(data.shipments) || data.shipments.length === 0) {
    return <ChartContainer error="No shipment data available" />;
  }

  // Format data to ensure proper structure
  const formattedShipments = data.shipments.map((item: any) => ({
    status: item.status || 'Unknown',
    count: item.count || 0,
    percentage: item.percentage || 0
  }));

  // F1-themed colors for shipment statuses
  const COLORS = {
    'Delivered': 'hsl(160, 100%, 41%)', // Green
    'In Transit': 'hsl(0, 96%, 44%)', // Primary red
    'Processing': 'hsl(45, 100%, 50%)', // Yellow
    'Pending': 'hsl(0, 0%, 60%)' // Muted foreground
  };

  const ICONS = {
    'Delivered': CheckCircle,
    'In Transit': Truck,
    'Processing': Clock,
    'Pending': Package2
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg">
          <p className="font-semibold mb-2">{data.name}</p>
          <p className="text-sm">Count: {data.value?.toLocaleString() || 0}</p>
          <p className="text-sm">Percentage: {data.payload?.percentage || 0}%</p>
        </div>
      );
    }
    return null;
  };

  const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    if (!percent || percent === 0) return null;
    
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        className="font-bold text-sm"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  // Custom legend with icons
  const renderCustomLegend = (props: any) => {
    const { payload } = props;
    if (!payload || payload.length === 0) return null;
    
    return (
      <div className="grid grid-cols-2 gap-4 mt-6">
        {payload.map((entry: any, index: number) => {
          const Icon = ICONS[entry.value as keyof typeof ICONS];
          if (!Icon) return null;
          
          return (
            <div key={`item-${index}`} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: entry.color }}
              />
              <Icon className="h-4 w-4" />
              <span className="text-sm">{entry.value}</span>
              <span className="text-sm text-muted-foreground ml-auto">
                ({entry.payload?.percentage || 0}%)
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  const totalShipments = formattedShipments.reduce((sum: number, item: any) => sum + item.count, 0);

  return (
    <ChartContainer>
      <div className="text-center mb-4">
        <h3 className="text-2xl font-bold font-mono">{totalShipments.toLocaleString()}</h3>
        <p className="text-sm text-muted-foreground">Total Shipments</p>
      </div>
      <ResponsiveContainer width="100%" height={350}>
        <PieChart>
          <Pie
            data={formattedShipments}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={CustomLabel}
            outerRadius={120}
            fill="#8884d8"
            dataKey="count"
            nameKey="status"
          >
            {formattedShipments.map((entry: any, index: number) => (
              <Cell 
                key={`cell-${index}`} 
                fill={COLORS[entry.status as keyof typeof COLORS] || 'hsl(0, 0%, 50%)'} 
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend content={renderCustomLegend} />
        </PieChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};

export default ShipmentsPieChart;
