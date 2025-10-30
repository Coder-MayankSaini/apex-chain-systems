import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useAnalytics } from '@/hooks/useAnalytics';
import ChartContainer from './ChartContainer';
import { formatCurrency } from '@/lib/analytics-utils';

interface SalesLineChartProps {
  timeRange: string;
}

const SalesLineChart: React.FC<SalesLineChartProps> = ({ timeRange }) => {
  const { data, isLoading, error } = useAnalytics('sales', timeRange);

  if (isLoading) return <ChartContainer isLoading />;
  if (error || !data?.sales) return <ChartContainer error="Failed to load sales data" />;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg">
          <p className="font-semibold mb-2">{label}</p>
          <p className="text-sm text-green-600">
            Revenue: {formatCurrency(payload[0].value)}
          </p>
          <p className="text-sm text-blue-600">
            Orders: {payload[1].value}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <ChartContainer>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart
          data={data.sales}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis 
            dataKey="date" 
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
          />
          <YAxis 
            yAxisId="left" 
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
          />
          <YAxis 
            yAxisId="right" 
            orientation="right" 
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            wrapperStyle={{ paddingTop: '20px' }}
            iconType="line"
          />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="revenue"
            stroke="hsl(var(--f1-flag-green))"
            strokeWidth={2}
            dot={{ fill: 'hsl(var(--f1-flag-green))', r: 4 }}
            activeDot={{ r: 6 }}
            name="Revenue ($)"
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="orders"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            dot={{ fill: 'hsl(var(--primary))', r: 4 }}
            activeDot={{ r: 6 }}
            name="Orders"
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};

export default SalesLineChart;
