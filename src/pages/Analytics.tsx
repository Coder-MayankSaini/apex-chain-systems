import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, TrendingUp, Truck, Globe } from 'lucide-react';
import OverviewCards from '@/components/analytics/OverviewCards';
import SalesLineChart from '@/components/analytics/SalesLineChart';
import ProductsBarChart from '@/components/analytics/ProductsBarChart';
import ShipmentsPieChart from '@/components/analytics/ShipmentsPieChart';
import RegionalHeatmap from '@/components/analytics/RegionalHeatmap';

const Analytics = () => {
  const [timeRange, setTimeRange] = useState('30days');

  return (
    <div className="min-h-screen bg-background">
      {/* F1-themed header */}
      <div className="bg-speed-gradient border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-heading font-bold text-white">Analytics Dashboard</h1>
              <p className="text-gray-200 mt-1">Real-time supply chain performance metrics</p>
            </div>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-40 bg-background/90 backdrop-blur">
                <SelectValue placeholder="Select time range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7days">Last 7 days</SelectItem>
                <SelectItem value="30days">Last 30 days</SelectItem>
                <SelectItem value="90days">Last 90 days</SelectItem>
                <SelectItem value="1year">Last year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Overview KPI Cards */}
        <OverviewCards timeRange={timeRange} />

        {/* Tabbed Analytics Views */}
        <Tabs defaultValue="performance" className="mt-8">
          <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-4">
            <TabsTrigger value="performance" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Performance
            </TabsTrigger>
            <TabsTrigger value="distribution" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Distribution
            </TabsTrigger>
            <TabsTrigger value="logistics" className="flex items-center gap-2">
              <Truck className="h-4 w-4" />
              Logistics
            </TabsTrigger>
            <TabsTrigger value="regional" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Regional
            </TabsTrigger>
          </TabsList>

          <TabsContent value="performance" className="mt-6">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Sales Performance</CardTitle>
                  <CardDescription>Revenue and order trends over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <SalesLineChart timeRange={timeRange} />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="distribution" className="mt-6">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Product Distribution</CardTitle>
                  <CardDescription>Category breakdown and performance</CardDescription>
                </CardHeader>
                <CardContent>
                  <ProductsBarChart timeRange={timeRange} />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="logistics" className="mt-6">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Shipment Status</CardTitle>
                  <CardDescription>Current logistics overview</CardDescription>
                </CardHeader>
                <CardContent>
                  <ShipmentsPieChart timeRange={timeRange} />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="regional" className="mt-6">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Regional Distribution</CardTitle>
                  <CardDescription>Geographic performance analysis</CardDescription>
                </CardHeader>
                <CardContent>
                  <RegionalHeatmap timeRange={timeRange} />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Analytics;
