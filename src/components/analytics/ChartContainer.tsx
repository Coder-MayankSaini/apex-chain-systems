import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle } from 'lucide-react';

interface ChartContainerProps {
  children?: React.ReactNode;
  isLoading?: boolean;
  error?: string;
}

const ChartContainer: React.FC<ChartContainerProps> = ({ children, isLoading, error }) => {
  if (isLoading) {
    return (
      <div className="w-full h-[400px] flex items-center justify-center">
        <div className="w-full h-full space-y-4">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-[320px] w-full" />
          <div className="flex gap-4 justify-center">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-[400px] flex flex-col items-center justify-center text-muted-foreground">
        <AlertCircle className="h-12 w-12 mb-4" />
        <p className="text-lg font-semibold">Unable to load chart data</p>
        <p className="text-sm mt-2">{error}</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {children}
    </div>
  );
};

export default ChartContainer;
