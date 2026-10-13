import * as React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth-store';
import {
  LayoutDashboard,
  UtensilsCrossed,
  Receipt,
  Table,
  ChefHat,
  Clock,
  QrCode,
  BookOpen,
  Apple,
  Boxes,
  DollarSign,
  BarChart3,
  Users,
  Award,
  BellRing,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { usePendingCount } from '@/hooks/use-service-requests';

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  roles?: string[];
  badge?: string;
  badgeColor?: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

// 4 Logical Core Groups based on Restaurant Management ERP Standards
const navSections: NavSection[] = [
  {
    title: 'BÁN HÀNG & PHỤC VỤ',
    items: [
      {
        name: 'Bán hàng (POS)',
        href: '/orders/create',
        icon: UtensilsCrossed,
        badge: 'Mở Đơn',
        badgeColor: 'bg-orange-500/15 text-orange-600 dark:text-orange-400 border border-orange-500/30',
      },
      {
        name: 'Sổ đơn hàng',
        href: '/orders',
        icon: Receipt,
      },
      {
        name: 'Sơ đồ bàn & Đặt bàn',
        href: '/tables',
        icon: Table,
      },
      {
        name: 'Màn hình Bếp (KDS)',
        href: '/kitchen',
        icon: ChefHat,
        badge: 'Live',
        badgeColor: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30',
      },
      {
        name: 'Mã QR bàn ăn',
        href: '/qr',
        icon: QrCode,
      },
      {
        name: 'Yêu cầu phục vụ',
        href: '/service-requests',
        icon: BellRing,
      },
    ],
  },
  {
    title: 'KHÁCH HÀNG & CA LÀM',
    items: [
      {
        name: 'Khách hàng & Hội viên',
        href: '/customers',
        icon: Award,
        badge: 'Loyalty',
        badgeColor: 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30',
      },
      {
        name: 'Quản lý ca làm việc',
        href: '/shifts',
        icon: Clock,
      },
      {
        name: 'Quản trị nhân sự',
        href: '/users',
        icon: Users,
        roles: ['ADMIN'],
      },
    ],
  },
  {
    title: 'ẨM THỰC & KHO BÃI',
    items: [
      {
        name: 'Thực đơn & Công thức',
        href: '/menu',
        icon: BookOpen,
        badge: 'BOM',
        badgeColor: 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/30',
        roles: ['ADMIN', 'MANAGER'],
      },
      {
        name: 'Nguyên liệu kho',
        href: '/ingredients',
        icon: Apple,
        roles: ['ADMIN', 'MANAGER'],
      },
      {
        name: 'Nhập / Xuất kho',
        href: '/inventory/receipts',
        icon: Boxes,
        roles: ['ADMIN', 'MANAGER'],
      },
    ],
  },
  {
    title: 'BÁO CÁO & TÀI CHÍNH',
    items: [
      {
        name: 'Dashboard Tổng quan',
        href: '/dashboard',
        icon: LayoutDashboard,
        roles: ['ADMIN', 'MANAGER'],
      },
      {
        name: 'Báo cáo doanh thu',
        href: '/reports/revenue',
        icon: BarChart3,
        roles: ['ADMIN', 'MANAGER'],
      },
      {
        name: 'Báo cáo tồn kho',
        href: '/reports/stock',
        icon: BarChart3,
      },
      {
        name: 'Sổ chi phí vận hành',
        href: '/expenses',
        icon: DollarSign,
        roles: ['ADMIN', 'MANAGER'],
      },
    ],
  },
];

export function AppSidebar() {
  const { user } = useAuthStore();
  const location = useLocation();
  const { data: pendingCount = 0 } = usePendingCount();

  // Collapsed state persisted in localStorage
  const [isCollapsed, setIsCollapsed] = React.useState<boolean>(() => {
    try {
      return localStorage.getItem('gourmet_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  const toggleCollapsed = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('gourmet_sidebar_collapsed', String(next));
      } catch {}
      return next;
    });
  };

  const isItemActive = React.useCallback(
    (itemHref: string) => {
      const pathname = location.pathname;

      // Đơn hàng POS: /orders/create và /orders/new
      if (pathname === '/orders/create' || pathname === '/orders/new') {
        return itemHref === '/orders/create';
      }

      // Trùng khớp tuyệt đối
      if (pathname === itemHref) {
        return true;
      }

      // Dashboard chỉ active khi đúng /dashboard
      if (itemHref === '/dashboard') {
        return pathname === '/dashboard';
      }

      // Sổ đơn hàng: active khi vào trang con chi tiết hóa đơn (/orders/:id/invoice)
      if (itemHref === '/orders') {
        return pathname.startsWith('/orders/') && pathname !== '/orders/create' && pathname !== '/orders/new';
      }

      // Sơ đồ bàn & Đặt bàn
      if (itemHref === '/tables' && pathname === '/reservations') {
        return true;
      }

      // Thực đơn & Công thức (/menu)
      if (itemHref === '/menu' && pathname === '/recipes') {
        return true;
      }

      // Nhập / Xuất kho
      if (itemHref === '/inventory/receipts' && pathname.startsWith('/inventory/')) {
        return true;
      }

      // Khớp các trang con khác
      return pathname.startsWith(`${itemHref}/`);
    },
    [location.pathname]
  );

  return (
    <aside
      className={cn(
        'border-r bg-card h-screen sticky top-0 flex flex-col justify-between hidden md:flex select-none transition-all duration-300 ease-in-out',
        isCollapsed ? 'w-20' : 'w-64'
      )}
    >
      <div className="flex flex-col h-full overflow-hidden">
        {/* Brand & Collapse Header */}
        <div
          className={cn(
            'h-16 flex items-center border-b shrink-0 bg-background/50 backdrop-blur-sm transition-all',
            isCollapsed ? 'justify-center px-2' : 'justify-between px-4'
          )}
        >
          {/* Logo & Brand text */}
          <div className="flex items-center gap-2.5 min-w-0 overflow-hidden">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center text-white text-lg shadow-md shadow-orange-500/20 font-black shrink-0">
              🍽️
            </div>
            {!isCollapsed && (
              <div className="min-w-0">
                <h2 className="font-black text-sm tracking-tight leading-none text-foreground truncate">
                  Gourmet Haven
                </h2>
                <p className="text-[10px] text-muted-foreground font-medium mt-1 tracking-wider uppercase truncate">
                  Quản Trị Nhà Hàng
                </p>
              </div>
            )}
          </div>

          {/* Quick Collapse Toggle Button */}
          <button
            type="button"
            onClick={toggleCollapsed}
            title={isCollapsed ? 'Mở rộng thanh điều hướng' : 'Thu gọn thanh điều hướng'}
            className={cn(
              'text-muted-foreground hover:text-foreground hover:bg-muted p-1.5 rounded-lg transition-colors',
              isCollapsed && 'mt-1'
            )}
          >
            {isCollapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
          </button>
        </div>

        {/* Navigation Sections */}
        <nav className="flex-1 px-2.5 py-3 space-y-4 overflow-y-auto scrollbar-thin scrollbar-thumb-muted">
          {navSections.map((section, idx) => {
            const visibleItems = section.items.filter(
              (item) => !item.roles || (user && item.roles.includes(user.role))
            );

            if (visibleItems.length === 0) return null;

            return (
              <div key={section.title} className="space-y-1">
                {/* Section Header */}
                {!isCollapsed ? (
                  <div className="px-2.5 py-1 text-[10px] font-bold tracking-wider text-muted-foreground/70 uppercase">
                    {section.title}
                  </div>
                ) : (
                  idx > 0 && <div className="h-px bg-border/60 my-2 mx-1" />
                )}

                {/* Section Items */}
                <div className="space-y-0.5">
                  {visibleItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = isItemActive(item.href);

                    return (
                      <NavLink
                        key={item.href}
                        to={item.href}
                        title={isCollapsed ? `${item.name}${item.badge ? ` (${item.badge})` : ''}` : undefined}
                        className={cn(
                          'group flex items-center rounded-xl text-xs font-semibold transition-all duration-150',
                          isCollapsed
                            ? 'justify-center p-2.5'
                            : 'justify-between px-3 py-2',
                          isActive
                            ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/20'
                            : 'text-muted-foreground hover:bg-muted/80 hover:text-foreground'
                        )}
                      >
                        <div className={cn('flex items-center min-w-0', isCollapsed ? 'justify-center' : 'gap-2.5')}>
                          <Icon
                            className={cn(
                              'h-4 w-4 shrink-0 transition-transform group-hover:scale-110',
                              isActive ? 'text-primary-foreground' : 'text-muted-foreground'
                            )}
                          />
                          {!isCollapsed && <span className="truncate">{item.name}</span>}
                        </div>

                        {!isCollapsed && item.href === '/service-requests' && pendingCount > 0 ? (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0 bg-rose-500 text-white animate-pulse">
                            {pendingCount}
                          </span>
                        ) : !isCollapsed && item.badge ? (
                          <span
                            className={cn(
                              'text-[10px] font-bold px-1.5 py-0.2 rounded-full shrink-0 tracking-wider',
                              isActive ? 'bg-white/20 text-white' : item.badgeColor
                            )}
                          >
                            {item.badge}
                          </span>
                        ) : null}
                      </NavLink>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>
      </div>

      {/* Footer Info */}
      <div className={cn('p-2.5 border-t bg-muted/20 shrink-0 transition-all', isCollapsed && 'text-center')}>
        {!isCollapsed ? (
          <div className="flex items-center justify-between text-[11px] text-muted-foreground px-1">
            <span className="font-semibold text-foreground">Gourmet v2.5</span>
            <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span> DB Trực Tiếp
            </span>
          </div>
        ) : (
          <div className="flex justify-center" title="Trạng thái hệ thống: Kết nối MySQL Trực tiếp">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
          </div>
        )}
      </div>
    </aside>
  );
}
