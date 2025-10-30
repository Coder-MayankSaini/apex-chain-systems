import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { useAnalytics } from '@/hooks/useAnalytics';
import ChartContainer from './ChartContainer';
import { formatCurrency } from '@/lib/analytics-utils';
import { Button } from '@/components/ui/button';

interface ProductsBarChartProps {
  timeRange: string;
}

const ProductsBarChart: React.FC<ProductsBarChartProps> = ({ timeRange }) => {
  const { data, isLoading, error } = useAnalytics('products', timeRange);
  const [showRevenue, setShowRevenue] = useState(false);

  if (isLoading) return <ChartContainer isLoading />;
  if (error || !data?.products) return <ChartContainer error="Failed to load product data" />;

  // F1-themed colors for different categories
  const COLORS = {
    'Engines': 'hsl(var(--f1-flag-red))',
    'Aerodynamics': 'hsl(var(--f1-flag-green))',
    'Electronics': 'hsl(var(--primary))',
    'Tires': 'hsl(var(--f1-flag-yellow))',
    'Chassis': '#FF8C00',
    'Safety': '#8B008B',
    'Other': '#708090'
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg">
          <p className="font-semibold mb-2">{label}</p>
          <p className="text-sm">
            Quantity: {payload[0].payload.quantity.toLocaleString()} units
          </p>
          <p className="text-sm">
            Revenue: {formatCurrency(payload[0].payload.revenue)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <ChartContainer>
      <div className="flex justify-end mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowRevenue(!showRevenue)}
        >
          Show {showRevenue ? 'Quantity' : 'Revenue'}
        </Button>
      </div>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          data={data.products}
          margin={{ top: 5, right: 30, left: 20, bottom: 60 }}
        >
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis 
            dataKey="category" 
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            angle={-45}
            textAnchor="end"
            height={100}
          />
          <YAxis 
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tickFormatter={showRevenue ? 
              (value) => `$${(value / 1000).toFixed(0)}k` : 
              (value) => value.toLocaleString()
            }
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            wrapperStyle={{ paddingTop: '20px' }}
          />
          <Bar 
            dataKey={showRevenue ? 'revenue' : 'quantity'} 
            name={showRevenue ? 'Revenue ($)' : 'Quantity'}
            radius={[8, 8, 0, 0]}
          >
            {data.products.map((entry: any, index: number) => (
              <Cell 
                key={`cell-${index}`} 
                fill={COLORS[entry.category as keyof typeof COLORS] || COLORS.Other} 
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};

export default ProductsBarChart;
