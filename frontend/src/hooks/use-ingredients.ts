import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ingredientApi, IngredientQueryParams } from '@/api/ingredient.api';
import { Ingredient, IngredientCategory } from '@/types/ingredient';
import { toast } from 'sonner';

export const useIngredients = (params?: IngredientQueryParams) => {
  return useQuery({
    queryKey: ['ingredients', params],
    queryFn: () => ingredientApi.getAll(params),
  });
};

export const useIngredientCategories = () => {
  return useQuery({
    queryKey: ['ingredient-categories'],
    queryFn: () => ingredientApi.getCategories(),
  });
};

export const useCreateIngredient = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<Ingredient>) => ingredientApi.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ingredients'] });
      toast.success('Tạo nguyên liệu thành công');
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Lỗi tạo nguyên liệu'),
  });
};

export const useUpdateIngredient = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<Ingredient> }) => ingredientApi.update(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ingredients'] });
      toast.success('Cập nhật nguyên liệu thành công');
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Lỗi cập nhật'),
  });
};

export const useDeleteIngredient = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => ingredientApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ingredients'] });
      toast.success('Xóa nguyên liệu thành công');
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Lỗi xóa nguyên liệu'),
  });
};

export const useCreateCategory = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<IngredientCategory>) => ingredientApi.createCategory(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ingredient-categories'] });
      toast.success('Tạo danh mục thành công');
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Lỗi tạo danh mục'),
  });
};

export const useDeleteCategory = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => ingredientApi.deleteCategory(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ingredient-categories'] });
      toast.success('Xóa danh mục thành công');
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Lỗi xóa danh mục'),
  });
};
