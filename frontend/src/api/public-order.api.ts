import api from './axios-instance';
import { ApiResponse } from '@/types/common';
import { SaleOrder } from '@/types/order';

export interface PublicTableSession {
  tableId: number;
  tableNumber: string;
  capacity: number;
  tableStatus: string;
  activeOrder?: SaleOrder;
}

export const publicOrderApi = {
  startSession: async (token: string): Promise<PublicTableSession> => {
    const res = await api.get<ApiResponse<PublicTableSession>>('/public-order/start', { params: { token } });
    return res.data.data;
  },
  submitOrder: async (payload: any): Promise<SaleOrder> => {
    const res = await api.post<ApiResponse<SaleOrder>>('/public-order/submit', payload);
    return res.data.data;
  },
};
