import * as React from 'react';
import { useStockReport } from '@/hooks/use-reports';
import { PageHeader } from '@/components/shared/page-header';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { StatusBadge } from '@/components/shared/status-badge';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';

export function StockReportPage() {
  const { data: stockItems, isLoading } = useStockReport();

  const critical = stockItems?.filter((i) => i.statusLevel === 'CRITICAL') || [];
  const warning = stockItems?.filter((i) => i.statusLevel === 'WARNING') || [];
  const normal = stockItems?.filter((i) => i.statusLevel === 'NORMAL') || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Báo Cáo Phân Tầng Tồn Kho"
        description="Phân loại nguyên liệu theo các ngưỡng an toàn: Khẩn cấp (Hết hàng), Cảnh báo (Dưới ngưỡng) và Ổn định"
      />

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
