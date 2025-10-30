import { format, subDays, startOfDay } from 'date-fns';

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export const generateMockData = (timeRange: string) => {
  // Determine number of days based on time range
  const getDays = () => {
    switch(timeRange) {
      case '7days': return 7;
      case '30days': return 30;
      case '90days': return 90;
      case '1year': return 365;
      default: return 30;
    }
  };

  const days = getDays();
  const today = startOfDay(new Date());

  // Generate sales data
  const sales = Array.from({ length: Math.min(days, 30) }, (_, i) => {
    const date = subDays(today, days - i - 1);
    const baseRevenue = 50000 + Math.random() * 100000;
    const baseOrders = 20 + Math.floor(Math.random() * 50);
    
    // Add some variance for weekends
    const dayOfWeek = date.getDay();
    const weekendMultiplier = (dayOfWeek === 0 || dayOfWeek === 6) ? 1.3 : 1;
    
    return {
      date: format(date, 'MMM dd'),
      revenue: Math.floor(baseRevenue * weekendMultiplier),
      orders: Math.floor(baseOrders * weekendMultiplier)
    };
  });

  // F1-themed product categories
  const products = [
    { category: 'Engines', quantity: 145, revenue: 2850000 },
    { category: 'Aerodynamics', quantity: 312, revenue: 1920000 },
    { category: 'Electronics', quantity: 567, revenue: 1450000 },
    { category: 'Tires', quantity: 2340, revenue: 980000 },
    { category: 'Chassis', quantity: 89, revenue: 3200000 },
    { category: 'Safety', quantity: 456, revenue: 670000 },
  ];

  // Shipment status data
  const shipments = [
    { status: 'Delivered', count: 1245, percentage: 45 },
    { status: 'In Transit', count: 892, percentage: 32 },
    { status: 'Processing', count: 456, percentage: 17 },
    { status: 'Pending', count: 167, percentage: 6 },
  ];

  // F1 circuit locations for regional data
  const regions = [
    { region: 'Monaco', orders: 245, revenue: 4500000 },
    { region: 'Silverstone', orders: 189, revenue: 3200000 },
    { region: 'Monza', orders: 167, revenue: 2900000 },
    { region: 'Spa', orders: 156, revenue: 2700000 },
    { region: 'Suzuka', orders: 134, revenue: 2400000 },
    { region: 'Austin', orders: 123, revenue: 2100000 },
    { region: 'Singapore', orders: 112, revenue: 1900000 },
    { region: 'Barcelona', orders: 98, revenue: 1650000 },
  ];

  // Calculate overview metrics
  const totalRevenue = sales.reduce((sum, day) => sum + day.revenue, 0);
  const totalOrders = sales.reduce((sum, day) => sum + day.orders, 0);
  const totalProducts = products.reduce((sum, cat) => sum + cat.quantity, 0);
  const avgOrderValue = totalRevenue / totalOrders;
  
  // Simulate dynamic rates based on time range
  const growthMultiplier = days <= 7 ? 1.2 : days <= 30 ? 1.15 : days <= 90 ? 1.1 : 1.08;
  const deliveryRate = 92 + Math.random() * 6; // 92-98%
  const growthRate = ((growthMultiplier - 1) * 100);

  const overview = {
    totalRevenue,
    totalOrders,
    totalProducts,
    avgOrderValue,
    deliveryRate: Math.floor(deliveryRate),
    growthRate: Math.floor(growthRate)
  };

  return {
    overview,
    sales,
    products,
    shipments,
    regions
  };
};

// Helper function to calculate percentage changes
export const calculatePercentageChange = (current: number, previous: number): string => {
  if (previous === 0) return '+0%';
  const change = ((current - previous) / previous) * 100;
  const sign = change >= 0 ? '+' : '';
  return `${sign}${change.toFixed(1)}%`;
};

// Helper to format large numbers
export const formatLargeNumber = (num: number): string => {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  } else if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
};
