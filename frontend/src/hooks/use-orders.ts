import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orderApi, OrderQueryParams } from '@/api/order.api';
import { toast } from 'sonner';

export const useOrders = (params?: OrderQueryParams) => {
  return useQuery({
    queryKey: ['orders', params],
    queryFn: () => orderApi.getAll(params),
  });
};

export const useOrder = (id: number) => {
  return useQuery({
    queryKey: ['order', id],
    queryFn: () => orderApi.getById(id),
    enabled: !!id,
  });
};

export const useInvoice = (id: number) => {
  return useQuery({
    queryKey: ['invoice', id],
    queryFn: () => orderApi.getInvoice(id),
    enabled: !!id,
  });
};

export const useCreateOrder = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: orderApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['orders'] });
      qc.invalidateQueries({ queryKey: ['tables'] });
      toast.success('Tạo đơn hàng thành công');
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Lỗi tạo đơn hàng'),
  });
};

export const useAddOrderItems = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, items }: { id: number; items: any[] }) => orderApi.addItems(id, items),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ['orders'] });
      qc.invalidateQueries({ queryKey: ['order', variables.id] });
      toast.success('Đã thêm món vào đơn');
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Lỗi thêm món'),
  });
};

export const useCompleteOrder = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => orderApi.complete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Đơn hàng đã phục vụ (SERVED) và đã trừ kho');
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Lỗi hoàn thành đơn'),
  });
};

export const usePayOrder = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => orderApi.pay(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['orders'] });
      qc.invalidateQueries({ queryKey: ['tables'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Thanh toán thành công và đã giải phóng bàn');
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Lỗi thanh toán'),
  });
};

export const useCancelOrder = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => orderApi.cancel(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['orders'] });
      qc.invalidateQueries({ queryKey: ['tables'] });
      toast.success('Đã hủy đơn hàng');
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Lỗi hủy đơn'),
  });
};
