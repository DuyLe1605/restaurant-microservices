import api from './axios-instance';
import { ApiResponse } from '@/types/common';
import { AuthResponse, LoginPayload, RegisterPayload, User } from '@/types/auth';

export const authApi = {
  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    const res = await api.post<ApiResponse<AuthResponse>>('/auth/login', payload);
    return res.data.data;
  },
  register: async (payload: RegisterPayload): Promise<User> => {
    const res = await api.post<ApiResponse<User>>('/auth/register', payload);
    return res.data.data;
  },
  verify: async (): Promise<User> => {
    const res = await api.get<ApiResponse<User>>('/auth/verify');
    return res.data.data;
  },
  refresh: async (refreshToken: string): Promise<AuthResponse> => {
    const res = await api.post<ApiResponse<AuthResponse>>('/auth/refresh', { refreshToken });
    return res.data.data;
  },
  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
  },
};
