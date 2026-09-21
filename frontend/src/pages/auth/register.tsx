import * as React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useRegister } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { UtensilsCrossed } from 'lucide-react';
import { Role } from '@/types/auth';

export function RegisterPage() {
  const [fullname, setFullname] = React.useState('');
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [role, setRole] = React.useState<Role>('USER');

  const navigate = useNavigate();
  const registerMutation = useRegister();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert('Mật khẩu xác nhận không khớp');
      return;
    }

    registerMutation.mutate(
      { fullname, username, password, confirmPassword, role },
      {
        onSuccess: () => navigate('/login'),
      }
    );
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-orange-50 via-background to-amber-50/50 p-4">
      <Card className="w-full max-w-md shadow-xl border-border/60">
        <CardHeader className="text-center space-y-2 pb-6">
          <div className="mx-auto h-12 w-12 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/30">
            <UtensilsCrossed className="h-6 w-6" />
          </div>
          <CardTitle className="text-2xl font-black tracking-tight">Đăng ký tài khoản</CardTitle>
          <CardDescription>Tạo tài khoản quản trị viên hoặc nhân viên mới</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1 block">Họ và tên</label>
              <Input
                placeholder="Ví dụ: Nguyễn Văn A"
                value={fullname}
                onChange={(e) => setFullname(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1 block">Tên đăng nhập</label>
              <Input
                placeholder="Tối thiểu 3 ký tự (chữ, số)"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1 block">Mật khẩu</label>
              <Input
                type="password"
                placeholder="Tối thiểu 6 ký tự"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1 block">Xác nhận mật khẩu</label>
              <Input
                type="password"
                placeholder="Nhập lại mật khẩu"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <div>
              <Select label="Vai trò (Role)" value={role} onChange={(e) => setRole(e.target.value as Role)}>
                <option value="USER">Nhân viên phục vụ (USER)</option>
                <option value="MANAGER">Quản lý nhà hàng (MANAGER)</option>
                <option value="ADMIN">Quản trị viên hệ thống (ADMIN)</option>
              </Select>
            </div>

            <Button type="submit" className="w-full h-11 text-base font-bold" isLoading={registerMutation.isPending}>
              Tạo tài khoản
            </Button>
          </form>

          <div className="mt-4 text-center text-xs text-muted-foreground">
            Đã có tài khoản?{' '}
            <Link to="/login" className="text-primary font-bold hover:underline">
              Đăng nhập ngay
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
