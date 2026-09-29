import * as React from 'react';
import { useTables, useGenerateQr, useClearQr } from '@/hooks/use-tables';
import { PageHeader } from '@/components/shared/page-header';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { QrCode, RefreshCw, Trash2, ExternalLink } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

export function QrManagePage() {
  const { data: tables, isLoading } = useTables();
  const generateMutation = useGenerateQr();
  const clearMutation = useClearQr();

  const getPublicUrl = (token?: string) => {
    if (!token) return '';
    return `${window.location.origin}/public/order?token=${token}`;
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quản Lý Mã QR Bàn Ăn"
        description="Mỗi bàn được gán mã định danh duy nhất (token) để khách hàng quét camera điện thoại tự gọi món"
      />

      {isLoading ? (
        <LoadingSpinner text="Đang tải danh sách mã QR..." />
      ) : !tables || tables.length === 0 ? (
        <div className="text-center py-12 border border-dashed rounded-xl">
          <p className="text-muted-foreground text-sm">Chưa có bàn ăn nào trong hệ thống.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {tables.map((table) => {
            const hasToken = !!table.orderToken;
            const qrUrl = getPublicUrl(table.orderToken);

            return (
              <Card key={table.id} className="text-center overflow-hidden border hover:shadow-md transition-all">
                <CardHeader className="bg-muted/30 pb-3">
                  <CardTitle className="text-lg font-black">{table.number}</CardTitle>
                  <p className="text-xs text-muted-foreground font-medium">Bàn {table.capacity} chỗ ngồi</p>
                </CardHeader>
                <CardContent className="p-6 flex flex-col items-center justify-center space-y-4">
                  {hasToken ? (
                    <>
                      <div className="p-3 bg-white rounded-xl shadow-inner border inline-block">
                        <QRCodeSVG value={qrUrl} size={150} level="M" />
                      </div>
                      <div className="w-full">
                        <p className="text-[11px] font-mono text-muted-foreground break-all px-2 py-1 bg-muted/40 rounded">
                          Token: {table.orderToken?.slice(0, 16)}...
                        </p>
                      </div>
                      <div className="flex gap-2 w-full">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 text-xs"
                          onClick={() => window.open(qrUrl, '_blank')}
                        >
                          <ExternalLink className="h-3.5 w-3.5 mr-1" /> Thử nghiệm
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive text-xs"
                          onClick={() => clearMutation.mutate(table.id)}
                          isLoading={clearMutation.isPending}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="py-8 flex flex-col items-center">
                      <div className="h-16 w-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-3">
                        <QrCode className="h-8 w-8 text-muted-foreground/40" />
                      </div>
                      <p className="text-xs text-muted-foreground mb-4">Bàn chưa được kích hoạt mã QR</p>
                      <Button
                        size="sm"
                        onClick={() => generateMutation.mutate(table.id)}
                        isLoading={generateMutation.isPending}
                      >
                        <RefreshCw className="h-3.5 w-3.5 mr-1.5" /> Kích hoạt QR
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
