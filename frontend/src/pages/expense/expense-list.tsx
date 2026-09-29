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
import { Plus, Trash2, DollarSign, Search } from 'lucide-react';
import { Expense } from '@/types/expense';

export function ExpenseListPage() {
  const [page, setPage] = React.useState(0);
  const [search, setSearch] = React.useState('');
  const [typeFilter, setTypeFilter] = React.useState('');

  const { data, isLoading } = useExpenses({ page, size: 20 });
  const createMutation = useCreateExpense();
  const deleteMutation = useDeleteExpense();

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [expenseType, setExpenseType] = React.useState('Nguyên vật liệu tươi sống');
  const [amount, setAmount] = React.useState<number>(100000);
  const [description, setDescription] = React.useState('');
  const [expenseDate, setExpenseDate] = React.useState(new Date().toISOString().split('T')[0]);

  const [deleteId, setDeleteId] = React.useState<number | null>(null);

  const rawExpenses: Expense[] = data?.content || (Array.isArray(data) ? data : []);

  const filteredExpenses = React.useMemo(() => {
    return rawExpenses.filter((e) => {
      const matchSearch =
        !search ||
        e.expenseType.toLowerCase().includes(search.toLowerCase()) ||
        (e.description && e.description.toLowerCase().includes(search.toLowerCase()));

      const matchType = !typeFilter || e.expenseType.includes(typeFilter);

      return matchSearch && matchType;
    });
  }, [rawExpenses, search, typeFilter]);

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

  if (isLoading) {
    return <LoadingSpinner text="Đang tải sổ chi phí..." />;
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Sổ Chi phí Vận hành" description="Ghi nhận các khoản chi phí mặt bằng, điện nước, nhân công, bảo trì và mua sắm.">
        
          <Button onClick={() => setDialogOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" /> Ghi chi phí mới
          </Button>
        
      </PageHeader>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-card p-4 rounded-xl border">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm theo khoản chi, mô tả..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="w-full sm:w-56">
          <Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
            <option value="">-- Tất cả loại chi phí --</option>
            <option value="điện">Tiền điện / Nước</option>
            <option value="mặt bằng">Thuê mặt bằng</option>
            <option value="bảo trì">Bảo trì thiết bị</option>
            <option value="thực phẩm">Nguyên vật liệu</option>
          </Select>
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
