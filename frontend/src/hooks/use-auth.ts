import { useMutation } from '@tanstack/react-query';
import { authApi } from '@/api/auth.api';
import { useAuthStore } from '@/stores/auth-store';
import { LoginPayload, RegisterPayload } from '@/types/auth';
import { toast } from 'sonner';

export const useLogin = () => {
  const login = useAuthStore((state) => state.login);

  return useMutation({
    mutationFn: (payload: LoginPayload) => authApi.login(payload),
    onSuccess: (data) => {
      login(data.token, data.user);
      toast.success('Đăng nhập thành công! Chào mừng ' + data.user.fullname);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại tài khoản');
    },
  });
};

export const useRegister = () => {
  return useMutation({
    mutationFn: (payload: RegisterPayload) => authApi.register(payload),
    onSuccess: () => {
      toast.success('Đăng ký tài khoản thành công! Bạn có thể đăng nhập ngay');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Đăng ký thất bại');
    },
  });
};
