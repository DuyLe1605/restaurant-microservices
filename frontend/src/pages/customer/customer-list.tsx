import * as React from 'react';
import { useCustomers, useRegisterCustomer, useUpdateCustomer } from '@/hooks/use-customers';
import { Customer, CustomerTier } from '@/api/customer.api';
import { PageHeader } from '@/components/shared/page-header';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { EmptyState } from '@/components/shared/empty-state';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Dialog } from '@/components/ui/dialog';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { ExportDropdown } from '@/components/shared/export-dropdown';
import { exportToExcel, printProfessionalReport } from '@/lib/export-utils';
import { formatVND } from '@/lib/format-currency';
import { formatDateTime } from '@/lib/format-date';
import {
  Users,
  UserPlus,
  Search,
  Crown,
  Award,
  Sparkles,
  Phone,
  Mail,
  Coins,
  TrendingUp,
  MoreHorizontal,
  Edit2,
  Calendar,
} from 'lucide-react';
import { toast } from 'sonner';

export function CustomerListPage() {
  const [search, setSearch] = React.useState('');
  const [tierFilter, setTierFilter] = React.useState<string>('ALL');
  const [page, setPage] = React.useState(0);

  const { data, isLoading } = useCustomers({ keyword: search || undefined, page, size: 50 });
  const registerMutation = useRegisterCustomer();
  const updateMutation = useUpdateCustomer();

  // Create / Edit Modal State
  const [modalOpen, setModalOpen] = React.useState(false);
  const [editingCustomer, setEditingCustomer] = React.useState<Customer | null>(null);
  const [formName, setFormName] = React.useState('');
  const [formPhone, setFormPhone] = React.useState('');
  const [formEmail, setFormEmail] = React.useState('');
  const [formNote, setFormNote] = React.useState('');

  const rawCustomers: Customer[] = data?.content || (Array.isArray(data) ? data : []);

  // Filter client-side by Tier if selected
  const filteredCustomers = React.useMemo(() => {
    return rawCustomers.filter((c) => {
      if (tierFilter !== 'ALL' && c.tier !== tierFilter) return false;
      return true;
    });
  }, [rawCustomers, tierFilter]);

  // KPIs
  const totalCount = rawCustomers.length;
  const diamondCount = rawCustomers.filter((c) => c.tier === 'DIAMOND').length;
  const goldCount = rawCustomers.filter((c) => c.tier === 'GOLD').length;
  const silverCount = rawCustomers.filter((c) => c.tier === 'SILVER').length;
  const bronzeCount = rawCustomers.filter((c) => c.tier === 'BRONZE').length;

  const handleOpenCreate = () => {
    setEditingCustomer(null);
    setFormName('');
    setFormPhone('');
    setFormEmail('');
    setFormNote('');
    setModalOpen(true);
  };

  const handleOpenEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setFormName(customer.name);
    setFormPhone(customer.phone);
    setFormEmail(customer.email || '');
    setFormNote(customer.note || '');
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formPhone.trim()) {
      toast.error('Vui lòng nhập họ tên và số điện thoại');
      return;
    }

    if (editingCustomer) {
      updateMutation.mutate(
        {
          id: editingCustomer.id,
          payload: {
            name: formName.trim(),
            email: formEmail.trim() || undefined,
            note: formNote.trim() || undefined,
          },
        },
        {
          onSuccess: () => setModalOpen(false),
        }
      );
    } else {
      registerMutation.mutate(
        {
          name: formName.trim(),
          phone: formPhone.trim(),
          email: formEmail.trim() || undefined,
          note: formNote.trim() || undefined,
        },
        {
          onSuccess: () => setModalOpen(false),
        }
      );
    }
  };

  const getTierBadge = (tier: CustomerTier) => {
    switch (tier) {
      case 'DIAMOND':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-cyan-100 text-cyan-800 dark:bg-cyan-950/50 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-800">
            <Sparkles className="h-3 w-3 text-cyan-600 animate-pulse" /> Kim Cương (-15%)
          </span>
        );
      case 'GOLD':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
            <Crown className="h-3 w-3 text-amber-600" /> Vàng (-10%)
          </span>
        );
      case 'SILVER':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
            <Award className="h-3 w-3 text-slate-600" /> Bạc (-5%)
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-orange-100 text-orange-800 dark:bg-orange-950/50 dark:text-orange-300 border border-orange-200 dark:border-orange-800">
            Đồng (Chuẩn)
          </span>
        );
    }
  };

  const handleExportExcel = () => {
    if (filteredCustomers.length === 0) return;
    const excelData = filteredCustomers.map((c, idx) => ({
      stt: idx + 1,
      name: c.name,
      phone: c.phone,
      tier: c.tierLabel,
      discount: `${c.discountPercent}%`,
      points: `${c.points} điểm`,
      pointsValue: formatVND(c.pointsValue || 0),
      monthSpent: formatVND(c.currentMonthSpent || 0),
      totalSpent: formatVND(c.totalSpent || 0),
    }));

    exportToExcel(
      'Danh_Sach_Khach_Hang_Hoi_Vien',
      'SỔ THEO DÕI KHÁCH HÀNG & PHÂN HẠNG HỘI VIÊN',
      [
        { header: 'STT', key: 'stt' },
        { header: 'Họ và Tên', key: 'name' },
        { header: 'Số Điện Thoại', key: 'phone' },
        { header: 'Hạng Thẻ', key: 'tier' },
        { header: 'Giảm Giá', key: 'discount' },
        { header: 'Điểm Tích Lũy', key: 'points' },
        { header: 'Quy Đổi Điểm', key: 'pointsValue' },
        { header: 'Chi Tiêu Tháng Này', key: 'monthSpent' },
        { header: 'Tổng Chi Tiêu', key: 'totalSpent' },
      ],
      excelData,
      [
        { label: 'Tổng số hội viên', value: `${filteredCustomers.length} khách` },
        {
          label: 'Tổng tiền chi tiêu tháng',
          value: formatVND(filteredCustomers.reduce((s, c) => s + (c.currentMonthSpent || 0), 0)),
        },
      ],
      {
        'Bộ phận': 'Chăm sóc Khách hàng & Loyalty',
        'Thời gian': formatDateTime(new Date().toISOString()),
      }
    );
  };

  const handlePrintReport = () => {
    if (filteredCustomers.length === 0) return;
    printProfessionalReport({
      title: 'BÁO CÁO PHÂN HẠNG & TÍCH ĐIỂM KHÁCH HÀNG',
      subtitle: `Tháng ${new Date().getMonth() + 1}/${new Date().getFullYear()} - Danh sách ${filteredCustomers.length} hội viên`,
      reportPeriod: `Tháng ${new Date().getMonth() + 1}/${new Date().getFullYear()}`,
      preparedBy: 'Bộ phận Quản lý Khách hàng & Thu ngân',
      kpis: [
        { label: 'Tổng hội viên', value: `${filteredCustomers.length}`, color: '#0284c7' },
        { label: 'Hạng Kim Cương', value: `${diamondCount}`, color: '#06b6d4' },
        { label: 'Hạng Vàng', value: `${goldCount}`, color: '#f59e0b' },
        { label: 'Hạng Bạc & Đồng', value: `${silverCount + bronzeCount}`, color: '#64748b' },
      ],
      columns: [
        { header: 'STT', key: '__index', align: 'center' },
        { header: 'Khách hàng', key: 'name', align: 'left' },
        { header: 'Số điện thoại', key: 'phone', align: 'center' },
        { header: 'Hạng thẻ', key: 'tierLabel', align: 'center' },
        { header: 'Giảm giá', key: 'discountPercent', align: 'center', formatter: (v) => `${v}%` },
        { header: 'Điểm tích', key: 'points', align: 'right', formatter: (v) => `${v} đ` },
        { header: 'Chi tiêu tháng', key: 'currentMonthSpent', align: 'right', formatter: (v) => formatVND(v || 0) },
        { header: 'Tổng chi tiêu', key: 'totalSpent', align: 'right', formatter: (v) => formatVND(v || 0) },
      ],
      data: filteredCustomers,
      summary: [
        { label: 'Tổng số hội viên', value: `${filteredCustomers.length} khách` },
        {
          label: 'Tổng doanh thu từ hội viên tháng này',
          value: formatVND(filteredCustomers.reduce((s, c) => s + (c.currentMonthSpent || 0), 0)),
        },
      ],
      signatures: ['Người Lập Báo Cáo', 'Trưởng Bộ Phận CSKH', 'Giám Đốc Nhà Hàng'],
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quản Lý Khách Hàng & Hội Viên"
        description="Chính sách tích điểm (10.000 đ = 1 điểm), phân hạng theo chỉ tiêu chi tiêu tháng và ưu đãi giảm giá"
      >
        <div className="flex items-center gap-2.5">
          <ExportDropdown
            onExportExcel={filteredCustomers.length > 0 ? handleExportExcel : undefined}
            onPrintReport={filteredCustomers.length > 0 ? handlePrintReport : undefined}
            excelLabel="Xuất sổ hội viên (.xlsx)"
            printLabel="In báo cáo phân hạng (A4)"
            disabled={filteredCustomers.length === 0}
            buttonText="Xuất & Báo cáo"
          />
          <Button
            size="sm"
            className="gap-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold"
            onClick={handleOpenCreate}
          >
            <UserPlus className="h-4 w-4" /> Thêm khách hàng
          </Button>
        </div>
      </PageHeader>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-card border rounded-2xl shadow-xs border-l-4 border-l-blue-500 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase">Tổng khách hàng</p>
            <p className="text-2xl font-black text-foreground mt-1">{totalCount}</p>
          </div>
          <Users className="h-8 w-8 text-blue-500 opacity-80" />
        </div>

        <div className="p-4 bg-card border rounded-2xl shadow-xs border-l-4 border-l-cyan-500 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase">Kim Cương (≥10 tr/tháng)</p>
            <p className="text-2xl font-black text-cyan-600 dark:text-cyan-400 mt-1">{diamondCount}</p>
          </div>
          <Sparkles className="h-8 w-8 text-cyan-500 opacity-80" />
        </div>

        <div className="p-4 bg-card border rounded-2xl shadow-xs border-l-4 border-l-amber-500 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase">Hạng Vàng (≥5 tr/tháng)</p>
            <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">{goldCount}</p>
          </div>
          <Crown className="h-8 w-8 text-amber-500 opacity-80" />
        </div>

        <div className="p-4 bg-card border rounded-2xl shadow-xs border-l-4 border-l-slate-400 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase">Hạng Bạc & Đồng</p>
            <p className="text-2xl font-black text-slate-700 dark:text-slate-300 mt-1">
              {silverCount + bronzeCount}
            </p>
          </div>
          <Award className="h-8 w-8 text-slate-500 opacity-80" />
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-card p-4 rounded-2xl border shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
          <Input
            className="pl-9 h-10 text-xs"
            placeholder="Tìm theo tên hoặc số điện thoại..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Select
            value={tierFilter}
            onChange={(e) => setTierFilter(e.target.value)}
            className="h-10 text-xs min-w-[170px]"
          >
            <option value="ALL">Tất cả hạng thành viên</option>
            <option value="DIAMOND">💎 Kim Cương (Giảm 15%)</option>
            <option value="GOLD">🥇 Hạng Vàng (Giảm 10%)</option>
            <option value="SILVER">🥈 Hạng Bạc (Giảm 5%)</option>
            <option value="BRONZE">🥉 Hạng Đồng (Chuẩn)</option>
          </Select>
        </div>
      </div>

      {/* Main Table */}
      {isLoading ? (
        <LoadingSpinner />
      ) : filteredCustomers.length === 0 ? (
        <EmptyState
          title="Không tìm thấy khách hàng nào"
          description="Thử tìm kiếm với số điện thoại hoặc từ khóa khác, hoặc bấm Thêm khách hàng mới."
        />
      ) : (
        <div className="border rounded-2xl bg-card overflow-hidden shadow-xs">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead className="w-12 text-center">STT</TableHead>
                <TableHead>Khách Hàng</TableHead>
                <TableHead>Số Điện Thoại</TableHead>
                <TableHead className="text-center">Hạng Thành Viên</TableHead>
                <TableHead className="text-right">Điểm Tích Lũy</TableHead>
                <TableHead className="text-right">Chi Tiêu Tháng Này</TableHead>
                <TableHead className="text-right">Tổng Chi Tiêu</TableHead>
                <TableHead className="w-16 text-center">Thao Tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.map((c, idx) => {
                const nextTarget = c.nextTierTarget || 0;
                const monthSpent = c.currentMonthSpent || 0;
                const progressPct = nextTarget > 0 ? Math.min(100, Math.round((monthSpent / nextTarget) * 100)) : 100;

                return (
                  <TableRow key={c.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="text-center font-medium text-xs">{idx + 1}</TableCell>
                    <TableCell>
                      <div className="font-bold text-sm text-foreground">{c.name}</div>
                      {c.email && <div className="text-[11px] text-muted-foreground">{c.email}</div>}
                    </TableCell>
                    <TableCell>
                      <div className="font-semibold text-xs text-foreground flex items-center gap-1.5">
                        <Phone className="h-3 w-3 text-muted-foreground" /> {c.phone}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">{getTierBadge(c.tier)}</TableCell>
                    <TableCell className="text-right">
                      <div className="font-black text-sm text-purple-600 dark:text-purple-400">
                        {c.points} điểm
                      </div>
                      <div className="text-[11px] text-muted-foreground">≈ {formatVND(c.pointsValue || 0)}</div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="font-bold text-xs text-foreground">{formatVND(monthSpent)}</div>
                      {c.nextTierTarget && (
                        <div className="mt-1">
                          <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden ml-auto">
                            <div
                              className="h-full bg-purple-600 rounded-full transition-all"
                              style={{ width: `${progressPct}%` }}
                            />
                          </div>
                          <div className="text-[9.5px] text-muted-foreground mt-0.5">
                            Cần {formatVND(Math.max(0, nextTarget - monthSpent))} lên {c.nextTierLabel}
                          </div>
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-bold text-xs text-foreground">
                      {formatVND(c.totalSpent || 0)}
                    </TableCell>
                    <TableCell className="text-center">
                      <DropdownMenu
                        trigger={
                          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted">
                            <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        }
                      >
                        <DropdownMenuItem
                          icon={<Edit2 className="h-4 w-4 text-blue-600" />}
                          onClick={() => handleOpenEdit(c)}
                        >
                          Chỉnh sửa thông tin
                        </DropdownMenuItem>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Add / Edit Customer Dialog */}
      <Dialog
        open={modalOpen}
        onOpenChange={(open) => !open && setModalOpen(false)}
        title={editingCustomer ? 'Chỉnh Sửa Thông Tin Hội Viên' : 'Thêm Mới Khách Hàng Hội Viên'}
        description="Số điện thoại là mã định danh duy nhất để tích lũy điểm thưởng và hưởng chính sách giảm giá theo hạng."
        className="max-w-md"
      >
        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          <div>
            <label className="text-xs font-semibold text-foreground block mb-1">
              Họ và tên khách hàng <span className="text-red-500">*</span>
            </label>
            <Input
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="Ví dụ: Nguyễn Văn An"
              className="text-xs h-9"
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground block mb-1">
              Số điện thoại <span className="text-red-500">*</span>
            </label>
            <Input
              value={formPhone}
              onChange={(e) => setFormPhone(e.target.value)}
              placeholder="Ví dụ: 0912345678"
              className="text-xs h-9"
              disabled={!!editingCustomer}
              required
            />
            {editingCustomer && (
              <p className="text-[10px] text-muted-foreground mt-0.5">Số điện thoại không thể thay đổi sau khi đăng ký.</p>
            )}
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground block mb-1">Email liên hệ (nếu có)</label>
            <Input
              type="email"
              value={formEmail}
              onChange={(e) => setFormEmail(e.target.value)}
              placeholder="khachhang@gmail.com"
              className="text-xs h-9"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground block mb-1">Ghi chú</label>
            <Input
              value={formNote}
              onChange={(e) => setFormNote(e.target.value)}
              placeholder="Khách quen thích ngồi bàn VIP, dị ứng tiêu..."
              className="text-xs h-9"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t">
            <Button type="button" variant="outline" size="sm" onClick={() => setModalOpen(false)}>
              Hủy
            </Button>
            <Button
              type="submit"
              size="sm"
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold"
              disabled={registerMutation.isPending || updateMutation.isPending}
            >
              {editingCustomer ? 'Cập Nhật' : 'Đăng Ký Hội Viên'}
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
