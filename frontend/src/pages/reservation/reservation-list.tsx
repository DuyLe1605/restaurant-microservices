import * as React from 'react';
import { useReservations, useCreateReservation, useDeleteReservation } from '@/hooks/use-reservations';
import { useTables } from '@/hooks/use-tables';
import { PageHeader } from '@/components/shared/page-header';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { EmptyState } from '@/components/shared/empty-state';
import { StatusBadge } from '@/components/shared/status-badge';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { formatDateTime } from '@/lib/format-date';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Dialog } from '@/components/ui/dialog';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Plus, Trash2, Calendar, Search } from 'lucide-react';
import { Reservation, ReservationStatus } from '@/types/table';

export function ReservationListPage() {
  const { data: reservations, isLoading } = useReservations();
  const { data: tables } = useTables();
  const createMutation = useCreateReservation();
  const deleteMutation = useDeleteReservation();

  const [search, setSearch] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<string>('');

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [tableId, setTableId] = React.useState<number>(0);
  const [customerName, setCustomerName] = React.useState('');
  const [customerPhone, setCustomerPhone] = React.useState('');
  const [partySize, setPartySize] = React.useState<number>(2);
  const [startTime, setStartTime] = React.useState('');
  const [endTime, setEndTime] = React.useState('');
  const [note, setNote] = React.useState('');

  const [deleteId, setDeleteId] = React.useState<number | null>(null);

  const rawReservations: Reservation[] = reservations || [];

  const filteredReservations = React.useMemo(() => {
    return rawReservations.filter((r) => {
      const matchSearch =
        !search ||
        r.customerName.toLowerCase().includes(search.toLowerCase()) ||
        (r.customerPhone && r.customerPhone.includes(search)) ||
        (r.tableNumber && r.tableNumber.toLowerCase().includes(search.toLowerCase()));

      const matchStatus = !statusFilter || r.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [rawReservations, search, statusFilter]);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !startTime || !endTime) return;

    createMutation.mutate({
      tableId,
      customerName,
      customerPhone,
      partySize,
      startTime,
      endTime,
      note,
      status: 'CONFIRMED',
    });
    setDialogOpen(false);
  };

  if (isLoading) {
    return <LoadingSpinner text="Đang tải danh sách đặt bàn..." />;
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Quản lý Đặt bàn trước" description="Ghi nhận thông tin khách đặt trước, số lượng khách và gán bàn tương ứng.">
        
          <Button onClick={() => setDialogOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" /> Đặt bàn mới
          </Button>
        
      </PageHeader>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-card p-4 rounded-xl border">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm khách hàng, số điện thoại, bàn..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="w-full sm:w-56">
          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">-- Tất cả trạng thái --</option>
            <option value="PENDING">Chờ xác nhận (PENDING)</option>
            <option value="CONFIRMED">Đã xác nhận (CONFIRMED)</option>
            <option value="CANCELLED">Đã hủy (CANCELLED)</option>
          </Select>
        </div>
      </div>

      {filteredReservations.length === 0 ? (
        <EmptyState
          title="Không có lịch đặt bàn"
          description={search ? "Không tìm thấy lịch đặt bàn phù hợp." : "Chưa có lượt đặt bàn nào trong hệ thống."}
          actionText="Tạo mới ngay"
          onAction={() => setDialogOpen(true)}
        />
      ) : (
        <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead>Khách hàng</TableHead>
                <TableHead>Số điện thoại</TableHead>
                <TableHead>Bàn ăn</TableHead>
                <TableHead>Số khách</TableHead>
                <TableHead>Thời gian đến</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Ghi chú</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReservations.map((r) => (
                <TableRow key={r.id} className="hover:bg-muted/30">
                  <TableCell className="font-bold">{r.customerName}</TableCell>
                  <TableCell className="text-xs font-mono">{r.customerPhone || '---'}</TableCell>
                  <TableCell className="font-semibold text-primary">{r.tableNumber || `Bàn #${r.tableId}`}</TableCell>
                  <TableCell className="font-bold">{r.partySize} người</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{formatDateTime(r.startTime)}</TableCell>
                  <TableCell><StatusBadge status={r.status} /></TableCell>
                  <TableCell className="text-xs max-w-xs truncate text-muted-foreground">{r.note || '---'}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10"
                      onClick={() => setDeleteId(r.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Add Reservation Dialog */}
      <Dialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title="Thêm lịch đặt bàn mới"
        description="Điền thông tin khách hàng, số lượng và chọn bàn phục vụ."
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1 block">Tên khách hàng</label>
            <Input value={customerName} onChange={(e) => setCustomerName(e.target.value)} required />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1 block">Số điện thoại</label>
              <Input value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} required />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1 block">Số lượng khách</label>
              <Input type="number" min="1" value={partySize} onChange={(e) => setPartySize(Number(e.target.value))} required />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1 block">Chọn bàn xếp chỗ</label>
            <Select value={tableId} onChange={(e) => setTableId(Number(e.target.value))}>
              <option value="0">-- Chọn bàn --</option>
              {tables?.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.number} ({t.capacity} chỗ - {t.status})
                </option>
              ))}
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1 block">Thời gian bắt đầu</label>
              <Input type="datetime-local" value={startTime} onChange={(e) => setStartTime(e.target.value)} required />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1 block">Thời gian kết thúc</label>
              <Input type="datetime-local" value={endTime} onChange={(e) => setEndTime(e.target.value)} required />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1 block">Ghi chú yêu cầu đặc biệt</label>
            <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Ví dụ: Sinh nhật, bàn góc yên tĩnh..." />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Hủy</Button>
            <Button type="submit">Xác nhận đặt bàn</Button>
          </div>
        </form>
      </Dialog>

      {/* Delete Reservation Confirm Dialog */}
      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Xác nhận hủy lịch đặt bàn"
        description="Bạn có chắc chắn muốn hủy lịch đặt chỗ của khách hàng này? Thao tác này không thể hoàn tác."
        confirmText="Xác nhận hủy"
        isDanger={true}
        onConfirm={() => {
          if (deleteId) deleteMutation.mutate(deleteId);
        }}
      />
    </div>
  );
}
