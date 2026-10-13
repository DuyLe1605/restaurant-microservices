import * as React from 'react';
import { useCurrentShift, useShiftHistory, useOpenShift, useCloseShift, useShiftDetail } from '@/hooks/use-shifts';
import { PageHeader } from '@/components/shared/page-header';
import { formatVND } from '@/lib/format-currency';
import { formatDateTime } from '@/lib/format-date';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { useAuthStore } from '@/stores/auth-store';
import { WorkShiftDto } from '@/api/shift.api';
import {
  Clock, DollarSign, CreditCard, Wallet, Lock, Unlock, Printer,
  History, AlertCircle, CheckCircle2, MoreHorizontal, Eye, RefreshCw,
  TrendingUp, Users, Search,
} from 'lucide-react';
import { DropdownMenu, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export function ShiftManagePage() {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'MANAGER';

  const { data: currentShift, isLoading: loadingCurrent, refetch: refetchCurrent } = useCurrentShift();
  const { data: history = [], isLoading: loadingHistory, refetch: refetchHistory } = useShiftHistory();
  const openMutation = useOpenShift();
  const closeMutation = useCloseShift();

  // Open shift modal
  const [openModalOpen, setOpenModalOpen] = React.useState(false);
  const [cashierName, setCashierName] = React.useState(user?.fullname || '');
  const [openingCash, setOpeningCash] = React.useState<number>(2000000);

  // Close shift modal
  const [closeModalOpen, setCloseModalOpen] = React.useState(false);
  const [actualCash, setActualCash] = React.useState<number>(0);
  const [handoverNote, setHandoverNote] = React.useState('');

  // Detail modal
  const [detailShiftId, setDetailShiftId] = React.useState<number | null>(null);
  const { data: shiftDetail, isLoading: loadingDetail } = useShiftDetail(detailShiftId);

  // Search filter for history
  const [historySearch, setHistorySearch] = React.useState('');

  React.useEffect(() => {
    if (currentShift) setActualCash(currentShift.expectedCash);
  }, [currentShift]);

  const difference = currentShift ? actualCash - currentShift.expectedCash : 0;

  const handleOpenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    openMutation.mutate({ cashierName, openingCash }, { onSuccess: () => { setOpenModalOpen(false); refetchCurrent(); } });
  };

  const handleCloseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentShift) return;
    closeMutation.mutate({ actualCash, handoverNote }, {
      onSuccess: () => { setCloseModalOpen(false); refetchCurrent(); refetchHistory(); setHandoverNote(''); },
    });
  };

  if (loadingCurrent) return <div className="flex justify-center p-20"><LoadingSpinner /></div>;

  return (
    <div className="space-y-6 p-6 max-w-6xl mx-auto">
      <PageHeader
        title="Quản Lý Ca Làm Việc & Chốt Két"
        description="Kiểm soát tiền mặt đầu ca, doanh thu thực tế, chốt két bàn giao và in phiếu kết ca"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => { refetchCurrent(); refetchHistory(); }}>
              <RefreshCw className="h-4 w-4" />
            </Button>
            {currentShift ? (
              <>
                <Button variant="outline" size="sm" onClick={() => setDetailShiftId(currentShift.id)}>
                  <Eye className="h-4 w-4 mr-1.5" />
                  Xem Chi Tiết Ca
                </Button>
                <Button
                  className="bg-rose-600 hover:bg-rose-700 text-white font-bold"
                  size="sm"
                  onClick={() => { setActualCash(currentShift.expectedCash); setCloseModalOpen(true); }}
                >
                  <Lock className="h-4 w-4 mr-1.5" />
                  Chốt Két Đóng Ca
                </Button>
              </>
            ) : (
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold" size="sm" onClick={() => setOpenModalOpen(true)}>
                <Unlock className="h-4 w-4 mr-1.5" />
                Mở Ca Làm Việc Mới
              </Button>
            )}
          </div>
        }
      />

      {/* Active Shift */}
      {currentShift ? (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl border bg-gradient-to-r from-emerald-500/10 via-green-500/5 to-transparent flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 flex items-center justify-center">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-base tracking-tight">{currentShift.shiftCode}</h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 animate-pulse">
                    ĐANG HOẠT ĐỘNG
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Bắt đầu: {formatDateTime(currentShift.startTime)} · Phụ trách: <strong>{currentShift.cashierName}</strong>
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs text-muted-foreground">Đã phục vụ:</span>
              <p className="text-lg font-black text-primary">{currentShift.orderCount} đơn hàng</p>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Tiền mặt đầu ca', value: currentShift.openingCash, icon: <Wallet className="h-5 w-5" />, color: 'bg-blue-500/10 text-blue-600' },
              { label: 'Thu tiền mặt', value: currentShift.cashSales, icon: <DollarSign className="h-5 w-5" />, color: 'bg-emerald-500/10 text-emerald-600' },
              { label: 'Thẻ / Chuyển khoản', value: currentShift.cardSales, icon: <CreditCard className="h-5 w-5" />, color: 'bg-purple-500/10 text-purple-600' },
              { label: 'Tiền két lý thuyết', value: currentShift.expectedCash, icon: <Lock className="h-5 w-5" />, color: 'bg-primary text-primary-foreground shadow-md shadow-primary/30', highlight: true },
            ].map((card) => (
              <Card key={card.label} className={cn('rounded-2xl shadow-sm', card.highlight && 'border-2 border-primary/40')}>
                <CardContent className="p-5 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-muted-foreground uppercase">{card.label}</span>
                    <h4 className={cn('text-xl font-black mt-1', card.highlight ? 'text-primary' : '')}>{formatVND(card.value)}</h4>
                  </div>
                  <div className={cn('h-11 w-11 rounded-xl flex items-center justify-center', card.color)}>{card.icon}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        <div className="p-12 rounded-3xl border border-dashed bg-card text-center space-y-3">
          <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
            <Lock className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-bold">Chưa có ca làm việc nào đang mở</h3>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            Vui lòng mở ca làm việc mới và nhập số tiền mặt đầu ca để bắt đầu ghi nhận doanh thu.
          </p>
          <Button className="bg-emerald-600 hover:bg-emerald-700 font-bold" onClick={() => setOpenModalOpen(true)}>
            <Unlock className="h-4 w-4 mr-2" />Mở ca ngay bây giờ
          </Button>
        </div>
      )}

      {/* Shift History */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <History className="h-5 w-5 text-primary" />
            <h3 className="text-base font-bold tracking-tight">Lịch Sử Các Ca Đã Chốt</h3>
            {isAdmin && (
              <span className="text-xs text-muted-foreground flex items-center gap-1 bg-muted px-2 py-0.5 rounded-full font-medium">
                <Users className="h-3 w-3" /> Toàn bộ hệ thống
              </span>
            )}
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Tìm theo thu ngân, mã ca..."
              value={historySearch}
              onChange={(e) => setHistorySearch(e.target.value)}
              className="h-8.5 pl-8 text-xs rounded-xl"
            />
          </div>
        </div>

        <div className="rounded-2xl border bg-card shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead>Mã ca</TableHead>
                <TableHead>Thu ngân</TableHead>
                <TableHead>Thời gian</TableHead>
                <TableHead>Số đơn</TableHead>
                <TableHead>Tiền mặt</TableHead>
                <TableHead>Thẻ/CK</TableHead>
                <TableHead>Tổng doanh thu</TableHead>
                <TableHead>Chênh lệch két</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loadingHistory ? (
                <TableRow><TableCell colSpan={9} className="text-center py-8"><RefreshCw className="h-4 w-4 animate-spin mx-auto" /></TableCell></TableRow>
              ) : history.filter(s => s.status === 'CLOSED' && (!historySearch || s.cashierName.toLowerCase().includes(historySearch.toLowerCase()) || s.shiftCode.toLowerCase().includes(historySearch.toLowerCase()))).length === 0 ? (
                <TableRow><TableCell colSpan={9} className="text-center py-8 text-xs text-muted-foreground">Không tìm thấy ca làm việc nào.</TableCell></TableRow>
              ) : (
                history
                  .filter(s => s.status === 'CLOSED' && (!historySearch || s.cashierName.toLowerCase().includes(historySearch.toLowerCase()) || s.shiftCode.toLowerCase().includes(historySearch.toLowerCase())))
                  .map((shift) => (
                  <TableRow key={shift.id} className="hover:bg-muted/30">
                    <TableCell className="font-mono font-bold text-xs">{shift.shiftCode}</TableCell>
                    <TableCell className="font-medium text-xs">{shift.cashierName}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {formatDateTime(shift.startTime).slice(0, 16)} → {shift.endTime ? formatDateTime(shift.endTime).slice(11, 16) : '-'}
                    </TableCell>
                    <TableCell className="text-xs font-bold text-center">{shift.orderCount}</TableCell>
                    <TableCell className="text-xs font-semibold text-emerald-600">{formatVND(shift.cashSales)}</TableCell>
                    <TableCell className="text-xs font-semibold text-purple-600">{formatVND(shift.cardSales)}</TableCell>
                    <TableCell className="text-xs font-bold text-primary">{formatVND(shift.totalSales)}</TableCell>
                    <TableCell>
                      {(shift.difference ?? 0) === 0 ? (
                        <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Khớp 100%</span>
                      ) : (shift.difference ?? 0) > 0 ? (
                        <span className="text-[11px] font-bold text-blue-600">+{formatVND(shift.difference ?? 0)} (Thừa)</span>
                      ) : (
                        <span className="text-[11px] font-bold text-rose-600 flex items-center gap-1"><AlertCircle className="h-3 w-3" />{formatVND(shift.difference ?? 0)} (Thiếu)</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu align="end" trigger={
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button>
                      }>
                        <DropdownMenuItem icon={<Eye className="h-4 w-4 text-primary" />} onClick={() => setDetailShiftId(shift.id)}>
                          Xem báo cáo chi tiết
                        </DropdownMenuItem>
                        <DropdownMenuItem icon={<Printer className="h-4 w-4 text-blue-600" />} onClick={() => { setDetailShiftId(shift.id); setTimeout(() => window.print(), 600); }}>
                          In biên bản bàn giao
                        </DropdownMenuItem>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* MODAL: Mở ca */}
      <Dialog open={openModalOpen} onOpenChange={setOpenModalOpen} title="Mở Ca Làm Việc Mới" description="Nhập thông tin nhân viên phụ trách và số tiền thối bàn giao đầu ca">
        <form onSubmit={handleOpenSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-muted-foreground block mb-1">Nhân viên phụ trách ca</label>
            <Input value={cashierName} onChange={(e) => setCashierName(e.target.value)} placeholder="Họ tên thu ngân..." required />
          </div>
          <div>
            <label className="text-xs font-bold text-muted-foreground block mb-1">Tiền mặt bàn giao đầu ca (VNĐ)</label>
            <Input type="number" min="0" step="50000" value={openingCash} onChange={(e) => setOpeningCash(Number(e.target.value))} required />
            <div className="flex gap-2 mt-2">
              {[1000000, 2000000, 3000000, 5000000].map((preset) => (
                <button key={preset} type="button" onClick={() => setOpeningCash(preset)} className="px-2 py-1 rounded bg-secondary hover:bg-secondary/80 text-xs font-semibold">{formatVND(preset)}</button>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t">
            <Button type="button" variant="outline" onClick={() => setOpenModalOpen(false)}>Hủy</Button>
            <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold" disabled={openMutation.isPending}>
              {openMutation.isPending ? 'Đang mở...' : 'Xác Nhận Mở Ca'}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* MODAL: Chốt két */}
      <Dialog open={closeModalOpen} onOpenChange={setCloseModalOpen} title="Kiểm Đếm Chốt Két & Đóng Ca" description="Đếm số tiền mặt thực tế trong két và so sánh với hệ thống">
        <form onSubmit={handleCloseSubmit} className="space-y-4">
          {currentShift && (
            <div className="p-3 bg-muted rounded-xl text-xs space-y-1">
              <div className="flex justify-between"><span>Tiền mặt đầu ca:</span><span className="font-semibold">{formatVND(currentShift.openingCash)}</span></div>
              <div className="flex justify-between"><span>Doanh thu tiền mặt trong ca:</span><span className="font-semibold text-emerald-600">+{formatVND(currentShift.cashSales)}</span></div>
              <div className="flex justify-between"><span>Số đơn đã thanh toán:</span><span className="font-semibold">{currentShift.orderCount} đơn</span></div>
              <div className="flex justify-between font-bold border-t pt-1 text-sm text-foreground">
                <span>Tiền mặt lý thuyết trong két:</span><span className="text-primary">{formatVND(currentShift.expectedCash)}</span>
              </div>
            </div>
          )}
          <div>
            <label className="text-xs font-bold text-muted-foreground block mb-1">Tiền mặt thực tế kiểm đếm trong két (VNĐ)</label>
            <Input type="number" min="0" step="10000" value={actualCash} onChange={(e) => setActualCash(Number(e.target.value))} required className="text-base font-bold" />
          </div>
          <div className="p-3 rounded-xl border text-xs flex items-center justify-between">
            <span className="font-semibold">Chênh lệch két:</span>
            {difference === 0 ? (
              <span className="font-extrabold text-emerald-600 flex items-center gap-1"><CheckCircle2 className="h-4 w-4" /> 0 VNĐ (Khớp chuẩn 100%)</span>
            ) : difference > 0 ? (
              <span className="font-extrabold text-blue-600">+{formatVND(difference)} (Thừa tiền két)</span>
            ) : (
              <span className="font-extrabold text-rose-600 flex items-center gap-1"><AlertCircle className="h-4 w-4" /> {formatVND(difference)} (Thiếu hụt)</span>
            )}
          </div>
          <div>
            <label className="text-xs font-bold text-muted-foreground block mb-1">Ghi chú bàn giao ca</label>
            <Input value={handoverNote} onChange={(e) => setHandoverNote(e.target.value)} placeholder="Lý do chênh lệch hoặc việc cần lưu ý cho ca sau..." />
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t">
            <Button type="button" variant="outline" onClick={() => setCloseModalOpen(false)}>Quay lại</Button>
            <Button type="submit" className="bg-rose-600 hover:bg-rose-700 text-white font-bold" disabled={closeMutation.isPending}>
              {closeMutation.isPending ? 'Đang chốt...' : 'Xác Nhận Đóng Ca'}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* MODAL: Báo cáo chi tiết ca */}
      <Dialog open={detailShiftId !== null} onOpenChange={(open) => !open && setDetailShiftId(null)} title="Báo Cáo Chi Tiết Ca Làm Việc" description="Danh sách toàn bộ đơn hàng đã thanh toán trong ca" className="max-w-2xl">
        {loadingDetail ? (
          <div className="flex justify-center py-12"><LoadingSpinner /></div>
        ) : shiftDetail ? (
          <div className="space-y-4">
            {/* Shift summary */}
            <div className="grid grid-cols-3 gap-3 text-xs">
              {[
                { label: 'Tiền mặt', value: formatVND(shiftDetail.shift.cashSales), color: 'text-emerald-600' },
                { label: 'Thẻ/CK', value: formatVND(shiftDetail.shift.cardSales), color: 'text-purple-600' },
                { label: 'Tổng doanh thu', value: formatVND(shiftDetail.shift.totalSales), color: 'text-primary font-black' },
              ].map((s) => (
                <div key={s.label} className="p-3 rounded-xl bg-muted/50 text-center">
                  <p className="text-muted-foreground">{s.label}</p>
                  <p className={cn('text-base font-bold mt-0.5', s.color)}>{s.value}</p>
                </div>
              ))}
            </div>

            {/* Orders table */}
            <div className="rounded-xl border overflow-hidden max-h-96 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40">
                    <TableHead className="w-16">#Đơn</TableHead>
                    <TableHead>Bàn / Khách</TableHead>
                    <TableHead>Nguồn</TableHead>
                    <TableHead>Thanh toán lúc</TableHead>
                    <TableHead className="text-right">Số tiền</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {shiftDetail.orders.length === 0 ? (
                    <TableRow><TableCell colSpan={5} className="text-center py-6 text-xs text-muted-foreground">Không có đơn hàng nào trong ca này.</TableCell></TableRow>
                  ) : (
                    shiftDetail.orders.map((o) => (
                      <TableRow key={o.orderId}>
                        <TableCell className="font-mono text-xs font-bold text-primary">#{o.orderId}</TableCell>
                        <TableCell className="text-xs">{o.tableNumber}{o.customerName ? ` · ${o.customerName}` : ''}</TableCell>
                        <TableCell><span className="text-[10px] px-1.5 py-0.5 bg-muted rounded font-semibold">{o.source}</span></TableCell>
                        <TableCell className="text-xs text-muted-foreground">{o.paidAt ? formatDateTime(o.paidAt) : '-'}</TableCell>
                        <TableCell className="text-xs font-bold text-right text-emerald-600">{formatVND(o.totalAmount)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <Button variant="outline" size="sm" onClick={() => setDetailShiftId(null)}>Đóng</Button>
              <Button size="sm" onClick={() => window.print()}>
                <Printer className="h-4 w-4 mr-1.5" />In Biên Bản
              </Button>
            </div>
          </div>
        ) : null}
      </Dialog>
    </div>
  );
}
