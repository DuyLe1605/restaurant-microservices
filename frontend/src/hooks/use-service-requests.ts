import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { serviceRequestApi, CreateServiceRequestDto } from '@/api/service-request.api';
import { toast } from 'sonner';

const QUERY_KEY = ['service-requests'];

/** Hook cho Staff: lấy danh sách requests pending, auto-refresh mỗi 5 giây */
export function useServiceRequests(pendingOnly = false) {
  return useQuery({
    queryKey: [...QUERY_KEY, pendingOnly ? 'pending' : 'all'],
    queryFn: pendingOnly ? serviceRequestApi.getPending : serviceRequestApi.getAll,
    refetchInterval: 5000, // Poll mỗi 5s để real-time effect
  });
}

/** Hook cho Staff: đếm badge notification */
export function usePendingCount() {
  return useQuery({
    queryKey: [...QUERY_KEY, 'count'],
    queryFn: serviceRequestApi.countPending,
    refetchInterval: 5000,
  });
}

/** Hook cho QR Page: gửi yêu cầu phụ (public, không cần auth) */
export function useCreateServiceRequest() {
  return useMutation({
    mutationFn: (dto: CreateServiceRequestDto) => serviceRequestApi.createPublic(dto),
    onSuccess: (_, dto) => {
      toast.success('Yêu cầu đã được gửi! Nhân viên sẽ tới ngay.', { icon: '🔔', duration: 3000 });
    },
    onError: () => {
      toast.error('Không thể gửi yêu cầu. Vui lòng thử lại.');
    },
  });
}

/** Hook cho Staff: resolve request */
export function useResolveServiceRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => serviceRequestApi.resolve(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success('Đã xử lý yêu cầu!');
    },
  });
}

/** Hook cho Staff: dismiss request */
export function useDismissServiceRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => serviceRequestApi.dismiss(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}
