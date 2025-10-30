import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Package, ShoppingCart, TrendingUp, Truck, CheckCircle } from 'lucide-react';
import { useAnalytics } from '@/hooks/useAnalytics';
import { Skeleton } from '@/components/ui/skeleton';

interface OverviewCardsProps {
  timeRange: string;
}

const OverviewCards: React.FC<OverviewCardsProps> = ({ timeRange }) => {
  const { data, isLoading, error } = useAnalytics('overview', timeRange);

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-32 mb-1" />
              <Skeleton className="h-3 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error || !data?.overview) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Failed to load analytics data</p>
      </div>
    );
  }

  const metrics = [
    {
      title: "Total Revenue",
      value: `$${data.overview.totalRevenue.toLocaleString()}`,
      change: "+12.5%",
      icon: DollarSign,
      color: "text-green-600"
    },
    {
      title: "Total Orders",
      value: data.overview.totalOrders.toLocaleString(),
      change: "+8.2%",
      icon: ShoppingCart,
      color: "text-blue-600"
    },
    {
      title: "Products Tracked",
      value: data.overview.totalProducts.toLocaleString(),
      change: "+15.3%",
      icon: Package,
      color: "text-purple-600"
    },
    {
      title: "Avg Order Value",
      value: `$${data.overview.avgOrderValue.toFixed(2)}`,
      change: "+3.7%",
      icon: TrendingUp,
      color: "text-orange-600"
    },
    {
      title: "Delivery Rate",
      value: `${data.overview.deliveryRate}%`,
      change: "+2.1%",
      icon: Truck,
      color: "text-cyan-600"
    },
    {
      title: "Growth Rate",
      value: `${data.overview.growthRate}%`,
      change: `+${data.overview.growthRate}%`,
      icon: CheckCircle,
      color: "text-f1-flag-green"
    }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {metrics.map((metric, index) => {
        const Icon = metric.icon;
        return (
          <Card key={index} className="hover:shadow-lg transition-shadow duration-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
              <Icon className={`h-4 w-4 ${metric.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-mono">{metric.value}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-f1-flag-green font-semibold">{metric.change}</span> from last period
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default OverviewCards;
