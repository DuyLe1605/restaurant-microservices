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
} from 'lucide-react';

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

const navSections: NavSection[] = [
  {
    title: 'TỔNG QUAN',
    items: [
      { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'MANAGER'] },
    ],
  },
  {
    title: 'VẬN HÀNH & BÁN HÀNG',
    items: [
      { name: 'Bán hàng (POS)', href: '/orders/create', icon: UtensilsCrossed, badge: 'Mở Đơn', badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' },
      { name: 'Sổ đơn hàng', href: '/orders', icon: Receipt },
      { name: 'Màn hình Bếp (KDS)', href: '/kitchen', icon: ChefHat, badge: 'Live', badgeColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-400' },
      { name: 'Sơ đồ bàn & Đặt bàn', href: '/tables', icon: Table },
      { name: 'Quản lý ca làm việc', href: '/shifts', icon: Clock },
      { name: 'Mã QR bàn ăn', href: '/qr', icon: QrCode },
    ],
  },
  {
    title: 'ẨM THỰC & ĐỊNH LƯỢNG',
    items: [
      { name: 'Thực đơn & Công thức', href: '/menu', icon: BookOpen, badge: 'BOM', badgeColor: 'bg-purple-500/10 text-purple-600 dark:text-purple-400', roles: ['ADMIN', 'MANAGER'] },
    ],
  },
  {
    title: 'KHO & NGUYÊN LIỆU',
    items: [
      { name: 'Nguyên liệu kho', href: '/ingredients', icon: Apple, roles: ['ADMIN', 'MANAGER'] },
      { name: 'Nhập / Xuất kho', href: '/inventory/receipts', icon: Boxes, roles: ['ADMIN', 'MANAGER'] },
    ],
  },
  {
    title: 'TÀI CHÍNH & BÁO CÁO',
    items: [
      { name: 'Sổ chi phí vận hành', href: '/expenses', icon: DollarSign, roles: ['ADMIN', 'MANAGER'] },
      { name: 'Báo cáo doanh thu', href: '/reports/revenue', icon: BarChart3, roles: ['ADMIN', 'MANAGER'] },
      { name: 'Báo cáo tồn kho', href: '/reports/stock', icon: BarChart3 },
    ],
  },
  {
    title: 'HỆ THỐNG',
    items: [
      { name: 'Quản trị nhân sự', href: '/users', icon: Users, roles: ['ADMIN'] },
    ],
  },
];

export function AppSidebar() {
  const { user } = useAuthStore();
  const location = useLocation();

  return (
    <aside className="w-64 border-r bg-card h-screen sticky top-0 flex flex-col justify-between hidden md:flex select-none">
      <div className="flex flex-col h-full overflow-hidden">
        {/* Brand */}
        <div className="h-16 flex items-center px-5 border-b gap-3 shrink-0 bg-background/50 backdrop-blur-sm">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center text-white text-lg shadow-md shadow-orange-500/20 font-black">
            🍽️
          </div>
          <div>
            <h2 className="font-black text-sm tracking-tight leading-none text-foreground">Gourmet Haven</h2>
            <p className="text-[10px] text-muted-foreground font-medium mt-1 tracking-wider uppercase">Hệ Thống Nhà Hàng Cao Cấp</p>
          </div>
        </div>

        {/* Navigation Sections */}
        <nav className="flex-1 px-3 py-3 space-y-4 overflow-y-auto scrollbar-thin scrollbar-thumb-muted">
          {navSections.map((section) => {
            const visibleItems = section.items.filter(
              (item) => !item.roles || (user && item.roles.includes(user.role))
            );

            if (visibleItems.length === 0) return null;

            return (
              <div key={section.title} className="space-y-1">
                <div className="px-3 py-1 text-[10px] font-bold tracking-wider text-muted-foreground/70 uppercase">
                  {section.title}
                </div>

                <div className="space-y-0.5">
                  {visibleItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.href || (item.href !== '/dashboard' && location.pathname.startsWith(item.href));

                    return (
                      <NavLink
                        key={item.href}
                        to={item.href}
                        className={cn(
                          'group flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-150',
                          isActive
                            ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/20'
                            : 'text-muted-foreground hover:bg-muted/80 hover:text-foreground'
                        )}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Icon className={cn('h-4 w-4 shrink-0 transition-transform group-hover:scale-110', isActive ? 'text-primary-foreground' : 'text-muted-foreground')} />
                          <span className="truncate">{item.name}</span>
                        </div>

                        {item.badge && (
                          <span
                            className={cn(
                              'text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0 uppercase tracking-wider',
                              isActive ? 'bg-white/20 text-white' : item.badgeColor
                            )}
                          >
                            {item.badge}
                          </span>
                        )}
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
      <div className="p-3 border-t bg-muted/20 shrink-0">
        <div className="flex items-center justify-between text-[11px] text-muted-foreground">
          <span className="font-semibold text-foreground">Gourmet v2.5</span>
          <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span> DB Trực Tiếp
          </span>
        </div>
      </div>
    </aside>
  );
}
