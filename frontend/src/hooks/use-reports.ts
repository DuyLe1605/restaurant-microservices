import { useQuery } from '@tanstack/react-query';
import { reportApi } from '@/api/report.api';

export const useDashboard = () => {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: reportApi.getDashboard,
    refetchInterval: 30000, // auto refresh every 30s
  });
};

export const useRevenueReport = (start?: string, end?: string) => {
  return useQuery({
    queryKey: ['revenue-report', start, end],
    queryFn: () => reportApi.getRevenue(start, end),
  });
};

export const useDailyOrderDetails = (day: string) => {
  return useQuery({
    queryKey: ['daily-orders', day],
    queryFn: () => reportApi.getRevenueByDay(day),
    enabled: !!day,
  });
};

export const useStockReport = () => {
  return useQuery({
    queryKey: ['stock-report'],
    queryFn: reportApi.getStockReport,
  });
};
