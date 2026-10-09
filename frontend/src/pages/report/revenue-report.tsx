import * as React from 'react';
import { useRevenueReport, useDailyOrderDetails } from '@/hooks/use-reports';
import { PageHeader } from '@/components/shared/page-header';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { formatVND } from '@/lib/format-currency';
import { formatDate } from '@/lib/format-date';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Calendar, Eye, Download, Printer, RotateCcw } from 'lucide-react';
import { exportToExcel, printProfessionalReport } from '@/lib/export-utils';

export function RevenueReportPage() {
  const [start, setStart] = React.useState(
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [end, setEnd] = React.useState(new Date().toISOString().split('T')[0]);

  const { data: report, isLoading } = useRevenueReport(start, end);

  // Drilldown Modal State
  const [selectedDay, setSelectedDay] = React.useState<string | null>(null);
  const { data: dayOrders, isLoading: isDayLoading } = useDailyOrderDetails(selectedDay || '');

  const details = report?.dailyDetails || (report as any)?.dailyBreakdown || [];
  const totalRev = report?.totalRevenue || 0;
  const totalExp = report?.totalExpense || 0;
  const totalProf = report?.totalProfit ?? (report as any)?.netProfit ?? (totalRev - totalExp);
  const totalOrds = report?.totalOrders ?? (report as any)?.orderCount ?? 0;

  // Preset Handlers
  const setToday = () => {
    const today = new Date().toISOString().split('T')[0];
    setStart(today);
    setEnd(today);
  };

  const setYesterday = () => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    const yStr = d.toISOString().split('T')[0];
    setStart(yStr);
    setEnd(yStr);
  };

  const set7Days = () => {
    const today = new Date();
    const past = new Date(today);
    past.setDate(today.getDate() - 6);
    setStart(past.toISOString().split('T')[0]);
    setEnd(today.toISOString().split('T')[0]);
  };

  const setMonth = () => {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    setStart(firstDay.toISOString().split('T')[0]);
    setEnd(today.toISOString().split('T')[0]);
  };

  const setLast30Days = () => {
    const today = new Date();
    const past = new Date(today);
    past.setDate(today.getDate() - 29);
    setStart(past.toISOString().split('T')[0]);
    setEnd(today.toISOString().split('T')[0]);
  };

  const isSingleDay = start === end;
  const datePeriodLabel = isSingleDay
    ? `Ngày ${formatDate(start)}`
    : `Từ ngày ${formatDate(start)} đến ngày ${formatDate(end)}`;

  const handleExportExcel = () => {
    if (!report) return;
    const fileSuffix = isSingleDay ? `Ngay_${start}` : `${start}_den_${end}`;
    const sheetTitle = isSingleDay
      ? `BÁO CÁO DOANH THU & LỢI NHUẬN NGÀY ${formatDate(start)}`
      : 'BÁO CÁO DOANH THU & LỢI NHUẬN HOẠT ĐỘNG KINH DOANH';

    exportToExcel(
      `Bao_Cao_Doanh_Thu_${fileSuffix}`,
      sheetTitle,
      [
        { header: 'STT', key: '__index' },
        { header: 'Ngày', key: 'date', formatter: (v) => formatDate(v) },
        { header: 'Số lượng đơn', key: 'orderCount', formatter: (v) => `${v} đơn` },
        { header: 'Doanh thu (VND)', key: 'revenue', formatter: (v) => formatVND(v) },
        { header: 'Chi phí vận hành (VND)', key: 'expense', formatter: (v) => formatVND(v) },
        { header: 'Lợi nhuận ròng (VND)', key: 'profit', formatter: (v) => formatVND(v) },
      ],
      details,
      [
        { label: 'TỔNG DOANH THU', value: formatVND(totalRev) },
        { label: 'TỔNG CHI PHÍ', value: formatVND(totalExp) },
        { label: 'LỢI NHUẬN RÒNG TỔNG HỢP', value: formatVND(totalProf) },
        { label: 'TỔNG LƯỢT ĐƠN HÀNG', value: `${totalOrds} lượt đơn` },
        {
          label: 'TỶ SUẤT LỢI NHUẬN RÒNG',
          value: totalRev > 0 ? `${((totalProf / totalRev) * 100).toFixed(2)}%` : '0%',
        },
      ],
      {
        'Kỳ thống kê': datePeriodLabel,
        'Bộ phận lập': 'Kế toán tài chính',
      }
    );
  };

  const handlePrintReport = () => {
    if (!report) return;
    const profitMargin = totalRev > 0 ? `${((totalProf / totalRev) * 100).toFixed(1)}%` : '0%';
    const printTitle = isSingleDay
      ? `Báo Cáo Doanh Thu & Lợi Nhuận Ngày ${formatDate(start)}`
      : 'Báo Cáo Doanh Thu & Lợi Nhuận Kinh Doanh';

    printProfessionalReport({
      title: printTitle,
      subtitle: isSingleDay
        ? `Chi tiết doanh thu, chi phí và lợi nhuận ròng phát sinh trong ngày ${formatDate(start)}`
        : 'Tổng hợp doanh số bán hàng, chi phí nguyên liệu & vận hành, và lợi nhuận ròng',
      reportPeriod: datePeriodLabel,
      preparedBy: 'Phòng Kế Toán & Quản Trị Tài Chính',
      kpis: [
        { label: 'Tổng doanh thu', value: formatVND(totalRev), color: '#16a34a' },
        { label: 'Tổng chi phí', value: formatVND(totalExp), color: '#e11d48' },
        { label: 'Lợi nhuận ròng', value: formatVND(totalProf), color: '#0284c7' },
        { label: 'Tổng đơn hàng', value: `${totalOrds} đơn`, color: '#64748b' },
        { label: 'Tỷ suất lợi nhuận', value: profitMargin, color: '#8b5cf6' },
      ],
      columns: [
        { header: 'STT', key: '__index', align: 'center' },
        { header: 'Ngày', key: 'date', align: 'left', formatter: (v) => formatDate(v) },
        { header: 'Số lượng đơn', key: 'orderCount', align: 'center', formatter: (v) => `${v} đơn` },
        {
          header: 'Doanh thu (VND)',
          key: 'revenue',
          align: 'right',
          formatter: (v) => `<span style="color:#16a34a;font-weight:700;">${formatVND(v)}</span>`,
        },
        {
          header: 'Chi phí (VND)',
          key: 'expense',
          align: 'right',
          formatter: (v) => `<span style="color:#e11d48;font-weight:600;">${formatVND(v)}</span>`,
        },
        {
          header: 'Lợi nhuận (VND)',
          key: 'profit',
          align: 'right',
          formatter: (v) => `<strong>${formatVND(v)}</strong>`,
        },
      ],
      data: details,
      summary: [
        { label: 'Tổng doanh thu kỳ báo cáo', value: formatVND(totalRev) },
        { label: 'Tổng chi phí phát sinh', value: formatVND(totalExp) },
        { label: 'LỢI NHUẬN RÒNG THỰC NHẬN', value: formatVND(totalProf) },
        { label: 'Tỷ suất lợi nhuận trên doanh thu', value: profitMargin },
      ],
      signatures: ['Người Lập Biểu', 'Kế Toán Trưởng', 'Tổng Giám Đốc'],
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Báo Cáo Doanh Thu & Lợi Nhuận"
        description="Thống kê doanh thu bán hàng, chi phí và lợi nhuận ròng tổng hợp theo ngày"
      >
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleExportExcel} disabled={isLoading || !report}>
            <Download className="h-4 w-4 mr-2" />
            Xuất Excel (CSV)
          </Button>
          <Button onClick={handlePrintReport} disabled={isLoading || !report}>
            <Printer className="h-4 w-4 mr-2" />
            In / Xuất PDF
          </Button>
        </div>
      </PageHeader>

      {/* Date Filter & Preset Toolbar */}
      <div className="bg-card border rounded-2xl p-4 shadow-sm space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b">
          <div className="flex items-center gap-2 text-sm font-bold text-foreground">
            <Calendar className="h-4 w-4 text-primary" />
            <span>Kỳ thống kê:</span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary">
              {datePeriodLabel}
            </span>
          </div>

          {/* Quick Preset Buttons */}
          <div className="flex flex-wrap items-center gap-1.5">
            <Button
              variant={isSingleDay && start === new Date().toISOString().split('T')[0] ? 'default' : 'outline'}
              size="sm"
              onClick={setToday}
              className="text-xs h-7"
            >
              Hôm nay
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={setYesterday}
              className="text-xs h-7"
            >
              Hôm qua
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={set7Days}
              className="text-xs h-7"
            >
              7 ngày qua
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={setMonth}
              className="text-xs h-7"
            >
              Tháng này
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={setLast30Days}
              className="text-xs h-7"
            >
              30 ngày qua
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground">Từ ngày:</span>
            <Input type="date" value={start} onChange={(e) => setStart(e.target.value)} className="w-40 h-8 text-xs" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground">Đến ngày:</span>
            <Input type="date" value={end} onChange={(e) => setEnd(e.target.value)} className="w-40 h-8 text-xs" />
          </div>
          <span className="text-xs text-muted-foreground italic">
            (Chọn cùng 1 ngày ở cả hai ô để xem và xuất dữ liệu cho riêng ngày đó)
          </span>
        </div>
      </div>

      {isLoading ? (
        <LoadingSpinner text="Đang tổng hợp báo cáo tài chính..." />
      ) : !report ? (
        <div className="text-center py-12 border rounded-xl">Không có dữ liệu báo cáo.</div>
      ) : (
        <>
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-5">
                <p className="text-xs font-semibold text-muted-foreground">Tổng doanh thu</p>
                <h3 className="text-xl font-bold text-emerald-600 mt-1">{formatVND(report.totalRevenue)}</h3>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <p className="text-xs font-semibold text-muted-foreground">Tổng chi phí</p>
                <h3 className="text-xl font-bold text-rose-600 mt-1">{formatVND(report.totalExpense)}</h3>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <p className="text-xs font-semibold text-muted-foreground">Lợi nhuận ròng</p>
                <h3 className="text-xl font-bold text-primary mt-1">{formatVND(report.totalProfit ?? (report as any).netProfit ?? 0)}</h3>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <p className="text-xs font-semibold text-muted-foreground">Tổng đơn thanh toán</p>
                <h3 className="text-xl font-bold mt-1">{report.totalOrders ?? (report as any).orderCount ?? 0} lượt đơn</h3>
              </CardContent>
            </Card>
          </div>

          {/* Daily Table */}
          <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ngày</TableHead>
                  <TableHead>Số lượng đơn</TableHead>
                  <TableHead>Doanh thu</TableHead>
                  <TableHead>Chi phí</TableHead>
                  <TableHead>Lợi nhuận</TableHead>
                  <TableHead className="text-right">Chi tiết</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {((report.dailyDetails || (report as any).dailyBreakdown || [])).length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                      Không có phát sinh giao dịch trong khoảng thời gian này.
                    </TableCell>
                  </TableRow>
                ) : (
                  (report.dailyDetails || (report as any).dailyBreakdown || []).map((d: any) => (
                    <TableRow key={d.date}>
                      <TableCell className="font-bold">{formatDate(d.date)}</TableCell>
                      <TableCell>{d.orderCount} đơn</TableCell>
                      <TableCell className="font-semibold text-emerald-600">{formatVND(d.revenue)}</TableCell>
                      <TableCell className="font-semibold text-rose-600">{formatVND(d.expense)}</TableCell>
                      <TableCell className="font-bold">{formatVND(d.profit)}</TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="outline" onClick={() => setSelectedDay(d.date)}>
                          <Eye className="h-3.5 w-3.5 mr-1" /> Xem đơn
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </>
      )}

      {/* Drilldown Day Orders Dialog */}
      <Dialog
        open={selectedDay !== null}
        onOpenChange={(open) => !open && setSelectedDay(null)}
        title={`Chi Tiết Đơn Hàng Ngày ${selectedDay ? formatDate(selectedDay) : ''}`}
        description="Danh sách các đơn thanh toán phát sinh trong ngày"
        className="max-w-2xl"
      >
        {isDayLoading ? (
          <LoadingSpinner text="Tải danh sách đơn trong ngày..." />
        ) : !dayOrders || dayOrders.length === 0 ? (
          <p className="text-center py-6 text-muted-foreground text-sm">Không có đơn hàng nào.</p>
        ) : (
          <div className="max-h-80 overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mã đơn</TableHead>
                  <TableHead>Bàn</TableHead>
                  <TableHead>Số tiền</TableHead>
                  <TableHead>Thu ngân</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dayOrders.map((o) => (
                  <TableRow key={o.id}>
                    <TableCell className="font-bold">#{o.id}</TableCell>
                    <TableCell>{o.tableNumber || 'Mang về'}</TableCell>
                    <TableCell className="font-bold text-emerald-600">{formatVND(o.totalAmount)}</TableCell>
                    <TableCell>{o.cashierName}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Dialog>
    </div>
  );
}
