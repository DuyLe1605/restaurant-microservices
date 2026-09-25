import * as React from 'react';
import { useIssues, useCreateManualIssue } from '@/hooks/use-inventory';
import { useIngredients } from '@/hooks/use-ingredients';
import { PageHeader } from '@/components/shared/page-header';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { EmptyState } from '@/components/shared/empty-state';
import { StatusBadge } from '@/components/shared/status-badge';
import { formatDate } from '@/lib/format-date';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Dialog } from '@/components/ui/dialog';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Plus, Trash2 } from 'lucide-react';
import { IssueDetail, IssueType } from '@/types/inventory';

export function IssueListPage() {
  const [page, setPage] = React.useState(0);
  const { data, isLoading } = useIssues({ page, size: 10 });
  const { data: ingData } = useIngredients({ size: 100 });
  const createMutation = useCreateManualIssue();

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [issueType, setIssueType] = React.useState<IssueType>('MANUAL');
  const [issueDate, setIssueDate] = React.useState(new Date().toISOString().split('T')[0]);
  const [note, setNote] = React.useState('');
  const [items, setItems] = React.useState<IssueDetail[]>([]);

  const handleOpenCreate = () => {
    setIssueType('MANUAL');
    setIssueDate(new Date().toISOString().split('T')[0]);
    setNote('');
    if (ingData && ingData.content.length > 0) {
      setItems([{ ingredientId: ingData.content[0].id, qty: 1 }]);
    } else {
      setItems([]);
    }
    setDialogOpen(true);
  };

  const handleAddItem = () => {
    if (!ingData || ingData.content.length === 0) return;
    setItems([...items, { ingredientId: ingData.content[0].id, qty: 1 }]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(
      { issueType, issueDate, note, items },
      { onSuccess: () => setDialogOpen(false) }
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quản Lý Xuất Kho (Issues)"
        description="Lịch sử xuất bán từ đơn hàng và phiếu xuất hủy / thủ công"
      >
        <Button onClick={handleOpenCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Xuất kho thủ công
        </Button>
      </PageHeader>

      {isLoading ? (
        <LoadingSpinner text="Đang tải lịch sử xuất kho..." />
      ) : !data || data.content.length === 0 ? (
        <EmptyState
          title="Chưa có dữ liệu xuất kho"
          description="Chưa có bản ghi xuất kho nào."
          actionText="Tạo phiếu xuất thủ công"
          onAction={handleOpenCreate}
        />
      ) : (
        <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mã phiếu</TableHead>
                <TableHead>Ngày xuất</TableHead>
                <TableHead>Loại xuất</TableHead>
                <TableHead>Ghi chú</TableHead>
                <TableHead>Số mặt hàng</TableHead>
                <TableHead>Trạng thái</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.content.map((issue) => (
                <TableRow key={issue.id}>
                  <TableCell className="font-bold">PXK-#{issue.id}</TableCell>
                  <TableCell>{formatDate(issue.issueDate)}</TableCell>
                  <TableCell>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                      issue.issueType === 'SALE' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {issue.issueType === 'SALE' ? 'Xuất theo đơn bán' : 'Xuất thủ công / Hủy'}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs">{issue.note || '-'}</TableCell>
                  <TableCell>{issue.items?.length || 0} mặt hàng</TableCell>
                  <TableCell>
                    <StatusBadge status={issue.status} />
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

      {/* Modal Manual Issue */}
      <Dialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title="Lập Phiếu Xuất Kho Thủ Công"
        description="Xuất hao hụt, hỏng hóc hoặc chế biến nội bộ"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Select label="Loại xuất" value={issueType} onChange={(e) => setIssueType(e.target.value as IssueType)}>
                <option value="MANUAL">Xuất thủ công</option>
                <option value="WASTE">Hao hụt / Hết hạn</option>
              </Select>
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1 block">Ngày xuất</label>
              <Input type="date" value={issueDate} onChange={(e) => setIssueDate(e.target.value)} required />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1 block">Lý do xuất kho</label>
            <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Ví dụ: Rau dập hỏng..." required />
          </div>

          {/* Dynamic Items */}
          <div className="border rounded-xl p-4 bg-muted/20 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-sm">Nguyên Liệu Xuất</h4>
              <Button type="button" size="sm" variant="outline" onClick={handleAddItem}>
                <Plus className="h-4 w-4 mr-1" /> Thêm dòng
              </Button>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {items.map((item, idx) => {
                const selectedIng = ingData?.content.find((i) => i.id === item.ingredientId);
                return (
                  <div key={idx} className="flex items-center gap-2">
                    <div className="flex-1">
                      <Select
                        value={item.ingredientId}
                        onChange={(e) => {
                          const newId = Number(e.target.value);
                          const newItems = [...items];
                          newItems[idx].ingredientId = newId;
                          setItems(newItems);
                        }}
                      >
                        {ingData?.content.map((i) => (
                          <option key={i.id} value={i.id}>
                            {i.name} (Tồn: {i.currentStock} {i.unit})
                          </option>
                        ))}
                      </Select>
                    </div>
                    <div className="w-28">
                      <Input
                        type="number"
                        min="0.01"
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
                    <span className="text-xs text-muted-foreground font-semibold w-10">
                      {selectedIng?.unit || ''}
                    </span>
                    <Button type="button" variant="ghost" size="icon" className="text-destructive" onClick={() => handleRemoveItem(idx)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
              Hủy
            </Button>
            <Button type="submit" isLoading={createMutation.isPending}>
              Xác nhận xuất kho
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
