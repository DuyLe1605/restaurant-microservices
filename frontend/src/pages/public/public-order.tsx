import * as React from 'react';
import { useSearchParams } from 'react-router-dom';
import { publicOrderApi, PublicTableSession } from '@/api/public-order.api';
import { useMenuItems } from '@/hooks/use-menu';
import { MenuItem } from '@/types/menu';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { formatVND } from '@/lib/format-currency';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog } from '@/components/ui/dialog';
import { cn, smartIncludes } from '@/lib/utils';
import { useCreateServiceRequest } from '@/hooks/use-service-requests';
import { ServiceRequestType } from '@/api/service-request.api';
import {
  Plus,
  Minus,
  ShoppingBag,
  CheckCircle,
  UtensilsCrossed,
  Search,
  Sparkles,
  Wifi,
  BellRing,
  Droplets,
  MessageSquare,
  Clock,
  Trash2,
  ChefHat,
  ChevronRight,
  Flame,
  Award,
  ArrowRight,
  X,
  Phone,
  User,
  Heart,
  Share2,
} from 'lucide-react';
import { toast } from 'sonner';

interface CartItemEntry {
  item: MenuItem;
  qty: number;
  note: string;
}

// Curated high-resolution culinary photography fallbacks
function getDishImage(item: MenuItem): string {
  if (item.imageUrl && item.imageUrl.startsWith('http')) return item.imageUrl;
  const name = item.name.toLowerCase();
  const code = (item.code || '').toLowerCase();

  if (name.includes('wagyu') || name.includes('bò') || code.includes('wagyu')) {
    return 'https://images.unsplash.com/photo-1544025162-d76694265947?w=700&auto=format&fit=crop&q=80';
  }
  if (name.includes('cua') || name.includes('crab') || code.includes('crab')) {
    return 'https://images.unsplash.com/photo-1559847844-5315695dadae?w=700&auto=format&fit=crop&q=80';
  }
  if (name.includes('bào ngư') || name.includes('súp') || name.includes('soup')) {
    return 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=700&auto=format&fit=crop&q=80';
  }
  if (name.includes('cá hồi') || name.includes('salmon')) {
    return 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=700&auto=format&fit=crop&q=80';
  }
  if (name.includes('salad') || name.includes('rau') || name.includes('khai vị')) {
    return 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=700&auto=format&fit=crop&q=80';
  }
  if (name.includes('rượu') || name.includes('vang') || name.includes('nước') || name.includes('uống') || name.includes('trà') || name.includes('cà phê')) {
    return 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=700&auto=format&fit=crop&q=80';
  }
  if (name.includes('bánh') || name.includes('mousse') || name.includes('chocolate') || name.includes('tráng miệng')) {
    return 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=700&auto=format&fit=crop&q=80';
  }
  return 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=700&auto=format&fit=crop&q=80';
}

export function PublicOrderPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [session, setSession] = React.useState<PublicTableSession | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const { data: menuData } = useMenuItems({ size: 100, active: true });

  // Cart state: menuId -> { item, qty, note }
  const [cart, setCart] = React.useState<Record<number, CartItemEntry>>({});

  // Filter & Search
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState('ALL');

  // Customer & Loyalty information
  const [customerName, setCustomerName] = React.useState('');
  const [customerPhone, setCustomerPhone] = React.useState('');
  const [orderNote, setOrderNote] = React.useState('');

  // Modals
  const [cartDrawerOpen, setCartDrawerOpen] = React.useState(false);
  const [detailModalItem, setDetailModalItem] = React.useState<{ item: MenuItem; note: string; qty: number } | null>(null);
  const [submitted, setSubmitted] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [lastSubmittedOrder, setLastSubmittedOrder] = React.useState<any>(null);

  // Service request state
  const createServiceRequest = useCreateServiceRequest();
  const [sentRequests, setSentRequests] = React.useState<Set<ServiceRequestType>>(new Set());

  // Quick preset notes
  const notePresets = ['Không cay', 'Ít cay', 'Không hành', 'Ít đá', 'Không đường', 'Lên món nhanh'];

  React.useEffect(() => {
    if (!token) {
      setError('Thiếu mã QR token của bàn. Vui lòng quét lại mã QR được dán trên bàn ăn.');
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

  const allMenuItems = React.useMemo(() => menuData?.content || [], [menuData]);

  // Extract unique categories
  const categories = React.useMemo(() => {
    const set = new Set<string>();
    allMenuItems.forEach((item) => {
      if (item.category) set.add(item.category);
    });
    return Array.from(set);
  }, [allMenuItems]);

  // Filtered menu
  const filteredMenuItems = React.useMemo(() => {
    return allMenuItems.filter((item) => {
      const matchSearch =
        !searchQuery ||
        smartIncludes(item.name, searchQuery) ||
        smartIncludes(item.code, searchQuery) ||
        smartIncludes(item.description, searchQuery);
      const matchCategory = selectedCategory === 'ALL' || item.category === selectedCategory;
      return matchSearch && matchCategory;
    });
  }, [allMenuItems, searchQuery, selectedCategory]);

  // Cart operations
  const handleAdd = (item: MenuItem, delta: number = 1, note: string = '') => {
    setCart((prev) => {
      const existing = prev[item.id];
      const newQty = (existing ? existing.qty : 0) + delta;
      return {
        ...prev,
        [item.id]: {
          item,
          qty: newQty,
          note: note || existing?.note || '',
        },
      };
    });
    toast.success(`Đã thêm "${item.name}" vào giỏ`, { duration: 1500 });
  };

  const handleMinus = (itemId: number) => {
    setCart((prev) => {
      const existing = prev[itemId];
      if (!existing) return prev;
      if (existing.qty <= 1) {
        const copy = { ...prev };
        delete copy[itemId];
        return copy;
      }
      return {
        ...prev,
        [itemId]: { ...existing, qty: existing.qty - 1 },
      };
    });
  };

  const handleRemove = (itemId: number) => {
    setCart((prev) => {
      const copy = { ...prev };
      delete copy[itemId];
      return copy;
    });
  };

  const cartEntries = Object.values(cart);
  const totalQty = cartEntries.reduce((sum, e) => sum + e.qty, 0);
  const totalAmount = cartEntries.reduce((sum, e) => sum + e.item.price * e.qty, 0);

  // Quick Service Request Actions – calls real backend API
  const handleCallStaff = (type: ServiceRequestType, label?: string) => {
    if (!session?.tableNumber || createServiceRequest.isPending || sentRequests.has(type)) return;
    createServiceRequest.mutate(
      { tableNumber: session.tableNumber, type, note: undefined },
      {
        onSuccess: () => {
          setSentRequests((prev) => new Set(prev).add(type));
          // Reset "sent" state after 30s to allow re-requesting
          setTimeout(() => setSentRequests((prev) => { const s = new Set(prev); s.delete(type); return s; }), 30000);
        },
      }
    );
  };

  const handleSubmitOrder = async () => {
    if (cartEntries.length === 0 || !token) return;
    setSubmitting(true);
    try {
      const res = await publicOrderApi.submitOrder({
        token,
        customerName: customerName.trim() || `Khách Bàn ${session?.tableNumber || 'QR'}`,
        customerPhone: customerPhone.trim() || undefined,
        note: orderNote.trim() || undefined,
        items: cartEntries.map((e) => ({
          menuId: e.item.id,
          qty: e.qty,
          note: e.note || undefined,
        })),
      });
      setLastSubmittedOrder(res);
      setSubmitted(true);
      setCartDrawerOpen(false);
      setCart({});
      toast.success('🎉 Đơn món đã được chuyển thành công tới nhà bếp!', { duration: 4000 });
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Có lỗi khi gửi gọi món. Vui lòng thử lại!');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-500/10 via-background to-background flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="h-16 w-16 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center text-3xl mx-auto shadow-xl animate-pulse">
            🍽️
          </div>
          <LoadingSpinner text="Đang nhận diện bàn ăn và tải thực đơn..." />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-950">
        <div className="max-w-md w-full p-8 text-center bg-card rounded-3xl border shadow-2xl space-y-4">
          <div className="h-16 w-16 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto text-2xl font-bold shadow-md">
            ⚠️
          </div>
          <h2 className="text-2xl font-black text-foreground">Không Thể Mở Thực Đơn</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">{error}</p>
          <div className="p-4 bg-muted/50 rounded-2xl text-xs text-muted-foreground space-y-1">
            <p className="font-semibold text-foreground">Hướng dẫn:</p>
            <p>1. Vui lòng quét lại mã QR được dán trực tiếp trên bàn ăn của bạn.</p>
            <p>2. Hoặc nhờ nhân viên phục vụ mở bàn để kích hoạt mã QR mới.</p>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // POST-ORDER SUCCESS VIEW
  // -------------------------------------------------------------
  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-500/15 via-background to-background p-4 flex items-center justify-center">
        <div className="max-w-md w-full bg-card rounded-3xl border shadow-2xl p-6 sm:p-8 text-center space-y-6">
          <div className="relative mx-auto w-20 h-20">
            <div className="absolute inset-0 bg-emerald-500/20 rounded-full animate-ping" />
            <div className="relative h-20 w-20 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-lg mx-auto">
              <CheckCircle className="h-10 w-10" />
            </div>
          </div>

          <div className="space-y-1.5">
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-emerald-600 bg-emerald-500/10 px-3 py-1 rounded-full">
              ĐÃ GỬI BẾP THÀNH CÔNG
            </span>
            <h2 className="text-2xl font-black text-foreground pt-1">Bếp Đang Chuẩn Bị Món!</h2>
            <p className="text-xs text-muted-foreground">
              Đơn gọi món tại <strong className="text-primary font-bold">Bàn {session?.tableNumber}</strong> đã được chuyển trực tiếp vào màn hình KDS của đầu bếp.
            </p>
          </div>

          {/* Timeline of preparation */}
          <div className="p-4 bg-muted/40 rounded-2xl border space-y-3 text-left">
            <p className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-primary" /> Tiến độ phục vụ
            </p>
            <div className="space-y-2.5 text-xs">
              <div className="flex items-center gap-2.5 text-emerald-600 font-semibold">
                <span className="h-5 w-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold">✓</span>
                <span>Tiếp nhận đơn gọi món từ QR</span>
              </div>
              <div className="flex items-center gap-2.5 text-amber-600 font-semibold">
                <span className="h-5 w-5 rounded-full bg-amber-500 text-white flex items-center justify-center text-[10px] font-bold animate-spin">⚡</span>
                <span>Bếp đang chuẩn bị chế biến</span>
              </div>
              <div className="flex items-center gap-2.5 text-muted-foreground">
                <span className="h-5 w-5 rounded-full bg-muted border flex items-center justify-center text-[10px]">3</span>
                <span>Phục vụ lên bàn</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => handleCallStaff('CALL_STAFF', 'Yêu cầu thanh toán')}
              className="h-11 text-xs font-bold rounded-xl"
            >
              <BellRing className="h-4 w-4 mr-1.5 text-amber-500" />
              Yêu cầu tính tiền
            </Button>
            <Button
              onClick={() => setSubmitted(false)}
              className="h-11 text-xs font-bold bg-primary text-primary-foreground rounded-xl shadow-md"
            >
              <UtensilsCrossed className="h-4 w-4 mr-1.5" />
              Gọi thêm món khác
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // MAIN DIGITAL MENU VIEW
  // -------------------------------------------------------------
  return (
    <div className="min-h-screen bg-slate-50/60 dark:bg-slate-950 text-foreground pb-28">
      {/* Top Banner / Restaurant Branding */}
      <div className="relative bg-gradient-to-br from-amber-900 via-stone-900 to-stone-950 text-white overflow-hidden shadow-lg">
        {/* Ambient overlay */}
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:16px_16px]" />

        <div className="relative max-w-2xl mx-auto px-4 pt-5 pb-6 space-y-3.5">
          {/* Top Brand Bar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-11 w-11 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-400 text-white flex items-center justify-center shadow-lg font-black text-xl">
                👑
              </div>
              <div>
                <h1 className="font-extrabold text-base tracking-wide flex items-center gap-1.5">
                  Nhà Hàng Hoàng Gia
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold px-1.5 py-0.2 rounded-full">
                    Gourmet
                  </span>
                </h1>
                <p className="text-[11px] text-amber-200/80 font-medium">Fine Dining & Vietnamese Cuisine</p>
              </div>
            </div>

            {/* Table Badge */}
            <div className="bg-white/10 backdrop-blur-md border border-white/15 px-3 py-1.5 rounded-2xl text-right shadow-inner">
              <span className="text-[10px] uppercase font-bold text-amber-300 block tracking-wider">BÀN ĂN</span>
              <span className="text-base font-black text-white">{session?.tableNumber}</span>
            </div>
          </div>

          {/* Quick Service Helper Actions */}
          <div className="flex items-center gap-2 pt-1 overflow-x-auto no-scrollbar">
            <button
              type="button"
              onClick={() => {
                navigator.clipboard?.writeText('88888888');
                toast.success('Đã sao chép mật khẩu WiFi: 88888888');
              }}
              className="whitespace-nowrap px-2.5 py-1 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-[11px] font-medium flex items-center gap-1.5 transition-all text-amber-100"
            >
              <Wifi className="h-3.5 w-3.5 text-amber-400" />
              WiFi: NhaHang_VIP
            </button>

            <button
              type="button"
              onClick={() => handleCallStaff('CALL_STAFF', 'Gọi phục vụ')}
              disabled={createServiceRequest.isPending || sentRequests.has('CALL_STAFF')}
              className={cn(
                'whitespace-nowrap px-2.5 py-1 rounded-xl border text-[11px] font-medium flex items-center gap-1.5 transition-all',
                sentRequests.has('CALL_STAFF')
                  ? 'bg-amber-500/30 border-amber-400/40 text-amber-200 cursor-default'
                  : 'bg-white/10 hover:bg-white/20 border-white/10 text-amber-100'
              )}
            >
              {sentRequests.has('CALL_STAFF') ? (
                <CheckCircle className="h-3.5 w-3.5 text-amber-400" />
              ) : (
                <BellRing className="h-3.5 w-3.5 text-amber-400" />
              )}
              {sentRequests.has('CALL_STAFF') ? 'Đã gọi ✓' : 'Gọi phục vụ'}
            </button>

            <button
              type="button"
              onClick={() => handleCallStaff('WATER', 'Thêm nước')}
              disabled={createServiceRequest.isPending || sentRequests.has('WATER')}
              className={cn(
                'whitespace-nowrap px-2.5 py-1 rounded-xl border text-[11px] font-medium flex items-center gap-1.5 transition-all',
                sentRequests.has('WATER')
                  ? 'bg-cyan-500/30 border-cyan-400/40 text-cyan-200 cursor-default'
                  : 'bg-white/10 hover:bg-white/20 border-white/10 text-amber-100'
              )}
            >
              {sentRequests.has('WATER') ? (
                <CheckCircle className="h-3.5 w-3.5 text-cyan-400" />
              ) : (
                <Droplets className="h-3.5 w-3.5 text-cyan-400" />
              )}
              {sentRequests.has('WATER') ? 'Đã gửi ✓' : 'Thêm nước'}
            </button>

            <button
              type="button"
              onClick={() => handleCallStaff('TOWEL', 'Gọi khăn')}
              disabled={createServiceRequest.isPending || sentRequests.has('TOWEL')}
              className={cn(
                'whitespace-nowrap px-2.5 py-1 rounded-xl border text-[11px] font-medium flex items-center gap-1.5 transition-all',
                sentRequests.has('TOWEL')
                  ? 'bg-emerald-500/30 border-emerald-400/40 text-emerald-200 cursor-default'
                  : 'bg-white/10 hover:bg-white/20 border-white/10 text-amber-100'
              )}
            >
              {sentRequests.has('TOWEL') ? (
                <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
              ) : (
                <MessageSquare className="h-3.5 w-3.5 text-emerald-400" />
              )}
              {sentRequests.has('TOWEL') ? 'Đã gửi ✓' : 'Gọi khăn'}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 -mt-3">
        {/* Search Bar */}
        <div className="relative shadow-md rounded-2xl overflow-hidden bg-card border">
          <Input
            placeholder="Tìm món ngon, đồ uống, tráng miệng..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-11 pl-10 pr-9 border-0 text-sm focus-visible:ring-0 bg-card"
          />
          <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-3.5 text-muted-foreground hover:text-foreground text-xs"
            >
              ✕
            </button>
          )}
        </div>

        {/* Customer Membership Prompt */}
        <div className="mt-3 p-3 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-purple-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Award className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <div>
              <span className="font-bold text-foreground">Hội viên tích điểm: </span>
              <span className="text-muted-foreground text-[11px]">
                {customerPhone ? `SĐT: ${customerPhone} (${customerName || 'Quý khách'})` : 'Nhập SĐT để tích điểm 10k = 1đ'}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setCartDrawerOpen(true)}
            className="text-[11px] font-bold text-primary hover:underline shrink-0"
          >
            {customerPhone ? 'Thay đổi' : 'Nhập SĐT'}
          </button>
        </div>

        {/* Category Carousel (Sticky) */}
        <div className="sticky top-0 z-30 bg-slate-50/90 dark:bg-slate-950/90 backdrop-blur-md py-3 -mx-4 px-4 border-b border-border/50">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            <button
              type="button"
              onClick={() => setSelectedCategory('ALL')}
              className={cn(
                'whitespace-nowrap px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0',
                selectedCategory === 'ALL'
                  ? 'bg-primary text-primary-foreground shadow-sm scale-105'
                  : 'bg-card text-muted-foreground border hover:bg-muted'
              )}
            >
              🍽️ Tất cả ({allMenuItems.length})
            </button>
            {categories.map((cat) => {
              const count = allMenuItems.filter((i) => i.category === cat).length;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={cn(
                    'whitespace-nowrap px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0',
                    selectedCategory === cat
                      ? 'bg-primary text-primary-foreground shadow-sm scale-105'
                      : 'bg-card text-muted-foreground border hover:bg-muted'
                  )}
                >
                  {cat} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Menu Items Grid / List */}
        <div className="pt-4 space-y-3">
          {filteredMenuItems.length === 0 ? (
            <div className="py-16 text-center bg-card rounded-3xl border border-dashed p-6 space-y-2">
              <UtensilsCrossed className="h-10 w-10 text-muted-foreground/40 mx-auto" />
              <p className="font-bold text-foreground text-sm">Không tìm thấy món phù hợp</p>
              <p className="text-xs text-muted-foreground">Thử tìm kiếm với từ khóa khác hoặc chọn danh mục "Tất cả"</p>
            </div>
          ) : (
            filteredMenuItems.map((item) => {
              const inCart = cart[item.id];
              const qty = inCart?.qty || 0;
              const imageUrl = getDishImage(item);

              return (
                <div
                  key={item.id}
                  className="group bg-card rounded-2xl border border-border/70 p-3 shadow-xs hover:shadow-md transition-all flex gap-3.5 items-center relative overflow-hidden"
                >
                  {/* Dish Thumbnail */}
                  <div
                    onClick={() => setDetailModalItem({ item, note: inCart?.note || '', qty: qty || 1 })}
                    className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden shrink-0 bg-muted cursor-pointer shadow-2xs"
                  >
                    <img
                      src={imageUrl}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {item.code && (
                      <span className="absolute top-1.5 left-1.5 text-[9px] font-mono font-bold bg-black/60 text-white px-1.5 py-0.2 rounded-full uppercase backdrop-blur-xs">
                        {item.code}
                      </span>
                    )}
                  </div>

                  {/* Dish Info */}
                  <div className="flex-1 min-w-0 pr-1 space-y-1">
                    <div className="flex items-center gap-1.5">
                      {item.category && (
                        <span className="text-[10px] font-semibold text-primary/80 uppercase tracking-wide">
                          {item.category}
                        </span>
                      )}
                      {item.price >= 500000 && (
                        <span className="text-[9px] font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300 px-1.5 py-0.2 rounded-full">
                          ⭐ Signature
                        </span>
                      )}
                    </div>

                    <h3
                      onClick={() => setDetailModalItem({ item, note: inCart?.note || '', qty: qty || 1 })}
                      className="font-bold text-sm text-foreground leading-snug line-clamp-1 cursor-pointer hover:text-primary transition-colors"
                    >
                      {item.name}
                    </h3>

                    <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                      {item.description || 'Món ăn đặc sắc tuyển chọn từ nguyên liệu tươi ngon thượng hạng.'}
                    </p>

                    {/* Price and Cart Actions */}
                    <div className="pt-1 flex items-center justify-between gap-2">
                      <span className="font-extrabold text-sm text-emerald-600 dark:text-emerald-400">
                        {formatVND(item.price)}
                      </span>

                      {/* Add Button or Stepper */}
                      {qty > 0 ? (
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleMinus(item.id)}
                            className="h-7 w-7 rounded-lg border border-primary/30 bg-primary/10 text-primary flex items-center justify-center font-bold text-sm active:scale-95 transition-transform"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="min-w-[18px] text-center font-extrabold text-xs text-primary">
                            {qty}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleAdd(item, 1)}
                            className="h-7 w-7 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm shadow-xs active:scale-95 transition-transform"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => handleAdd(item, 1)}
                          className="h-7.5 px-3 rounded-xl text-xs font-bold shadow-xs active:scale-95 transition-transform bg-primary text-primary-foreground"
                        >
                          <Plus className="h-3.5 w-3.5 mr-1" />
                          Chọn
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* -------------------------------------------------------------
          FLOATING BOTTOM CART BAR
         ------------------------------------------------------------- */}
      {totalQty > 0 && (
        <div className="fixed bottom-3 inset-x-0 z-40 px-4 max-w-lg mx-auto">
          <div
            onClick={() => setCartDrawerOpen(true)}
            className="bg-stone-900/95 dark:bg-stone-900/95 text-white p-3.5 rounded-2xl shadow-2xl border border-white/10 flex items-center justify-between cursor-pointer backdrop-blur-md active:scale-[0.99] transition-all hover:bg-stone-900"
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="h-10 w-10 rounded-xl bg-amber-500 text-stone-900 flex items-center justify-center font-black shadow-md">
                  <ShoppingBag className="h-5 w-5" />
                </div>
                <span className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-rose-500 text-white text-[11px] font-black flex items-center justify-center shadow-md animate-bounce">
                  {totalQty}
                </span>
              </div>
              <div>
                <p className="text-[11px] text-stone-300 font-medium">Bàn {session?.tableNumber} • {cartEntries.length} loại món</p>
                <p className="font-extrabold text-base text-amber-400">{formatVND(totalAmount)}</p>
              </div>
            </div>

            <Button
              size="sm"
              className="bg-amber-500 hover:bg-amber-600 text-stone-950 font-black text-xs px-3.5 h-9 rounded-xl shadow-md"
            >
              Xem Giỏ Hàng
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------
          DISH DETAIL MODAL
         ------------------------------------------------------------- */}
      <Dialog
        open={detailModalItem !== null}
        onOpenChange={(open) => !open && setDetailModalItem(null)}
        title={detailModalItem?.item.name || 'Chi Tiết Món Ăn'}
        description={detailModalItem?.item.category ? `Danh mục: ${detailModalItem.item.category}` : undefined}
        className="max-w-md max-h-[90vh] overflow-y-auto"
      >
        {detailModalItem && (
          <div className="space-y-4 pt-1">
            <div className="relative h-48 w-full rounded-2xl overflow-hidden bg-muted shadow-inner">
              <img
                src={getDishImage(detailModalItem.item)}
                alt={detailModalItem.item.name}
                className="w-full h-full object-cover"
              />
              <span className="absolute bottom-2.5 right-2.5 bg-black/70 backdrop-blur-md text-amber-400 font-black text-base px-3 py-1 rounded-xl shadow-md">
                {formatVND(detailModalItem.item.price)}
              </span>
            </div>

            <div className="space-y-1">
              <h4 className="font-black text-lg text-foreground">{detailModalItem.item.name}</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {detailModalItem.item.description || 'Món ăn đặc sắc của nhà hàng, chế biến từ nguyên liệu tươi ngon hàng ngày.'}
              </p>
            </div>

            {/* Note Presets */}
            <div className="space-y-1.5 pt-1">
              <label className="text-xs font-bold text-foreground block">Ghi chú cho món ăn này:</label>
              <div className="flex flex-wrap gap-1.5">
                {notePresets.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => {
                      const current = detailModalItem.note;
                      const updated = current ? `${current}, ${preset}` : preset;
                      setDetailModalItem({ ...detailModalItem, note: updated });
                    }}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-muted hover:bg-primary/10 hover:text-primary transition-all border border-border/60"
                  >
                    + {preset}
                  </button>
                ))}
              </div>
              <Input
                placeholder="Ghi chú thêm (vd: ăn cay ít, không bỏ tiêu, ăn nóng...)"
                value={detailModalItem.note}
                onChange={(e) => setDetailModalItem({ ...detailModalItem, note: e.target.value })}
                className="h-8.5 text-xs mt-1"
              />
            </div>

            {/* Quantity Stepper & Add */}
            <div className="flex items-center justify-between pt-2 border-t">
              <div className="flex items-center gap-2 border rounded-xl p-1 bg-muted/40">
                <button
                  type="button"
                  onClick={() => setDetailModalItem({ ...detailModalItem, qty: Math.max(1, detailModalItem.qty - 1) })}
                  className="h-8 w-8 rounded-lg bg-card hover:bg-muted flex items-center justify-center font-bold text-foreground"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="w-8 text-center font-black text-sm">{detailModalItem.qty}</span>
                <button
                  type="button"
                  onClick={() => setDetailModalItem({ ...detailModalItem, qty: detailModalItem.qty + 1 })}
                  className="h-8 w-8 rounded-lg bg-card hover:bg-muted flex items-center justify-center font-bold text-foreground"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>

              <Button
                onClick={() => {
                  handleAdd(detailModalItem.item, detailModalItem.qty, detailModalItem.note);
                  setDetailModalItem(null);
                }}
                className="h-10 px-5 text-xs font-bold rounded-xl shadow-md bg-primary text-primary-foreground"
              >
                Thêm vào giỏ • {formatVND(detailModalItem.item.price * detailModalItem.qty)}
              </Button>
            </div>
          </div>
        )}
      </Dialog>

      {/* -------------------------------------------------------------
          CART DRAWER / ORDER REVIEW MODAL
         ------------------------------------------------------------- */}
      <Dialog
        open={cartDrawerOpen}
        onOpenChange={setCartDrawerOpen}
        title={`Giỏ Hàng Bàn ${session?.tableNumber || ''}`}
        description="Kiểm tra lại món ăn và thông tin trước khi gửi lệnh gọi món tới nhà bếp."
        className="max-w-lg max-h-[90vh] overflow-y-auto"
      >
        <div className="space-y-4 pt-1">
          {/* Customer & Loyalty inputs */}
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                <Award className="h-4 w-4 text-amber-600" />
                Tài Khoản Khách Hàng & Tích Điểm
              </span>
              <span className="text-[10px] font-semibold text-amber-700 dark:text-amber-300">
                10.000đ = 1 điểm
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="relative">
                <User className="h-3.5 w-3.5 absolute left-2.5 top-2.5 text-muted-foreground" />
                <Input
                  placeholder="Tên của bạn..."
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="h-8 text-xs pl-8 bg-background"
                />
              </div>
              <div className="relative">
                <Phone className="h-3.5 w-3.5 absolute left-2.5 top-2.5 text-muted-foreground" />
                <Input
                  placeholder="Số ĐT tích điểm..."
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="h-8 text-xs pl-8 bg-background"
                />
              </div>
            </div>
          </div>

          {/* List of items */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-muted-foreground uppercase">
              <span>Món đã chọn ({cartEntries.length})</span>
              <button
                type="button"
                onClick={() => setCart({})}
                className="text-destructive hover:underline text-[11px] font-normal"
              >
                Xóa tất cả
              </button>
            </div>

            <div className="divide-y border rounded-2xl overflow-hidden bg-card max-h-56 overflow-y-auto">
              {cartEntries.map((e) => (
                <div key={e.item.id} className="p-3 flex items-center justify-between gap-3 text-xs">
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-foreground text-sm truncate">{e.item.name}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {formatVND(e.item.price)} × {e.qty} = <strong className="text-foreground">{formatVND(e.item.price * e.qty)}</strong>
                    </p>
                    {e.note && (
                      <p className="text-[10px] text-amber-700 dark:text-amber-400 italic mt-0.5">
                        Ghi chú: "{e.note}"
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <div className="flex items-center border rounded-lg bg-muted/40 p-0.5">
                      <button
                        type="button"
                        onClick={() => handleMinus(e.item.id)}
                        className="h-6 w-6 rounded flex items-center justify-center hover:bg-muted font-bold text-xs"
                      >
                        -
                      </button>
                      <span className="w-6 text-center font-bold text-xs">{e.qty}</span>
                      <button
                        type="button"
                        onClick={() => handleAdd(e.item, 1)}
                        className="h-6 w-6 rounded flex items-center justify-center hover:bg-muted font-bold text-xs"
                      >
                        +
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemove(e.item.id)}
                      className="text-muted-foreground/60 hover:text-destructive p-1 rounded hover:bg-destructive/10"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Kitchen Note */}
          <div>
            <label className="text-xs font-bold text-foreground block mb-1">
              Ghi chú chung cho nhà bếp:
            </label>
            <Input
              placeholder="Ví dụ: Mang món khai vị trước, lên món nhanh giúp mình..."
              value={orderNote}
              onChange={(e) => setOrderNote(e.target.value)}
              className="h-8.5 text-xs"
            />
          </div>

          {/* Total Summary */}
          <div className="p-3.5 bg-muted/60 rounded-2xl border space-y-1.5 text-xs">
            <div className="flex justify-between text-muted-foreground">
              <span>Tổng số lượng:</span>
              <span className="font-bold text-foreground">{totalQty} phần</span>
            </div>
            {customerPhone && (
              <div className="flex justify-between text-amber-700 dark:text-amber-400 font-medium">
                <span>Ước tính tích điểm:</span>
                <span className="font-bold">+{Math.floor(totalAmount / 10000)} điểm</span>
              </div>
            )}
            <div className="flex justify-between text-base font-black text-primary border-t pt-2">
              <span>TỔNG TIỀN DỰ KIẾN:</span>
              <span className="text-lg">{formatVND(totalAmount)}</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t">
            <Button
              variant="outline"
              onClick={() => setCartDrawerOpen(false)}
              className="h-11 font-bold text-xs rounded-xl"
            >
              Chọn thêm món
            </Button>
            <Button
              disabled={submitting || cartEntries.length === 0}
              onClick={handleSubmitOrder}
              className="h-11 font-black text-xs rounded-xl shadow-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
            >
              <ChefHat className="h-4 w-4 mr-1.5" />
              {submitting ? 'Đang gửi...' : 'Gửi Nhà Bếp'}
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
