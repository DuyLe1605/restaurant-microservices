import api from './axios-instance';
import { ApiResponse, PageResponse, PaginationParams } from '@/types/common';
import { MenuItem, RecipeItem, CheckInventoryResponse } from '@/types/menu';

export interface MenuQueryParams extends PaginationParams {
  category?: string;
  active?: boolean;
}

export const menuApi = {
  getAll: async (params?: MenuQueryParams): Promise<PageResponse<MenuItem>> => {
    const res = await api.get<ApiResponse<PageResponse<MenuItem>>>('/menu', { params });
    return res.data.data;
  },
  getById: async (id: number): Promise<MenuItem> => {
    const res = await api.get<ApiResponse<MenuItem>>(`/menu/${id}`);
    return res.data.data;
  },
  getByCode: async (code: string): Promise<MenuItem> => {
    const res = await api.get<ApiResponse<MenuItem>>(`/menu/code/${code}`);
    return res.data.data;
  },
  create: async (payload: Partial<MenuItem>): Promise<MenuItem> => {
    const res = await api.post<ApiResponse<MenuItem>>('/menu', payload);
    return res.data.data;
  },
  update: async (id: number, payload: Partial<MenuItem>): Promise<MenuItem> => {
    const res = await api.put<ApiResponse<MenuItem>>(`/menu/${id}`, payload);
    return res.data.data;
  },
  delete: async (id: number): Promise<void> => {
    await api.delete(`/menu/${id}`);
  },
  // Recipes
  getRecipes: async (menuId: number): Promise<RecipeItem[]> => {
    const res = await api.get<ApiResponse<RecipeItem[]>>('/recipes', { params: { menuId } });
    return res.data.data;
  },
  saveRecipe: async (menuId: number, items: RecipeItem[]): Promise<RecipeItem[]> => {
    const res = await api.post<ApiResponse<RecipeItem[]>>('/recipes', { menuId, items });
    return res.data.data;
  },
  deleteRecipe: async (id: number): Promise<void> => {
    await api.delete(`/recipes/${id}`);
  },
  checkInventory: async (items: { menuId: number; qty: number }[]): Promise<CheckInventoryResponse> => {
    const res = await api.post<ApiResponse<CheckInventoryResponse>>('/recipes/check-inventory', { items });
    return res.data.data;
  },
};
