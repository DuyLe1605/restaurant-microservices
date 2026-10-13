import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { shiftApi } from '@/api/shift.api';
import { toast } from 'sonner';

const QUERY_KEY = ['shifts'];

export function useCurrentShift() {
  return useQuery({
    queryKey: [...QUERY_KEY, 'current'],
    queryFn: shiftApi.getCurrent,
    refetchInterval: 30000, // refresh every 30s so cash totals stay fresh
  });
}

export function useShiftHistory() {
  return useQuery({
    queryKey: [...QUERY_KEY, 'history'],
    queryFn: shiftApi.getAll,
  });
}

export function useShiftDetail(id: number | null) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'detail', id],
    queryFn: () => shiftApi.getDetail(id!),
    enabled: id !== null,
  });
}

export function useOpenShift() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: shiftApi.open,
    onSuccess: (shift) => {
      qc.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success(`Đã mở ca làm việc ${shift.shiftCode}`);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Không thể mở ca. Kiểm tra lại kết nối.');
    },
  });
}

export function useCloseShift() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: shiftApi.close,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success('Đã chốt két và đóng ca thành công!');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Không thể chốt két.');
    },
  });
}

// Legacy compatibility – keep old hook signature so shift-manage.tsx doesn't break entirely
export function useShifts() {
  const { data: currentShift } = useCurrentShift();
  const { data: history = [] } = useShiftHistory();
  const openMutation = useOpenShift();
  const closeMutation = useCloseShift();

  return {
    currentShift: currentShift ?? null,
    history,
    openShift: (data: { cashierName: string; openingCash: number }) =>
      openMutation.mutate({ cashierName: data.cashierName, openingCash: data.openingCash }),
    closeShift: (data: { actualCash: number; handoverNote: string }) =>
      closeMutation.mutate({ actualCash: data.actualCash, handoverNote: data.handoverNote }),
  };
}
