import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { inventoryApi, ReceiptQueryParams } from '@/api/inventory.api';
import { PaginationParams } from '@/types/common';
import { toast } from 'sonner';

export const useReceipts = (params?: ReceiptQueryParams) => {
  return useQuery({
    queryKey: ['inventory-receipts', params],
    queryFn: () => inventoryApi.getReceipts(params),
  });
};

export const useCreateReceipt = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: inventoryApi.createReceipt,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['inventory-receipts'] });
      toast.success('Tạo phiếu nhập kho thành công');
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Lỗi tạo phiếu nhập'),
  });
};

export const useCompleteReceipt = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => inventoryApi.completeReceipt(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['inventory-receipts'] });
      qc.invalidateQueries({ queryKey: ['ingredients'] });
      toast.success('Đã hoàn thành phiếu nhập và cộng tồn kho');
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Lỗi hoàn thành phiếu'),
  });
};

export const useIssues = (params?: PaginationParams) => {
  return useQuery({
    queryKey: ['inventory-issues', params],
    queryFn: () => inventoryApi.getIssues(params),
  });
};

export const useCreateManualIssue = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: inventoryApi.createManualIssue,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['inventory-issues'] });
      qc.invalidateQueries({ queryKey: ['ingredients'] });
      toast.success('Xuất kho thành công và đã trừ tồn kho');
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Lỗi xuất kho'),
  });
};

export const useAdjustStock = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: inventoryApi.adjustStock,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ingredients'] });
      toast.success('Điều chỉnh số lượng kho thành công');
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Lỗi điều chỉnh kho'),
  });
};
