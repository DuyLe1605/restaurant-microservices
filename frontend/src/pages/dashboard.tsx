import * as React from 'react';
import { useDashboard } from '@/hooks/use-reports';
import { PageHeader } from '@/components/shared/page-header';
import { StatsCard } from '@/components/shared/stats-card';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { formatVND } from '@/lib/format-currency';
import { formatDate } from '@/lib/format-date';
import { StatusBadge } from '@/components/shared/status-badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { DollarSign, ShoppingCart, TrendingUp, AlertTriangle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export function DashboardPage() {
  const { data: dashboard, isLoading } = useDashboard();

  if (isLoading) {
    return <LoadingSpinner text="Đang tải dữ liệu tổng quan..." />;
  }

  const todayRevenue = dashboard?.todayRevenue ?? 0;
  const todayExpense = dashboard?.todayExpense ?? 0;
  const todayProfit = dashboard?.todayProfit ?? 0;
  const todayOrders = dashboard?.todayOrderCount ?? 0;
  const lowStock = dashboard?.lowStockAlerts ?? [];
  const recentOrders = dashboard?.recentOrders ?? [];

  // Chart sample data
  const chartData = [
    { name: 'Hôm nay', revenue: todayRevenue, expense: todayExpense, profit: todayProfit },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tổng Quan Nhà Hàng"
        description="Theo dõi hoạt động kinh doanh, doanh thu, đơn hàng và kho thời gian thực"
      >
        <Link to="/orders/new" className="inline-flex items-center justify-center rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-semibold shadow hover:bg-primary/90 transition-all">
          <ShoppingCart className="h-4 w-4 mr-2" />
          Tạo đơn hàng mới
        </Link>
      </PageHeader>

      {/* 4 Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Doanh thu hôm nay"
          value={formatVND(todayRevenue)}
          subtitle="Tổng tiền thu từ đơn đã trả"
          icon={<DollarSign className="h-5 w-5" />}
          iconBg="bg-emerald-500/10 text-emerald-600"
          trend="+12.5% so với tuần trước"
          trendPositive={true}
        />
        <StatsCard
          title="Chi phí phát sinh"
          value={formatVND(todayExpense)}
          subtitle="Chi phí nguyên liệu và vận hành"
          icon={<TrendingUp className="h-5 w-5" />}
          iconBg="bg-rose-500/10 text-rose-600"
        />
        <StatsCard
          title="Lợi nhuận ròng"
          value={formatVND(todayProfit)}
          subtitle="Doanh thu trừ chi phí"
          icon={<DollarSign className="h-5 w-5" />}
          iconBg="bg-primary/10 text-primary"
          trendPositive={todayProfit >= 0}
        />
        <StatsCard
          title="Đơn hàng hôm nay"
          value={todayOrders}
          subtitle="Số lượt bàn đã thanh toán"
          icon={<ShoppingCart className="h-5 w-5" />}
          iconBg="bg-blue-500/10 text-blue-600"
        />
      </div>

      {/* Chart and Low Stock alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-bold">Biểu Đồ Tài Chính Hôm Nay</CardTitle>
            <span className="text-xs text-muted-foreground font-medium">Đơn vị: VNĐ</span>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={(val) => `${(val / 1000).toLocaleString()}k`} />
                  <Tooltip formatter={(value: any) => formatVND(Number(value))} />
                  <Bar dataKey="revenue" name="Doanh thu" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expense" name="Chi phí" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="profit" name="Lợi nhuận" fill="#f97316" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Low Stock Alerts */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              Cảnh Báo Tồn Kho
            </CardTitle>
            <Link to="/reports/stock" className="text-xs text-primary font-semibold hover:underline flex items-center">
              Xem hết <ArrowRight className="h-3 w-3 ml-1" />
            </Link>
          </CardHeader>
          <CardContent>
            {lowStock.length === 0 ? (
              <p className="text-xs text-muted-foreground py-6 text-center">Tồn kho các nguyên liệu đang ở mức an toàn.</p>
            ) : (
              <div className="space-y-3">
                {lowStock.slice(0, 5).map((item) => (
                  <div key={item.ingredientId} className="flex items-center justify-between p-2 rounded-lg border bg-muted/20">
                    <div>
                      <p className="text-sm font-semibold">{item.ingredientName}</p>
                      <p className="text-xs text-muted-foreground">
                        Tồn: <span className="font-bold text-foreground">{item.currentQty} {item.unit}</span> (Tối thiểu: {item.minStock})
                      </p>
                    </div>
                    <StatusBadge status={item.statusLevel} />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base font-bold">Đơn Hàng Gần Đây</CardTitle>
          <Link to="/orders" className="text-xs text-primary font-semibold hover:underline flex items-center">
            Tất cả đơn <ArrowRight className="h-3 w-3 ml-1" />
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mã đơn</TableHead>
                <TableHead>Ngày giờ</TableHead>
                <TableHead>Bàn ăn</TableHead>
                <TableHead>Tổng tiền</TableHead>
                <TableHead>Thu ngân</TableHead>
                <TableHead>Nguồn</TableHead>
                <TableHead>Trạng thái</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                    Chưa có đơn hàng nào được ghi nhận hôm nay.
                  </TableCell>
                </TableRow>
              ) : (
                recentOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-bold">#{order.id}</TableCell>
                    <TableCell>{formatDate(order.orderDate)}</TableCell>
                    <TableCell className="font-semibold">{order.tableNumber || 'Mang đi'}</TableCell>
                    <TableCell className="font-bold text-emerald-600">{formatVND(order.totalAmount)}</TableCell>
                    <TableCell className="text-muted-foreground">{order.cashierName}</TableCell>
                    <TableCell>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-muted">
                        {order.source}
                      </span>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={order.status} />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
