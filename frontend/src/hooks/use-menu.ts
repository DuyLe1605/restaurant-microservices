import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { menuApi, MenuQueryParams } from '@/api/menu.api';
import { MenuItem, RecipeItem } from '@/types/menu';
import { toast } from 'sonner';

export const useMenuItems = (params?: MenuQueryParams) => {
  return useQuery({
    queryKey: ['menu-items', params],
    queryFn: () => menuApi.getAll(params),
  });
};

export const useMenuItem = (id: number) => {
  return useQuery({
    queryKey: ['menu-item', id],
    queryFn: () => menuApi.getById(id),
    enabled: !!id,
  });
};

export const useCreateMenuItem = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<MenuItem>) => menuApi.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['menu-items'] });
      toast.success('Tạo món ăn thành công');
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Lỗi tạo món'),
  });
};

export const useUpdateMenuItem = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<MenuItem> }) => menuApi.update(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['menu-items'] });
      toast.success('Cập nhật món thành công');
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Lỗi cập nhật'),
  });
};

export const useDeleteMenuItem = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => menuApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['menu-items'] });
      toast.success('Xóa món ăn thành công');
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Lỗi xóa món'),
  });
};

export const useRecipes = (menuId: number) => {
  return useQuery({
    queryKey: ['recipes', menuId],
    queryFn: () => menuApi.getRecipes(menuId),
    enabled: !!menuId,
  });
};

export const useSaveRecipe = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ menuId, items }: { menuId: number; items: RecipeItem[] }) => menuApi.saveRecipe(menuId, items),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ['recipes'] });
      toast.success('Lưu công thức món thành công');
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Lỗi lưu công thức'),
  });
};
