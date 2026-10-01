import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft, UtensilsCrossed, Compass } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[75vh] flex flex-col items-center justify-center text-center px-4 py-12">
      <div className="relative mb-6">
        <div className="h-28 w-28 rounded-3xl bg-primary/10 text-primary flex items-center justify-center mx-auto shadow-inner animate-pulse">
          <Compass className="h-14 w-14" />
        </div>
        <span className="absolute -bottom-2 -right-2 bg-primary text-primary-foreground font-black text-xs px-2.5 py-0.5 rounded-full shadow">
          404
        </span>
      </div>

      <h1 className="text-3xl font-black tracking-tight text-foreground sm:text-4xl mb-2">
        Không Tìm Thấy Trang Yêu Cầu
      </h1>

      <p className="text-sm text-muted-foreground max-w-md mx-auto mb-8 leading-relaxed">
        Đường dẫn bạn vừa truy cập không tồn tại trong hệ thống, hoặc quyền hạn tài khoản của bạn chưa được cấp phép truy cập mục này.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button onClick={() => navigate(-1)} variant="outline" className="gap-2 font-bold text-xs">
          <ArrowLeft className="h-4 w-4" />
          Quay lại trang trước
        </Button>

        <Button onClick={() => navigate('/dashboard')} className="gap-2 font-bold text-xs">
          <Home className="h-4 w-4" />
          Về Bảng Điều Khiển
        </Button>

        <Button onClick={() => navigate('/orders/create')} variant="secondary" className="gap-2 font-bold text-xs">
          <UtensilsCrossed className="h-4 w-4" />
          Màn hình Bán Hàng (POS)
        </Button>
      </div>
    </div>
  );
}
