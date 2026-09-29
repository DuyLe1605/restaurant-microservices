import * as React from 'react';
import { useKitchen, KitchenTicket } from '@/hooks/use-kitchen';
import { PageHeader } from '@/components/shared/page-header';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { Button } from '@/components/ui/button';
import { OrderDetailStatus } from '@/types/order';
import {
  ChefHat,
  Clock,
  CheckCircle2,
  Flame,
  AlertTriangle,
  RotateCw,
  Maximize2,
  Utensils,
  Volume2,
  VolumeX,
  MessageSquare,
  Sparkles,
} from 'lucide-react';

export function KitchenDisplayPage() {
  const { tickets, isLoading, refetch, updateItemStatus, markAllTicket } = useKitchen();

  const [selectedStation, setSelectedStation] = React.useState<string>('ALL');
  const [soundEnabled, setSoundEnabled] = React.useState<boolean>(true);
  const [currentTime, setCurrentTime] = React.useState<Date>(new Date());

  // Update clock every second
  React.useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Filter tickets by status (active tickets that still have unserved items)
  const activeTickets = React.useMemo(() => {
    return tickets.filter((ticket) => {
      const hasUnserved = ticket.items.some((i) => i.currentStatus !== 'SERVED');
      return hasUnserved;
    });
  }, [tickets]);

  // Calculate elapsed minutes
  const getElapsedMinutes = (orderTimeStr: string): number => {
    const orderDate = new Date(orderTimeStr).getTime();
    const now = currentTime.getTime();
    const diffMs = Math.max(0, now - orderDate);
    return Math.floor(diffMs / 60000);
  };

  // Next status helper
  const getNextStatus = (current: OrderDetailStatus): OrderDetailStatus => {
    switch (current) {
      case 'ORDERED':
        return 'COOKING';
      case 'COOKING':
        return 'COOKED';
      case 'COOKED':
        return 'SERVED';
      default:
        return 'SERVED';
    }
  };

  const getStatusBadge = (status: OrderDetailStatus) => {
    switch (status) {
      case 'ORDERED':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-muted text-muted-foreground border">Chờ nấu</span>;
      case 'COOKING':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/30 flex items-center gap-1">
            <Flame className="h-3 w-3 animate-pulse" /> Đang nấu
          </span>
        );
      case 'COOKED':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" /> Đã xong
          </span>
        );
      case 'SERVED':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-purple-500/20 text-purple-700 dark:text-purple-400 border border-purple-500/30">Đã ra món</span>;
      default:
        return null;
    }
  };

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-card p-4 rounded-2xl border shadow-sm">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-md shadow-orange-500/20">
            <ChefHat className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight flex items-center gap-2">
              Màn Hình Bếp & Quầy Bar (KDS)
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 animate-pulse">
                Live Real-time
              </span>
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Nhận lệnh gọi món từ POS, cập nhật tiến độ chế biến và giảm thời gian chờ của khách
            </p>
          </div>
        </div>

        {/* Live Clock & Action Tools */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-muted/60 border font-mono font-bold text-sm">
            <Clock className="h-4 w-4 text-primary" />
            <span>{currentTime.toLocaleTimeString('vi-VN')}</span>
          </div>

          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9 rounded-xl"
            onClick={() => setSoundEnabled(!soundEnabled)}
            title={soundEnabled ? 'Tắt âm báo' : 'Bật âm báo'}
          >
            {soundEnabled ? <Volume2 className="h-4 w-4 text-primary" /> : <VolumeX className="h-4 w-4 text-muted-foreground" />}
          </Button>

          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9 rounded-xl"
            onClick={() => refetch()}
            title="Làm mới danh sách"
          >
            <RotateCw className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9 rounded-xl hidden sm:flex"
            onClick={handleToggleFullscreen}
            title="Toàn màn hình"
          >
            <Maximize2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Station Tabs & Counters */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: 'ALL', name: 'Tất cả phân khu', count: activeTickets.length },
            { id: 'HOT', name: '🔥 Bếp Nóng (Nướng/Xào)', count: activeTickets.length },
            { id: 'COLD', name: '🥗 Bếp Khai Vị & Lẩu', count: Math.ceil(activeTickets.length / 2) },
            { id: 'BAR', name: '🍹 Quầy Bar & Pha Chế', count: Math.floor(activeTickets.length / 2) },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedStation(tab.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                selectedStation === tab.id
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-card border text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <span>{tab.name}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/10 dark:bg-white/20">
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 text-xs font-medium text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
            <span>&lt; 10 phút</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500"></span>
            <span>10 - 20 phút</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-500 animate-ping"></span>
            <span>&gt; 20 phút (Trễ)</span>
          </div>
        </div>
      </div>

      {/* Ticket Grid */}
      {isLoading ? (
        <LoadingSpinner text="Đang đồng bộ vé gọi món từ các bàn..." />
      ) : activeTickets.length === 0 ? (
        <div className="rounded-3xl border border-dashed p-16 text-center bg-card">
          <div className="h-16 w-16 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-bold">Khu vực bếp đã hoàn thành tất cả các món!</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
            Hiện tại không có đơn gọi món nào đang chờ chế biến. Các vé mới tạo từ POS sẽ tự động xuất hiện tại đây.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {activeTickets.map((ticket) => {
            const elapsedMins = getElapsedMinutes(ticket.orderTime);
            const isLate = elapsedMins >= 20;
            const isWarning = elapsedMins >= 10 && elapsedMins < 20;

            const borderStatusClass = isLate
              ? 'border-rose-500 ring-2 ring-rose-500/20 shadow-rose-500/10'
              : isWarning
              ? 'border-amber-500/70 shadow-amber-500/10'
              : 'border-border';

            const headerBgClass = isLate
              ? 'bg-rose-500/10 text-rose-700 dark:text-rose-400'
              : isWarning
              ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400'
              : 'bg-muted/40 text-foreground';

            const allCooked = ticket.items.every((i) => i.currentStatus === 'COOKED' || i.currentStatus === 'SERVED');

            return (
              <div
                key={ticket.orderId}
                className={`rounded-2xl border bg-card shadow-md flex flex-col justify-between overflow-hidden transition-all ${borderStatusClass}`}
              >
                <div>
                  {/* Ticket Header */}
                  <div className={`p-3.5 border-b flex items-center justify-between ${headerBgClass}`}>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-base font-black tracking-tight">{ticket.tableNumber}</span>
                        <span className="text-[11px] font-mono font-bold bg-background/80 px-2 py-0.5 rounded-full border">
                          #{ticket.orderId}
                        </span>
                      </div>
                      {ticket.customerName && (
                        <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
                          Khách: {ticket.customerName}
                        </p>
                      )}
                    </div>

                    {/* Timer Badge */}
                    <div
                      className={`flex items-center gap-1 font-mono font-extrabold text-xs px-2.5 py-1 rounded-xl shadow-sm ${
                        isLate
                          ? 'bg-rose-600 text-white animate-pulse'
                          : isWarning
                          ? 'bg-amber-500 text-white'
                          : 'bg-emerald-600 text-white'
                      }`}
                    >
                      <Clock className="h-3.5 w-3.5" />
                      <span>{elapsedMins} ph</span>
                    </div>
                  </div>

                  {/* General order note */}
                  {ticket.note && (
                    <div className="p-2.5 bg-amber-500/10 border-b border-amber-500/20 text-xs font-semibold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                      <MessageSquare className="h-3.5 w-3.5 shrink-0" />
                      <span className="line-clamp-2">Ghi chú bàn: {ticket.note}</span>
                    </div>
                  )}

                  {/* Dish Line Items */}
                  <div className="p-3 space-y-2.5 divide-y divide-border/60">
                    {ticket.items.map((item, idx) => {
                      const nextStatus = getNextStatus(item.currentStatus);

                      return (
                        <div key={idx} className="pt-2 first:pt-0 flex items-start justify-between gap-2">
                          <div className="flex-1 pr-1">
                            <div className="flex items-start gap-1.5">
                              <span className="font-extrabold text-sm text-primary shrink-0 mt-0.5">
                                {item.qty}×
                              </span>
                              <div>
                                <p className="font-bold text-sm leading-tight text-foreground">
                                  {item.menuName || `Món ăn #${item.menuId}`}
                                </p>
                                {item.note && (
                                  <p className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 mt-0.5 flex items-center gap-1">
                                    <Sparkles className="h-3 w-3" />
                                    <span>Ghi chú: {item.note}</span>
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Quick advance status button */}
                          <div className="shrink-0 flex flex-col items-end gap-1">
                            {getStatusBadge(item.currentStatus)}
                            {item.currentStatus !== 'SERVED' && (
                              <button
                                onClick={() => updateItemStatus(ticket.orderId, idx, nextStatus)}
                                className="text-[10px] font-bold text-primary hover:underline flex items-center gap-0.5 mt-0.5"
                              >
                                Chuyển &gt;
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Ticket Footer Actions */}
                <div className="p-3 border-t bg-muted/20 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs h-8 font-semibold"
                      onClick={() => markAllTicket(ticket.orderId, 'COOKING')}
                    >
                      <Flame className="h-3 w-3 mr-1 text-amber-500" />
                      Nấu tất cả
                    </Button>
                    <Button
                      size="sm"
                      className={`text-xs h-8 font-bold ${
                        allCooked
                          ? 'bg-purple-600 hover:bg-purple-700 text-white'
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      }`}
                      onClick={() => markAllTicket(ticket.orderId, allCooked ? 'SERVED' : 'COOKED')}
                    >
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      {allCooked ? 'Ra món hết' : 'Nấu xong hết'}
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
