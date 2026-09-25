import * as React from 'react';
import {
  useIngredients,
  useCreateIngredient,
  useUpdateIngredient,
  useDeleteIngredient,
  useIngredientCategories,
  useCreateCategory,
  useDeleteCategory,
} from '@/hooks/use-ingredients';
import { PageHeader } from '@/components/shared/page-header';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { EmptyState } from '@/components/shared/empty-state';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { formatVND } from '@/lib/format-currency';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Dialog } from '@/components/ui/dialog';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Plus, Search, Edit2, Trash2, AlertTriangle, FolderPlus, Layers, Check } from 'lucide-react';
import { Ingredient, IngredientCategory } from '@/types/ingredient';
import { toast } from 'sonner';

export function IngredientListPage() {
  const [search, setSearch] = React.useState('');
  const [category, setCategory] = React.useState('');
  const [page, setPage] = React.useState(0);

  const { data, isLoading } = useIngredients({ search, category: category || undefined, page, size: 10 });
  const { data: categoriesData } = useIngredientCategories();
  const createMutation = useCreateIngredient();
  const updateMutation = useUpdateIngredient();
  const deleteMutation = useDeleteIngredient();
  const createCategoryMutation = useCreateCategory();
  const deleteCategoryMutation = useDeleteCategory();

  // Ingredient Modal State
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editingItem, setEditingItem] = React.useState<Ingredient | null>(null);
  const [code, setCode] = React.useState('');
  const [name, setName] = React.useState('');
  const [unit, setUnit] = React.useState('kg');
  const [purchasePrice, setPurchasePrice] = React.useState<number>(50000);
  const [minStock, setMinStock] = React.useState<number>(5);
  const [itemCategory, setItemCategory] = React.useState('');
  const [mainSupplier, setMainSupplier] = React.useState('');

  // Category Management Modal State
  const [categoryModalOpen, setCategoryModalOpen] = React.useState(false);
  const [newCatName, setNewCatName] = React.useState('');
  const [newCatDesc, setNewCatDesc] = React.useState('');
  const [deleteCatId, setDeleteCatId] = React.useState<number | null>(null);

  // Delete State
  const [deleteId, setDeleteId] = React.useState<number | null>(null);

  const categories: IngredientCategory[] = categoriesData || [];

  const handleOpenCreate = () => {
    setEditingItem(null);
    setCode('ING-' + Math.floor(100 + Math.random() * 900));
    setName('');
    setUnit('kg');
    setPurchasePrice(100000);
    setMinStock(5);
    setItemCategory(categories[0]?.name || 'Thịt & Gia cầm');
    setMainSupplier('');
    setDialogOpen(true);
  };

  const handleOpenEdit = (item: Ingredient) => {
    setEditingItem(item);
    setCode(item.code);
    setName(item.name);
    setUnit(item.unit);
    setPurchasePrice(item.purchasePrice || 0);
    setMinStock(item.minStock);
    setItemCategory(item.category || (categories[0]?.name || ''));
    setMainSupplier(item.mainSupplier || '');
    setDialogOpen(true);
  };

  const handleSubmitIngredient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemCategory) {
      toast.error('Vui lòng chọn danh mục nguyên liệu!');
      return;
    }

    const payload = {
      code,
      name,
      unit,
      purchasePrice,
      minStock,
      category: itemCategory,
      mainSupplier,
    };

    if (editingItem) {
      updateMutation.mutate(
        { id: editingItem.id, payload },
        { onSuccess: () => setDialogOpen(false) }
      );
    } else {
      createMutation.mutate(payload, { onSuccess: () => setDialogOpen(false) });
    }
  };

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    createCategoryMutation.mutate(
      { name: newCatName.trim(), description: newCatDesc.trim() },
      {
        onSuccess: () => {
          setNewCatName('');
          setNewCatDesc('');
          toast.success('Đã thêm danh mục nguyên liệu mới');
        },
      }
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quản Lý Nguyên Liệu"
        description="Danh mục vật tư thực phẩm, đơn vị tính, ngưỡng tồn kho an toàn và quản lý danh mục phân loại chuẩn"
      >
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setCategoryModalOpen(true)} className="gap-2">
            <Layers className="h-4 w-4" /> Quản lý danh mục
          </Button>
          <Button onClick={handleOpenCreate} className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold">
            <Plus className="h-4 w-4" /> Thêm nguyên liệu
          </Button>
        </div>
      </PageHeader>

      {/* Filter */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-card p-3 rounded-xl border">
        <div className="relative flex-1 w-full">
          <Input
            placeholder="Tìm theo mã hoặc tên nguyên liệu (vd: Bò Wagyu, Nấm Truffle...)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        </div>
        <Select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full sm:w-64">
          <option value="">-- Tất cả danh mục nguyên liệu --</option>
          {categories.map((c) => (
            <option key={c.id} value={c.name}>
              {c.name}
            </option>
          ))}
        </Select>
      </div>

      {isLoading ? (
        <LoadingSpinner text="Đang tải nguyên liệu..." />
      ) : !data || data.content.length === 0 ? (
        <EmptyState
          title="Chưa có nguyên liệu"
          description="Chưa có bản ghi nguyên liệu nào phù hợp."
          actionText="Thêm nguyên liệu đầu tiên"
          onAction={handleOpenCreate}
        />
      ) : (
        <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead>Mã</TableHead>
                <TableHead>Tên nguyên liệu</TableHead>
                <TableHead>Danh mục</TableHead>
                <TableHead>Đơn vị</TableHead>
                <TableHead>Giá nhập gần nhất</TableHead>
                <TableHead>Tồn hiện tại</TableHead>
                <TableHead>Tồn an toàn</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.content.map((item) => {
                const isOutOfStock = item.currentStock <= 0;
                const isLow = item.currentStock > 0 && item.currentStock <= item.minStock;

                return (
                  <TableRow key={item.id} className={isOutOfStock ? 'bg-rose-500/5' : isLow ? 'bg-amber-500/5' : ''}>
                    <TableCell className="font-mono text-xs font-bold text-muted-foreground">{item.code}</TableCell>
                    <TableCell className="font-semibold flex items-center gap-2">
                      {item.name}
                      {isOutOfStock ? (
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" /> Hết hàng
                        </span>
                      ) : isLow ? (
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                          Sắp hết
                        </span>
                      ) : null}
                    </TableCell>
                    <TableCell>
                      <span className="text-xs px-2.5 py-1 rounded-full bg-secondary font-medium">
                        {item.category || 'Mặc định'}
                      </span>
                    </TableCell>
                    <TableCell className="font-semibold text-muted-foreground">{item.unit}</TableCell>
                    <TableCell className="font-medium">{formatVND(item.purchasePrice)}</TableCell>
                    <TableCell>
                      <span className={`font-bold ${isOutOfStock ? 'text-rose-600' : isLow ? 'text-amber-600' : 'text-emerald-600'}`}>
                        {item.currentStock} {item.unit}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">{item.minStock} {item.unit}</TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(item)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => setDeleteId(item.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {/* Pagination */}
          <div className="flex items-center justify-between px-6 py-4 border-t text-sm">
            <span className="text-muted-foreground text-xs">
              Trang {data.pageNumber + 1} / {data.totalPages} ({data.totalElements} nguyên liệu)
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

      {/* MODAL 1: Thêm / Sửa Nguyên Liệu (Dropdown Category) */}
      <Dialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={editingItem ? 'Chỉnh Sửa Nguyên Liệu' : 'Thêm Nguyên Liệu Mới'}
        description="Khai báo thông tin nguyên liệu, chọn danh mục chuẩn và cài đặt ngưỡng cảnh báo tồn kho"
      >
        <form onSubmit={handleSubmitIngredient} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1 block">Mã nguyên liệu</label>
              <Input value={code} onChange={(e) => setCode(e.target.value)} required />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1 block">Đơn vị tính</label>
              <Select value={unit} onChange={(e) => setUnit(e.target.value)} required>
                <option value="kg">kg (Kilôgam)</option>
                <option value="g">g (Gram)</option>
                <option value="lít">lít (Lít)</option>
                <option value="ml">ml (Mililít)</option>
                <option value="hộp 100g">hộp 100g</option>
                <option value="lon">lon</option>
                <option value="chai">chai</option>
                <option value="gói">gói</option>
                <option value="quả">quả / củ</option>
              </Select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1 block">Tên nguyên liệu</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="VD: Bò Wagyu A5, Bơ Pháp..." required />
          </div>

          {/* Category Dropdown with Quick Management Button */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold text-muted-foreground block">
                Danh mục nguyên liệu <span className="text-destructive">*</span>
              </label>
              <button
                type="button"
                onClick={() => setCategoryModalOpen(true)}
                className="text-[11px] text-primary hover:underline font-semibold flex items-center gap-1"
              >
                + Quản lý danh mục
              </button>
            </div>
            <Select
              value={itemCategory}
              onChange={(e) => setItemCategory(e.target.value)}
              required
            >
              <option value="">-- Chọn danh mục nguyên liệu --</option>
              {categories.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1 block">Giá nhập tham chiếu (VNĐ)</label>
              <Input type="number" min="0" step="1000" value={purchasePrice} onChange={(e) => setPurchasePrice(Number(e.target.value))} />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1 block">Tồn kho an toàn tối thiểu</label>
              <Input type="number" min="0" step="0.1" value={minStock} onChange={(e) => setMinStock(Number(e.target.value))} required />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1 block">Nhà cung cấp chính</label>
            <Input value={mainSupplier} onChange={(e) => setMainSupplier(e.target.value)} placeholder="VD: Công ty TNHH Nhập Khẩu Thực Phẩm Cao Cấp..." />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
              Hủy
            </Button>
            <Button type="submit" isLoading={createMutation.isPending || updateMutation.isPending}>
              Lưu thông tin nguyên liệu
            </Button>
          </div>
        </form>
      </Dialog>

      {/* MODAL 2: Quản Lý Riêng Danh Mục Nguyên Liệu (Category Management) */}
      <Dialog
        open={categoryModalOpen}
        onOpenChange={setCategoryModalOpen}
        title="Quản Lý Danh Mục Nguyên Liệu"
        description="Thêm, xóa và cấu hình các nhóm danh mục phân loại cho vật tư nguyên liệu"
        className="max-w-xl"
      >
        <div className="space-y-4">
          {/* Add Category Form */}
          <form onSubmit={handleCreateCategory} className="p-3 bg-muted/40 rounded-xl border space-y-2">
            <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <FolderPlus className="h-4 w-4 text-primary" /> Thêm danh mục mới
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <Input
                placeholder="Tên danh mục (vd: Đồ đông lạnh, Nước sốt...)..."
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                className="text-xs h-9"
                required
              />
              <Input
                placeholder="Mô tả danh mục (tùy chọn)..."
                value={newCatDesc}
                onChange={(e) => setNewCatDesc(e.target.value)}
                className="text-xs h-9"
              />
            </div>
            <div className="flex justify-end">
              <Button type="submit" size="sm" isLoading={createCategoryMutation.isPending} className="text-xs font-bold">
                <Plus className="h-3.5 w-3.5 mr-1" /> Thêm danh mục
              </Button>
            </div>
          </form>

          {/* Current Categories List */}
          <div className="space-y-1">
            <span className="text-xs font-bold text-muted-foreground uppercase">
              Danh sách danh mục hiện có ({categories.length})
            </span>
            <div className="max-h-56 overflow-y-auto divide-y border rounded-xl">
              {categories.map((cat) => (
                <div key={cat.id} className="p-2.5 flex items-center justify-between text-xs hover:bg-muted/30 transition-colors">
                  <div>
                    <p className="font-bold text-foreground">{cat.name}</p>
                    {cat.description && <p className="text-[11px] text-muted-foreground">{cat.description}</p>}
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive hover:bg-destructive/10"
                    title="Xóa danh mục"
                    onClick={() => setDeleteCatId(cat.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end pt-2 border-t">
            <Button type="button" onClick={() => setCategoryModalOpen(false)}>
              Hoàn tất
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Delete Ingredient Dialog */}
      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Xóa nguyên liệu"
        description="Bạn có chắc chắn muốn xóa nguyên liệu này khỏi kho? Món ăn dùng nguyên liệu này trong công thức có thể bị ảnh hưởng."
        confirmText="Xóa nguyên liệu"
        isDanger={true}
        isLoading={deleteMutation.isPending}
        onConfirm={() => {
          if (deleteId) deleteMutation.mutate(deleteId);
        }}
      />

      {/* Delete Category Dialog */}
      <ConfirmDialog
        open={deleteCatId !== null}
        onOpenChange={(open) => !open && setDeleteCatId(null)}
        title="Xóa danh mục nguyên liệu"
        description="Bạn có chắc chắn muốn xóa danh mục này? Các nguyên liệu thuộc danh mục này sẽ chuyển về mặc định."
        confirmText="Xóa danh mục"
        isDanger={true}
        isLoading={deleteCategoryMutation.isPending}
        onConfirm={() => {
          if (deleteCatId) {
            deleteCategoryMutation.mutate(deleteCatId);
            setDeleteCatId(null);
          }
        }}
      />
    </div>
  );
}
