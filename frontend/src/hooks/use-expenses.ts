import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { expenseApi, ExpenseQueryParams } from '@/api/expense.api';
import { Expense } from '@/types/expense';
import { toast } from 'sonner';

export const useExpenses = (params?: ExpenseQueryParams) => {
  return useQuery({
    queryKey: ['expenses', params],
    queryFn: () => expenseApi.getAll(params),
  });
};

export const useCreateExpense = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<Expense>) => expenseApi.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['expenses'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Ghi nhận chi phí thành công');
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Lỗi tạo chi phí'),
  });
};

export const useDeleteExpense = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => expenseApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['expenses'] });
      toast.success('Xóa chi phí thành công');
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Lỗi xóa chi phí'),
  });
};
