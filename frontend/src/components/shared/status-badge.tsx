import { Badge } from '@/components/ui/badge';

interface StatusBadgeProps {
  status?: string | null;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  if (!status) return null;

  switch (status.toUpperCase()) {
    case 'OPEN':
    case 'PENDING':
      return <Badge variant="warning">Đang chờ (PENDING)</Badge>;
    case 'SERVED':
    case 'CONFIRMED':
      return <Badge variant="info">Đã phục vụ</Badge>;
    case 'PAID':
    case 'COMPLETED':
      return <Badge variant="success">Hoàn thành</Badge>;
    case 'CANCEL':
    case 'CANCELLED':
      return <Badge variant="destructive">Đã hủy</Badge>;
    case 'FREE':
      return <Badge variant="success">Bàn trống</Badge>;
    case 'OCCUPIED':
      return <Badge variant="destructive">Có khách</Badge>;
    case 'RESERVED':
      return <Badge variant="warning">Đã đặt trước</Badge>;
    case 'CRITICAL':
      return <Badge variant="destructive">Hết hàng (Khẩn cấp)</Badge>;
    case 'WARNING':
      return <Badge variant="warning">Sắp hết</Badge>;
    case 'NORMAL':
      return <Badge variant="success">Ổn định</Badge>;
    case 'ADMIN':
      return <Badge variant="destructive">Admin</Badge>;
    case 'MANAGER':
      return <Badge variant="info">Quản lý</Badge>;
    case 'USER':
      return <Badge variant="secondary">Nhân viên</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}
