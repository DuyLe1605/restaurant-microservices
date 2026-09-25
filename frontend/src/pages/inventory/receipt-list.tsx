import * as React from 'react';
import { useReceipts, useCreateReceipt, useCompleteReceipt } from '@/hooks/use-inventory';
import { useIngredients } from '@/hooks/use-ingredients';
import { PageHeader } from '@/components/shared/page-header';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { EmptyState } from '@/components/shared/empty-state';
import { StatusBadge } from '@/components/shared/status-badge';
import { formatVND } from '@/lib/format-currency';
import { formatDate } from '@/lib/format-date';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Dialog } from '@/components/ui/dialog';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Plus, Check, Trash2 } from 'lucide-react';
import { ReceiptDetail } from '@/types/inventory';

export function ReceiptListPage() {
  const [page, setPage] = React.useState(0);
  const { data, isLoading } = useReceipts({ page, size: 10 });
  const { data: ingData } = useIngredients({ size: 100 });
  const createMutation = useCreateReceipt();
  const completeMutation = useCompleteReceipt();

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [supplier, setSupplier] = React.useState('Công ty TNHH Thực Phẩm Sạch');
  const [receiptDate, setReceiptDate] = React.useState(new Date().toISOString().split('T')[0]);
  const [note, setNote] = React.useState('');
  const [items, setItems] = React.useState<ReceiptDetail[]>([]);

  const handleOpenCreate = () => {
    setSupplier('Công ty TNHH Thực Phẩm Sạch');
    setReceiptDate(new Date().toISOString().split('T')[0]);
    setNote('');
    if (ingData && ingData.content.length > 0) {
      const first = ingData.content[0];
      setItems([{ ingredientId: first.id, qty: 10, unitPrice: first.purchasePrice || 50000 }]);
    } else {
      setItems([]);
    }
    setDialogOpen(true);
  };

  const handleAddItem = () => {
    if (!ingData || ingData.content.length === 0) return;
    const first = ingData.content[0];
    setItems([...items, { ingredientId: first.id, qty: 10, unitPrice: first.purchasePrice || 50000 }]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(
      { supplier, receiptDate, note, items },
      { onSuccess: () => setDialogOpen(false) }
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quản Lý Nhập Kho (Receipts)"
        description="Tạo phiếu nhập từ nhà cung cấp và hoàn thành phiếu để tự động cộng dồn kho"
      >
        <Button onClick={handleOpenCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Tạo phiếu nhập
        </Button>
      </PageHeader>

      {isLoading ? (
        <LoadingSpinner text="Đang tải danh sách phiếu nhập..." />
      ) : !data || data.content.length === 0 ? (
        <EmptyState
          title="Chưa có phiếu nhập"
          description="Chưa có phiếu nhập kho nào được tạo."
          actionText="Tạo phiếu nhập đầu tiên"
          onAction={handleOpenCreate}
        />
      ) : (
        <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mã phiếu</TableHead>
                <TableHead>Ngày nhập</TableHead>
                <TableHead>Nhà cung cấp</TableHead>
                <TableHead>Số mặt hàng</TableHead>
                <TableHead>Tổng tiền</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.content.map((receipt) => (
                <TableRow key={receipt.id}>
                  <TableCell className="font-bold">PNK-#{receipt.id}</TableCell>
                  <TableCell>{formatDate(receipt.receiptDate)}</TableCell>
                  <TableCell className="font-semibold">{receipt.supplier || 'N/A'}</TableCell>
                  <TableCell>{receipt.items?.length || 0} mặt hàng</TableCell>
                  <TableCell className="font-bold text-emerald-600">{formatVND(receipt.totalAmount)}</TableCell>
                  <TableCell>
                    <StatusBadge status={receipt.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    {receipt.status === 'PENDING' && (
                      <Button
                        size="sm"
                        variant="success"
                        isLoading={completeMutation.isPending}
                        onClick={() => completeMutation.mutate(receipt.id)}
                      >
                        <Check className="h-4 w-4 mr-1.5" />
                        Chốt nhập kho
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination */}
          <div className="flex items-center justify-between px-6 py-4 border-t text-sm">
            <span className="text-muted-foreground text-xs">
              Trang {data.pageNumber + 1} / {data.totalPages} ({data.totalElements} phiếu)
            </span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={data.pageNumber === 0} onClick={() => setPage((p) => p - 1)}>
                Trước
              </Button>
              <Button variant="outline" size="sm" disabled={data.last} onClick={() => setPage((p) => p + 1)}>
                Sau
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Create Receipt */}
      <Dialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title="Lập Phiếu Nhập Kho Mới"
        description="Điền nhà cung cấp và danh sách nguyên liệu nhập"
        className="max-w-2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1 block">Nhà cung cấp</label>
              <Input value={supplier} onChange={(e) => setSupplier(e.target.value)} required />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1 block">Ngày nhập</label>
              <Input type="date" value={receiptDate} onChange={(e) => setReceiptDate(e.target.value)} required />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1 block">Ghi chú phiếu nhập</label>
            <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Nhập theo hóa đơn số..." />
          </div>

          {/* Dynamic Items */}
          <div className="border rounded-xl p-4 bg-muted/20 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-sm">Danh Sách Mặt Hàng Nhập</h4>
              <Button type="button" size="sm" variant="outline" onClick={handleAddItem}>
                <Plus className="h-4 w-4 mr-1" /> Thêm dòng
              </Button>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {items.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <div className="flex-1">
                    <Select
                      value={item.ingredientId}
                      onChange={(e) => {
                        const newId = Number(e.target.value);
                        const selectedIng = ingData?.content.find((i) => i.id === newId);
                        const newItems = [...items];
                        newItems[idx] = {
                          ...newItems[idx],
                          ingredientId: newId,
                          unitPrice: selectedIng?.purchasePrice || newItems[idx].unitPrice,
                        };
                        setItems(newItems);
                      }}
                    >
                      {ingData?.content.map((i) => (
                        <option key={i.id} value={i.id}>
                          {i.name} ({i.unit})
                        </option>
                      ))}
                    </Select>
                  </div>
                  <div className="w-24">
                    <Input
                      type="number"
                      min="0.1"
                      step="0.1"
                      placeholder="Số lượng"
                      value={item.qty}
                      onChange={(e) => {
                        const newItems = [...items];
                        newItems[idx].qty = Number(e.target.value);
                        setItems(newItems);
                      }}
                      required
                    />
                  </div>
                  <div className="w-32">
                    <Input
                      type="number"
                      min="0"
                      step="1000"
                      placeholder="Đơn giá"
                      value={item.unitPrice}
                      onChange={(e) => {
                        const newItems = [...items];
                        newItems[idx].unitPrice = Number(e.target.value);
                        setItems(newItems);
                      }}
                      required
                    />
                  </div>
                  <Button type="button" variant="ghost" size="icon" className="text-destructive" onClick={() => handleRemoveItem(idx)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
              Hủy
            </Button>
            <Button type="submit" isLoading={createMutation.isPending}>
              Tạo phiếu nhập (PENDING)
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
