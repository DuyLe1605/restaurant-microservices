import * as React from 'react';
import { useExpenses, useCreateExpense, useDeleteExpense } from '@/hooks/use-expenses';
import { PageHeader } from '@/components/shared/page-header';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { EmptyState } from '@/components/shared/empty-state';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { formatVND } from '@/lib/format-currency';
import { formatDate } from '@/lib/format-date';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Dialog } from '@/components/ui/dialog';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Plus, Trash2, DollarSign, Search, Download, Printer, Calendar, RotateCcw } from 'lucide-react';
import { Expense } from '@/types/expense';
import { exportToExcel, printProfessionalReport } from '@/lib/export-utils';

export function ExpenseListPage() {
  const [page, setPage] = React.useState(0);
  const [search, setSearch] = React.useState('');
  const [typeFilter, setTypeFilter] = React.useState('');
  const [startDate, setStartDate] = React.useState('');
  const [endDate, setEndDate] = React.useState('');

  const { data, isLoading } = useExpenses({ page, size: 50 });
  const createMutation = useCreateExpense();
  const deleteMutation = useDeleteExpense();

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [expenseType, setExpenseType] = React.useState('Nguyên vật liệu tươi sống');
  const [amount, setAmount] = React.useState<number>(100000);
  const [description, setDescription] = React.useState('');
  const [expenseDate, setExpenseDate] = React.useState(new Date().toISOString().split('T')[0]);

  const [deleteId, setDeleteId] = React.useState<number | null>(null);

  // Preset Handlers
  const setToday = () => {
    const today = new Date().toISOString().split('T')[0];
    setStartDate(today);
    setEndDate(today);
  };

  const set7Days = () => {
    const today = new Date();
    const past = new Date(today);
    past.setDate(today.getDate() - 6);
    setStartDate(past.toISOString().split('T')[0]);
    setEndDate(today.toISOString().split('T')[0]);
  };

  const setMonth = () => {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    setStartDate(firstDay.toISOString().split('T')[0]);
    setEndDate(today.toISOString().split('T')[0]);
  };

  const setAll = () => {
    setStartDate('');
    setEndDate('');
    setTypeFilter('');
    setSearch('');
  };

  const isSingleDay = Boolean(startDate && endDate && startDate === endDate);
  const datePeriodLabel = React.useMemo(() => {
    if (startDate && endDate) {
      return startDate === endDate ? `Ngày ${formatDate(startDate)}` : `Từ ngày ${formatDate(startDate)} đến ngày ${formatDate(endDate)}`;
    }
    if (startDate) return `Từ ngày ${formatDate(startDate)}`;
    if (endDate) return `Đến ngày ${formatDate(endDate)}`;
    return 'Toàn bộ thời gian';
  }, [startDate, endDate]);

  const rawExpenses: Expense[] = data?.content || (Array.isArray(data) ? data : []);

  const filteredExpenses = React.useMemo(() => {
    return rawExpenses.filter((e) => {
      const matchSearch =
        !search ||
        e.expenseType.toLowerCase().includes(search.toLowerCase()) ||
        (e.description && e.description.toLowerCase().includes(search.toLowerCase()));

      const matchType = !typeFilter || e.expenseType.includes(typeFilter);
      const matchStart = !startDate || e.expenseDate >= startDate;
      const matchEnd = !endDate || e.expenseDate <= endDate;

      return matchSearch && matchType && matchStart && matchEnd;
    });
  }, [rawExpenses, search, typeFilter, startDate, endDate]);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseType || !amount || !expenseDate) return;

    createMutation.mutate({
      expenseType,
      amount,
      description,
      expenseDate,
    });
    setDialogOpen(false);
    setDescription('');
  };

  const handleExportExcel = () => {
    if (filteredExpenses.length === 0) return;
    const totalExp = filteredExpenses.reduce((sum, item) => sum + (item.amount || 0), 0);
    const fileSuffix = isSingleDay
      ? `Ngay_${startDate}`
      : startDate && endDate
      ? `${startDate}_den_${endDate}`
      : 'Toan_Bo';
    const sheetTitle = isSingleDay
      ? `SỔ CHI PHÍ VẬN HÀNH NGÀY ${formatDate(startDate)}`
      : 'SỔ THEO DÕI VÀ BÁO CÁO CHI PHÍ VẬN HÀNH';

    const excelData = filteredExpenses.map((item, idx) => ({
      stt: idx + 1,
      date: formatDate(item.expenseDate),
      type: item.expenseType,
      desc: item.description || '---',
      amount: formatVND(item.amount),
    }));

    exportToExcel(
      `So_Chi_Phi_Van_Hanh_${fileSuffix}`,
      sheetTitle,
      [
        { header: 'STT', key: 'stt' },
        { header: 'Ngày Chi', key: 'date' },
        { header: 'Khoản Mục Chi', key: 'type' },
        { header: 'Mô Tả Chi Tiết / Số HĐ', key: 'desc' },
        { header: 'Số Tiền (VNĐ)', key: 'amount' },
      ],
      excelData,
      [
        { label: 'Tổng số khoản chi', value: `${filteredExpenses.length} khoản` },
        { label: 'TỔNG CHI PHÍ VẬN HÀNH', value: formatVND(totalExp) },
      ],
      {
        'Kỳ thống kê': datePeriodLabel,
        'Bộ lọc khoản mục': typeFilter || 'Tất cả chi phí',
        'Phòng ban': 'Phòng Kế Toán / Thu Ngân',
      }
    );
  };

  const handlePrintExpenseBook = () => {
    if (filteredExpenses.length === 0) return;
    const totalExp = filteredExpenses.reduce((sum, item) => sum + (item.amount || 0), 0);
    const maxExp = Math.max(...filteredExpenses.map((e) => e.amount || 0));
    const avgExp = Math.round(totalExp / filteredExpenses.length);
    const printTitle = isSingleDay
      ? `SỔ CHI PHÍ VẬN HÀNH NGÀY ${formatDate(startDate)}`
      : 'SỔ THEO DÕI CHI PHÍ VẬN HÀNH NHÀ HÀNG';

    printProfessionalReport({
      title: printTitle,
      subtitle: `Bảng kê chi tiết các khoản chi phí phục vụ hoạt động vận hành & nhà hàng`,
      reportPeriod: datePeriodLabel,
      preparedBy: 'Kế toán thanh toán',
      kpis: [
        { label: 'Tổng chi phí', value: formatVND(totalExp), color: '#e11d48' },
        { label: 'Số khoản chi', value: `${filteredExpenses.length} khoản`, color: '#0284c7' },
        { label: 'Khoản chi lớn nhất', value: formatVND(maxExp), color: '#d97706' },
        { label: 'Chi phí trung bình', value: formatVND(avgExp) },
      ],
      columns: [
        { header: 'STT', key: 'stt', align: 'center' },
        { header: 'Ngày chi', key: 'date', align: 'left' },
        { header: 'Khoản mục chi', key: 'type', align: 'left' },
        { header: 'Diễn giải chi tiết / Hóa đơn', key: 'desc', align: 'left' },
        { header: 'Số tiền chi', key: 'amount', align: 'right' },
      ],
      data: filteredExpenses.map((item, idx) => ({
        stt: idx + 1,
        date: formatDate(item.expenseDate),
        type: item.expenseType,
        desc: item.description || '---',
        amount: formatVND(item.amount),
      })),
      summary: [
        { label: 'TỔNG CỘNG CHI PHÍ VẬN HÀNH', value: formatVND(totalExp) },
      ],
      signatures: ['Người Lập Biểu', 'Kế Toán Thanh Toán', 'Giám Đốc / Chủ Quán'],
    });
  };

  if (isLoading) {
    return <LoadingSpinner text="Đang tải sổ chi phí..." />;
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Sổ Chi phí Vận hành" description="Ghi nhận các khoản chi phí mặt bằng, điện nước, nhân công, bảo trì và mua sắm.">
        <div className="flex items-center gap-2">
          {filteredExpenses.length > 0 && (
            <>
              <Button variant="outline" onClick={handleExportExcel} className="gap-2">
                <Download className="h-4 w-4 text-emerald-600" />
                Xuất Excel
              </Button>
              <Button variant="outline" onClick={handlePrintExpenseBook} className="gap-2">
                <Printer className="h-4 w-4" />
                In sổ chi phí
              </Button>
            </>
          )}
          <Button onClick={() => setDialogOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" /> Ghi chi phí mới
          </Button>
        </div>
      </PageHeader>

      {/* Date & Filter Toolbar */}
      <div className="bg-card border rounded-2xl p-4 shadow-sm space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b">
          <div className="flex items-center gap-2 text-sm font-bold text-foreground">
            <Calendar className="h-4 w-4 text-primary" />
            <span>Khoảng thời gian:</span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary">
              {datePeriodLabel}
            </span>
          </div>

          {/* Quick Preset Buttons */}
          <div className="flex flex-wrap items-center gap-1.5">
            <Button
              variant={isSingleDay && startDate === new Date().toISOString().split('T')[0] ? 'default' : 'outline'}
              size="sm"
              onClick={setToday}
              className="text-xs h-7"
            >
              Hôm nay
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={set7Days}
              className="text-xs h-7"
            >
              7 ngày qua
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={setMonth}
              className="text-xs h-7"
            >
              Tháng này
            </Button>
            <Button
              variant={!startDate && !endDate ? 'secondary' : 'outline'}
              size="sm"
              onClick={setAll}
              className="text-xs h-7 gap-1"
            >
              <RotateCcw className="h-3 w-3" />
              Tất cả
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-1">
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1 block">Từ ngày:</label>
            <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1 block">Đến ngày:</label>
            <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1 block">Khoản mục chi:</label>
            <Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
              <option value="">-- Tất cả loại chi phí --</option>
              <option value="điện">Tiền điện / Nước</option>
              <option value="mặt bằng">Thuê mặt bằng</option>
              <option value="bảo trì">Bảo trì thiết bị</option>
              <option value="thực phẩm">Nguyên vật liệu</option>
            </Select>
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1 block">Tìm kiếm:</label>
            <div className="relative">
              <Input
                placeholder="Khoản chi, diễn giải..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8"
              />
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            </div>
          </div>
        </div>
      </div>

      {filteredExpenses.length === 0 ? (
        <EmptyState
          title="Không tìm thấy chi phí"
          description={search ? "Không có khoản chi nào khớp tìm kiếm." : "Chưa có khoản chi phí nào được ghi nhận."}
          actionText="Tạo mới ngay"
          onAction={() => setDialogOpen(true)}
        />
      ) : (
        <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead>Ngày chi</TableHead>
                <TableHead>Khoản chi / Mục đích</TableHead>
                <TableHead>Mô tả chi tiết</TableHead>
                <TableHead className="text-right">Số tiền chi</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredExpenses.map((exp) => (
                <TableRow key={exp.id} className="hover:bg-muted/30">
                  <TableCell className="text-xs text-muted-foreground">{formatDate(exp.expenseDate)}</TableCell>
                  <TableCell className="font-bold">{exp.expenseType}</TableCell>
                  <TableCell className="text-xs text-muted-foreground max-w-sm">{exp.description || '---'}</TableCell>
                  <TableCell className="text-right font-black text-destructive text-sm">{formatVND(exp.amount)}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10"
                      onClick={() => setDeleteId(exp.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Add Expense Dialog */}
      <Dialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title="Ghi nhận khoản chi phí mới"
        description="Điền đầy đủ thông tin số tiền và mục đích chi phục vụ tính toán lợi nhuận ròng."
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1 block">Khoản mục chi phí</label>
            <Select value={expenseType} onChange={(e) => setExpenseType(e.target.value)}>
              <option value="Tiền điện kinh doanh EVN">Tiền điện kinh doanh EVN</option>
              <option value="Thuê mặt bằng nhà hàng">Thuê mặt bằng nhà hàng</option>
              <option value="Bảo trì hệ thống hút mùi & bếp">Bảo trì hệ thống hút mùi & bếp</option>
              <option value="Mua nguyên vật liệu tươi sống">Mua nguyên vật liệu tươi sống</option>
              <option value="Văn phòng phẩm & Marketing">Văn phòng phẩm & Marketing</option>
            </Select>
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1 block">Số tiền (VNĐ)</label>
            <Input
              type="number"
              min="1000"
              step="1000"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1 block">Ngày thanh toán</label>
            <Input
              type="date"
              value={expenseDate}
              onChange={(e) => setExpenseDate(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1 block">Ghi chú chi tiết hóa đơn</label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="VD: Hóa đơn điện số #123456, chuyển khoản Techcombank..."
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Hủy</Button>
            <Button type="submit">Lưu chi phí</Button>
          </div>
        </form>
      </Dialog>

      {/* Delete Expense Confirm Dialog */}
      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Xóa khoản chi phí"
        description="Bạn có chắc chắn muốn xóa bản ghi chi phí này? Số liệu báo cáo lợi nhuận sẽ thay đổi theo."
        confirmText="Xác nhận xóa"
        isDanger={true}
        onConfirm={() => {
          if (deleteId) deleteMutation.mutate(deleteId);
        }}
      />
    </div>
  );
}
