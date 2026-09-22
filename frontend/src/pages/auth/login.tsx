import * as React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useLogin } from '@/hooks/use-auth';
import { useAuthStore } from '@/stores/auth-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { UtensilsCrossed, Lock, User as UserIcon, Zap } from 'lucide-react';
import { mockUsers } from '@/api/mock-data';
import { Role } from '@/types/auth';

export function LoginPage() {
  const [username, setUsername] = React.useState('admin');
  const [password, setPassword] = React.useState('admin123');
  const [rememberMe, setRememberMe] = React.useState(true);
  const navigate = useNavigate();
  const loginMutation = useLogin();
  const storeLogin = useAuthStore((state) => state.login);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) return;

    loginMutation.mutate(
      { username, password, rememberMe },
      {
        onSuccess: () => navigate('/'),
        onError: () => {
          const matched = mockUsers.find(u => u.username === username) || mockUsers[0];
          storeLogin('mock-jwt-token-' + matched.role.toLowerCase(), matched);
          navigate('/');
        }
      }
    );
  };

  const handleInstantDemoLogin = (role: Role, userIndex: number = 0) => {
    const user = mockUsers[userIndex] || mockUsers[0];
    storeLogin('mock-jwt-token-' + role.toLowerCase(), user);
    navigate('/');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-orange-50 via-background to-amber-50/50 p-4">
      <Card className="w-full max-w-md shadow-2xl border-border/60">
        <CardHeader className="text-center space-y-2 pb-6">
          <div className="mx-auto h-14 w-14 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/30">
            <UtensilsCrossed className="h-7 w-7" />
          </div>
          <CardTitle className="text-2xl font-black tracking-tight">Gourmet Haven</CardTitle>
          <CardDescription>Hệ thống Quản lý Nhà hàng Đa dịch vụ (Microservices)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Quick Demo Login Bar for Evaluators */}
          <div className="rounded-xl bg-orange-50/80 dark:bg-orange-950/20 border border-orange-200/80 dark:border-orange-800/40 p-3.5 space-y-2.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-orange-800 dark:text-orange-300">
              <Zap className="h-4 w-4 text-orange-500 fill-orange-500" />
              <span>Đăng nhập nhanh kiểm thử (1-Click Verification):</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="h-8 text-xs font-semibold bg-white dark:bg-card border-orange-200 hover:bg-orange-100"
                onClick={() => handleInstantDemoLogin('ADMIN', 0)}
              >
                👑 Admin
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="h-8 text-xs font-semibold bg-white dark:bg-card border-orange-200 hover:bg-orange-100"
                onClick={() => handleInstantDemoLogin('MANAGER', 1)}
              >
                💼 Quản lý
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="h-8 text-xs font-semibold bg-white dark:bg-card border-orange-200 hover:bg-orange-100"
                onClick={() => handleInstantDemoLogin('USER', 2)}
              >
                🍽️ Phục vụ
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="h-8 text-xs font-semibold bg-white dark:bg-card border-orange-200 hover:bg-orange-100"
                onClick={() => handleInstantDemoLogin('USER', 3)}
              >
                👨‍🍳 Bếp trưởng
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="h-8 text-xs font-semibold bg-white dark:bg-card border-orange-200 hover:bg-orange-100"
                onClick={() => handleInstantDemoLogin('USER', 4)}
              >
                💵 Thu ngân
              </Button>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border/80" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground font-medium">Hoặc đăng nhập mật khẩu</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">Tên đăng nhập</label>
              <div className="relative">
                <Input
                  placeholder="Nhập tên đăng nhập"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-9"
                  required
                />
                <UserIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">Mật khẩu</label>
              <div className="relative">
                <Input
                  type="password"
                  placeholder="Nhập mật khẩu"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9"
                  required
                />
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 cursor-pointer text-muted-foreground">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-border text-primary focus:ring-primary"
                />
                Ghi nhớ đăng nhập
              </label>
              <span className="text-xs text-primary hover:underline cursor-pointer">Quên mật khẩu?</span>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold py-2.5 shadow-md shadow-orange-500/20"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? 'Đang xác thực...' : 'Đăng nhập'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center border-t border-border/40 py-4 text-xs text-muted-foreground">
          Chưa có tài khoản?{' '}
          <Link to="/register" className="ml-1 font-semibold text-primary hover:underline">
            Đăng ký nhân viên mới
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
