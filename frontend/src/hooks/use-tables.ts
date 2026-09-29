export const useTransferTable = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ sourceId, targetTableId, reason }: { sourceId: number; targetTableId: number; reason?: string }) =>
      tableApi.transferTable(sourceId, targetTableId, reason),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['tables'] });
      qc.invalidateQueries({ queryKey: ['orders'] });
      toast.success(data?.message || 'Chuyển bàn và chuyển toàn bộ đơn hàng thành công!');
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Lỗi khi chuyển bàn'),
  });
};

export const useMergeTables = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ primaryId, mergedTableIds }: { primaryId: number; mergedTableIds: number[] }) =>
      tableApi.mergeTables(primaryId, mergedTableIds),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tables'] });
      qc.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Ghép bàn và gộp toàn bộ đơn hàng thành công!');
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Lỗi khi ghép bàn'),
  });
};

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tableApi } from '@/api/table.api';
import { RestaurantTable, TableStatus } from '@/types/table';
import { toast } from 'sonner';

export const useTables = () => {
  return useQuery({
    queryKey: ['tables'],
    queryFn: async () => {
      const data = await tableApi.getAll();
      return data ?? [];
    },
  });
};

export const useCreateTable = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<RestaurantTable>) => tableApi.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tables'] });
      toast.success('Tạo bàn mới thành công');
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Lỗi tạo bàn'),
  });
};

export const useUpdateTableStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: TableStatus }) => tableApi.updateStatus(id, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tables'] });
      toast.success('Cập nhật trạng thái bàn thành công');
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Lỗi cập nhật'),
  });
};

export const useDeleteTable = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => tableApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tables'] });
      toast.success('Xóa bàn thành công');
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Lỗi xóa bàn'),
  });
};

export const useGenerateQr = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (tableId: number) => tableApi.generateQr(tableId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tables'] });
      toast.success('Sinh mã QR bàn thành công');
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Lỗi sinh mã QR'),
  });
};

export const useClearQr = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (tableId: number) => tableApi.clearQr(tableId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tables'] });
      toast.success('Xóa mã QR bàn thành công');
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Lỗi xóa mã QR'),
  });
};
