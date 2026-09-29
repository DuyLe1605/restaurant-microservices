import api from './axios-instance';
import { ApiResponse, PageResponse, PaginationParams } from '@/types/common';
import { Expense } from '@/types/expense';

export interface ExpenseQueryParams extends PaginationParams {
  start?: string;
  end?: string;
}

export const expenseApi = {
  getAll: async (params?: ExpenseQueryParams): Promise<PageResponse<Expense>> => {
    const res = await api.get<ApiResponse<PageResponse<Expense>>>('/expenses', { params });
    return res.data.data;
  },
  getById: async (id: number): Promise<Expense> => {
    const res = await api.get<ApiResponse<Expense>>(`/expenses/${id}`);
    return res.data.data;
  },
  create: async (payload: Partial<Expense>): Promise<Expense> => {
    const res = await api.post<ApiResponse<Expense>>('/expenses', payload);
    return res.data.data;
  },
  update: async (id: number, payload: Partial<Expense>): Promise<Expense> => {
    const res = await api.put<ApiResponse<Expense>>(`/expenses/${id}`, payload);
    return res.data.data;
  },
  delete: async (id: number): Promise<void> => {
    await api.delete(`/expenses/${id}`);
  },
};
