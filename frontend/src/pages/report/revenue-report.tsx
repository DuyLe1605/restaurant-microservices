import * as React from 'react';
import { useRevenueReport, useDailyOrderDetails } from '@/hooks/use-reports';
import { PageHeader } from '@/components/shared/page-header';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { formatVND } from '@/lib/format-currency';
import { formatDate } from '@/lib/format-date';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog } from '@/components/ui/dialog';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { DollarSign, Eye } from 'lucide-react';

export function RevenueReportPage() {
  const [start, setStart] = React.useState(
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [end, setEnd] = React.useState(new Date().toISOString().split('T')[0]);

  const { data: report, isLoading } = useRevenueReport(start, end);

  // Drilldown Modal State
  const [selectedDay, setSelectedDay] = React.useState<string | null>(null);
  const { data: dayOrders, isLoading: isDayLoading } = useDailyOrderDetails(selectedDay || '');

  return (
    <div className="space-y-6">
      <PageHeader
        title="Báo Cáo Doanh Thu & Lợi Nhuận"
        description="Thống kê doanh thu bán hàng, chi phí và lợi nhuận ròng tổng hợp theo ngày"
      />

      {/* Date Filter */}
      <div className="flex flex-col sm:flex-row items-center gap-3 p-4 bg-card rounded-xl border shadow-sm">
        <span className="text-xs font-bold text-muted-foreground whitespace-nowrap">Khoảng thời gian:</span>
        <Input type="date" value={start} onChange={(e) => setStart(e.target.value)} className="w-full sm:w-44" />
        <span className="text-xs text-muted-foreground">đến</span>
        <Input type="date" value={end} onChange={(e) => setEnd(e.target.value)} className="w-full sm:w-44" />
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
