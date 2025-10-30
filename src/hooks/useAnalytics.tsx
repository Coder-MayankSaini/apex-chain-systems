import { useQuery } from '@tanstack/react-query';
import { generateMockData } from '@/lib/analytics-utils';

type DataType = 'overview' | 'sales' | 'products' | 'shipments' | 'regions';

interface AnalyticsData {
  overview: {
    totalRevenue: number;
    totalOrders: number;
    totalProducts: number;
    avgOrderValue: number;
    deliveryRate: number;
    growthRate: number;
  };
  sales: Array<{ date: string; revenue: number; orders: number }>;
  products: Array<{ category: string; quantity: number; revenue: number }>;
  shipments: Array<{ status: string; count: number; percentage: number }>;
  regions: Array<{ region: string; orders: number; revenue: number }>;
}

export const useAnalytics = (dataType: DataType, timeRange: string) => {
  return useQuery({
    queryKey: ['analytics', dataType, timeRange],
    queryFn: async () => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Generate mock data based on time range
      const mockData = generateMockData(timeRange);
      
      // Return the specific data type requested
      return {
        [dataType]: mockData[dataType]
      };
    },
    staleTime: 15 * 60 * 1000, // 15 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes (formerly cacheTime)
    refetchOnWindowFocus: false,
    retry: 2,
  });
};

// Export type for use in components
export type { AnalyticsData };
