import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useTables,
  useCreateTable,
  useUpdateTable,
  useUpdateTableStatus,
  useDeleteTable,
  useTransferTable,
  useMergeTables,
} from '@/hooks/use-tables';
import { useOrders } from '@/hooks/use-orders';
import { toast } from 'sonner';
import { PageHeader } from '@/components/shared/page-header';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { StatusBadge } from '@/components/shared/status-badge';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { formatVND } from '@/lib/format-currency';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Dialog } from '@/components/ui/dialog';
import {
  Plus,
  Users,
  UtensilsCrossed,
  Trash2,
  Search,
  Edit2,
  ArrowRightLeft,
  Merge,
  Layers,
  CheckCircle2,
  Receipt,
  Clock,
  QrCode,
  Sparkles,
} from 'lucide-react';
import { RestaurantTable, TableStatus } from '@/types/table';
import { SaleOrder } from '@/types/order';
import { useAuthStore } from '@/stores/auth-store';

export function TableListPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const canManageTables = user?.role === 'ADMIN' || user?.role === 'MANAGER';

  // Queries
  const { data: tables, isLoading: isTablesLoading } = useTables();
  const { data: ordersData, isLoading: isOrdersLoading } = useOrders({ status: 'OPEN', size: 100 });

  // Mutations
  const createMutation = useCreateTable();
  const updateTableMutation = useUpdateTable();
  const updateStatusMutation = useUpdateTableStatus();
  const deleteMutation = useDeleteTable();
  const transferMutation = useTransferTable();
  const mergeMutation = useMergeTables();

  const [search, setSearch] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<string>('');

  // Add / Edit Modal
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editingTable, setEditingTable] = React.useState<RestaurantTable | null>(null);
  const [number, setNumber] = React.useState('');
  const [capacity, setCapacity] = React.useState(4);
  const [status, setStatus] = React.useState<TableStatus>('FREE');

  // Change Status Modal
  const [statusModalTable, setStatusModalTable] = React.useState<RestaurantTable | null>(null);
  const [newStatus, setNewStatus] = React.useState<TableStatus>('FREE');

  // Move Table (Chuyển Bàn) Modal
  const [moveModalTable, setMoveModalTable] = React.useState<RestaurantTable | null>(null);
  const [moveTargetId, setMoveTargetId] = React.useState<number>(0);
  const [moveReason, setMoveReason] = React.useState('');

  // Merge Table (Ghép Bàn) Modal
  const [mergeModalTable, setMergeModalTable] = React.useState<RestaurantTable | null>(null);
  const [mergeTargetId, setMergeTargetId] = React.useState<number>(0);

  // Delete State
  const [deleteId, setDeleteId] = React.useState<number | null>(null);

  const rawTables: RestaurantTable[] = tables || [];
  const openOrders: SaleOrder[] = ordersData?.content || (Array.isArray(ordersData) ? ordersData : []);

  // Map tableId -> Active SaleOrder
  const openOrdersByTable = React.useMemo(() => {
    const map = new Map<number, SaleOrder>();
    openOrders.forEach((ord) => {
      if (ord.tableId && ord.status === 'OPEN') {
        map.set(ord.tableId, ord);
      }
    });
    return map;
  }, [openOrders]);

  const filteredTables = React.useMemo(() => {
    return rawTables.filter((t) => {
      const matchSearch =
        !search ||
        t.number.toLowerCase().includes(search.toLowerCase()) ||
        String(t.capacity).includes(search);

      const matchStatus = !statusFilter || t.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [rawTables, search, statusFilter]);

  // Target tables available for moving (only FREE tables)
  const freeTables = React.useMemo(() => {
    return rawTables.filter((t) => t.status === 'FREE' && t.id !== moveModalTable?.id);
  }, [rawTables, moveModalTable]);

  // Target tables available for merging (only other OCCUPIED tables)
  const occupiedTables = React.useMemo(() => {
    return rawTables.filter((t) => t.status === 'OCCUPIED' && t.id !== mergeModalTable?.id);
  }, [rawTables, mergeModalTable]);

  const handleOpenAdd = () => {
    setEditingTable(null);
    setNumber('');
    setCapacity(4);
    setStatus('FREE');
    setDialogOpen(true);
  };

  const handleOpenEdit = (t: RestaurantTable) => {
    setEditingTable(t);
    setNumber(t.number);
    setCapacity(t.capacity);
    setStatus(t.status);
    setDialogOpen(true);
  };

  const handleSaveTable = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTable) {
      updateTableMutation.mutate(
        { id: editingTable.id, payload: { number, capacity, status } },
        { onSuccess: () => setDialogOpen(false) }
      );
    } else {
      createMutation.mutate(
        { number, capacity, status },
        { onSuccess: () => setDialogOpen(false) }
      );
    }
  };

  const handleChangeStatus = () => {
    if (!statusModalTable) return;
    updateStatusMutation.mutate(
      { id: statusModalTable.id, status: newStatus },
      { onSuccess: () => setStatusModalTable(null) }
    );
  };

  const handleConfirmMove = () => {
    if (!moveModalTable || !moveTargetId) return;
    const target = rawTables.find((t) => t.id === moveTargetId);
    if (!target) return;

    transferMutation.mutate(
      {
        sourceId: moveModalTable.id,
        targetTableId: moveTargetId,
        reason: moveReason,
      },
      {
        onSuccess: () => {
          setMoveModalTable(null);
          setMoveTargetId(0);
          setMoveReason('');
        },
      }
    );
  };

  const handleConfirmMerge = () => {
    if (!mergeModalTable || !mergeTargetId) return;
    mergeMutation.mutate(
      {
        primaryId: mergeTargetId,
        mergedTableIds: [mergeModalTable.id],
      },
      {
        onSuccess: () => {
          setMergeModalTable(null);
          setMergeTargetId(0);
        },
      }
    );
  };

  if (isTablesLoading || isOrdersLoading) {
    return <LoadingSpinner text="Đang tải sơ đồ bàn ăn và đơn hàng trực tiếp..." />;
  }

  // Active order currently being moved
  const moveModalOrder = moveModalTable ? openOrdersByTable.get(moveModalTable.id) : null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sơ Đồ Bàn Ăn"
        description="Quản lý bàn theo sức chứa, đổi trạng thái, chuyển bàn, ghép bàn và theo dõi đơn hàng tại bàn thời gian thực."
      >
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate('/qr')} className="gap-2">
              <QrCode className="h-4 w-4" /> Quản Lý QR Bàn
            </Button>
            {canManageTables && (
              <Button onClick={handleOpenAdd} className="gap-2">
                <Plus className="h-4 w-4" /> Thêm Bàn Mới
              </Button>
            )}
          </div>
      </PageHeader>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-card p-4 rounded-xl border">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm theo số bàn (B-01, VIP...)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="w-full sm:w-56">
          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">-- Tất cả trạng thái --</option>
            <option value="FREE">Bàn trống (FREE)</option>
            <option value="OCCUPIED">Đang có khách (OCCUPIED)</option>
            <option value="RESERVED">Đã đặt trước (RESERVED)</option>
          </Select>
        </div>
      </div>

      {/* Table Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredTables.map((t) => {
          const isOccupied = t.status === 'OCCUPIED';
          const isFree = t.status === 'FREE';
          const isReserved = t.status === 'RESERVED';
          const activeOrder = openOrdersByTable.get(t.id);

          return (
            <div
              key={t.id}
              className={`relative rounded-2xl border bg-card p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between ${
                isOccupied
                  ? 'border-rose-300 dark:border-rose-900 bg-rose-50/20 dark:bg-rose-950/10 ring-1 ring-rose-400/20'
                  : isReserved
                  ? 'border-amber-300 dark:border-amber-900 bg-amber-50/20 dark:bg-amber-950/10'
                  : 'hover:border-primary/50'
              }`}
            >
              <div>
                {/* Header */}
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="text-xl font-black tracking-tight">{t.number}</span>
                    <p className="text-[11px] text-muted-foreground font-mono">Bàn #{t.id}</p>
                  </div>
                  <StatusBadge status={t.status} />
                </div>

                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3 font-medium">
                  <Users className="h-3.5 w-3.5" />
                  <span>Sức chứa: {t.capacity} khách</span>
                </div>

                {/* LIVE ORDER PREVIEW ON OCCUPIED TABLES */}
                {isOccupied && activeOrder && (
                  <div className="mb-4 p-3 bg-white dark:bg-card rounded-xl border border-rose-200 dark:border-rose-900/50 shadow-sm space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1">
                        <Receipt className="h-3.5 w-3.5" />
                        Đơn #{activeOrder.id}
                      </span>
                      <span className="text-[11px] font-semibold text-muted-foreground">
                        {activeOrder.customerName || 'Khách tại bàn'}
                      </span>
                    </div>

                    <div className="text-xs text-muted-foreground">
                      <p className="line-clamp-1 text-[11px] font-medium">
                        🍲 {activeOrder.items?.map((it) => `${it.menuName} (x${it.qty})`).join(', ') || 'Chưa có món'}
                      </p>
                    </div>

                    {activeOrder.note && (
                      <p className="text-[10px] text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 px-2 py-0.5 rounded font-semibold line-clamp-1">
                        📝 {activeOrder.note}
                      </p>
                    )}

                    <div className="pt-1 border-t flex items-center justify-between">
                      <span className="text-[11px] text-muted-foreground font-semibold">Tạm tính:</span>
                      <span className="text-xs font-black text-primary">
                        {formatVND(activeOrder.totalAmount)}
                      </span>
                    </div>
                  </div>
                )}

                {/* Occupied but no active order found */}
                {isOccupied && !activeOrder && (
                  <div className="mb-4 p-2.5 bg-muted/40 rounded-xl text-center text-xs text-muted-foreground">
                    <p className="font-semibold text-foreground">Bàn đang có khách ngồi</p>
                    <p className="text-[11px]">Chưa ghi nhận món ăn</p>
                  </div>
                )}

                {/* Free table placeholder */}
                {isFree && (
                  <div className="mb-4 p-3 bg-muted/20 border border-dashed rounded-xl text-center text-xs text-muted-foreground">
                    <p className="font-semibold text-emerald-600 dark:text-emerald-400">Bàn trống sẵn sàng</p>
                    <p className="text-[11px] text-muted-foreground">Sẵn sàng nhận khách mới</p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 border-t pt-3">
                {/* Free table: Mở đơn POS */}
                {isFree && (
                  <Button
                    size="sm"
                    className="w-full text-xs font-bold gap-1.5 h-8 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                    onClick={() => navigate(`/orders/create?tableId=${t.id}`)}
                  >
                    <UtensilsCrossed className="h-3.5 w-3.5" /> Mở Đơn Gọi Món
                  </Button>
                )}

                {/* Occupied table: Chuyển bàn, Ghép bàn & Xem đơn */}
                {isOccupied && (
                  <div className="space-y-1.5">
                    <div className="grid grid-cols-2 gap-1.5">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs h-8 font-semibold text-blue-600 border-blue-200 hover:bg-blue-50 dark:hover:bg-blue-950/30"
                        onClick={() => {
                          setMoveModalTable(t);
                          setMoveTargetId(0);
                        }}
                        title="Chuyển khách và đơn hàng sang bàn trống khác"
                      >
                        <ArrowRightLeft className="h-3.5 w-3.5 mr-1" /> Chuyển Bàn
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs h-8 font-semibold text-purple-600 border-purple-200 hover:bg-purple-50 dark:hover:bg-purple-950/30"
                        onClick={() => {
                          setMergeModalTable(t);
                          setMergeTargetId(0);
                        }}
                        title="Ghép vào bàn khác đang dùng"
                      >
                        <Merge className="h-3.5 w-3.5 mr-1" /> Ghép Bàn
                      </Button>
                    </div>

                    {activeOrder ? (
                      <Button
                        size="sm"
                        className="w-full text-xs font-bold h-8 bg-primary hover:bg-primary/90 text-primary-foreground gap-1.5"
                        onClick={() => navigate(`/orders?tableId=${t.id}`)}
                      >
                        <Receipt className="h-3.5 w-3.5" /> Xem Đơn #{activeOrder.id} ({formatVND(activeOrder.totalAmount)})
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full text-xs font-bold h-8"
                        onClick={() => navigate(`/orders/create?tableId=${t.id}`)}
                      >
                        <Plus className="h-3.5 w-3.5 mr-1" /> Mở Đơn Cho Bàn
                      </Button>
                    )}
                  </div>
                )}

                {/* Trạng thái bàn */}
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full text-xs font-semibold gap-1.5 h-7"
                  onClick={() => {
                    setStatusModalTable(t);
                    setNewStatus(t.status);
                  }}
                >
                  Đổi trạng thái
                </Button>

                {/* Bottom actions: Sửa, Xóa */}
                <div className="flex justify-between items-center pt-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 text-xs text-muted-foreground hover:text-foreground"
                    onClick={() => handleOpenEdit(t)}
                  >
                    <Edit2 className="h-3 w-3 mr-1" /> Sửa
                  </Button>

                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 text-xs text-destructive hover:bg-destructive/10"
                    onClick={() => setDeleteId(t.id)}
                  >
                    <Trash2 className="h-3 w-3 mr-1" /> Xóa
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL 1: Chuyển Bàn Ăn (Move Table) */}
      <Dialog
        open={moveModalTable !== null}
        onOpenChange={(open) => !open && setMoveModalTable(null)}
        title={`Chuyển Bàn Ăn - Từ ${moveModalTable?.number || ''}`}
        description="Chuyển khách và toàn bộ đơn hàng đang gọi sang một bàn trống khác."
      >
        <div className="space-y-4">
          <div className="p-3 bg-muted rounded-xl text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Bàn nguồn:</span>
              <span className="font-bold text-foreground">{moveModalTable?.number} ({moveModalTable?.capacity} khách)</span>
            </div>

            {moveModalOrder ? (
              <div className="p-2 bg-background rounded-lg border flex items-center justify-between">
                <div>
                  <p className="font-bold text-primary">Đơn #{moveModalOrder.id} - {moveModalOrder.customerName || 'Khách tại bàn'}</p>
                  <p className="text-[11px] text-muted-foreground">{moveModalOrder.items?.length || 0} món đang phục vụ</p>
                </div>
                <span className="font-black text-xs text-rose-600 dark:text-rose-400">
                  {formatVND(moveModalOrder.totalAmount)}
                </span>
              </div>
            ) : (
              <p className="text-[11px] text-muted-foreground italic">Không có đơn hàng nào gắn với bàn này.</p>
            )}
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1 block">
              Chọn bàn trống muốn chuyển sang (*):
            </label>
            {freeTables.length === 0 ? (
              <p className="text-xs text-rose-500 font-semibold py-2">
                Hiện không còn bàn trống nào trong nhà hàng! Vui lòng thanh toán hoặc giải phóng bàn trước.
              </p>
            ) : (
              <Select value={moveTargetId} onChange={(e) => setMoveTargetId(Number(e.target.value))}>
                <option value={0}>-- Chọn bàn đích trống --</option>
                {freeTables.map((ft) => (
                  <option key={ft.id} value={ft.id}>
                    {ft.number} (Sức chứa {ft.capacity} khách)
                  </option>
                ))}
              </Select>
            )}
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1 block">Lý do chuyển bàn (tùy chọn)</label>
            <Input
              value={moveReason}
              onChange={(e) => setMoveReason(e.target.value)}
              placeholder="VD: Khách yêu cầu bàn gần cửa sổ, đổi sang bàn lớn hơn..."
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t">
            <Button variant="outline" onClick={() => setMoveModalTable(null)}>
              Hủy
            </Button>
            <Button
              disabled={moveTargetId === 0 || transferMutation.isPending}
              isLoading={transferMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold"
              onClick={handleConfirmMove}
            >
              <ArrowRightLeft className="h-4 w-4 mr-1.5" />
              Xác Nhận Chuyển Bàn
            </Button>
          </div>
        </div>
      </Dialog>

      {/* MODAL 2: Ghép Bàn Ăn (Merge Tables) */}
      <Dialog
        open={mergeModalTable !== null}
        onOpenChange={(open) => !open && setMergeModalTable(null)}
        title={`Ghép Bàn Ăn - Gộp Bàn ${mergeModalTable?.number || ''}`}
        description="Gộp nhóm khách và thức đơn của bàn này vào một bàn khác đang phục vụ."
      >
        <div className="space-y-4">
          <div className="p-3 bg-muted rounded-xl text-xs flex items-center justify-between">
            <span>Bàn cần gộp:</span>
            <span className="font-bold text-primary">{mergeModalTable?.number}</span>
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1 block">
              Chọn bàn đích (đang có khách) để gộp vào:
            </label>
            {occupiedTables.length === 0 ? (
              <p className="text-xs text-rose-500 font-semibold py-2">
                Không có bàn nào khác đang phục vụ để ghép!
              </p>
            ) : (
              <Select value={mergeTargetId} onChange={(e) => setMergeTargetId(Number(e.target.value))}>
                <option value={0}>-- Chọn bàn đích --</option>
                {occupiedTables.map((ot) => (
                  <option key={ot.id} value={ot.id}>
                    {ot.number} (Đang phục vụ {ot.capacity} khách)
                  </option>
                ))}
              </Select>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t">
            <Button variant="outline" onClick={() => setMergeModalTable(null)}>
              Hủy
            </Button>
            <Button
              disabled={mergeTargetId === 0 || mergeMutation.isPending}
              isLoading={mergeMutation.isPending}
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold"
              onClick={handleConfirmMerge}
            >
              <Merge className="h-4 w-4 mr-1.5" />
              Xác Nhận Ghép Bàn
            </Button>
          </div>
        </div>
      </Dialog>

      {/* MODAL 3: Đổi trạng thái bàn */}
      <Dialog
        open={statusModalTable !== null}
        onOpenChange={(open) => !open && setStatusModalTable(null)}
        title={`Đổi Trạng Thái Bàn ${statusModalTable?.number || ''}`}
        description="Cập nhật nhanh trạng thái sẵn sàng của bàn ăn."
      >
        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-muted-foreground mb-1 block">Chọn trạng thái mới:</label>
            <Select value={newStatus} onChange={(e) => setNewStatus(e.target.value as TableStatus)}>
              <option value="FREE">Bàn trống (FREE)</option>
              <option value="OCCUPIED">Đang có khách (OCCUPIED)</option>
              <option value="RESERVED">Đã đặt trước (RESERVED)</option>
            </Select>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t">
            <Button variant="outline" onClick={() => setStatusModalTable(null)}>
              Hủy
            </Button>
            <Button onClick={handleChangeStatus} isLoading={updateStatusMutation.isPending} className="font-bold">
              Lưu Trạng Thái
            </Button>
          </div>
        </div>
      </Dialog>

      {/* MODAL 4: Thêm / Sửa Bàn */}
      <Dialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={editingTable ? 'Sửa Thông Tin Bàn' : 'Thêm Bàn Ăn Mới'}
        description="Điền số hiệu bàn và sức chứa số lượng khách."
      >
        <form onSubmit={handleSaveTable} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-muted-foreground mb-1 block">Số hiệu bàn (*)</label>
            <Input
              value={number}
              onChange={(e) => setNumber(e.target.value)}
              placeholder="VD: B-07, VIP-03..."
              required
            />
          </div>

          <div>
            <label className="text-xs font-bold text-muted-foreground mb-1 block">Sức chứa (số khách)</label>
            <Input
              type="number"
              min="1"
              max="50"
              value={capacity}
              onChange={(e) => setCapacity(Number(e.target.value))}
              required
            />
          </div>

          <div>
            <label className="text-xs font-bold text-muted-foreground mb-1 block">Trạng thái khởi tạo</label>
            <Select value={status} onChange={(e) => setStatus(e.target.value as TableStatus)}>
              <option value="FREE">Bàn trống (FREE)</option>
              <option value="OCCUPIED">Đang có khách (OCCUPIED)</option>
              <option value="RESERVED">Đã đặt trước (RESERVED)</option>
            </Select>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t">
            <Button variant="outline" type="button" onClick={() => setDialogOpen(false)}>
              Hủy
            </Button>
            <Button type="submit" className="font-bold">
              {editingTable ? 'Lưu Thay Đổi' : 'Thêm Bàn'}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* CONFIRM DIALOG: Xóa Bàn */}
      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Xác Nhận Xóa Bàn"
        description="Bạn có chắc chắn muốn xóa bàn ăn này khỏi hệ thống sơ đồ?"
        confirmText="Xóa Bàn"
        cancelText="Giữ Lại"
        isDanger={true}
        onConfirm={() => {
          if (deleteId) {
            deleteMutation.mutate(deleteId, {
              onSuccess: () => {
                setDeleteId(null);
                toast.success('Đã xóa bàn thành công');
              },
            });
          }
        }}
      />
    </div>
  );
}
