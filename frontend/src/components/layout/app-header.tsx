import * as React from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/shared/status-badge';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { LogOut, User as UserIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function AppHeader() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [showLogoutConfirm, setShowLogoutConfirm] = React.useState(false);

  const handleConfirmLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b bg-card/80 px-6 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold px-2 py-1 rounded bg-primary/10 text-primary">
            SOA Microservices
          </span>
        </div>

        <div className="flex items-center gap-4">
          {/* User Info */}
          <div className="flex items-center gap-3 border-r pr-4">
            <div className="h-9 w-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
              {user?.fullname ? user.fullname.charAt(0).toUpperCase() : <UserIcon className="h-4 w-4" />}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-bold leading-none">{user?.fullname || user?.username}</p>
              <div className="mt-1">
                <StatusBadge status={user?.role} />
              </div>
            </div>
          </div>

          {/* Logout Trigger with Confirm Dialog */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowLogoutConfirm(true)}
            className="text-muted-foreground hover:text-destructive transition-colors font-medium"
          >
            <LogOut className="h-4 w-4 mr-1.5" />
            <span className="hidden sm:inline">Đăng xuất</span>
          </Button>
        </div>
      </header>

      {/* Logout Confirmation Dialog */}
      <ConfirmDialog
        open={showLogoutConfirm}
        onOpenChange={setShowLogoutConfirm}
        title="Xác nhận đăng xuất"
        description="Bạn có chắc chắn muốn đăng xuất khỏi phiên làm việc hiện tại trên hệ thống?"
        confirmText="Đăng xuất ngay"
        cancelText="Ở lại"
        isDanger={true}
        onConfirm={handleConfirmLogout}
      />
    </>
  );
}
