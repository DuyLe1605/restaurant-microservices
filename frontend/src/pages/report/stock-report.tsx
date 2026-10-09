import * as React from 'react';
import { useStockReport } from '@/hooks/use-reports';
import { PageHeader } from '@/components/shared/page-header';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { StatusBadge } from '@/components/shared/status-badge';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';

import { Button } from '@/components/ui/button';
import { Download, Printer } from 'lucide-react';
import { exportToExcel, printProfessionalReport } from '@/lib/export-utils';

export function StockReportPage() {
  const { data: stockItems, isLoading } = useStockReport();

  const critical = stockItems?.filter((i) => i.statusLevel === 'CRITICAL') || [];
  const warning = stockItems?.filter((i) => i.statusLevel === 'WARNING') || [];
  const normal = stockItems?.filter((i) => i.statusLevel === 'NORMAL') || [];

  const handleExportExcel = () => {
    if (!stockItems || stockItems.length === 0) return;
    exportToExcel(
      'Bao_Cao_Ton_Kho',
      'BÁO CÁO PHÂN TẦNG TỒN KHO NGUYÊN LIỆU',
      [
        { header: 'STT', key: '__index' },
        { header: 'Mã NL', key: 'ingredientId' },
        { header: 'Tên nguyên liệu', key: 'ingredientName' },
        { header: 'Số lượng tồn', key: 'currentQty' },
        { header: 'Đơn vị tính', key: 'unit' },
        { header: 'Ngưỡng an toàn tối thiểu', key: 'minStock' },
        {
          header: 'Phân loại tồn kho',
          key: 'statusLevel',
          formatter: (val) =>
            val === 'CRITICAL' ? 'Khẩn cấp (Hết hàng)' : val === 'WARNING' ? 'Cảnh báo (Sắp hết)' : 'Ổn định',
        },
      ],
      stockItems,
      [
        { label: 'Tổng số loại nguyên liệu theo dõi', value: `${stockItems.length} mặt hàng` },
        { label: 'Số mặt hàng khẩn cấp (Hết hàng)', value: `${critical.length} mặt hàng` },
        { label: 'Số mặt hàng cảnh báo (Sắp hết)', value: `${warning.length} mặt hàng` },
        { label: 'Số mặt hàng tồn kho ổn định', value: `${normal.length} mặt hàng` },
      ],
      {
        'Người lập': 'Quản lý kho',
        'Bộ phận': 'Kho & Bếp',
      }
    );
  };

  const handlePrintReport = () => {
    if (!stockItems || stockItems.length === 0) return;
    printProfessionalReport({
      title: 'Báo Cáo Phân Tầng Tồn Kho Nguyên Liệu',
      subtitle: 'Kiểm kê và phân loại tồn kho theo ngưỡng an toàn để chủ động nhập hàng',
      reportPeriod: `Tính đến ngày ${new Date().toLocaleDateString('vi-VN')}`,
      preparedBy: 'Bộ phận Quản lý Kho & Bếp',
      kpis: [
        { label: 'Tổng mặt hàng', value: `${stockItems.length}`, color: '#0284c7' },
        { label: 'Khẩn cấp (Hết hàng)', value: `${critical.length}`, color: '#e11d48' },
        { label: 'Cảnh báo (Sắp hết)', value: `${warning.length}`, color: '#d97706' },
        { label: 'Tồn ổn định', value: `${normal.length}`, color: '#16a34a' },
      ],
      columns: [
        { header: 'STT', key: '__index', align: 'center' },
        { header: 'Mã NL', key: 'ingredientId', align: 'center' },
        { header: 'Tên nguyên liệu', key: 'ingredientName', align: 'left' },
        {
          header: 'Số lượng tồn',
          key: 'currentQty',
          align: 'right',
          formatter: (v, r) => `<strong>${v}</strong> ${r.unit}`,
        },
        {
          header: 'Ngưỡng tối thiểu',
          key: 'minStock',
          align: 'right',
          formatter: (v, r) => `${v} ${r.unit}`,
        },
        {
          header: 'Trạng thái',
          key: 'statusLevel',
          align: 'center',
          formatter: (v) =>
            v === 'CRITICAL'
              ? '<span style="color:#e11d48;font-weight:700;">🚨 Hết hàng</span>'
              : v === 'WARNING'
              ? '<span style="color:#d97706;font-weight:700;">⚠️ Sắp hết</span>'
              : '<span style="color:#16a34a;font-weight:700;">Ổn định</span>',
        },
      ],
      data: stockItems,
      summary: [
        { label: 'Tổng số nguyên liệu theo dõi', value: `${stockItems.length} mặt hàng` },
        { label: 'Tổng mặt hàng cần tái đặt hàng', value: `${critical.length + warning.length} mặt hàng` },
      ],
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Báo Cáo Phân Tầng Tồn Kho"
        description="Phân loại nguyên liệu theo các ngưỡng an toàn: Khẩn cấp (Hết hàng), Cảnh báo (Dưới ngưỡng) và Ổn định"
      >
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleExportExcel} disabled={isLoading || !stockItems?.length}>
            <Download className="h-4 w-4 mr-2" />
            Xuất Excel (CSV)
          </Button>
          <Button onClick={handlePrintReport} disabled={isLoading || !stockItems?.length}>
            <Printer className="h-4 w-4 mr-2" />
            In / Xuất PDF
          </Button>
        </div>
      </PageHeader>

      {isLoading ? (
        <LoadingSpinner text="Đang phân tích mức tồn kho..." />
      ) : (
        <div className="space-y-8">
          {/* Critical Section */}
          {critical.length > 0 && (
            <div className="rounded-xl border border-rose-500/40 bg-rose-50/20 dark:bg-rose-950/10 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-base text-rose-600 flex items-center gap-2">
                  🚨 Mức Khẩn Cấp - Đã Hết Hàng ({critical.length} mặt hàng)
                </h3>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tên nguyên liệu</TableHead>
                    <TableHead>Số lượng tồn</TableHead>
                    <TableHead>Ngưỡng tối thiểu</TableHead>
                    <TableHead>Trạng thái</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {critical.map((item) => (
                    <TableRow key={item.ingredientId}>
                      <TableCell className="font-bold">{item.ingredientName}</TableCell>
                      <TableCell className="text-rose-600 font-black">{item.currentQty} {item.unit}</TableCell>
                      <TableCell>{item.minStock} {item.unit}</TableCell>
                      <TableCell><StatusBadge status={item.statusLevel} /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Warning Section */}
          {warning.length > 0 && (
            <div className="rounded-xl border border-amber-500/40 bg-amber-50/20 dark:bg-amber-950/10 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-base text-amber-600 flex items-center gap-2">
                  ⚠️ Cảnh Báo - Sắp Hết Hàng ({warning.length} mặt hàng)
                </h3>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tên nguyên liệu</TableHead>
                    <TableHead>Số lượng tồn</TableHead>
                    <TableHead>Ngưỡng tối thiểu</TableHead>
                    <TableHead>Trạng thái</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {warning.map((item) => (
                    <TableRow key={item.ingredientId}>
                      <TableCell className="font-bold">{item.ingredientName}</TableCell>
                      <TableCell className="text-amber-600 font-bold">{item.currentQty} {item.unit}</TableCell>
                      <TableCell>{item.minStock} {item.unit}</TableCell>
                      <TableCell><StatusBadge status={item.statusLevel} /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Normal Section */}
          <div className="rounded-xl border p-5 space-y-3 bg-card shadow-sm">
            <h3 className="font-bold text-base text-emerald-600 flex items-center gap-2">
              ✅ Tồn Kho Ổn Định ({normal.length} mặt hàng)
            </h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tên nguyên liệu</TableHead>
                  <TableHead>Số lượng tồn</TableHead>
                  <TableHead>Ngưỡng tối thiểu</TableHead>
                  <TableHead>Trạng thái</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {normal.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                      Không có mặt hàng trong nhóm ổn định.
                    </TableCell>
                  </TableRow>
                ) : (
                  normal.map((item) => (
                    <TableRow key={item.ingredientId}>
                      <TableCell className="font-semibold">{item.ingredientName}</TableCell>
                      <TableCell className="text-emerald-600 font-semibold">{item.currentQty} {item.unit}</TableCell>
                      <TableCell>{item.minStock} {item.unit}</TableCell>
                      <TableCell><StatusBadge status={item.statusLevel} /></TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
}
