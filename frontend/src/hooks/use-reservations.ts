import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tableApi } from '@/api/table.api';
import { toast } from 'sonner';

export const useReservations = (tableId?: number) => {
  return useQuery({
    queryKey: ['reservations', tableId],
    queryFn: () => tableApi.getReservations(tableId),
  });
};

export const useCreateReservation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: tableApi.createReservation,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['reservations'] });
      qc.invalidateQueries({ queryKey: ['tables'] });
      toast.success('Đặt bàn thành công');
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Lỗi đặt bàn hoặc trùng lịch'),
  });
};

export const useDeleteReservation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: tableApi.deleteReservation,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['reservations'] });
      toast.success('Hủy lịch đặt bàn thành công');
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Lỗi hủy lịch đặt bàn'),
  });
};
