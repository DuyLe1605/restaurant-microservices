import api from './axios-instance';
import { ApiResponse, PageResponse, PaginationParams } from '@/types/common';
import { Ingredient, IngredientCategory, IngredientStock } from '@/types/ingredient';

export interface IngredientQueryParams extends PaginationParams {
  category?: string;
}

export const ingredientApi = {
  getAll: async (params?: IngredientQueryParams): Promise<PageResponse<Ingredient>> => {
    const res = await api.get<ApiResponse<PageResponse<Ingredient>>>('/ingredients', { params });
    return res.data.data;
  },
  getById: async (id: number): Promise<Ingredient> => {
    const res = await api.get<ApiResponse<Ingredient>>(`/ingredients/${id}`);
    return res.data.data;
  },
  getStock: async (id: number): Promise<IngredientStock> => {
    const res = await api.get<ApiResponse<IngredientStock>>(`/ingredients/${id}/stock`);
    return res.data.data;
  },
  getLowStock: async (): Promise<Ingredient[]> => {
    const res = await api.get<ApiResponse<Ingredient[]>>('/ingredients/low-stock');
    return res.data.data;
  },
  create: async (payload: Partial<Ingredient>): Promise<Ingredient> => {
    const res = await api.post<ApiResponse<Ingredient>>('/ingredients', payload);
    return res.data.data;
  },
  update: async (id: number, payload: Partial<Ingredient>): Promise<Ingredient> => {
    const res = await api.put<ApiResponse<Ingredient>>(`/ingredients/${id}`, payload);
    return res.data.data;
  },
  delete: async (id: number): Promise<void> => {
    await api.delete(`/ingredients/${id}`);
  },
  // Categories
  getCategories: async (): Promise<IngredientCategory[]> => {
    const res = await api.get<ApiResponse<IngredientCategory[]>>('/ingredient-categories');
    return res.data.data;
  },
  createCategory: async (payload: Partial<IngredientCategory>): Promise<IngredientCategory> => {
    const res = await api.post<ApiResponse<IngredientCategory>>('/ingredient-categories', payload);
    return res.data.data;
  },
  updateCategory: async (id: number, payload: Partial<IngredientCategory>): Promise<IngredientCategory> => {
    const res = await api.put<ApiResponse<IngredientCategory>>(`/ingredient-categories/${id}`, payload);
    return res.data.data;
  },
  deleteCategory: async (id: number): Promise<void> => {
    await api.delete(`/ingredient-categories/${id}`);
  },
};
