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
import { Plus, Check, Trash2, Download, Printer, FileText, Calendar, Search, RotateCcw } from 'lucide-react';
import { ReceiptDetail, InventoryReceipt } from '@/types/inventory';
import { exportToExcel, printProfessionalReport } from '@/lib/export-utils';

export function ReceiptListPage() {
  const [page, setPage] = React.useState(0);
  const { data, isLoading } = useReceipts({ page, size: 50 });
  const { data: ingData } = useIngredients({ size: 100 });
  const createMutation = useCreateReceipt();
  const completeMutation = useCompleteReceipt();

  // Date Filter & Criteria
  const [startDate, setStartDate] = React.useState('');
  const [endDate, setEndDate] = React.useState('');
  const [supplierFilter, setSupplierFilter] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('');

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [supplier, setSupplier] = React.useState('Công ty TNHH Thực Phẩm Sạch');
  const [receiptDate, setReceiptDate] = React.useState(new Date().toISOString().split('T')[0]);
  const [note, setNote] = React.useState('');
  const [items, setItems] = React.useState<ReceiptDetail[]>([]);

  // Preset Filters
  const setFilterToday = () => {
    const today = new Date().toISOString().split('T')[0];
    setStartDate(today);
    setEndDate(today);
  };

  const setFilter7Days = () => {
    const today = new Date();
    const past = new Date(today);
    past.setDate(today.getDate() - 6);
    setStartDate(past.toISOString().split('T')[0]);
    setEndDate(today.toISOString().split('T')[0]);
  };

  const setFilterMonth = () => {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    setStartDate(firstDay.toISOString().split('T')[0]);
    setEndDate(today.toISOString().split('T')[0]);
  };

  const setFilterAll = () => {
    setStartDate('');
    setEndDate('');
    setSupplierFilter('');
    setStatusFilter('');
  };

  const rawReceipts: InventoryReceipt[] = data?.content || [];
  const filteredReceipts = React.useMemo(() => {
    return rawReceipts.filter((r) => {
      const matchStart = !startDate || r.receiptDate >= startDate;
      const matchEnd = !endDate || r.receiptDate <= endDate;
      const matchSupplier = !supplierFilter || (r.supplier && r.supplier.toLowerCase().includes(supplierFilter.toLowerCase()));
      const matchStatus = !statusFilter || r.status === statusFilter;
      return matchStart && matchEnd && matchSupplier && matchStatus;
    });
  }, [rawReceipts, startDate, endDate, supplierFilter, statusFilter]);

  const datePeriodLabel = React.useMemo(() => {
    if (startDate && endDate) {
      return startDate === endDate ? `Ngày ${formatDate(startDate)}` : `Từ ngày ${formatDate(startDate)} đến ngày ${formatDate(endDate)}`;
    }
    if (startDate) return `Từ ngày ${formatDate(startDate)}`;
    if (endDate) return `Đến ngày ${formatDate(endDate)}`;
    return 'Toàn bộ thời gian';
  }, [startDate, endDate]);

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

  const handleExportListExcel = () => {
    if (filteredReceipts.length === 0) return;
    const totalSum = filteredReceipts.reduce((acc, r) => acc + (r.totalAmount || 0), 0);
    const dateSuffix = startDate ? (startDate === endDate ? startDate : `${startDate}_den_${endDate}`) : 'Toan_Bo';
    exportToExcel(
      `So_Theo_Doi_Nhap_Kho_${dateSuffix}`,
      `SỔ THEO DÕI & TỔNG HỢP NHẬP KHO NGUYÊN LIỆU (${datePeriodLabel.toUpperCase()})`,
      [
        { header: 'STT', key: '__index' },
        { header: 'Mã phiếu', key: 'id', formatter: (v) => `PNK-#${v}` },
        { header: 'Ngày nhập', key: 'receiptDate', formatter: (v) => formatDate(v) },
        { header: 'Nhà cung cấp', key: 'supplier' },
        { header: 'Số mặt hàng', key: 'items', formatter: (v) => `${v?.length || 0} mặt hàng` },
        { header: 'Tổng tiền (VND)', key: 'totalAmount', formatter: (v) => formatVND(v) },
        { header: 'Trạng thái', key: 'status', formatter: (v) => (v === 'COMPLETED' ? 'Đã nhập kho' : 'Chờ duyệt') },
        { header: 'Ghi chú', key: 'note' },
      ],
      filteredReceipts,
      [
        { label: 'TỔNG GIÁ TRỊ NHẬP KHO', value: formatVND(totalSum) },
        { label: 'TỔNG SỐ PHIẾU NHẬP', value: `${filteredReceipts.length} phiếu` },
      ],
      {
        'Kỳ trích xuất': datePeriodLabel,
        'Người trích xuất': 'Thủ kho / Ban Quản Lý',
        'Bộ phận': 'Quản lý Kho Vận',
      }
    );
  };

  const handlePrintListReport = () => {
    if (filteredReceipts.length === 0) return;
    const totalSum = filteredReceipts.reduce((acc, r) => acc + (r.totalAmount || 0), 0);
    const completedCount = filteredReceipts.filter((r) => r.status === 'COMPLETED').length;
    const pendingCount = filteredReceipts.filter((r) => r.status === 'PENDING').length;

    printProfessionalReport({
      title: 'Báo Cáo Sổ Tổng Hợp Nhập Kho Nguyên Liệu',
      subtitle: `Bảng kê các phiếu nhập hàng nguyên liệu thực phẩm từ nhà cung cấp`,
      reportPeriod: datePeriodLabel,
      preparedBy: 'Bộ phận Thủ Kho & Tiếp Nhận Hàng Hóa',
      kpis: [
        { label: 'Tổng số phiếu', value: `${filteredReceipts.length} phiếu`, color: '#0284c7' },
        { label: 'Tổng giá trị nhập', value: formatVND(totalSum), color: '#16a34a' },
        { label: 'Đã hoàn tất', value: `${completedCount} phiếu`, color: '#16a34a' },
        { label: 'Chờ duyệt', value: `${pendingCount} phiếu`, color: '#d97706' },
      ],
      columns: [
        { header: 'STT', key: '__index', align: 'center' },
        { header: 'Mã phiếu', key: 'id', align: 'center', formatter: (v) => `<strong>PNK-#${v}</strong>` },
        { header: 'Ngày nhập', key: 'receiptDate', align: 'left', formatter: (v) => formatDate(v) },
        { header: 'Nhà cung cấp', key: 'supplier', align: 'left' },
        { header: 'Số mặt hàng', key: 'items', align: 'center', formatter: (v) => `${v?.length || 0} mục` },
        {
          header: 'Tổng tiền',
          key: 'totalAmount',
          align: 'right',
          formatter: (v) => `<span style="color:#059669;font-weight:700;">${formatVND(v)}</span>`,
        },
        {
          header: 'Trạng thái',
          key: 'status',
          align: 'center',
          formatter: (v) =>
            v === 'COMPLETED'
              ? '<span style="color:#16a34a;font-weight:600;">Đã nhập kho</span>'
              : '<span style="color:#d97706;font-weight:600;">Chờ duyệt</span>',
        },
      ],
      data: filteredReceipts,
      summary: [
        { label: 'TỔNG TIỀN NHẬP KHO', value: formatVND(totalSum) },
      ],
      signatures: ['Người Lập Phiếu', 'Thủ Kho Nhận Hàng', 'Kế Toán Vật Tư', 'Giám Đốc / Bếp Trưởng'],
    });
  };

  const handlePrintSingleReceipt = (receipt: InventoryReceipt) => {
    printProfessionalReport({
      title: `PHIẾU NHẬP KHO #${receipt.id}`,
      subtitle: `Nhà cung cấp: ${receipt.supplier || 'N/A'} - Ngày nhập: ${formatDate(receipt.receiptDate)}`,
      reportPeriod: `Ngày lập: ${formatDate(receipt.receiptDate)}`,
      preparedBy: 'Thủ kho phụ trách',
      kpis: [
        { label: 'Số mặt hàng', value: `${receipt.items?.length || 0} mục`, color: '#0284c7' },
        { label: 'Tổng giá trị phiếu', value: formatVND(receipt.totalAmount), color: '#16a34a' },
        { label: 'Trạng thái', value: receipt.status === 'COMPLETED' ? 'Đã nhập kho' : 'Chờ duyệt', color: '#8b5cf6' },
      ],
      columns: [
        { header: 'STT', key: '__index', align: 'center' },
        { header: 'Mã NL', key: 'ingredientId', align: 'center' },
        { header: 'Tên nguyên liệu', key: 'ingredientName', align: 'left', formatter: (v, r) => v || `Nguyên liệu #${r.ingredientId}` },
        { header: 'Số lượng nhập', key: 'qty', align: 'right', formatter: (v) => `<strong>${v}</strong>` },
        { header: 'Đơn giá (VND)', key: 'unitPrice', align: 'right', formatter: (v) => formatVND(v) },
        { header: 'Thành tiền (VND)', key: 'unitPrice', align: 'right', formatter: (v, r) => formatVND((r.qty || 0) * (v || 0)) },
      ],
      data: receipt.items || [],
      summary: [
        { label: 'TỔNG CỘNG TIỀN HÀNG', value: formatVND(receipt.totalAmount) },
        { label: 'Ghi chú', value: receipt.note || 'Không có ghi chú' },
      ],
      signatures: ['Người Giao Hàng', 'Thủ Kho Tiếp Nhận', 'Kế Toán Trưởng'],
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quản Lý Nhập Kho (Receipts)"
        description="Theo dõi danh sách các phiếu nhập hàng nguyên vật liệu từ nhà cung cấp"
      >
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleExportListExcel} disabled={isLoading || filteredReceipts.length === 0}>
            <Download className="h-4 w-4 mr-2" />
            Xuất Excel
          </Button>
          <Button variant="outline" onClick={handlePrintListReport} disabled={isLoading || filteredReceipts.length === 0}>
            <Printer className="h-4 w-4 mr-2" />
            In sổ nhập kho
          </Button>
          <Button onClick={handleOpenCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Tạo phiếu nhập
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
              variant={startDate === new Date().toISOString().split('T')[0] && endDate === new Date().toISOString().split('T')[0] ? 'default' : 'outline'}
              size="sm"
              onClick={setFilterToday}
              className="text-xs h-7"
            >
              Hôm nay
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={setFilter7Days}
              className="text-xs h-7"
            >
              7 ngày qua
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={setFilterMonth}
              className="text-xs h-7"
            >
              Tháng này
            </Button>
            <Button
              variant={!startDate && !endDate ? 'secondary' : 'outline'}
              size="sm"
              onClick={setFilterAll}
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
            <label className="text-xs font-semibold text-muted-foreground mb-1 block">Tìm nhà cung cấp:</label>
            <div className="relative">
              <Input
                placeholder="Tên NCC..."
                value={supplierFilter}
                onChange={(e) => setSupplierFilter(e.target.value)}
                className="pl-8"
              />
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1 block">Trạng thái:</label>
            <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">-- Tất cả trạng thái --</option>
              <option value="COMPLETED">Đã nhập kho</option>
              <option value="PENDING">Chờ duyệt</option>
            </Select>
          </div>
        </div>
      </div>

      {isLoading ? (
        <LoadingSpinner text="Đang tải danh sách phiếu nhập..." />
      ) : filteredReceipts.length === 0 ? (
        <EmptyState
          title="Không tìm thấy phiếu nhập"
          description={startDate || endDate || supplierFilter ? "Không có phiếu nhập kho nào khớp với bộ lọc ngày/tiêu chí." : "Chưa có phiếu nhập kho nào được tạo."}
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
              {filteredReceipts.map((receipt) => (
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
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        title="In phiếu nhập kho này"
                        onClick={() => handlePrintSingleReceipt(receipt)}
                      >
                        <Printer className="h-3.5 w-3.5 mr-1" />
                        In phiếu
                      </Button>
                      {receipt.status === 'PENDING' && (
                        <Button
                          size="sm"
                          variant="success"
                          isLoading={completeMutation.isPending}
                          onClick={() => completeMutation.mutate(receipt.id)}
                        >
                          <Check className="h-4 w-4 mr-1.5" />
                          Chốt kho
                        </Button>
                      )}
                    </div>
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
