import api from './axios-instance';
import { ApiResponse, PageResponse, PaginationParams } from '@/types/common';
import { SaleOrder, OrderStatus, Invoice } from '@/types/order';

export interface OrderQueryParams extends PaginationParams {
  status?: OrderStatus;
  tableId?: number;
}

export const orderApi = {
  getAll: async (params?: OrderQueryParams): Promise<PageResponse<SaleOrder>> => {
    const res = await api.get<ApiResponse<PageResponse<SaleOrder>>>('/orders', { params });
    return res.data.data;
  },
  getById: async (id: number): Promise<SaleOrder> => {
    const res = await api.get<ApiResponse<SaleOrder>>(`/orders/${id}`);
    return res.data.data;
  },
  create: async (payload: any): Promise<SaleOrder> => {
    const res = await api.post<ApiResponse<SaleOrder>>('/orders', payload);
    return res.data.data;
  },
  update: async (id: number, payload: any): Promise<SaleOrder> => {
    const res = await api.put<ApiResponse<SaleOrder>>(`/orders/${id}`, payload);
    return res.data.data;
  },
  addItems: async (id: number, items: { menuId: number; qty: number; note?: string }[]): Promise<SaleOrder> => {
    const res = await api.post<ApiResponse<SaleOrder>>(`/orders/${id}/add-items`, { items });
    return res.data.data;
  },
  complete: async (id: number): Promise<SaleOrder> => {
    const res = await api.post<ApiResponse<SaleOrder>>(`/orders/${id}/complete`);
    return res.data.data;
  },
  pay: async (id: number): Promise<SaleOrder> => {
    const res = await api.post<ApiResponse<SaleOrder>>(`/orders/${id}/pay`);
    return res.data.data;
  },
  cancel: async (id: number): Promise<SaleOrder> => {
    const res = await api.post<ApiResponse<SaleOrder>>(`/orders/${id}/cancel`);
    return res.data.data;
  },
  delete: async (id: number): Promise<void> => {
    await api.delete(`/orders/${id}`);
  },
  getInvoice: async (id: number): Promise<Invoice> => {
    const res = await api.get<ApiResponse<Invoice>>(`/orders/${id}/invoice`);
    return res.data.data;
  },
  updateItemStatus: async (orderId: number, itemId: number, status: string): Promise<any> => {
    const res = await api.put<ApiResponse<any>>(`/orders/${orderId}/items/${itemId}/status`, { status });
    return res.data.data;
  },
  updateAllTicketStatus: async (orderId: number, status: string): Promise<any> => {
    const res = await api.put<ApiResponse<any>>(`/orders/${orderId}/items/status`, { status });
    return res.data.data;
  },
};
