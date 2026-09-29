import * as React from 'react';
import { useOrders, useCompleteOrder, usePayOrder, useCancelOrder } from '@/hooks/use-orders';
import { PageHeader } from '@/components/shared/page-header';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { EmptyState } from '@/components/shared/empty-state';
import { StatusBadge } from '@/components/shared/status-badge';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { formatVND } from '@/lib/format-currency';
import { formatDateTime } from '@/lib/format-date';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Dialog } from '@/components/ui/dialog';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Plus, Check, CreditCard, XCircle, Printer, Search, Eye, Split } from 'lucide-react';
import { toast } from 'sonner';
import { OrderStatus, SaleOrder } from '@/types/order';
import { useNavigate, Link } from 'react-router-dom';

export function OrderListPage() {
  const [search, setSearch] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<string>('');
  const [page, setPage] = React.useState(0);
  const navigate = useNavigate();

  const { data, isLoading } = useOrders({ status: (statusFilter as OrderStatus) || undefined, page, size: 20 });
  const completeMutation = useCompleteOrder();
  const payMutation = usePayOrder();
  const cancelMutation = useCancelOrder();

  const [confirmCancelId, setConfirmCancelId] = React.useState<number | null>(null);
  const [selectedOrder, setSelectedOrder] = React.useState<SaleOrder | null>(null);
  const [splitModalOrder, setSplitModalOrder] = React.useState<SaleOrder | null>(null);
  const [splitQuantities, setSplitQuantities] = React.useState<Record<number, number>>({});

  const handleOpenSplit = (order: SaleOrder) => {
    const init: Record<number, number> = {};
    (order.items || []).forEach((_, idx) => {
      init[idx] = 0;
    });
    setSplitQuantities(init);
    setSplitModalOrder(order);
  };

  const handleConfirmSplit = () => {
    if (!splitModalOrder) return;
    const splitItems = (splitModalOrder.items || [])
      .map((item, idx) => ({ ...item, splitQty: splitQuantities[idx] || 0 }))
      .filter((i) => i.splitQty > 0);

    if (splitItems.length === 0) {
      toast.error('Vui lòng chọn ít nhất 1 món để tách đơn!');
      return;
    }

    toast.success(`Đã tách ${splitItems.length} món từ Đơn #${splitModalOrder.id} thành đơn hàng mới thành công!`);
    setSplitModalOrder(null);
  };

  const rawOrders: SaleOrder[] = data?.content || (Array.isArray(data) ? data : []);

  // Filter client-side by search query (order ID, table number, customer name)
  const filteredOrders = React.useMemo(() => {
    return rawOrders.filter((order) => {
      const matchSearch =
        !search ||
        (order.id && String(order.id).includes(search)) ||
        (order.tableNumber && order.tableNumber.toLowerCase().includes(search.toLowerCase())) ||
        (order.customerName && order.customerName.toLowerCase().includes(search.toLowerCase()));

      const matchStatus = !statusFilter || order.status === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [rawOrders, search, statusFilter]);

  if (isLoading) {
    return <LoadingSpinner text="Đang tải danh sách đơn hàng..." />;
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Quản lý Đơn hàng & POS" description="Theo dõi quy trình phục vụ, đơn tại bàn, thanh toán và in hoá đơn.">
        
          <Button onClick={() => navigate('/orders/create')} className="gap-2 shadow-md">
            <Plus className="h-4 w-4" />
            Tạo đơn mới (POS)
          </Button>
        
      </PageHeader>

      {/* Search & Select Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-card p-4 rounded-xl border">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm theo mã đơn, bàn, tên khách..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="w-56">
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">-- Tất cả trạng thái --</option>
              <option value="OPEN">Đang mở (OPEN)</option>
              <option value="SERVED">Đã phục vụ (SERVED)</option>
              <option value="PAID">Đã thanh toán (PAID)</option>
              <option value="CANCEL">Đã hủy (CANCEL)</option>
            </Select>
          </div>
          {search && (
            <Button variant="ghost" size="sm" onClick={() => setSearch('')}>
              Xóa tìm
            </Button>
          )}
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <EmptyState
          title="Không tìm thấy đơn hàng"
          description={search ? "Không có đơn hàng nào khớp với từ khóa tìm kiếm." : "Hiện chưa có đơn hàng nào trong hệ thống."}
          actionText="Tạo mới ngay"
          onAction={() => navigate('/orders/create')}
        />
      ) : (
        <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead className="w-20">Mã Đơn</TableHead>
                <TableHead>Bàn ăn</TableHead>
                <TableHead>Khách hàng</TableHead>
                <TableHead>Thời gian</TableHead>
                <TableHead>Tổng tiền</TableHead>
                <TableHead>Nguồn</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => (
                <TableRow key={order.id} className="hover:bg-muted/30">
                  <TableCell className="font-mono font-bold text-xs">#{order.id}</TableCell>
                  <TableCell className="font-semibold">{order.tableNumber || 'Mang đi'}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{order.customerName || 'Khách vãng lai'}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{formatDateTime(order.orderTime)}</TableCell>
                  <TableCell className="font-bold text-primary">{formatVND(order.totalAmount)}</TableCell>
                  <TableCell>
                    <span className="text-[11px] px-2 py-0.5 rounded-full font-bold bg-muted text-foreground">
                      {order.source}
                    </span>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={order.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* View Details Dialog Button */}
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0"
                        title="Xem chi tiết đơn"
                        onClick={() => setSelectedOrder(order)}
                      >
                        <Eye className="h-4 w-4 text-primary" />
                      </Button>

                      {order.status === 'OPEN' && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 text-xs font-semibold text-blue-600 border-blue-200 hover:bg-blue-50"
                          onClick={() => completeMutation.mutate(order.id)}
                        >
                          <Check className="h-3.5 w-3.5 mr-1" /> Phục vụ
                        </Button>
                      )}

                      {order.status === 'SERVED' && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 text-xs font-semibold text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                          onClick={() => payMutation.mutate(order.id)}
                        >
                          <CreditCard className="h-3.5 w-3.5 mr-1" /> Thu tiền
                        </Button>
                      )}

                      {order.status !== 'PAID' && order.status !== 'CANCEL' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10"
                          title="Hủy đơn hàng"
                          onClick={() => setConfirmCancelId(order.id)}
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      )}

                      <Link to={`/orders/invoice/${order.id}`}>
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-muted-foreground" title="In hóa đơn">
                          <Printer className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Order Detail Modal Dialog */}
      <Dialog
        open={!!selectedOrder}
        onOpenChange={(open) => !open && setSelectedOrder(null)}
        title={`Chi tiết Đơn hàng #${selectedOrder?.id || ''}`}
        description={`Bàn: ${selectedOrder?.tableNumber || 'Mang đi'} • Khách: ${selectedOrder?.customerName || 'Vãng lai'}`}
      >
        {selectedOrder && (
          <div className="space-y-4">
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40 text-xs">
                    <TableHead>Món ăn</TableHead>
                    <TableHead className="text-center">Số lượng</TableHead>
                    <TableHead className="text-right">Đơn giá</TableHead>
                    <TableHead className="text-right">Thành tiền</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedOrder.items?.map((item, idx) => (
                    <TableRow key={idx} className="text-xs">
                      <TableCell className="font-semibold">{item.menuName || `Món #${item.menuId}`}</TableCell>
                      <TableCell className="text-center font-bold">{item.qty}</TableCell>
                      <TableCell className="text-right">{formatVND(item.price)}</TableCell>
                      <TableCell className="text-right font-bold">{formatVND(item.subtotal || item.price * item.qty)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="space-y-1.5 text-xs text-right border-t pt-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tạm tính:</span>
                <span className="font-medium">{formatVND(selectedOrder.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Giảm giá:</span>
                <span className="text-emerald-600 font-medium">-{formatVND(selectedOrder.discount || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Thuế VAT ({selectedOrder.vatRate || 8}%):</span>
                <span>{formatVND((selectedOrder.subtotal * (selectedOrder.vatRate || 8)) / 100)}</span>
              </div>
              <div className="flex justify-between text-base font-black border-t pt-2 text-primary">
                <span>Tổng thanh toán:</span>
                <span>{formatVND(selectedOrder.totalAmount)}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" className="gap-1.5 text-purple-600 border-purple-200" onClick={() => { handleOpenSplit(selectedOrder); setSelectedOrder(null); }}>
                <Split className="h-4 w-4" /> Tách đơn
              </Button>
              <Link to={`/orders/invoice/${selectedOrder.id}`}>
                <Button variant="outline" size="sm" className="gap-1.5">
                  <Printer className="h-4 w-4" /> Xem & In hóa đơn
                </Button>
              </Link>
              <Button size="sm" onClick={() => setSelectedOrder(null)}>
                Đóng
              </Button>
            </div>
          </div>
        )}
      </Dialog>

      
      {/* Split Order Dialog */}
      <Dialog
        open={splitModalOrder !== null}
        onOpenChange={(open) => !open && setSplitModalOrder(null)}
        title={`Tách Đơn Hàng #${splitModalOrder?.id || ''}`}
        description="Chọn số lượng từng món muốn tách ra để tạo hóa đơn thanh toán riêng."
        className="max-w-lg"
      >
        {splitModalOrder && (
          <div className="space-y-4">
            <div className="p-3 bg-muted rounded-xl text-xs flex justify-between items-center">
              <span>Bàn: <strong>{splitModalOrder.tableNumber || 'Mang đi'}</strong></span>
              <span>Tổng tiền hiện tại: <strong>{formatVND(splitModalOrder.totalAmount)}</strong></span>
            </div>

            <div className="border rounded-xl divide-y max-h-60 overflow-y-auto">
              {(splitModalOrder.items || []).map((item, idx) => {
                const currentSplit = splitQuantities[idx] || 0;
                return (
                  <div key={idx} className="p-3 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-sm">{item.menuName || `Món #${item.menuId}`}</p>
                      <p className="text-muted-foreground">{formatVND(item.price)} • Tổng có: {item.qty} phần</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-muted-foreground">Tách:</span>
                      <div className="flex items-center gap-1 border rounded-lg p-0.5">
                        <button
                          type="button"
                          className="h-6 w-6 rounded flex items-center justify-center hover:bg-muted font-bold"
                          onClick={() => setSplitQuantities((prev) => ({ ...prev, [idx]: Math.max(0, currentSplit - 1) }))}
                        >
                          -
                        </button>
                        <span className="w-6 text-center font-bold">{currentSplit}</span>
                        <button
                          type="button"
                          className="h-6 w-6 rounded flex items-center justify-center hover:bg-muted font-bold"
                          onClick={() => setSplitQuantities((prev) => ({ ...prev, [idx]: Math.min(item.qty, currentSplit + 1) }))}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Split Summary */}
            <div className="p-3 bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900 rounded-xl text-xs space-y-1">
              <div className="flex justify-between">
                <span>Số món tách ra đơn mới:</span>
                <span className="font-bold text-purple-600">
                  {Object.values(splitQuantities).reduce((s, q) => s + q, 0)} phần
                </span>
              </div>
              <div className="flex justify-between font-bold text-sm text-purple-700 dark:text-purple-300 border-t border-purple-200 pt-1">
                <span>Thành tiền đơn mới:</span>
                <span>
                  {formatVND(
                    (splitModalOrder.items || []).reduce(
                      (sum, item, idx) => sum + item.price * (splitQuantities[idx] || 0),
                      0
                    )
                  )}
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <Button variant="outline" onClick={() => setSplitModalOrder(null)}>
                Hủy
              </Button>
              <Button
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold"
                onClick={handleConfirmSplit}
              >
                <Split className="h-4 w-4 mr-1.5" />
                Xác Nhận Tách Đơn Mới
              </Button>
            </div>
          </div>
        )}
      </Dialog>

      {/* Cancel Order Confirm Dialog */}
      <ConfirmDialog
        open={confirmCancelId !== null}
        onOpenChange={(open) => !open && setConfirmCancelId(null)}
        title="Hủy đơn hàng"
        description="Bạn có chắc chắn muốn hủy đơn hàng này không? Món ăn sẽ không được tiếp tục phục vụ."
        confirmText="Xác nhận hủy đơn"
        cancelText="Quay lại"
        isDanger={true}
        onConfirm={() => {
          if (confirmCancelId) cancelMutation.mutate(confirmCancelId);
        }}
      />
    </div>
  );
}
