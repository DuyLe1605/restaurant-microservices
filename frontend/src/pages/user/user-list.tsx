import * as React from 'react';
import { useUsers, useCreateUser, useDeleteUser, useChangePassword } from '@/hooks/use-users';
import { PageHeader } from '@/components/shared/page-header';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { StatusBadge } from '@/components/shared/status-badge';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Dialog } from '@/components/ui/dialog';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Plus, KeyRound, Trash2, Search, ShieldCheck } from 'lucide-react';
import { Role, User } from '@/types/auth';

export function UserListPage() {
  const [page, setPage] = React.useState(0);
  const [search, setSearch] = React.useState('');
  const [roleFilter, setRoleFilter] = React.useState<string>('');

  const { data, isLoading } = useUsers({ page, size: 20 });
  const createMutation = useCreateUser();
  const deleteMutation = useDeleteUser();
  const changePasswordMutation = useChangePassword();

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [username, setUsername] = React.useState('');
  const [fullname, setFullname] = React.useState('');
  const [password, setPassword] = React.useState('123456');
  const [role, setRole] = React.useState<Role>('USER');

  // Change password modal
  const [passwordModalUser, setPasswordModalUser] = React.useState<{ id: number; username: string } | null>(null);
  const [currentPassword, setCurrentPassword] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');

  const [deleteId, setDeleteId] = React.useState<number | null>(null);

  const rawUsers: User[] = data?.content || (Array.isArray(data) ? data : []);

  const filteredUsers = React.useMemo(() => {
    return rawUsers.filter((u) => {
      const matchSearch =
        !search ||
        u.username.toLowerCase().includes(search.toLowerCase()) ||
        u.fullname.toLowerCase().includes(search.toLowerCase());

      const matchRole = !roleFilter || u.role === roleFilter;

      return matchSearch && matchRole;
    });
  }, [rawUsers, search, roleFilter]);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password || !fullname) return;

    createMutation.mutate({
      username,
      password,
      confirmPassword: password,
      fullname,
      role,
    });
    setDialogOpen(false);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordModalUser || !newPassword) return;

    changePasswordMutation.mutate({
      id: passwordModalUser.id,
      payload: { currentPassword: currentPassword || '', oldPassword: currentPassword || '', newPassword },
    });
    setPasswordModalUser(null);
    setCurrentPassword('');
    setNewPassword('');
  };

  if (isLoading) {
    return <LoadingSpinner text="Đang tải danh sách nhân viên..." />;
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Quản trị Nhân viên & Cấp quyền" description="Quản lý tài khoản truy cập hệ thống theo các vai trò: Quản trị (ADMIN), Quản lý (MANAGER), Nhân viên (USER).">
        
          <Button onClick={() => setDialogOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" /> Thêm tài khoản mới
          </Button>
        
      </PageHeader>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-card p-4 rounded-xl border">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm theo tên nhân viên, tài khoản..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="w-full sm:w-56">
          <Select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
            <option value="">-- Tất cả vai trò --</option>
            <option value="ADMIN">Quản trị viên (ADMIN)</option>
            <option value="MANAGER">Quản lý (MANAGER)</option>
            <option value="USER">Nhân viên (USER)</option>
          </Select>
        </div>
      </div>

      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead className="w-16">ID</TableHead>
              <TableHead>Tên đăng nhập</TableHead>
              <TableHead>Họ và tên</TableHead>
              <TableHead>Vai trò hệ thống</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((u) => (
              <TableRow key={u.id} className="hover:bg-muted/30">
                <TableCell className="font-mono text-xs">#{u.id}</TableCell>
                <TableCell className="font-bold">{u.username}</TableCell>
                <TableCell>{u.fullname}</TableCell>
                <TableCell><StatusBadge status={u.role} /></TableCell>
                <TableCell><StatusBadge status={u.active ? 'ACTIVE' : 'INACTIVE'} /></TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0"
                      title="Đổi mật khẩu"
                      onClick={() => setPasswordModalUser({ id: u.id, username: u.username })}
                    >
                      <KeyRound className="h-4 w-4 text-primary" />
                    </Button>

                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10"
                      title="Xóa tài khoản"
                      onClick={() => setDeleteId(u.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Add User Dialog */}
      <Dialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title="Tạo tài khoản nhân viên mới"
        description="Cấp quyền truy cập hệ thống cho nhân sự mới."
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1 block">Tên đăng nhập</label>
            <Input value={username} onChange={(e) => setUsername(e.target.value)} required />
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1 block">Họ và tên nhân viên</label>
            <Input value={fullname} onChange={(e) => setFullname(e.target.value)} required />
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1 block">Mật khẩu khởi tạo</label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1 block">Vai trò (Phân quyền)</label>
            <Select value={role} onChange={(e) => setRole(e.target.value as Role)}>
              <option value="USER">Nhân viên (Phục vụ / Bếp / Thu ngân)</option>
              <option value="MANAGER">Quản lý (Giám sát vận hành)</option>
              <option value="ADMIN">Quản trị viên (Toàn quyền)</option>
            </Select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Hủy</Button>
            <Button type="submit">Tạo tài khoản</Button>
          </div>
        </form>
      </Dialog>

      {/* Change Password Dialog */}
      <Dialog
        open={passwordModalUser !== null}
        onOpenChange={(open) => !open && setPasswordModalUser(null)}
        title={`Đổi mật khẩu: ${passwordModalUser?.username || ''}`}
      >
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1 block">Mật khẩu hiện tại (Tùy chọn cho Quản trị viên)</label>
            <Input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="Để trống nếu reset mật khẩu" />
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1 block">Mật khẩu mới</label>
            <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={6} placeholder="Tối thiểu 6 ký tự" />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setPasswordModalUser(null)}>Hủy</Button>
            <Button type="submit">Cập nhật mật khẩu</Button>
          </div>
        </form>
      </Dialog>

      {/* Delete User Confirm Dialog */}
      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Xóa tài khoản nhân viên"
        description="Bạn có chắc chắn muốn xóa tài khoản này? Nhân viên sẽ không thể đăng nhập vào hệ thống nữa."
        confirmText="Xác nhận xóa"
        isDanger={true}
        onConfirm={() => {
          if (deleteId) deleteMutation.mutate(deleteId);
        }}
      />
    </div>
  );
}
