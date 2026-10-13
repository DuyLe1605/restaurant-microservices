import api from './axios-instance';
import { ApiResponse, PageResponse, PaginationParams } from '@/types/common';

export type CustomerTier = 'BRONZE' | 'SILVER' | 'GOLD' | 'DIAMOND';

export interface Customer {
  id: number;
  name: string;
  phone: string;
  email?: string;
  tier: CustomerTier;
  tierLabel: string;
  discountPercent: number;
  pointMultiplier: number;
  points: number;
  pointsValue: number;
  totalSpent: number;
  currentMonthSpent: number;
  nextTierTarget?: number;
  nextTierLabel?: string;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerQueryParams extends PaginationParams {
  keyword?: string;
}

export interface CustomerRegisterRequest {
  name: string;
  phone: string;
  email?: string;
  note?: string;
}

export const customerApi = {
  getAll: async (params?: CustomerQueryParams): Promise<PageResponse<Customer>> => {
    const res = await api.get<ApiResponse<PageResponse<Customer>>>('/customers', { params });
    return res.data.data;
  },

  getById: async (id: number): Promise<Customer> => {
    const res = await api.get<ApiResponse<Customer>>(`/customers/${id}`);
    return res.data.data;
  },

  lookupByPhone: async (phone: string): Promise<Customer> => {
    const res = await api.get<ApiResponse<Customer>>('/customers/lookup', {
      params: { phone: phone.trim() },
    });
    return res.data.data;
  },

  registerOrGet: async (payload: CustomerRegisterRequest): Promise<Customer> => {
    const res = await api.post<ApiResponse<Customer>>('/customers', payload);
    return res.data.data;
  },

  update: async (id: number, payload: Partial<CustomerRegisterRequest>): Promise<Customer> => {
    const res = await api.put<ApiResponse<Customer>>(`/customers/${id}`, payload);
    return res.data.data;
  },
};
