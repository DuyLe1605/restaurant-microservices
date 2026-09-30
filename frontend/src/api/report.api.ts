import api from './axios-instance';
import { ApiResponse } from '@/types/common';
import { DashboardMetrics, RevenueReport, StockAlert, OrderSummary } from '@/types/report';

export const reportApi = {
  getDashboard: async (): Promise<DashboardMetrics> => {
    const res = await api.get<ApiResponse<DashboardMetrics>>('/dashboard');
    return res.data.data;
  },
  getRevenue: async (start?: string, end?: string): Promise<RevenueReport> => {
    const res = await api.get<ApiResponse<RevenueReport>>('/reports/revenue', { params: { start, end } });
    return res.data.data;
  },
  getRevenueByDay: async (day: string): Promise<OrderSummary[]> => {
    const res = await api.get<ApiResponse<OrderSummary[]>>(`/reports/revenue/${day}`);
    return res.data.data;
  },
  getStockReport: async (): Promise<StockAlert[]> => {
    const res = await api.get<ApiResponse<StockAlert[]>>('/reports/stock');
    return res.data.data;
  },
};
