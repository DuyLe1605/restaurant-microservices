import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { customerApi, CustomerQueryParams, CustomerRegisterRequest } from '@/api/customer.api';
import { toast } from 'sonner';

export const useCustomers = (params?: CustomerQueryParams) => {
  return useQuery({
    queryKey: ['customers', params],
    queryFn: () => customerApi.getAll(params),
  });
};

export const useCustomer = (id: number) => {
  return useQuery({
    queryKey: ['customer', id],
    queryFn: () => customerApi.getById(id),
    enabled: !!id,
  });
};

export const useCustomerLookup = (phone: string, enabled = false) => {
  return useQuery({
    queryKey: ['customer-lookup', phone],
    queryFn: () => customerApi.lookupByPhone(phone),
    enabled: enabled && !!phone && phone.trim().length >= 9,
    retry: false,
  });
};

export const useRegisterCustomer = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CustomerRegisterRequest) => customerApi.registerOrGet(payload),
    onSuccess: (customer) => {
      qc.invalidateQueries({ queryKey: ['customers'] });
      qc.setQueryData(['customer-lookup', customer.phone], customer);
      toast.success(`Đã đăng ký hội viên: ${customer.name} (${customer.phone})`);
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Lỗi đăng ký hội viên'),
  });
};

export const useUpdateCustomer = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<CustomerRegisterRequest> }) =>
      customerApi.update(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['customers'] });
      toast.success('Cập nhật thông tin khách hàng thành công');
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Lỗi cập nhật khách hàng'),
  });
};
