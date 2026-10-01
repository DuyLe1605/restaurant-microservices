import * as React from 'react';
import { useShifts } from '@/hooks/use-shifts';
import { PageHeader } from '@/components/shared/page-header';
import { formatVND } from '@/lib/format-currency';
import { formatDateTime } from '@/lib/format-date';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog } from '@/components/ui/dialog';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import {
  Clock,
  DollarSign,
  CreditCard,
  Wallet,
  Lock,
  Unlock,
  Printer,
  History,
  AlertCircle,
  CheckCircle2,
  FileText,
  UserCheck,
} from 'lucide-react';
import { WorkShift } from '@/types/shift';

export function ShiftManagePage() {
  const { currentShift, history, openShift, closeShift } = useShifts();

  // Modals
  const [openModalOpen, setOpenModalOpen] = React.useState(false);
  const [cashierName, setCashierName] = React.useState('Nguyễn Văn Quản Lý');
  const [openingCash, setOpeningCash] = React.useState<number>(2000000);

  const [closeModalOpen, setCloseModalOpen] = React.useState(false);
  const [actualCash, setActualCash] = React.useState<number>(currentShift?.expectedCash || 0);
  const [handoverNote, setHandoverNote] = React.useState('');

  const [receiptShift, setReceiptShift] = React.useState<WorkShift | null>(null);

  React.useEffect(() => {
    if (currentShift) {
      setActualCash(currentShift.expectedCash);
    }
  }, [currentShift]);

  const handleOpenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    openShift({ cashierName, openingCash });
    setOpenModalOpen(false);
  };

  const handleCloseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentShift) return;

    const shiftToPrint: WorkShift = {
      ...currentShift,
      endTime: new Date().toISOString(),
      status: 'CLOSED',
      actualCash,
      difference: actualCash - currentShift.expectedCash,
      handoverNote,
    };

    closeShift({ actualCash, handoverNote });
    setCloseModalOpen(false);
    setReceiptShift(shiftToPrint);
  };

  const difference = currentShift ? actualCash - currentShift.expectedCash : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quản Lý Ca Làm Việc & Chốt Két"
        description="Kiểm soát tiền mặt đầu ca, doanh thu thực tế, chốt két bàn giao và in phiếu kết ca"
      >
        {currentShift ? (
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setReceiptShift(currentShift)}>
              <Printer className="h-4 w-4 mr-1.5" />
              In Tạm Tính Ca
            </Button>
            <Button
              className="bg-rose-600 hover:bg-rose-700 text-white font-bold"
              size="sm"
              onClick={() => {
                setActualCash(currentShift.expectedCash);
                setCloseModalOpen(true);
              }}
            >
              <Lock className="h-4 w-4 mr-1.5" />
              Chốt Két Đóng Ca
            </Button>
          </div>
        ) : (
          <Button
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
            size="sm"
            onClick={() => setOpenModalOpen(true)}
          >
            <Unlock className="h-4 w-4 mr-1.5" />
            Mở Ca Làm Việc Mới
          </Button>
        )}
      </PageHeader>

      {/* Active Shift Section */}
      {currentShift ? (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl border bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-transparent flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-amber-500/20 text-amber-700 dark:text-amber-300 flex items-center justify-center font-bold">
                <Clock className="h-5 w-5 animate-spin-slow" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-base tracking-tight">{currentShift.shiftCode}</h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    ĐANG HOẠT ĐỘNG
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Bắt đầu: {formatDateTime(currentShift.startTime)} • Phụ trách: <strong>{currentShift.cashierName}</strong>
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs text-muted-foreground">Tổng số đơn trong ca:</span>
              <p className="text-lg font-black text-primary">{currentShift.orderCount} đơn hàng</p>
            </div>
          </div>

          {/* 4 Financial Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="rounded-2xl shadow-sm border">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-muted-foreground uppercase">Tiền mặt đầu ca</span>
                  <h4 className="text-xl font-black mt-1 text-foreground">{formatVND(currentShift.openingCash)}</h4>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Tiền thối bàn giao</p>
                </div>
                <div className="h-11 w-11 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
                  <Wallet className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl shadow-sm border">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-muted-foreground uppercase">Thu tiền mặt (Cash)</span>
                  <h4 className="text-xl font-black mt-1 text-emerald-600 dark:text-emerald-400">{formatVND(currentShift.cashSales)}</h4>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Cần nộp vào két</p>
                </div>
                <div className="h-11 w-11 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                  <DollarSign className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl shadow-sm border">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-muted-foreground uppercase">Thẻ / Chuyển khoản</span>
                  <h4 className="text-xl font-black mt-1 text-purple-600 dark:text-purple-400">{formatVND(currentShift.cardSales)}</h4>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Tài khoản ngân hàng</p>
                </div>
                <div className="h-11 w-11 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center">
                  <CreditCard className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl shadow-sm border-2 border-primary/40 bg-primary/[0.02]">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-primary uppercase">Tiền mặt lý thuyết trong két</span>
                  <h4 className="text-xl font-black mt-1 text-primary">{formatVND(currentShift.expectedCash)}</h4>
                  <p className="text-[11px] text-muted-foreground mt-0.5">= Đầu ca + Tiền mặt</p>
                </div>
                <div className="h-11 w-11 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-md shadow-primary/30">
                  <Lock className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <div className="p-12 rounded-3xl border border-dashed bg-card text-center space-y-3">
          <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
            <Lock className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-bold">Chưa có ca làm việc nào đang mở</h3>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            Vui lòng mở ca làm việc mới và nhập số tiền mặt đầu ca để bắt đầu ghi nhận doanh thu và đối soát két tiền.
          </p>
          <Button className="bg-emerald-600 hover:bg-emerald-700 font-bold" onClick={() => setOpenModalOpen(true)}>
            <Unlock className="h-4 w-4 mr-2" />
            Mở ca ngay bây giờ
          </Button>
        </div>
      )}

      {/* Shift History Section */}
      <div className="space-y-3 pt-4">
        <div className="flex items-center gap-2">
          <History className="h-5 w-5 text-primary" />
          <h3 className="text-base font-bold tracking-tight">Lịch Sử Các Ca Đã Chốt</h3>
        </div>

        <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mã ca</TableHead>
                <TableHead>Thu ngân</TableHead>
                <TableHead>Thời gian</TableHead>
                <TableHead>Tiền đầu ca</TableHead>
                <TableHead>Tiền mặt</TableHead>
                <TableHead>Thẻ/CK</TableHead>
                <TableHead>Tổng doanh thu</TableHead>
                <TableHead>Chênh lệch két</TableHead>
                <TableHead className="text-right">Phiếu</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-xs text-muted-foreground">
                    Chưa có lịch sử ca làm việc nào.
                  </TableCell>
                </TableRow>
              ) : (
                history.map((shift) => (
                  <TableRow key={shift.id}>
                    <TableCell className="font-mono font-bold text-xs">{shift.shiftCode}</TableCell>
                    <TableCell className="font-medium text-xs">{shift.cashierName}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {formatDateTime(shift.startTime).slice(0, 16)} → {shift.endTime ? formatDateTime(shift.endTime).slice(11, 16) : '-'}
                    </TableCell>
                    <TableCell className="text-xs">{formatVND(shift.openingCash)}</TableCell>
                    <TableCell className="text-xs font-semibold text-emerald-600">{formatVND(shift.cashSales)}</TableCell>
                    <TableCell className="text-xs font-semibold text-purple-600">{formatVND(shift.cardSales)}</TableCell>
                    <TableCell className="text-xs font-bold text-primary">{formatVND(shift.totalSales)}</TableCell>
                    <TableCell>
                      {shift.difference === 0 ? (
                        <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" /> Khớp 100%
                        </span>
                      ) : (shift.difference || 0) > 0 ? (
                        <span className="text-[11px] font-bold text-blue-600">
                          +{formatVND(shift.difference || 0)} (Thừa)
                        </span>
                      ) : (
                        <span className="text-[11px] font-bold text-rose-600">
                          {formatVND(shift.difference || 0)} (Thiếu)
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => setReceiptShift(shift)}>
                        <Printer className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* MODAL 1: Mở ca làm việc */}
      <Dialog
        open={openModalOpen}
        onOpenChange={setOpenModalOpen}
        title="Mở Ca Làm Việc Mới"
        description="Nhập thông tin nhân viên phụ trách và số tiền thối bàn giao đầu ca"
      >
        <form onSubmit={handleOpenSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-muted-foreground block mb-1">Nhân viên phụ trách ca</label>
            <Input
              value={cashierName}
              onChange={(e) => setCashierName(e.target.value)}
              placeholder="Họ tên thu ngân..."
              required
            />
          </div>

          <div>
            <label className="text-xs font-bold text-muted-foreground block mb-1">Tiền mặt bàn giao đầu ca (VNĐ)</label>
            <Input
              type="number"
              min="0"
              step="50000"
              value={openingCash}
              onChange={(e) => setOpeningCash(Number(e.target.value))}
              required
            />
            <div className="flex gap-2 mt-2">
              {[1000000, 2000000, 3000000, 5000000].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setOpeningCash(preset)}
                  className="px-2 py-1 rounded bg-secondary hover:bg-secondary/80 text-xs font-semibold"
                >
                  {formatVND(preset)}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t">
            <Button type="button" variant="outline" onClick={() => setOpenModalOpen(false)}>
              Hủy
            </Button>
            <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold">
              Xác Nhận Mở Ca
            </Button>
          </div>
        </form>
      </Dialog>

      {/* MODAL 2: Chốt két đóng ca */}
      <Dialog
        open={closeModalOpen}
        onOpenChange={setCloseModalOpen}
        title="Kiểm Đếm Chốt Két & Đóng Ca"
        description="Đếm số tiền mặt thực tế trong két và so sánh với hệ thống"
      >
        <form onSubmit={handleCloseSubmit} className="space-y-4">
          {currentShift && (
            <div className="p-3 bg-muted rounded-xl text-xs space-y-1">
              <div className="flex justify-between">
                <span>Tiền mặt đầu ca:</span>
                <span className="font-semibold">{formatVND(currentShift.openingCash)}</span>
              </div>
              <div className="flex justify-between">
                <span>Doanh thu tiền mặt trong ca:</span>
                <span className="font-semibold text-emerald-600">+{formatVND(currentShift.cashSales)}</span>
              </div>
              <div className="flex justify-between font-bold border-t pt-1 text-sm text-foreground">
                <span>Tiền mặt lý thuyết trong két:</span>
                <span className="text-primary">{formatVND(currentShift.expectedCash)}</span>
              </div>
            </div>
          )}

          <div>
            <label className="text-xs font-bold text-muted-foreground block mb-1">
              Tiền mặt thực tế kiểm đếm trong két (VNĐ)
            </label>
            <Input
              type="number"
              min="0"
              step="10000"
              value={actualCash}
              onChange={(e) => setActualCash(Number(e.target.value))}
              required
              className="text-base font-bold"
            />
          </div>

          {/* Difference alert */}
          <div className="p-3 rounded-xl border text-xs flex items-center justify-between">
            <span className="font-semibold">Chênh lệch két:</span>
            {difference === 0 ? (
              <span className="font-extrabold text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4" /> 0 VNĐ (Khớp chuẩn 100%)
              </span>
            ) : difference > 0 ? (
              <span className="font-extrabold text-blue-600">
                +{formatVND(difference)} (Thừa tiền két)
              </span>
            ) : (
              <span className="font-extrabold text-rose-600 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" /> {formatVND(difference)} (Thiếu hụt tiền két)
              </span>
            )}
          </div>

          <div>
            <label className="text-xs font-bold text-muted-foreground block mb-1">Ghi chú bàn giao ca</label>
            <Input
              value={handoverNote}
              onChange={(e) => setHandoverNote(e.target.value)}
              placeholder="Lý do chênh lệch hoặc việc cần lưu ý cho ca sau..."
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t">
            <Button type="button" variant="outline" onClick={() => setCloseModalOpen(false)}>
              Quay lại
            </Button>
            <Button type="submit" className="bg-rose-600 hover:bg-rose-700 text-white font-bold">
              Xác Nhận Đóng Ca & In Phiếu
            </Button>
          </div>
        </form>
      </Dialog>

      {/* MODAL 3: Phiếu Chốt Ca Bàn Giao (Printable Receipt) */}
      <Dialog
        open={receiptShift !== null}
        onOpenChange={(open) => !open && setReceiptShift(null)}
        title="Phiếu Bàn Giao Ca Làm Việc"
        description="Báo cáo tài chính chi tiết kết thúc ca thu ngân"
        className="max-w-md"
      >
        {receiptShift && (
          <div className="space-y-4 text-xs font-mono">
            <div className="text-center border-b pb-3 space-y-1">
              <h2 className="text-base font-black tracking-tight font-sans">GOURMET HAVEN LUXURY DINING</h2>
              <p className="text-[11px] text-muted-foreground">PHIẾU BÀN GIAO & KẾT THÚC CA</p>
              <p className="text-[10px] font-bold text-primary">{receiptShift.shiftCode}</p>
            </div>

            <div className="space-y-1.5 border-b pb-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Thu ngân phụ trách:</span>
                <span className="font-bold">{receiptShift.cashierName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Giờ mở ca:</span>
                <span>{formatDateTime(receiptShift.startTime)}</span>
              </div>
              {receiptShift.endTime && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Giờ đóng ca:</span>
                  <span>{formatDateTime(receiptShift.endTime)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Số đơn phục vụ:</span>
                <span className="font-bold">{receiptShift.orderCount} đơn</span>
              </div>
            </div>

            {/* Financials */}
            <div className="space-y-1.5 border-b pb-3">
              <div className="flex justify-between">
                <span>Tiền mặt mồi đầu ca:</span>
                <span className="font-bold">{formatVND(receiptShift.openingCash)}</span>
              </div>
              <div className="flex justify-between">
                <span>Doanh thu Tiền mặt:</span>
                <span className="font-bold text-emerald-600">+{formatVND(receiptShift.cashSales)}</span>
              </div>
              <div className="flex justify-between">
                <span>Doanh thu Thẻ / CK:</span>
                <span className="font-bold text-purple-600">+{formatVND(receiptShift.cardSales)}</span>
              </div>
              <div className="flex justify-between font-bold text-sm pt-1 border-t">
                <span>Tổng doanh thu ca:</span>
                <span className="text-primary">{formatVND(receiptShift.totalSales)}</span>
              </div>
            </div>

            {/* Reconciliation */}
            <div className="space-y-1.5 border-b pb-3">
              <div className="flex justify-between">
                <span>Tiền mặt lý thuyết trong két:</span>
                <span className="font-bold">{formatVND(receiptShift.expectedCash)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tiền mặt thực tế kiểm đếm:</span>
                <span className="font-bold">{formatVND(receiptShift.actualCash || receiptShift.expectedCash)}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span>Chênh lệch thừa/thiếu:</span>
                <span className={receiptShift.difference === 0 ? 'text-emerald-600' : 'text-rose-600'}>
                  {formatVND(receiptShift.difference || 0)}
                </span>
              </div>
            </div>

            {receiptShift.handoverNote && (
              <div className="p-2 bg-muted rounded text-[11px] italic">
                \"{receiptShift.handoverNote}\"
              </div>
            )}

            <div className="grid grid-cols-2 text-center pt-4 text-[11px]">
              <div>
                <p className="font-bold">Thu Ngân Bàn Giao</p>
                <p className="text-muted-foreground mt-8">(Ký và ghi rõ họ tên)</p>
              </div>
              <div>
                <p className="font-bold">Quản Lý Nhận Bàn Giao</p>
                <p className="text-muted-foreground mt-8">(Ký và ghi rõ họ tên)</p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t print:hidden">
              <Button variant="outline" size="sm" onClick={() => setReceiptShift(null)}>
                Đóng
              </Button>
              <Button size="sm" onClick={() => window.print()}>
                <Printer className="h-4 w-4 mr-1.5" /> In Phiếu
              </Button>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
}
