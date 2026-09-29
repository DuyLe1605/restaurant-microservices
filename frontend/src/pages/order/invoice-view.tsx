import * as React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useInvoice } from '@/hooks/use-orders';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { formatVND } from '@/lib/format-currency';
import { formatDateTime } from '@/lib/format-date';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Printer } from 'lucide-react';

export function InvoiceViewPage() {
  const { id } = useParams<{ id: string }>();
  const orderId = Number(id);
  const { data: invoice, isLoading } = useInvoice(orderId);

  if (isLoading) return <LoadingSpinner text="Đang tải hóa đơn..." />;
  if (!invoice) return <div className="p-8 text-center">Không tìm thấy thông tin hóa đơn.</div>;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between print:hidden">
        <Link to="/orders" className="inline-flex items-center text-sm font-semibold text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4 mr-1.5" /> Quay lại danh sách
        </Link>
        <Button onClick={() => window.print()} className="font-bold">
          <Printer className="h-4 w-4 mr-2" /> In hóa đơn
        </Button>
      </div>

      {/* Bill Paper Container */}
      <div className="bg-card border shadow-lg rounded-2xl p-8 print:border-none print:shadow-none font-sans text-foreground">
        {/* Header */}
        <div className="text-center pb-6 border-b space-y-1">
          <h2 className="text-2xl font-black tracking-tight">{invoice.restaurantName}</h2>
          <p className="text-xs text-muted-foreground">{invoice.restaurantAddress}</p>
          <p className="text-sm font-bold uppercase tracking-wider text-primary pt-2">Hóa Đơn Thanh Toán</p>
        </div>

        {/* Info */}
        <div className="grid grid-cols-2 text-xs py-4 border-b gap-2 text-muted-foreground">
          <div>
            <p>Mã hóa đơn: <span className="font-bold text-foreground">#{invoice.orderId}</span></p>
            <p>Bàn ăn: <span className="font-bold text-foreground">{invoice.tableNumber || 'Mang về'}</span></p>
          </div>
          <div className="text-right">
            <p>Ngày giờ: <span className="font-bold text-foreground">{formatDateTime(invoice.invoiceDate)}</span></p>
            <p>Thu ngân: <span className="font-bold text-foreground">{invoice.cashierName}</span></p>
          </div>
        </div>

        {/* Table Items */}
        <div className="py-4 border-b">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b text-muted-foreground text-left">
                <th className="pb-2">Tên món</th>
                <th className="pb-2 text-center">SL</th>
                <th className="pb-2 text-right">Đơn giá</th>
                <th className="pb-2 text-right">Thành tiền</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {invoice.items?.map((item, idx) => (
                <tr key={idx} className="py-2">
                  <td className="py-2 font-semibold">{item.menuName}</td>
                  <td className="py-2 text-center">{item.qty}</td>
                  <td className="py-2 text-right">{formatVND(item.price)}</td>
                  <td className="py-2 text-right font-bold">{formatVND(item.subtotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="pt-4 space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Tạm tính:</span>
            <span className="font-semibold">{formatVND(invoice.subtotal)}</span>
          </div>
          {invoice.discount > 0 && (
            <div className="flex justify-between text-rose-600">
              <span>Giảm giá:</span>
              <span>-{formatVND(invoice.discount)}</span>
            </div>
          )}
          {invoice.vatAmount > 0 && (
            <div className="flex justify-between text-muted-foreground">
              <span>Thuế GTGT (VAT):</span>
              <span>+{formatVND(invoice.vatAmount)}</span>
            </div>
          )}
          <div className="flex justify-between text-base font-black pt-3 border-t text-foreground">
            <span>TỔNG CỘNG:</span>
            <span className="text-primary">{formatVND(invoice.totalAmount)}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center pt-8 text-xs text-muted-foreground space-y-1">
          <p className="font-medium">Cảm ơn quý khách và hẹn gặp lại!</p>
          <p className="text-[10px]">Hệ Thống Nhà Hàng Gourmet Haven • Microservices SOA</p>
        </div>
      </div>
    </div>
  );
}
