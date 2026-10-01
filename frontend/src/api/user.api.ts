import api from './axios-instance';
import { ApiResponse, PageResponse, PaginationParams } from '@/types/common';
import { User, Role } from '@/types/auth';

export interface UserQueryParams extends PaginationParams {
  role?: Role;
  active?: boolean;
}

export const userApi = {
  getAll: async (params?: UserQueryParams): Promise<PageResponse<User>> => {
    const res = await api.get<ApiResponse<PageResponse<User>>>('/users', { params });
    return res.data.data;
  },
  getById: async (id: number): Promise<User> => {
    const res = await api.get<ApiResponse<User>>(`/users/${id}`);
    return res.data.data;
  },
  create: async (payload: any): Promise<User> => {
    const res = await api.post<ApiResponse<User>>('/users', payload);
    return res.data.data;
  },
  update: async (id: number, payload: any): Promise<User> => {
    const res = await api.put<ApiResponse<User>>(`/users/${id}`, payload);
    return res.data.data;
  },
  changePassword: async (id: number, payload: any): Promise<void> => {
    await api.put(`/users/${id}/change-password`, payload);
  },
  delete: async (id: number): Promise<void> => {
    await api.delete(`/users/${id}`);
  },
  countActive: async (): Promise<number> => {
    const res = await api.get<ApiResponse<number>>('/users/count');
    return res.data.data;
  },
};
