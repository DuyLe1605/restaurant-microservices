import * as React from 'react';
import { useSearchParams } from 'react-router-dom';
import { publicOrderApi, PublicTableSession } from '@/api/public-order.api';
import { useMenuItems } from '@/hooks/use-menu';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { formatVND } from '@/lib/format-currency';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Minus, ShoppingBag, CheckCircle, Utensils } from 'lucide-react';
import { toast } from 'sonner';

export function PublicOrderPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [session, setSession] = React.useState<PublicTableSession | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const { data: menuData } = useMenuItems({ size: 100, active: true });
  const [cart, setCart] = React.useState<{ [menuId: number]: number }>({});
  const [customerName, setCustomerName] = React.useState('');
  const [note, setNote] = React.useState('');
  const [submitted, setSubmitted] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (!token) {
      setError('Thiếu mã QR token. Vui lòng quét lại mã QR tại bàn.');
      setLoading(false);
      return;
    }

    publicOrderApi
      .startSession(token)
      .then((data) => {
        setSession(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.response?.data?.message || 'Mã QR không hợp lệ hoặc đã hết hạn.');
        setLoading(false);
      });
  }, [token]);

  const handleAdd = (menuId: number) => {
    setCart((prev) => ({ ...prev, [menuId]: (prev[menuId] || 0) + 1 }));
  };

  const handleMinus = (menuId: number) => {
    setCart((prev) => {
      const cur = prev[menuId] || 0;
      if (cur <= 1) {
        const copy = { ...prev };
        delete copy[menuId];
        return copy;
      }
      return { ...prev, [menuId]: cur - 1 };
    });
  };

  const cartEntries = Object.entries(cart).map(([mId, qty]) => {
    const item = menuData?.content.find((m) => m.id === Number(mId));
    return { item, qty, subtotal: (item?.price || 0) * qty };
  }).filter((e) => e.item);

  const total = cartEntries.reduce((sum, e) => sum + e.subtotal, 0);

  const handleSubmitOrder = async () => {
    if (cartEntries.length === 0 || !token) return;
    setSubmitting(true);
    try {
      await publicOrderApi.submitOrder({
        token,
        customerName: customerName || 'Khách quét QR',
        note,
        items: cartEntries.map((e) => ({ menuId: e.item!.id, qty: e.qty })),
      });
      setSubmitted(true);
      toast.success('Đơn món đã gửi thành công tới nhà bếp!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Lỗi khi gửi gọi món');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner text="Đang nhận diện bàn ăn..." />;

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
        <div className="max-w-md w-full p-8 text-center bg-card rounded-2xl border shadow-lg space-y-3">
          <div className="h-12 w-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto text-xl font-bold">
            !
          </div>
          <h2 className="text-xl font-bold text-foreground">Không thể gọi món</h2>
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-emerald-50/40">
        <div className="max-w-md w-full p-8 text-center bg-card rounded-2xl border shadow-xl space-y-4">
          <CheckCircle className="h-16 w-16 text-emerald-500 mx-auto" />
          <h2 className="text-2xl font-black text-foreground">Gọi Món Thành Công!</h2>
          <p className="text-sm text-muted-foreground">
            Bàn <span className="font-bold text-foreground">{session?.tableNumber}</span> đã được ghi nhận. Nhà bếp đang chuẩn bị món ăn cho bạn.
          </p>
          <Button onClick={() => setSubmitted(false)} variant="outline" className="w-full">
            Gọi thêm món
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Sticky Table Header */}
      <header className="sticky top-0 z-40 bg-card/95 border-b backdrop-blur-md px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold">
            🍽️
          </div>
          <div>
            <h2 className="font-extrabold text-sm leading-none">Bàn: {session?.tableNumber}</h2>
            <p className="text-[11px] text-muted-foreground">Quét QR Tự Phục Vụ</p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
            {session?.tableStatus}
          </span>
        </div>
      </header>

      {/* Menu List */}
      <main className="max-w-lg mx-auto p-4 space-y-3">
        <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Thực Đơn Món Ăn</h3>

        {menuData?.content.map((item) => {
          const qty = cart[item.id] || 0;
          return (
            <div key={item.id} className="p-3.5 bg-card rounded-xl border shadow-sm flex items-center justify-between">
              <div className="flex-1 pr-3">
                <h4 className="font-bold text-sm">{item.name}</h4>
                <p className="text-xs text-muted-foreground line-clamp-1">{item.description || item.category}</p>
                <p className="font-extrabold text-emerald-600 text-sm mt-1">{formatVND(item.price)}</p>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {qty > 0 ? (
                  <>
                    <Button size="icon" variant="outline" className="h-8 w-8 rounded-lg" onClick={() => handleMinus(item.id)}>
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-6 text-center font-bold text-sm">{qty}</span>
                    <Button size="icon" className="h-8 w-8 rounded-lg" onClick={() => handleAdd(item.id)}>
                      <Plus className="h-3 w-3" />
                    </Button>
                  </>
                ) : (
                  <Button size="sm" className="h-8 text-xs font-bold" onClick={() => handleAdd(item.id)}>
                    + Chọn
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </main>

      {/* Fixed Bottom Cart Bar */}
      {cartEntries.length > 0 && (
        <div className="fixed bottom-0 inset-x-0 bg-card border-t p-4 shadow-2xl z-50 max-w-lg mx-auto">
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold text-muted-foreground">Món đã chọn ({cartEntries.length}):</span>
              <span className="font-black text-lg text-primary">{formatVND(total)}</span>
            </div>

            <Input
              placeholder="Tên khách hàng hoặc ghi chú..."
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="h-9 text-xs"
            />

            <Button
              className="w-full h-11 text-base font-bold shadow-lg"
              isLoading={submitting}
              onClick={handleSubmitOrder}
            >
              <ShoppingBag className="h-4 w-4 mr-2" />
              Gửi gọi món ({formatVND(total)})
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
