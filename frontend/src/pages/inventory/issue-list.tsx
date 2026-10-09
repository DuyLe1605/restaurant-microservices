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
import { Plus, Trash2, Download, Printer, FileText, Calendar, Search, RotateCcw } from 'lucide-react';
import { IssueDetail, IssueType, InventoryIssue } from '@/types/inventory';
import { exportToExcel, printProfessionalReport } from '@/lib/export-utils';

export function IssueListPage() {
  const [page, setPage] = React.useState(0);
  const { data, isLoading } = useIssues({ page, size: 50 });
  const { data: ingData } = useIngredients({ size: 100 });
  const createMutation = useCreateManualIssue();

  // Date Filter & Criteria
  const [startDate, setStartDate] = React.useState('');
  const [endDate, setEndDate] = React.useState('');
  const [typeFilter, setTypeFilter] = React.useState<string>('');
  const [searchNote, setSearchNote] = React.useState('');

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [issueType, setIssueType] = React.useState<IssueType>('MANUAL');
  const [issueDate, setIssueDate] = React.useState(new Date().toISOString().split('T')[0]);
  const [note, setNote] = React.useState('');
  const [items, setItems] = React.useState<IssueDetail[]>([]);

  // Presets
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
    setTypeFilter('');
    setSearchNote('');
  };

  const rawIssues: InventoryIssue[] = data?.content || [];
  const filteredIssues = React.useMemo(() => {
    return rawIssues.filter((i) => {
      const matchStart = !startDate || i.issueDate >= startDate;
      const matchEnd = !endDate || i.issueDate <= endDate;
      const matchType = !typeFilter || i.issueType === typeFilter;
      const matchNote = !searchNote || (i.note && i.note.toLowerCase().includes(searchNote.toLowerCase()));
      return matchStart && matchEnd && matchType && matchNote;
    });
  }, [rawIssues, startDate, endDate, typeFilter, searchNote]);

  const datePeriodLabel = React.useMemo(() => {
    if (startDate && endDate) {
      return startDate === endDate ? `Ngày ${formatDate(startDate)}` : `Từ ngày ${formatDate(startDate)} đến ngày ${formatDate(endDate)}`;
    }
    if (startDate) return `Từ ngày ${formatDate(startDate)}`;
    if (endDate) return `Đến ngày ${formatDate(endDate)}`;
    return 'Toàn bộ thời gian';
  }, [startDate, endDate]);

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

  const handleExportExcel = () => {
    if (filteredIssues.length === 0) return;
    const excelData = filteredIssues.map((item, idx) => ({
      stt: idx + 1,
      id: `PXK-${item.id}`,
      date: formatDate(item.issueDate),
      type: item.issueType === 'SALE' ? 'Xuất theo đơn bán hàng' : 'Xuất thủ công / Hủy hao hụt',
      itemCount: item.items?.length || 0,
      note: item.note || '---',
      status: item.status === 'COMPLETED' ? 'Đã hoàn tất' : 'Chờ xử lý',
    }));

    const dateSuffix = startDate ? (startDate === endDate ? startDate : `${startDate}_den_${endDate}`) : 'Toan_Bo';
    exportToExcel(
      `So_Xuat_Kho_${dateSuffix}`,
      `SỔ THEO DÕI XUẤT KHO NGUYÊN VẬT LIỆU (${datePeriodLabel.toUpperCase()})`,
      [
        { header: 'STT', key: 'stt' },
        { header: 'Mã Phiếu', key: 'id' },
        { header: 'Ngày Xuất', key: 'date' },
        { header: 'Hình Thức Xuất', key: 'type' },
        { header: 'Số Mặt Hàng', key: 'itemCount' },
        { header: 'Diễn Giải / Lý Do', key: 'note' },
        { header: 'Trạng Thái', key: 'status' },
      ],
      excelData,
      [
        { label: 'TỔNG SỐ PHIẾU XUẤT', value: `${filteredIssues.length} phiếu` },
      ],
      {
        'Kỳ trích xuất': datePeriodLabel,
        'Người trích xuất': 'Thủ kho / Ban Quản Lý',
      }
    );
  };

  const handlePrintIssueBook = () => {
    if (filteredIssues.length === 0) return;
    const saleCount = filteredIssues.filter((i) => i.issueType === 'SALE').length;
    const manualCount = filteredIssues.filter((i) => i.issueType !== 'SALE').length;

    printProfessionalReport({
      title: 'SỔ TỔNG HỢP XUẤT KHO NGUYÊN LIỆU',
      subtitle: `Bảng kê chi tiết các phiếu xuất nguyên liệu phục vụ bán hàng & chế biến`,
      reportPeriod: datePeriodLabel,
      preparedBy: 'Thủ kho / Kế toán vật tư',
      kpis: [
        { label: 'Tổng phiếu xuất', value: String(filteredIssues.length), color: '#0284c7' },
        { label: 'Xuất theo đơn bán', value: String(saleCount), color: '#16a34a' },
        { label: 'Xuất thủ công / Hủy', value: String(manualCount), color: '#d97706' },
      ],
      columns: [
        { header: 'Mã phiếu', key: 'id', align: 'left' },
        { header: 'Ngày xuất', key: 'date', align: 'left' },
        { header: 'Hình thức', key: 'type', align: 'left' },
        { header: 'Số mặt hàng', key: 'itemCount', align: 'center' },
        { header: 'Ghi chú', key: 'note', align: 'left' },
        { header: 'Trạng thái', key: 'status', align: 'center' },
      ],
      data: filteredIssues.map((item) => ({
        id: `PXK-#${item.id}`,
        date: formatDate(item.issueDate),
        type: item.issueType === 'SALE' ? 'Xuất theo đơn bán' : 'Xuất thủ công / Hủy',
        itemCount: `${item.items?.length || 0} mặt hàng`,
        note: item.note || '---',
        status: item.status === 'COMPLETED' ? 'Hoàn tất' : 'Chờ xử lý',
      })),
      signatures: ['Người Lập Biểu', 'Thủ Kho', 'Bếp Trưởng / Giám Đốc'],
    });
  };

  const handlePrintSingleIssue = (issue: InventoryIssue) => {
    const rows = (issue.items || []).map((it, idx) => {
      const ing = ingData?.content.find((i) => i.id === it.ingredientId);
      return {
        stt: idx + 1,
        code: ing?.code || `ING-${it.ingredientId}`,
        name: ing?.name || it.ingredientName || `Nguyên liệu #${it.ingredientId}`,
        unit: ing?.unit || it.unit || 'Kg',
        qty: it.qty,
        note: issue.note || 'Xuất chế biến',
      };
    });

    printProfessionalReport({
      title: `PHIẾU XUẤT KHO VẬT TƯ / NGUYÊN LIỆU`,
      subtitle: `Mã chứng từ: PXK-#${issue.id} - Ngày chứng từ: ${formatDate(issue.issueDate)}`,
      reportPeriod: formatDate(issue.issueDate),
      preparedBy: 'Thủ kho xuất',
      kpis: [
        { label: 'Mã phiếu xuất', value: `PXK-#${issue.id}`, color: '#0284c7' },
        {
          label: 'Loại xuất kho',
          value: issue.issueType === 'SALE' ? 'Xuất theo đơn bán' : 'Xuất thủ công / Hủy',
          color: '#d97706',
        },
        { label: 'Tổng số mặt hàng', value: `${issue.items?.length || 0} mục` },
        { label: 'Trạng thái', value: issue.status === 'COMPLETED' ? 'Đã hoàn tất' : 'Chờ xử lý', color: '#16a34a' },
      ],
      columns: [
        { header: 'STT', key: 'stt', align: 'center' },
        { header: 'Mã VT', key: 'code', align: 'left' },
        { header: 'Tên Nguyên Liệu / Vật Tư', key: 'name', align: 'left' },
        { header: 'ĐVT', key: 'unit', align: 'center' },
        { header: 'Số Lượng Xuất', key: 'qty', align: 'right' },
        { header: 'Mục Đích Sử Dụng', key: 'note', align: 'left' },
      ],
      data: rows.length > 0 ? rows : [{ stt: 1, code: '-', name: 'Không có chi tiết mặt hàng', unit: '-', qty: 0, note: '-' }],
      signatures: ['Người Nhận Hàng', 'Thủ Kho Xuất', 'Kế Toán Kho', 'Giám Đốc / Bếp Trưởng'],
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quản Lý Xuất Kho (Issues)"
        description="Lịch sử xuất bán từ đơn hàng và phiếu xuất hủy / thủ công"
      >
        <div className="flex items-center gap-2">
          {data && data.content.length > 0 && (
            <>
              <Button variant="outline" onClick={handleExportExcel} className="gap-2">
                <Download className="h-4 w-4 text-emerald-600" />
                Xuất Excel
              </Button>
              <Button variant="outline" onClick={handlePrintIssueBook} className="gap-2">
                <Printer className="h-4 w-4" />
                In sổ xuất kho
              </Button>
            </>
          )}
          <Button onClick={handleOpenCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Xuất kho thủ công
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
            <label className="text-xs font-semibold text-muted-foreground mb-1 block">Hình thức xuất:</label>
            <Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
              <option value="">-- Tất cả hình thức --</option>
              <option value="SALE">Xuất theo đơn bán hàng</option>
              <option value="MANUAL">Xuất thủ công / Hủy hao hụt</option>
            </Select>
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1 block">Tìm ghi chú:</label>
            <div className="relative">
              <Input
                placeholder="Nội dung ghi chú..."
                value={searchNote}
                onChange={(e) => setSearchNote(e.target.value)}
                className="pl-8"
              />
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            </div>
          </div>
        </div>
      </div>

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
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredIssues.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground text-sm">
                    Không tìm thấy phiếu xuất kho phù hợp với bộ lọc thời gian & điều kiện này.
                  </TableCell>
                </TableRow>
              ) : (
                filteredIssues.map((issue) => (
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
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handlePrintSingleIssue(issue)}
                        title="In phiếu xuất kho"
                        className="gap-1 h-8 px-2"
                      >
                        <Printer className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-xs">In phiếu</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
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
