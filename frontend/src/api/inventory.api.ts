import api from './axios-instance';
import { ApiResponse, PageResponse, PaginationParams } from '@/types/common';
import { InventoryReceipt, InventoryIssue, StockAdjustment, ReceiptStatus } from '@/types/inventory';

export interface ReceiptQueryParams extends PaginationParams {
  status?: ReceiptStatus;
}

export const inventoryApi = {
  // Receipts
  getReceipts: async (params?: ReceiptQueryParams): Promise<PageResponse<InventoryReceipt>> => {
    const res = await api.get<ApiResponse<PageResponse<InventoryReceipt>>>('/inventory/receipts', { params });
    return res.data.data;
  },
  getReceiptById: async (id: number): Promise<InventoryReceipt> => {
    const res = await api.get<ApiResponse<InventoryReceipt>>(`/inventory/receipts/${id}`);
    return res.data.data;
  },
  createReceipt: async (payload: any): Promise<InventoryReceipt> => {
    const res = await api.post<ApiResponse<InventoryReceipt>>('/inventory/receipts', payload);
    return res.data.data;
  },
  updateReceipt: async (id: number, payload: any): Promise<InventoryReceipt> => {
    const res = await api.put<ApiResponse<InventoryReceipt>>(`/inventory/receipts/${id}`, payload);
    return res.data.data;
  },
  deleteReceipt: async (id: number): Promise<void> => {
    await api.delete(`/inventory/receipts/${id}`);
  },
  completeReceipt: async (id: number): Promise<InventoryReceipt> => {
    const res = await api.post<ApiResponse<InventoryReceipt>>(`/inventory/receipts/${id}/complete`);
    return res.data.data;
  },
  // Issues
  getIssues: async (params?: PaginationParams): Promise<PageResponse<InventoryIssue>> => {
    const res = await api.get<ApiResponse<PageResponse<InventoryIssue>>>('/inventory/issues', { params });
    return res.data.data;
  },
  getIssueById: async (id: number): Promise<InventoryIssue> => {
    const res = await api.get<ApiResponse<InventoryIssue>>(`/inventory/issues/${id}`);
    return res.data.data;
  },
  createManualIssue: async (payload: any): Promise<InventoryIssue> => {
    const res = await api.post<ApiResponse<InventoryIssue>>('/inventory/issues', payload);
    return res.data.data;
  },
  // Stock Adjustments
  adjustStock: async (payload: any): Promise<StockAdjustment> => {
    const res = await api.post<ApiResponse<StockAdjustment>>('/inventory/adjustments', payload);
    return res.data.data;
  },
  getAdjustments: async (ingredientId: number): Promise<StockAdjustment[]> => {
    const res = await api.get<ApiResponse<StockAdjustment[]>>(`/inventory/adjustments/ingredient/${ingredientId}`);
    return res.data.data;
  },
};
