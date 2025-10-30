import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend } from 'recharts';
import { useAnalytics } from '@/hooks/useAnalytics';
import ChartContainer from './ChartContainer';
import { formatCurrency } from '@/lib/analytics-utils';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { MapPin, DollarSign, Package } from 'lucide-react';

interface RegionalHeatmapProps {
  timeRange: string;
}

const RegionalHeatmap: React.FC<RegionalHeatmapProps> = ({ timeRange }) => {
  const { data, isLoading, error } = useAnalytics('regions', timeRange);
  const [metric, setMetric] = useState<'orders' | 'revenue'>('orders');

  if (isLoading) return <ChartContainer isLoading />;
  if (error || !data?.regions) return <ChartContainer error="Failed to load regional data" />;
  
  // Ensure regions data is valid
  if (!Array.isArray(data.regions) || data.regions.length === 0) {
    return <ChartContainer error="No regional data available" />;
  }

  // Ensure data has the correct structure
  const formattedRegions = data.regions.map((region: any) => ({
    region: region.region || 'Unknown',
    orders: region.orders || 0,
    revenue: region.revenue || 0
  }));

  // Calculate intensity for heatmap colors
  const maxValue = Math.max(...formattedRegions.map((r: any) => r[metric] || 0));
  const getColor = (value: number) => {
    const intensity = value / maxValue;
    if (intensity > 0.75) return 'hsl(0, 100%, 50%)'; // Red
    if (intensity > 0.5) return 'hsl(45, 100%, 50%)'; // Yellow  
    if (intensity > 0.25) return 'hsl(160, 100%, 41%)'; // Green
    return 'hsl(240, 10%, 16%)'; // Muted
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg">
          <p className="font-semibold mb-2 flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            {label}
          </p>
          <div className="space-y-1">
            <p className="text-sm flex items-center gap-2">
              <Package className="h-3 w-3" />
              Orders: {data.orders.toLocaleString()}
            </p>
            <p className="text-sm flex items-center gap-2">
              <DollarSign className="h-3 w-3" />
              Revenue: {formatCurrency(data.revenue)}
            </p>
          </div>
        </div>
      );
    }
    return null;
  };


  // Sort regions by selected metric
  const sortedRegions = [...formattedRegions].sort((a, b) => b[metric] - a[metric]);

  // Regional performance indicators
  const topRegion = sortedRegions[0];
  const totalValue = sortedRegions.reduce((sum, r) => sum + r[metric], 0);

  return (
    <ChartContainer>
      <div className="flex justify-between items-center mb-6">
        <div>
          <p className="text-sm text-muted-foreground">Top Region</p>
          <p className="text-lg font-bold">{topRegion.region}</p>
          <p className="text-sm text-muted-foreground">
            {metric === 'orders' 
              ? `${topRegion.orders.toLocaleString()} orders` 
              : formatCurrency(topRegion.revenue)
            }
          </p>
        </div>
        <ToggleGroup type="single" value={metric} onValueChange={(v) => v && setMetric(v as 'orders' | 'revenue')}>
          <ToggleGroupItem value="orders" aria-label="Show orders">
            <Package className="h-4 w-4 mr-2" />
            Orders
          </ToggleGroupItem>
          <ToggleGroupItem value="revenue" aria-label="Show revenue">
            <DollarSign className="h-4 w-4 mr-2" />
            Revenue
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          data={sortedRegions}
          margin={{ top: 20, right: 30, left: 40, bottom: 60 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis 
            dataKey="region"
            stroke="#888"
            fontSize={11}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis 
            stroke="#888"
            fontSize={12}
            tickFormatter={metric === 'revenue' 
              ? (value) => `$${(value / 1000000).toFixed(1)}M`
              : (value) => value.toLocaleString()
            }
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar 
            dataKey={metric}
            radius={[8, 8, 0, 0]}
          >
            {sortedRegions.map((entry: any, index: number) => (
              <Cell key={`cell-${index}`} fill={getColor(entry[metric])} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Heatmap Legend */}
      <div className="flex justify-center items-center gap-4 mt-6">
        <span className="text-sm text-muted-foreground">Performance:</span>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: 'hsl(240, 10%, 16%)' }} />
          <span className="text-xs">Low</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: 'hsl(160, 100%, 41%)' }} />
          <span className="text-xs">Medium</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: 'hsl(45, 100%, 50%)' }} />
          <span className="text-xs">High</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: 'hsl(0, 100%, 50%)' }} />
          <span className="text-xs">Top</span>
        </div>
      </div>
    </ChartContainer>
  );
};

export default RegionalHeatmap;
