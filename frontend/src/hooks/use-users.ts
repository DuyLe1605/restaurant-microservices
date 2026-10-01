import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userApi, UserQueryParams } from '@/api/user.api';
import { toast } from 'sonner';

export const useUsers = (params?: UserQueryParams) => {
  return useQuery({
    queryKey: ['users', params],
    queryFn: () => userApi.getAll(params),
  });
};

export const useCreateUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: userApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] });
      toast.success('Tạo người dùng thành công');
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Lỗi khi tạo người dùng'),
  });
};

export const useUpdateUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: any }) => userApi.update(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] });
      toast.success('Cập nhật người dùng thành công');
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Lỗi cập nhật'),
  });
};

export const useChangePassword = () => {
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: any }) => userApi.changePassword(id, payload),
    onSuccess: () => {
      toast.success('Đổi mật khẩu thành công');
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Lỗi đổi mật khẩu'),
  });
};

export const useDeleteUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: userApi.delete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] });
      toast.success('Xóa người dùng thành công');
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Lỗi xóa người dùng'),
  });
};
