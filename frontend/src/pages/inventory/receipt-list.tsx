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
import { Plus, Check, Trash2, Download, Printer, FileText, Calendar, Search, RotateCcw, Eye, MoreHorizontal } from 'lucide-react';
import { ReceiptDetail, InventoryReceipt } from '@/types/inventory';
import { exportToExcel, printProfessionalReport } from '@/lib/export-utils';
import { DropdownMenu, DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { ExportDropdown } from '@/components/shared/export-dropdown';
import { smartIncludes } from '@/lib/utils';

export function ReceiptListPage() {
  const [page, setPage] = React.useState(0);
  // Date Filter & Criteria
  const [startDate, setStartDate] = React.useState('');
  const [endDate, setEndDate] = React.useState('');
  const [supplierFilter, setSupplierFilter] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<ReceiptStatus | ''>('');

  const { data, isLoading } = useReceipts({
    page,
    size: 50,
    supplier: supplierFilter || undefined,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
    status: (statusFilter as ReceiptStatus) || undefined,
  });
  const { data: ingData } = useIngredients({ size: 100 });
  const createMutation = useCreateReceipt();
  const completeMutation = useCompleteReceipt();

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [viewReceipt, setViewReceipt] = React.useState<InventoryReceipt | null>(null);
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
    return rawReceipts
      .filter((r) => {
        const matchStart = !startDate || r.receiptDate >= startDate;
        const matchEnd = !endDate || r.receiptDate <= endDate;
        const matchSupplier = !supplierFilter || smartIncludes(r.supplier, supplierFilter);
        const matchStatus = !statusFilter || r.status === statusFilter;
        return matchStart && matchEnd && matchSupplier && matchStatus;
      })
      .sort((a, b) => {
        const dateDiff = new Date(b.receiptDate).getTime() - new Date(a.receiptDate).getTime();
        return dateDiff !== 0 ? dateDiff : (b.id || 0) - (a.id || 0);
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
        <div className="flex items-center gap-2.5">
          <ExportDropdown
            onExportExcel={handleExportListExcel}
            onPrintReport={handlePrintListReport}
            excelLabel="Xuất sổ theo dõi nhập kho (.xlsx)"
            printLabel="In bảng kê sổ nhập kho (A4)"
            disabled={isLoading || filteredReceipts.length === 0}
            buttonText="Xuất & In sổ nhập"
          />
          <Button onClick={handleOpenCreate} className="shadow-xs font-semibold gap-1.5">
            <Plus className="h-4 w-4" />
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
                <TableRow key={receipt.id} className="hover:bg-muted/40 transition-colors">
                  <TableCell>
                    <button
                      type="button"
                      onClick={() => setViewReceipt(receipt)}
                      className="font-bold text-primary hover:underline cursor-pointer"
                      title="Bấm để xem chi tiết các mặt hàng"
                    >
                      PNK-#{receipt.id}
                    </button>
                  </TableCell>
                  <TableCell>{formatDate(receipt.receiptDate)}</TableCell>
                  <TableCell className="font-semibold">{receipt.supplier || 'N/A'}</TableCell>
                  <TableCell>
                    <button
                      type="button"
                      onClick={() => setViewReceipt(receipt)}
                      className="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                      title="Xem các mặt hàng"
                    >
                      {receipt.items?.length || 0} mặt hàng
                    </button>
                  </TableCell>
                  <TableCell className="font-bold text-emerald-600 dark:text-emerald-400">{formatVND(receipt.totalAmount)}</TableCell>
                  <TableCell>
                    <StatusBadge status={receipt.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu
                      align="end"
                      trigger={
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground"
                          title="Thao tác"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Thao tác</span>
                        </Button>
                      }
                    >
                      <DropdownMenuItem
                        icon={<Eye className="h-4 w-4 text-primary" />}
                        onClick={() => setViewReceipt(receipt)}
                      >
                        Xem chi tiết mặt hàng
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        icon={<Printer className="h-4 w-4 text-blue-600 dark:text-blue-400" />}
                        onClick={() => handlePrintSingleReceipt(receipt)}
                      >
                        In phiếu nhập kho
                      </DropdownMenuItem>

                      {receipt.status === 'PENDING' && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            variant="success"
                            icon={<Check className="h-4 w-4 text-emerald-600" />}
                            disabled={completeMutation.isPending}
                            onClick={() => completeMutation.mutate(receipt.id)}
                          >
                            Chốt nhập kho
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenu>
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

      {/* Modal View Receipt Details & Items (Xem các mặt hàng trong phiếu) */}
      <Dialog
        open={!!viewReceipt}
        onOpenChange={(open) => !open && setViewReceipt(null)}
        title={`Chi Tiết Phiếu Nhập Kho PNK-#${viewReceipt?.id || ''}`}
        description={`Nhà cung cấp: ${viewReceipt?.supplier || 'N/A'} • Ngày nhập: ${viewReceipt ? formatDate(viewReceipt.receiptDate) : ''}`}
        className="max-w-2xl"
      >
        {viewReceipt && (
          <div className="space-y-4">
            {/* Summary cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-xl bg-muted/30 border text-xs">
              <div>
                <span className="text-muted-foreground block text-[11px]">Trạng thái:</span>
                <div className="mt-0.5">
                  <StatusBadge status={viewReceipt.status} />
                </div>
              </div>
              <div>
                <span className="text-muted-foreground block text-[11px]">Tổng số mặt hàng:</span>
                <span className="font-bold text-foreground text-sm mt-0.5 block">
                  {viewReceipt.items?.length || 0} mặt hàng
                </span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[11px]">Tổng giá trị nhập:</span>
                <span className="font-black text-emerald-600 dark:text-emerald-400 text-sm mt-0.5 block">
                  {formatVND(viewReceipt.totalAmount)}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[11px]">Ghi chú:</span>
                <span className="font-medium text-foreground text-xs mt-0.5 block truncate" title={viewReceipt.note || 'Không có'}>
                  {viewReceipt.note || '—'}
                </span>
              </div>
            </div>

            {/* Items Table */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Danh Sách Các Mặt Hàng Nguyên Liệu Nhập
                </h4>
              </div>

              <div className="rounded-xl border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40 text-xs">
                      <TableHead className="w-10 text-center">STT</TableHead>
                      <TableHead>Tên mặt hàng nguyên liệu</TableHead>
                      <TableHead className="text-center">ĐVT</TableHead>
                      <TableHead className="text-right">Số lượng</TableHead>
                      <TableHead className="text-right">Đơn giá nhập</TableHead>
                      <TableHead className="text-right">Thành tiền</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {viewReceipt.items && viewReceipt.items.length > 0 ? (
                      viewReceipt.items.map((item, idx) => {
                        const subtotal = item.qty * item.unitPrice;
                        return (
                          <TableRow key={idx} className="text-xs">
                            <TableCell className="text-center font-mono text-muted-foreground">
                              {idx + 1}
                            </TableCell>
                            <TableCell className="font-semibold text-foreground">
                              {item.ingredientName || `Nguyên liệu #${item.ingredientId}`}
                            </TableCell>
                            <TableCell className="text-center text-muted-foreground font-medium">
                              {item.unit || 'kg'}
                            </TableCell>
                            <TableCell className="text-right font-bold text-foreground">
                              {item.qty}
                            </TableCell>
                            <TableCell className="text-right text-muted-foreground">
                              {formatVND(item.unitPrice)}
                            </TableCell>
                            <TableCell className="text-right font-bold text-foreground">
                              {formatVND(subtotal)}
                            </TableCell>
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                          Chưa có thông tin chi tiết các mặt hàng
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Dialog Actions */}
            <div className="flex items-center justify-between pt-2 border-t">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handlePrintSingleReceipt(viewReceipt)}
                className="gap-1.5"
              >
                <Printer className="h-4 w-4" /> In phiếu nhập
              </Button>

              <div className="flex gap-2">
                {viewReceipt.status === 'PENDING' && (
                  <Button
                    size="sm"
                    variant="success"
                    isLoading={completeMutation.isPending}
                    onClick={() => {
                      completeMutation.mutate(viewReceipt.id, {
                        onSuccess: () => setViewReceipt(null),
                      });
                    }}
                    className="gap-1.5"
                  >
                    <Check className="h-4 w-4" /> Chốt nhập kho ngay
                  </Button>
                )}
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={() => setViewReceipt(null)}
                >
                  Đóng
                </Button>
              </div>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
}
