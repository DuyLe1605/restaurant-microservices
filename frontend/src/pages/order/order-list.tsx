import * as React from 'react';
import { useOrders, useCompleteOrder, usePayOrder, useCancelOrder, useSplitOrder } from '@/hooks/use-orders';
import { PageHeader } from '@/components/shared/page-header';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { EmptyState } from '@/components/shared/empty-state';
import { StatusBadge } from '@/components/shared/status-badge';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { formatVND } from '@/lib/format-currency';
import { formatDate, formatDateTime } from '@/lib/format-date';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Dialog } from '@/components/ui/dialog';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Plus, Check, CreditCard, XCircle, Printer, Search, Eye, Split, Download, Calendar, RotateCcw, MoreHorizontal, User, Phone, Tag, Percent, FileText, Crown, Award, Coins, UserPlus, RefreshCw, Users } from 'lucide-react';
import { toast } from 'sonner';
import { OrderStatus, SaleOrder } from '@/types/order';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth-store';
import { exportToExcel, printProfessionalReport } from '@/lib/export-utils';
import { orderApi } from '@/api/order.api';
import { cn } from '@/lib/utils';
import { DropdownMenu, DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { ExportDropdown } from '@/components/shared/export-dropdown';
import { useCustomerLookup, useRegisterCustomer } from '@/hooks/use-customers';
import { Customer } from '@/api/customer.api';

export function OrderListPage() {
  const { user } = useAuthStore();
  const canCancel = user?.role === 'ADMIN' || user?.role === 'MANAGER';
  const [searchParams, setSearchParams] = useSearchParams();
  const urlOrderId = searchParams.get('orderId');
  const urlTableId = searchParams.get('tableId');
  const openedRef = React.useRef<string | null>(null);

  const [search, setSearch] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<string>('');
  const [startDate, setStartDate] = React.useState('');
  const [endDate, setEndDate] = React.useState('');
  const [page, setPage] = React.useState(0);
  const navigate = useNavigate();

  const { data, isLoading } = useOrders({ status: (statusFilter as OrderStatus) || undefined, page, size: 50 });
  const completeMutation = useCompleteOrder();
  const payMutation = usePayOrder();
  const cancelMutation = useCancelOrder();
  const splitMutation = useSplitOrder();

  const [confirmCancelId, setConfirmCancelId] = React.useState<number | null>(null);
  const [selectedOrder, setSelectedOrder] = React.useState<SaleOrder | null>(null);
  const [splitModalOrder, setSplitModalOrder] = React.useState<SaleOrder | null>(null);
  const [splitQuantities, setSplitQuantities] = React.useState<Record<number, number>>({});
  const [splitCustomerName, setSplitCustomerName] = React.useState('');
  const [splitCustomerPhone, setSplitCustomerPhone] = React.useState('');
  const [splitDiscount, setSplitDiscount] = React.useState<number | string>(0);
  const [splitVatRate, setSplitVatRate] = React.useState<number | string>(0);
  const [splitNote, setSplitNote] = React.useState('');

  // Split Order - Customer Loyalty & Membership state
  const [splitCustomerMode, setSplitCustomerMode] = React.useState<'WALK_IN' | 'MEMBER'>('WALK_IN');
  const [splitMemberPhone, setSplitMemberPhone] = React.useState('');
  const [splitActiveMember, setSplitActiveMember] = React.useState<Customer | null>(null);
  const [splitShowRegister, setSplitShowRegister] = React.useState(false);
  const [splitNewName, setSplitNewName] = React.useState('');
  const [splitNewEmail, setSplitNewEmail] = React.useState('');

  const splitRegisterMutation = useRegisterCustomer();
  const {
    data: splitQueriedCustomer,
    isFetching: isSplitSearching,
  } = useCustomerLookup(splitMemberPhone, splitCustomerMode === 'MEMBER' && splitMemberPhone.trim().length >= 9);

  React.useEffect(() => {
    if (splitQueriedCustomer) {
      setSplitActiveMember(splitQueriedCustomer);
      setSplitCustomerName(splitQueriedCustomer.name);
      setSplitCustomerPhone(splitQueriedCustomer.phone);
      setSplitShowRegister(false);
    }
  }, [splitQueriedCustomer]);

  // Auto-open order details modal if navigated from Table Map (orderId or tableId in URL)
  React.useEffect(() => {
    if (urlOrderId && openedRef.current !== `order-${urlOrderId}`) {
      openedRef.current = `order-${urlOrderId}`;
      const idNum = Number(urlOrderId);
      if (!isNaN(idNum)) {
        orderApi
          .getById(idNum)
          .then((order) => {
            if (order) setSelectedOrder(order);
          })
          .catch((err) => {
            console.error('Không tìm thấy đơn hàng theo URL:', err);
          });
      }
    } else if (!urlOrderId && urlTableId && openedRef.current !== `table-${urlTableId}`) {
      const raw = data?.content || (Array.isArray(data) ? data : []);
      if (raw.length > 0) {
        openedRef.current = `table-${urlTableId}`;
        const tId = Number(urlTableId);
        const match =
          raw.find((o) => o.tableId === tId && (o.status === 'OPEN' || o.status === 'SERVED')) ||
          raw.find((o) => o.tableId === tId);
        if (match) {
          orderApi
            .getById(match.id)
            .then((order) => {
              if (order) setSelectedOrder(order);
            })
            .catch(() => setSelectedOrder(match));
        }
      }
    }
  }, [urlOrderId, urlTableId, data]);

  const handleCloseDetailDialog = () => {
    setSelectedOrder(null);
    if (searchParams.has('orderId') || searchParams.has('tableId')) {
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('orderId');
      newParams.delete('tableId');
      setSearchParams(newParams, { replace: true });
    }
  };

  // Preset Handlers
  const setFilterToday = () => {
    const today = new Date().toISOString().split('T')[0];
    setStartDate(today);
    setEndDate(today);
  };

  const setFilter7Days = () => {
    const today = new Date();
    const past = new Date(today);
    past.setDate(today.getDate() - 6);
    setStartDate(past.toISOString().split('T')[0]);
    setEndDate(today.toISOString().split('T')[0]);
  };

  const setFilterMonth = () => {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    setStartDate(firstDay.toISOString().split('T')[0]);
    setEndDate(today.toISOString().split('T')[0]);
  };

  const setFilterAll = () => {
    setStartDate('');
    setEndDate('');
    setStatusFilter('');
    setSearch('');
  };

  const isSingleDay = Boolean(startDate && endDate && startDate === endDate);
  const datePeriodLabel = React.useMemo(() => {
    if (startDate && endDate) {
      return startDate === endDate ? `Ngày ${formatDate(startDate)}` : `Từ ngày ${formatDate(startDate)} đến ngày ${formatDate(endDate)}`;
    }
    if (startDate) return `Từ ngày ${formatDate(startDate)}`;
    if (endDate) return `Đến ngày ${formatDate(endDate)}`;
    return 'Toàn bộ thời gian';
  }, [startDate, endDate]);

  const handleOpenSplit = (order: SaleOrder) => {
    const init: Record<number, number> = {};
    (order.items || []).forEach((_, idx) => {
      init[idx] = 0;
    });
    setSplitQuantities(init);
    setSplitCustomerName(order.customerName ? `${order.customerName} (Tách)` : '');
    setSplitCustomerPhone(order.customerPhone || '');
    setSplitCustomerMode(order.customerPhone ? 'MEMBER' : 'WALK_IN');
    setSplitMemberPhone(order.customerPhone || '');
    setSplitActiveMember(null);
    setSplitShowRegister(false);
    setSplitNewName('');
    setSplitNewEmail('');
    setSplitDiscount(0);
    setSplitVatRate(order.vatRate || 0);
    setSplitNote('');
    setSplitModalOrder(order);
  };

  const handleSplitQuickRegister = () => {
    if (!splitNewName.trim()) {
      toast.error('Vui lòng nhập họ tên khách hàng');
      return;
    }
    const phone = splitMemberPhone.trim();
    if (!phone || phone.length < 9) {
      toast.error('Vui lòng nhập số điện thoại hợp lệ');
      return;
    }
    splitRegisterMutation.mutate(
      { name: splitNewName.trim(), phone, email: splitNewEmail.trim() || undefined },
      {
        onSuccess: (newCust) => {
          setSplitActiveMember(newCust);
          setSplitCustomerName(newCust.name);
          setSplitCustomerPhone(newCust.phone);
          setSplitShowRegister(false);
          setSplitNewName('');
          setSplitNewEmail('');
        },
      }
    );
  };

  const handleConfirmSplit = () => {
    if (!splitModalOrder) return;
    const splitItems = (splitModalOrder.items || [])
      .map((item, idx) => ({
        menuId: item.menuId,
        qty: splitQuantities[idx] || 0,
        note: item.note,
      }))
      .filter((i) => i.qty > 0);

    if (splitItems.length === 0) {
      toast.error('Vui lòng chọn ít nhất 1 món để tách đơn!');
      return;
    }

    splitMutation.mutate(
      {
        id: splitModalOrder.id,
        payload: {
          customerName: splitCustomerName.trim() || undefined,
          customerPhone: splitCustomerPhone.trim() || undefined,
          discount: Number(splitDiscount) || 0,
          vatRate: Number(splitVatRate) || 0,
          note: splitNote.trim() || undefined,
          items: splitItems,
        },
      },
      {
        onSuccess: () => {
          setSplitModalOrder(null);
        },
      }
    );
  };

  const rawOrders: SaleOrder[] = data?.content || (Array.isArray(data) ? data : []);

  // Filter client-side by search query and dates
  const filteredOrders = React.useMemo(() => {
    return rawOrders.filter((order) => {
      const matchSearch =
        !search ||
        (order.id && String(order.id).includes(search)) ||
        (order.tableNumber && order.tableNumber.toLowerCase().includes(search.toLowerCase())) ||
        (order.customerName && order.customerName.toLowerCase().includes(search.toLowerCase()));

      const matchStatus = !statusFilter || order.status === statusFilter;

      const orderDate = (order.createdAt || order.orderTime || '').split('T')[0];
      const matchStart = !startDate || (orderDate && orderDate >= startDate);
      const matchEnd = !endDate || (orderDate && orderDate <= endDate);

      return matchSearch && matchStatus && matchStart && matchEnd;
    });
  }, [rawOrders, search, statusFilter, startDate, endDate]);

  const handleExportExcel = () => {
    if (filteredOrders.length === 0) return;
    const totalRev = filteredOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const fileSuffix = isSingleDay
      ? `Ngay_${startDate}`
      : startDate && endDate
      ? `${startDate}_den_${endDate}`
      : 'Toan_Bo';
    const sheetTitle = isSingleDay
      ? `BÁO CÁO DANH SÁCH ĐƠN HÀNG NGÀY ${formatDate(startDate)}`
      : startDate && endDate
      ? `BÁO CÁO DANH SÁCH ĐƠN HÀNG (TỪ ${formatDate(startDate)} ĐẾN ${formatDate(endDate)})`
      : 'BÁO CÁO DANH SÁCH ĐƠN HÀNG VÀ DOANH SỐ';

    const excelData = filteredOrders.map((o, idx) => ({
      stt: idx + 1,
      id: `DH-#${o.id}`,
      table: o.tableNumber || 'Mang về',
      customer: o.customerName || 'Khách vãng lai',
      time: formatDateTime(o.createdAt || o.orderTime),
      status: o.status,
      amount: formatVND(o.totalAmount || 0),
    }));

    exportToExcel(
      `Bao_Cao_Don_Hang_${fileSuffix}`,
      sheetTitle,
      [
        { header: 'STT', key: 'stt' },
        { header: 'Mã Đơn', key: 'id' },
        { header: 'Bàn', key: 'table' },
        { header: 'Khách Hàng', key: 'customer' },
        { header: 'Thời Gian', key: 'time' },
        { header: 'Trạng Thái', key: 'status' },
        { header: 'Tổng Tiền (VNĐ)', key: 'amount' },
      ],
      excelData,
      [
        { label: 'Tổng số đơn hàng', value: `${filteredOrders.length} đơn` },
        { label: 'TỔNG CỘNG DOANH SỐ BÁN', value: formatVND(totalRev) },
      ],
      {
        'Kỳ thống kê': datePeriodLabel,
        'Trạng thái lọc': statusFilter || 'Tất cả trạng thái',
        'Bộ phận lập': 'Hệ thống Quản lý Nhà hàng POS',
      }
    );
  };

  const handlePrintOrderReport = () => {
    if (filteredOrders.length === 0) return;
    const totalRev = filteredOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const paidCount = filteredOrders.filter((o) => o.status === 'PAID').length;
    const openCount = filteredOrders.filter((o) => o.status === 'OPEN' || o.status === 'SERVED').length;
    const printTitle = isSingleDay
      ? `BÁO CÁO DOANH SỐ ĐƠN HÀNG NGÀY ${formatDate(startDate)}`
      : 'BÁO CÁO TỔNG HỢP DOANH SỐ ĐƠN HÀNG';

    printProfessionalReport({
      title: printTitle,
      subtitle: `Kỳ báo cáo: ${datePeriodLabel} - Tổng số: ${filteredOrders.length} đơn hàng`,
      reportPeriod: datePeriodLabel,
      preparedBy: 'Thu ngân ca trực',
      kpis: [
        { label: 'Tổng doanh thu', value: formatVND(totalRev), color: '#16a34a' },
        { label: 'Tổng số đơn', value: `${filteredOrders.length} đơn`, color: '#0284c7' },
        { label: 'Đã thanh toán', value: `${paidCount} đơn`, color: '#16a34a' },
        { label: 'Đang phục vụ', value: `${openCount} đơn`, color: '#d97706' },
      ],
      columns: [
        { header: 'STT', key: 'stt', align: 'center' },
        { header: 'Mã Đơn', key: 'id', align: 'left' },
        { header: 'Bàn ăn', key: 'table', align: 'center' },
        { header: 'Khách hàng', key: 'customer', align: 'left' },
        { header: 'Thời gian đặt', key: 'time', align: 'left' },
        { header: 'Trạng thái', key: 'status', align: 'center' },
        { header: 'Tổng tiền', key: 'amount', align: 'right' },
      ],
      data: filteredOrders.map((o, idx) => ({
        stt: idx + 1,
        id: `DH-#${o.id}`,
        table: o.tableNumber || 'Mang về',
        customer: o.customerName || 'Khách vãng lai',
        time: formatDateTime(o.createdAt || o.orderTime),
        status: o.status,
        amount: formatVND(o.totalAmount || 0),
      })),
      summary: [
        { label: 'TỔNG CỘNG DOANH SỐ', value: formatVND(totalRev) },
      ],
      signatures: ['Thu Ngân Ca Trực', 'Quản Lý Nhà Hàng', 'Giám Đốc Điều Hành'],
    });
  };

  if (isLoading) {
    return <LoadingSpinner text="Đang tải danh sách đơn hàng..." />;
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Quản lý Đơn hàng & POS" description="Theo dõi quy trình phục vụ, đơn tại bàn, thanh toán và in hoá đơn.">
        <div className="flex items-center gap-2.5">
          <ExportDropdown
            onExportExcel={filteredOrders.length > 0 ? handleExportExcel : undefined}
            onPrintReport={filteredOrders.length > 0 ? handlePrintOrderReport : undefined}
            excelLabel="Xuất danh sách đơn hàng (.xlsx)"
            printLabel="In sổ doanh số & đơn hàng (A4)"
            disabled={isLoading || filteredOrders.length === 0}
            buttonText="Xuất & In doanh số"
          />
          <Button onClick={() => navigate('/orders/create')} className="gap-2 shadow-xs font-semibold">
            <Plus className="h-4 w-4" />
            Tạo đơn mới (POS)
          </Button>
        </div>
      </PageHeader>

      {/* Date & Filter Toolbar */}
      <div className="bg-card border rounded-2xl p-4 shadow-sm space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b">
          <div className="flex items-center gap-2 text-sm font-bold text-foreground">
            <Calendar className="h-4 w-4 text-primary" />
            <span>Khoảng thời gian:</span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary">
              {datePeriodLabel}
            </span>
          </div>

          {/* Quick Preset Buttons */}
          <div className="flex flex-wrap items-center gap-1.5">
            <Button
              variant={isSingleDay && startDate === new Date().toISOString().split('T')[0] ? 'default' : 'outline'}
              size="sm"
              onClick={setFilterToday}
              className="text-xs h-7"
            >
              Hôm nay
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={setFilter7Days}
              className="text-xs h-7"
            >
              7 ngày qua
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={setFilterMonth}
              className="text-xs h-7"
            >
              Tháng này
            </Button>
            <Button
              variant={!startDate && !endDate ? 'secondary' : 'outline'}
              size="sm"
              onClick={setFilterAll}
              className="text-xs h-7 gap-1"
            >
              <RotateCcw className="h-3 w-3" />
              Tất cả
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-1">
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1 block">Từ ngày:</label>
            <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1 block">Đến ngày:</label>
            <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1 block">Trạng thái đơn:</label>
            <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">-- Tất cả trạng thái --</option>
              <option value="OPEN">Đang mở (OPEN)</option>
              <option value="SERVED">Đã phục vụ (SERVED)</option>
              <option value="PAID">Đã thanh toán (PAID)</option>
              <option value="CANCEL">Đã hủy (CANCEL)</option>
            </Select>
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1 block">Tìm kiếm đơn:</label>
            <div className="relative">
              <Input
                placeholder="Mã đơn, bàn, tên khách..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8"
              />
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            </div>
          </div>
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
              {filteredOrders.map((order) => {
                const isTarget =
                  (urlOrderId && String(order.id) === urlOrderId) ||
                  (urlTableId && String(order.tableId) === urlTableId);
                return (
                  <TableRow
                    key={order.id}
                    className={cn(
                      'hover:bg-muted/30 transition-colors',
                      isTarget && 'bg-primary/10 border-l-4 border-l-primary font-medium'
                    )}
                  >
                    <TableCell>
                      <button
                        type="button"
                        className="font-mono font-bold text-xs text-primary hover:underline cursor-pointer"
                        title="Bấm để xem chi tiết đơn"
                        onClick={() => setSelectedOrder(order)}
                      >
                        #{order.id}
                      </button>
                    </TableCell>
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
                      <DropdownMenu
                        align="end"
                        trigger={
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground"
                            title="Thao tác"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Thao tác</span>
                          </Button>
                        }
                      >
                        <DropdownMenuItem
                          icon={<Eye className="h-4 w-4 text-primary" />}
                          onClick={() => setSelectedOrder(order)}
                        >
                          Xem chi tiết đơn
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          icon={<Printer className="h-4 w-4 text-blue-600 dark:text-blue-400" />}
                          onClick={() => navigate(`/orders/invoice/${order.id}`)}
                        >
                          In hóa đơn
                        </DropdownMenuItem>

                        {order.status === 'OPEN' && (
                          <DropdownMenuItem
                            variant="default"
                            icon={<Check className="h-4 w-4 text-blue-600" />}
                            onClick={() => completeMutation.mutate(order.id)}
                          >
                            Phục vụ xong
                          </DropdownMenuItem>
                        )}

                        {order.status === 'SERVED' && (
                          <DropdownMenuItem
                            variant="success"
                            icon={<CreditCard className="h-4 w-4 text-emerald-600" />}
                            onClick={() => payMutation.mutate(order.id)}
                          >
                            Thu tiền ({formatVND(order.totalAmount)})
                          </DropdownMenuItem>
                        )}

                        {order.status !== 'PAID' && order.status !== 'CANCEL' && canCancel && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              variant="danger"
                              icon={<XCircle className="h-4 w-4 text-rose-600" />}
                              onClick={() => setConfirmCancelId(order.id)}
                            >
                              Hủy đơn hàng
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Order Detail Modal Dialog */}
      <Dialog
        open={!!selectedOrder}
        onOpenChange={(open) => !open && handleCloseDetailDialog()}
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

            <div className="flex items-center justify-between gap-2 pt-2 border-t">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 text-purple-600 border-purple-200 hover:bg-purple-50"
                  onClick={() => {
                    handleOpenSplit(selectedOrder);
                    setSelectedOrder(null);
                  }}
                >
                  <Split className="h-4 w-4" /> Tách đơn
                </Button>
                <Link to={`/orders/invoice/${selectedOrder.id}`}>
                  <Button variant="outline" size="sm" className="gap-1.5">
                    <Printer className="h-4 w-4" /> In hóa đơn
                  </Button>
                </Link>
              </div>

              <div className="flex items-center gap-2">
                {selectedOrder.status === 'OPEN' && (
                  <Button
                    size="sm"
                    className="gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                    isLoading={completeMutation.isPending}
                    onClick={() => {
                      completeMutation.mutate(selectedOrder.id);
                      handleCloseDetailDialog();
                    }}
                  >
                    <Check className="h-4 w-4" /> Phục vụ xong
                  </Button>
                )}
                {selectedOrder.status === 'SERVED' && (
                  <Button
                    size="sm"
                    className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                    isLoading={payMutation.isPending}
                    onClick={() => {
                      payMutation.mutate(selectedOrder.id);
                      handleCloseDetailDialog();
                    }}
                  >
                    <CreditCard className="h-4 w-4" /> Thu tiền ({formatVND(selectedOrder.totalAmount)})
                  </Button>
                )}
                <Button size="sm" variant="secondary" onClick={handleCloseDetailDialog}>
                  Đóng
                </Button>
              </div>
            </div>
          </div>
        )}
      </Dialog>

      
      {/* Split Order Dialog */}
      <Dialog
        open={splitModalOrder !== null}
        onOpenChange={(open) => !open && setSplitModalOrder(null)}
        title={`Tách Đơn Hàng #${splitModalOrder?.id || ''}`}
        description="Chọn món và điền thông tin để tách thành đơn hàng mới độc lập."
        className="max-w-xl max-h-[90vh] overflow-y-auto"
      >
        {splitModalOrder && (() => {
          const splitSubtotal = (splitModalOrder.items || []).reduce(
            (sum, item, idx) => sum + item.price * (splitQuantities[idx] || 0),
            0
          );
          const discountVal = Number(splitDiscount) || 0;
          const vatRateVal = Number(splitVatRate) || 0;
          const taxableVal = Math.max(0, splitSubtotal - discountVal);
          const vatVal = Math.round(taxableVal * (vatRateVal / 100));
          const totalVal = taxableVal + vatVal;
          const totalSplitCount = Object.values(splitQuantities).reduce((s, q) => s + q, 0);

          return (
            <div className="space-y-4 pt-1">
              {/* Order Info Badge */}
              <div className="p-3 bg-muted/60 border rounded-xl text-xs flex justify-between items-center">
                <span>Bàn hiện tại: <strong className="text-foreground">{splitModalOrder.tableNumber || 'Mang đi'}</strong></span>
                <span>Tổng đơn gốc: <strong className="text-foreground">{formatVND(splitModalOrder.totalAmount)}</strong></span>
              </div>

              {/* Thông tin đơn mới & Hội viên */}
              <div className="p-3.5 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5 text-purple-600" /> Khách hàng đơn mới
                  </p>
                  {/* Mode switcher: Walk-in vs Member */}
                  <div className="flex items-center rounded-lg p-0.5 bg-muted border text-[10px] font-semibold">
                    <button
                      type="button"
                      onClick={() => {
                        setSplitCustomerMode('WALK_IN');
                        setSplitActiveMember(null);
                        setSplitMemberPhone('');
                      }}
                      className={cn(
                        'px-2 py-0.5 rounded-md transition-all',
                        splitCustomerMode === 'WALK_IN'
                          ? 'bg-background text-foreground shadow-xs font-bold'
                          : 'text-muted-foreground hover:text-foreground'
                      )}
                    >
                      Khách Vãng Lai
                    </button>
                    <button
                      type="button"
                      onClick={() => setSplitCustomerMode('MEMBER')}
                      className={cn(
                        'px-2 py-0.5 rounded-md transition-all flex items-center gap-1',
                        splitCustomerMode === 'MEMBER'
                          ? 'bg-purple-600 text-white shadow-xs font-bold'
                          : 'text-muted-foreground hover:text-foreground'
                      )}
                    >
                      <Crown className="h-3 w-3" />
                      Hội Viên
                    </button>
                  </div>
                </div>

                {/* Mode Walk-in */}
                {splitCustomerMode === 'WALK_IN' && (
                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                        Tên khách hàng
                      </label>
                      <div className="relative">
                        <User className="h-3.5 w-3.5 absolute left-2.5 top-2.5 text-muted-foreground" />
                        <Input
                          className="h-8 text-xs pl-8"
                          placeholder="Nhập tên khách hàng..."
                          value={splitCustomerName}
                          onChange={(e) => setSplitCustomerName(e.target.value)}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                        Số điện thoại
                      </label>
                      <div className="relative">
                        <Phone className="h-3.5 w-3.5 absolute left-2.5 top-2.5 text-muted-foreground" />
                        <Input
                          className="h-8 text-xs pl-8"
                          placeholder="09xx xxx xxx..."
                          value={splitCustomerPhone}
                          onChange={(e) => setSplitCustomerPhone(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Mode Member */}
                {splitCustomerMode === 'MEMBER' && (
                  <div className="space-y-2">
                    {!splitActiveMember ? (
                      <div className="space-y-2">
                        <div className="relative">
                          <Input
                            className="h-8 text-xs pl-8 font-medium"
                            placeholder="Nhập SĐT hội viên (ví dụ: 0988776655)..."
                            value={splitMemberPhone}
                            onChange={(e) => {
                              setSplitMemberPhone(e.target.value);
                              if (splitShowRegister) setSplitShowRegister(false);
                            }}
                          />
                          <Phone className="h-3.5 w-3.5 absolute left-2.5 top-2.5 text-muted-foreground" />
                          {isSplitSearching && (
                            <RefreshCw className="h-3.5 w-3.5 absolute right-2.5 top-2.5 animate-spin text-purple-600" />
                          )}
                        </div>

                        {splitMemberPhone.trim().length >= 9 && !isSplitSearching && !splitQueriedCustomer && (
                          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] font-medium text-amber-700 dark:text-amber-400">
                                Chưa có hội viên với SĐT này
                              </span>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setSplitShowRegister(!splitShowRegister)}
                                className="h-6 text-[10px] px-2 font-bold border-amber-500/30 text-amber-800 dark:text-amber-300 hover:bg-amber-500/20"
                              >
                                <UserPlus className="h-3 w-3 mr-1" />
                                {splitShowRegister ? 'Đóng' : 'Đăng ký nhanh'}
                              </Button>
                            </div>

                            {splitShowRegister && (
                              <div className="space-y-1.5 pt-1 border-t border-amber-500/20">
                                <Input
                                  placeholder="Họ tên khách hàng (*)..."
                                  value={splitNewName}
                                  onChange={(e) => setSplitNewName(e.target.value)}
                                  className="text-xs h-7.5 bg-background"
                                />
                                <Input
                                  placeholder="Email (tuỳ chọn)..."
                                  value={splitNewEmail}
                                  onChange={(e) => setSplitNewEmail(e.target.value)}
                                  className="text-xs h-7.5 bg-background"
                                />
                                <Button
                                  size="sm"
                                  disabled={splitRegisterMutation.isPending || !splitNewName.trim()}
                                  onClick={handleSplitQuickRegister}
                                  className="w-full h-7 text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white"
                                >
                                  {splitRegisterMutation.isPending ? 'Đang tạo...' : 'Tạo & Chọn Hội Viên Ngay'}
                                </Button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ) : (
                      /* Active Member Banner */
                      <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/25 space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-extrabold text-foreground mr-1.5">{splitActiveMember.name}</span>
                            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full border bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300 border-purple-300">
                              {splitActiveMember.tierLabel} • {splitActiveMember.points} điểm
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setSplitActiveMember(null);
                              setSplitMemberPhone('');
                              setSplitCustomerName('');
                              setSplitCustomerPhone('');
                            }}
                            className="text-[10px] text-muted-foreground hover:text-destructive underline"
                          >
                            Đổi khách
                          </button>
                        </div>

                        {splitActiveMember.discountPercent > 0 && (
                          <button
                            type="button"
                            onClick={() => {
                              const disc = Math.round(splitSubtotal * (splitActiveMember.discountPercent / 100));
                              setSplitDiscount(disc);
                              toast.success(`Đã áp dụng giảm ${splitActiveMember.discountPercent}% cho hội viên ${splitActiveMember.name}`);
                            }}
                            className="text-[10px] font-bold text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-900/30 px-2 py-0.5 rounded-md hover:underline"
                          >
                            🏷️ Áp dụng giảm {splitActiveMember.discountPercent}% hạng {splitActiveMember.tierLabel}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                      Giảm giá trực tiếp (VNĐ)
                    </label>
                    <div className="relative">
                      <Tag className="h-3.5 w-3.5 absolute left-2.5 top-2.5 text-muted-foreground" />
                      <Input
                        type="number"
                        min="0"
                        className="h-8 text-xs pl-8"
                        placeholder="0"
                        value={splitDiscount}
                        onChange={(e) => setSplitDiscount(Math.max(0, Number(e.target.value)))}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                      Thuế VAT (%)
                    </label>
                    <div className="relative">
                      <Percent className="h-3.5 w-3.5 absolute left-2.5 top-2.5 text-muted-foreground" />
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        className="h-8 text-xs pl-8"
                        placeholder="0"
                        value={splitVatRate}
                        onChange={(e) => setSplitVatRate(Math.min(100, Math.max(0, Number(e.target.value))))}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                    Ghi chú đơn mới
                  </label>
                  <div className="relative">
                    <FileText className="h-3.5 w-3.5 absolute left-2.5 top-2.5 text-muted-foreground" />
                    <Input
                      className="h-8 text-xs pl-8"
                      placeholder="Ghi chú yêu cầu của khách (ví dụ: Thanh toán thẻ, mang về...)"
                      value={splitNote}
                      onChange={(e) => setSplitNote(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Danh sách món chọn tách */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-bold text-foreground">
                    Chọn các món cần tách sang đơn mới:
                  </label>
                  <span className="text-[11px] text-muted-foreground">
                    Đã chọn: <strong className="text-purple-600">{totalSplitCount}</strong> phần
                  </span>
                </div>
                <div className="border rounded-xl divide-y max-h-52 overflow-y-auto">
                  {(splitModalOrder.items || []).map((item, idx) => {
                    const currentSplit = splitQuantities[idx] || 0;
                    return (
                      <div key={idx} className="p-2.5 flex items-center justify-between text-xs hover:bg-muted/30 transition-colors">
                        <div>
                          <p className="font-bold text-sm text-foreground">{item.menuName || `Món #${item.menuId}`}</p>
                          <p className="text-muted-foreground text-[11px]">{formatVND(item.price)} • Đơn gốc có: <strong>{item.qty}</strong></p>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-6 px-1.5 text-[10px] text-muted-foreground hover:text-foreground"
                            onClick={() => setSplitQuantities((prev) => ({ ...prev, [idx]: item.qty }))}
                          >
                            Tất cả
                          </Button>
                          <div className="flex items-center gap-1 border rounded-lg p-0.5 bg-background">
                            <button
                              type="button"
                              className="h-6 w-6 rounded flex items-center justify-center hover:bg-muted font-bold transition-colors"
                              onClick={() => setSplitQuantities((prev) => ({ ...prev, [idx]: Math.max(0, currentSplit - 1) }))}
                            >
                              -
                            </button>
                            <span className="w-6 text-center font-bold text-xs">{currentSplit}</span>
                            <button
                              type="button"
                              className="h-6 w-6 rounded flex items-center justify-center hover:bg-muted font-bold transition-colors"
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
              </div>

              {/* Bảng tổng kết giá trị đơn mới */}
              <div className="p-3 bg-purple-50/70 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900/50 rounded-xl text-xs space-y-1.5">
                <div className="flex justify-between text-muted-foreground">
                  <span>Tạm tính món tách:</span>
                  <span className="font-semibold text-foreground">{formatVND(splitSubtotal)}</span>
                </div>
                {discountVal > 0 && (
                  <div className="flex justify-between text-muted-foreground">
                    <span>Giảm giá:</span>
                    <span className="font-semibold text-emerald-600">-{formatVND(discountVal)}</span>
                  </div>
                )}
                {vatRateVal > 0 && (
                  <div className="flex justify-between text-muted-foreground">
                    <span>Thuế VAT ({vatRateVal}%):</span>
                    <span className="font-semibold text-foreground">+{formatVND(vatVal)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-sm text-purple-700 dark:text-purple-300 border-t border-purple-200 dark:border-purple-900/50 pt-1.5">
                  <span>TỔNG TIỀN ĐƠN MỚI:</span>
                  <span className="text-base">{formatVND(totalVal)}</span>
                </div>
              </div>

              {/* Thao tác */}
              <div className="flex justify-end gap-2 pt-2 border-t">
                <Button variant="outline" size="sm" onClick={() => setSplitModalOrder(null)}>
                  Hủy
                </Button>
                <Button
                  size="sm"
                  disabled={totalSplitCount === 0 || splitMutation.isPending}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-bold"
                  onClick={handleConfirmSplit}
                >
                  <Split className="h-4 w-4 mr-1.5" />
                  {splitMutation.isPending ? 'Đang tạo đơn...' : 'Xác Nhận Tách Đơn Mới'}
                </Button>
              </div>
            </div>
          );
        })()}
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
