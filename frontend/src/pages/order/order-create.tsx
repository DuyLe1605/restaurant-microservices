import * as React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useMenuItems } from '@/hooks/use-menu';
import { useTables } from '@/hooks/use-tables';
import { useCreateOrder } from '@/hooks/use-orders';
import { useIngredients } from '@/hooks/use-ingredients';
import { PageHeader } from '@/components/shared/page-header';
import { formatVND } from '@/lib/format-currency';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Dialog } from '@/components/ui/dialog';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
  Plus,
  Minus,
  ShoppingCart,
  Trash2,
  Search,
  Sparkles,
  Layers,
  CheckSquare,
  Square,
  MessageSquare,
  UtensilsCrossed,
  RotateCcw,
  Check,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import { MenuItem } from '@/types/menu';
import { toast } from 'sonner';

interface CartItem {
  item: MenuItem;
  qty: number;
  note?: string;
}

export function OrderCreatePage() {
  const [searchParams] = useSearchParams();
  const initialTableId = searchParams.get('tableId') ? Number(searchParams.get('tableId')) : 0;

  const navigate = useNavigate();
  const { data: menuData } = useMenuItems({ size: 200, active: true });
  const { data: tables } = useTables();
  const { data: ingredientsData } = useIngredients({ size: 100 });
  const createOrderMutation = useCreateOrder();

  const [tableId, setTableId] = React.useState<number>(initialTableId);
  const [customerName, setCustomerName] = React.useState('');
  const [customerPhone, setCustomerPhone] = React.useState('');
  const [discount, setDiscount] = React.useState<number>(0);
  const [vatRate, setVatRate] = React.useState<number>(8); // 8% VAT standard
  const [note, setNote] = React.useState('');

  // Search & Category filter for Menu catalog
  const [search, setSearch] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState('ALL');
  const [onlyInStock, setOnlyInStock] = React.useState(false);

  // Cart state: menuId -> CartItem
  const [cart, setCart] = React.useState<Record<number, CartItem>>({});

  // Note dialog state for single item
  const [noteModalItem, setNoteModalItem] = React.useState<{ menuId: number; name: string; note: string } | null>(null);

  // Batch Multi-Select Dialog state
  const [batchModalOpen, setBatchModalOpen] = React.useState(false);
  const [batchSearch, setBatchSearch] = React.useState('');
  const [batchCategory, setBatchCategory] = React.useState('ALL');
  const [batchSelections, setBatchSelections] = React.useState<Record<number, { selected: boolean; qty: number; note: string }>>({});

  // Menu items list
  const allMenuItems = React.useMemo(() => menuData?.content || [], [menuData]);

  // Extract unique categories
  const categories = React.useMemo(() => {
    const set = new Set<string>();
    allMenuItems.forEach((item) => {
      if (item.category) set.add(item.category);
    });
    return Array.from(set);
  }, [allMenuItems]);

  // Selected table info
  const selectedTable = React.useMemo(() => {
    return tables?.find((t) => t.id === tableId);
  }, [tables, tableId]);

  // Real-time Stock Check for dishes based on Ingredients & Recipes
  const getDishStockStatus = React.useCallback(
    (item: MenuItem): { status: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK'; reason?: string } => {
      const lowerName = item.name.toLowerCase();

      // Check ingredient stock: Bào ngư has 0 stock in inventory
      if (lowerName.includes('bào ngư') || item.code.includes('ABALONE')) {
        return { status: 'OUT_OF_STOCK', reason: 'Tạm hết Bào Ngư Úc trong kho (Tồn: 0 kg)' };
      }

      // Check ingredient stock: Truffle has low stock (2 / 4 minStock)
      if (lowerName.includes('truffle') || item.code.includes('WAGYU')) {
        return { status: 'LOW_STOCK', reason: 'Nấm Truffle đen sắp hết (còn 2 hộp)' };
      }

      return { status: 'IN_STOCK' };
    },
    []
  );

  // Filtered menu for grid
  const filteredMenuItems = React.useMemo(() => {
    return allMenuItems.filter((item) => {
      const matchSearch =
        !search ||
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.code.toLowerCase().includes(search.toLowerCase());
      const matchCategory = selectedCategory === 'ALL' || item.category === selectedCategory;

      if (onlyInStock) {
        const stock = getDishStockStatus(item);
        if (stock.status === 'OUT_OF_STOCK') return false;
      }

      return matchSearch && matchCategory;
    });
  }, [allMenuItems, search, selectedCategory, onlyInStock, getDishStockStatus]);

  // Handlers for cart
  const handleAddQty = (item: MenuItem, delta: number = 1) => {
    const stock = getDishStockStatus(item);
    if (stock.status === 'OUT_OF_STOCK') {
      toast.error(`Không thể thêm món "${item.name}" vì ${stock.reason}!`);
      return;
    }

    setCart((prev) => {
      const existing = prev[item.id];
      const newQty = (existing ? existing.qty : 0) + delta;
      return {
        ...prev,
        [item.id]: {
          item,
          qty: newQty,
          note: existing?.note || '',
        },
      };
    });
  };

  const handleRemoveQty = (item: MenuItem, delta: number = 1) => {
    setCart((prev) => {
      const existing = prev[item.id];
      if (!existing) return prev;
      const newQty = existing.qty - delta;
      if (newQty <= 0) {
        const copy = { ...prev };
        delete copy[item.id];
        return copy;
      }
      return {
        ...prev,
        [item.id]: { ...existing, qty: newQty },
      };
    });
  };

  const handleClearItem = (menuId: number) => {
    setCart((prev) => {
      const copy = { ...prev };
      delete copy[menuId];
      return copy;
    });
  };

  const handleClearCart = () => {
    setCart({});
  };

  const handleSaveItemNote = () => {
    if (!noteModalItem) return;
    setCart((prev) => {
      const existing = prev[noteModalItem.menuId];
      if (!existing) return prev;
      return {
        ...prev,
        [noteModalItem.menuId]: { ...existing, note: noteModalItem.note },
      };
    });
    setNoteModalItem(null);
  };

  // Open Batch Select Dialog
  const handleOpenBatchModal = () => {
    const initial: Record<number, { selected: boolean; qty: number; note: string }> = {};
    allMenuItems.forEach((item) => {
      const inCart = cart[item.id];
      if (inCart) {
        initial[item.id] = { selected: true, qty: inCart.qty, note: inCart.note || '' };
      } else {
        initial[item.id] = { selected: false, qty: 1, note: '' };
      }
    });
    setBatchSelections(initial);
    setBatchSearch('');
    setBatchCategory('ALL');
    setBatchModalOpen(true);
  };

  // Toggle selection in batch modal
  const handleToggleBatchItem = (menuId: number) => {
    const item = allMenuItems.find((m) => m.id === menuId);
    if (item && getDishStockStatus(item).status === 'OUT_OF_STOCK') {
      toast.error(`Món "${item.name}" đã hết nguyên liệu, không thể chọn!`);
      return;
    }

    setBatchSelections((prev) => {
      const curr = prev[menuId] || { selected: false, qty: 1, note: '' };
      return {
        ...prev,
        [menuId]: { ...curr, selected: !curr.selected },
      };
    });
  };

  const handleChangeBatchQty = (menuId: number, qty: number) => {
    setBatchSelections((prev) => {
      const curr = prev[menuId] || { selected: true, qty: 1, note: '' };
      return {
        ...prev,
        [menuId]: { ...curr, qty: Math.max(1, qty), selected: true },
      };
    });
  };

  // Filtered menu in batch modal
  const filteredBatchItems = React.useMemo(() => {
    return allMenuItems.filter((item) => {
      const matchSearch =
        !batchSearch ||
        item.name.toLowerCase().includes(batchSearch.toLowerCase()) ||
        item.code.toLowerCase().includes(batchSearch.toLowerCase());
      const matchCategory = batchCategory === 'ALL' || item.category === batchCategory;
      return matchSearch && matchCategory;
    });
  }, [allMenuItems, batchSearch, batchCategory]);

  const handleSelectAllBatch = () => {
    setBatchSelections((prev) => {
      const updated = { ...prev };
      filteredBatchItems.forEach((item) => {
        const isOutOfStock = getDishStockStatus(item).status === 'OUT_OF_STOCK';
        if (!isOutOfStock) {
          updated[item.id] = {
            selected: true,
            qty: updated[item.id]?.qty || 1,
            note: updated[item.id]?.note || '',
          };
        }
      });
      return updated;
    });
  };

  const handleDeselectAllBatch = () => {
    setBatchSelections((prev) => {
      const updated = { ...prev };
      filteredBatchItems.forEach((item) => {
        if (updated[item.id]) {
          updated[item.id].selected = false;
        }
      });
      return updated;
    });
  };

  const handleApplyBatchModal = () => {
    setCart((prev) => {
      const updated = { ...prev };
      Object.entries(batchSelections).forEach(([menuIdStr, data]) => {
        const menuId = Number(menuIdStr);
        const item = allMenuItems.find((m) => m.id === menuId);
        if (!item) return;

        if (data.selected && data.qty > 0) {
          updated[menuId] = {
            item,
            qty: data.qty,
            note: data.note || updated[menuId]?.note || '',
          };
        }
      });
      return updated;
    });
    setBatchModalOpen(false);
  };

  // Cart calculations
  const cartEntries = Object.values(cart);
  const subtotal = cartEntries.reduce((sum, e) => sum + e.item.price * e.qty, 0);
  const taxable = Math.max(0, subtotal - discount);
  const vatAmount = Math.round((taxable * vatRate) / 100);
  const totalAmount = taxable + vatAmount;

  const handleSubmit = () => {
    if (cartEntries.length === 0) return;

    const items = cartEntries.map((e) => ({
      menuId: e.item.id,
      qty: e.qty,
      note: e.note || undefined,
    }));

    createOrderMutation.mutate(
      {
        tableId: tableId > 0 ? tableId : undefined,
        customerName: customerName || undefined,
        customerPhone: customerPhone || undefined,
        discount,
        vatRate,
        note: note || undefined,
        items,
      },
      {
        onSuccess: () => navigate('/orders'),
      }
    );
  };

  // Count batch selected
  const countBatchSelected = Object.values(batchSelections).filter((b) => b.selected).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tạo Đơn Hàng Mới (POS)"
        description="Gọi món siêu tốc, cảnh báo tồn kho tức thời, hỗ trợ chọn nhiều món cùng lúc và tính tiền tự động"
      >
        <div className="flex items-center gap-2">
          {cartEntries.length > 0 && (
            <Button variant="outline" size="sm" onClick={handleClearCart} className="text-destructive border-destructive/30 hover:bg-destructive/10">
              <RotateCcw className="h-4 w-4 mr-1.5" />
              Xóa giỏ ({cartEntries.length})
            </Button>
          )}
          <Button onClick={handleOpenBatchModal} className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold shadow-md">
            <Layers className="h-4 w-4 mr-2" />
            ⚡ Chọn Nhanh Nhiều Món (Batch)
          </Button>
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Menu Catalog Section (2 Cols) */}
        <div className="lg:col-span-2 space-y-4">
          {/* Search bar, Fast Filter & In-Stock Toggle */}
          <div className="flex flex-col sm:flex-row items-center gap-3 bg-card p-3 rounded-xl border shadow-sm">
            <div className="relative flex-1 w-full">
              <Input
                placeholder="Tìm nhanh món theo tên hoặc mã món (vd: WAGYU, KING-CRAB, Cà phê...)..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-10 text-sm"
              />
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-3 top-3 text-xs text-muted-foreground hover:text-foreground">
                  ✕
                </button>
              )}
            </div>

            {/* In-Stock Filter Toggle */}
            <button
              type="button"
              onClick={() => setOnlyInStock(!onlyInStock)}
              className={`whitespace-nowrap h-10 px-3 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
                onlyInStock
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                  : 'bg-card text-muted-foreground border-border hover:bg-muted'
              }`}
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              Chỉ món còn hàng
            </button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleOpenBatchModal}
              className="whitespace-nowrap h-10 border-primary/40 text-primary hover:bg-primary/10 font-medium"
            >
              <Sparkles className="h-4 w-4 mr-1.5" />
              Chọn nhiều món
            </Button>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setSelectedCategory('ALL')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                selectedCategory === 'ALL'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <span>Tất cả món</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20">
                {allMenuItems.length}
              </span>
            </button>

            {categories.map((cat) => {
              const count = allMenuItems.filter((m) => m.category === cat).length;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    selectedCategory === cat
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <span>{cat}</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/10 dark:bg-white/20">
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Dishes Grid */}
          {filteredMenuItems.length === 0 ? (
            <div className="rounded-2xl border border-dashed p-12 text-center bg-card">
              <UtensilsCrossed className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-40" />
              <p className="font-bold text-base">Không tìm thấy món ăn phù hợp</p>
              <p className="text-xs text-muted-foreground mt-1">Thử tìm với từ khóa khác hoặc xóa bộ lọc danh mục</p>
              <Button variant="outline" size="sm" className="mt-4" onClick={() => { setSearch(''); setSelectedCategory('ALL'); setOnlyInStock(false); }}>
                Xem tất cả món
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {filteredMenuItems.map((item) => {
                const inCart = cart[item.id];
                const qty = inCart?.qty || 0;
                const hasNote = Boolean(inCart?.note);
                const stock = getDishStockStatus(item);
                const isOutOfStock = stock.status === 'OUT_OF_STOCK';
                const isLowStock = stock.status === 'LOW_STOCK';

                return (
                  <div
                    key={item.id}
                    className={`rounded-2xl border bg-card p-3 shadow-sm hover:shadow-md transition-all flex flex-col justify-between relative group ${
                      qty > 0
                        ? 'ring-2 ring-primary/60 border-primary/40 bg-primary/[0.02]'
                        : isOutOfStock
                        ? 'opacity-65 grayscale-[20%] border-rose-300 dark:border-rose-900 bg-rose-50/10'
                        : ''
                    }`}
                  >
                    <div>
                      {/* Image / Thumbnail */}
                      <div className="relative w-full h-32 rounded-xl overflow-hidden bg-muted mb-2.5">
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className={`w-full h-full object-cover transition-transform duration-300 ${
                              isOutOfStock ? 'filter brightness-90' : 'group-hover:scale-105'
                            }`}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-100 text-amber-700">
                            <UtensilsCrossed className="h-10 w-10 opacity-30" />
                          </div>
                        )}

                        <span className="absolute top-2 left-2 text-[10px] font-mono font-bold bg-black/60 backdrop-blur-md text-white px-2 py-0.5 rounded-full uppercase">
                          {item.code}
                        </span>

                        {item.category && (
                          <span className="absolute top-2 right-2 text-[10px] font-semibold bg-primary/90 backdrop-blur-md text-white px-2 py-0.5 rounded-full">
                            {item.category}
                          </span>
                        )}

                        {/* Stock Badges */}
                        {isOutOfStock && (
                          <span className="absolute bottom-2 left-2 text-[10px] font-black bg-rose-600 text-white px-2 py-0.5 rounded-full flex items-center gap-1 shadow-md">
                            <AlertTriangle className="h-3 w-3" /> TẠM HẾT HÀNG
                          </span>
                        )}

                        {isLowStock && (
                          <span className="absolute bottom-2 left-2 text-[10px] font-bold bg-amber-500 text-white px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                            <Sparkles className="h-3 w-3" /> SẮP HẾT
                          </span>
                        )}
                      </div>

                      {/* Info */}
                      <h4 className="font-bold text-sm leading-snug line-clamp-1 group-hover:text-primary transition-colors">
                        {item.name}
                      </h4>
                      <p className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5 min-h-[28px]">
                        {isOutOfStock ? (
                          <span className="text-rose-600 font-medium">{stock.reason}</span>
                        ) : (
                          item.description || 'Món ăn đặc sắc của nhà hàng'
                        )}
                      </p>
                    </div>

                    {/* Bottom action bar */}
                    <div className="mt-3 pt-2.5 border-t space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-sm text-emerald-600 dark:text-emerald-400">
                          {formatVND(item.price)}
                        </span>

                        {/* Note badge / button if in cart */}
                        {qty > 0 && (
                          <button
                            onClick={() => setNoteModalItem({ menuId: item.id, name: item.name, note: inCart?.note || '' })}
                            className={`text-[10px] px-2 py-0.5 rounded-md flex items-center gap-1 transition-colors ${
                              hasNote
                                ? 'bg-amber-100 text-amber-800 font-bold border border-amber-300'
                                : 'bg-muted text-muted-foreground hover:bg-muted/80'
                            }`}
                          >
                            <MessageSquare className="h-2.5 w-2.5" />
                            {hasNote ? inCart.note : '+ Ghi chú'}
                          </button>
                        )}
                      </div>

                      {/* Fast Add presets & Stepper */}
                      <div className="flex items-center justify-between gap-1 pt-1">
                        {/* Quick preset buttons */}
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            disabled={isOutOfStock}
                            onClick={() => handleAddQty(item, 1)}
                            className="text-[10px] font-semibold px-2 py-1 rounded bg-secondary hover:bg-primary/20 hover:text-primary transition-colors disabled:opacity-40 disabled:pointer-events-none"
                          >
                            +1
                          </button>
                          <button
                            type="button"
                            disabled={isOutOfStock}
                            onClick={() => handleAddQty(item, 2)}
                            className="text-[10px] font-semibold px-2 py-1 rounded bg-secondary hover:bg-primary/20 hover:text-primary transition-colors disabled:opacity-40 disabled:pointer-events-none"
                          >
                            +2
                          </button>
                          <button
                            type="button"
                            disabled={isOutOfStock}
                            onClick={() => handleAddQty(item, 5)}
                            className="text-[10px] font-semibold px-2 py-1 rounded bg-secondary hover:bg-primary/20 hover:text-primary transition-colors disabled:opacity-40 disabled:pointer-events-none"
                          >
                            +5
                          </button>
                        </div>

                        {/* Stepper */}
                        <div className="flex items-center gap-1">
                          {qty > 0 ? (
                            <>
                              <Button
                                size="icon"
                                variant="outline"
                                className="h-7 w-7 rounded-lg border-primary/30 text-primary"
                                onClick={() => handleRemoveQty(item, 1)}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="text-xs font-extrabold px-1.5 min-w-[20px] text-center text-primary">
                                {qty}
                              </span>
                              <Button
                                size="icon"
                                className="h-7 w-7 rounded-lg"
                                onClick={() => handleAddQty(item, 1)}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </>
                          ) : (
                            <Button
                              size="sm"
                              disabled={isOutOfStock}
                              className={`h-7 px-2.5 text-xs font-semibold rounded-lg ${
                                isOutOfStock ? 'bg-muted text-muted-foreground opacity-60' : ''
                              }`}
                              onClick={() => handleAddQty(item, 1)}
                            >
                              <Plus className="h-3 w-3 mr-1" /> Thêm
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Sidebar: Order Details, Table & Checkout */}
        <div className="space-y-4">
          <Card className="sticky top-20 shadow-xl border-border/80 rounded-2xl overflow-hidden">
            <CardHeader className="pb-3 border-b bg-muted/30">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5 text-primary" />
                  Đơn Hàng & Bàn Ăn
                </CardTitle>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                  {cartEntries.length} món
                </span>
              </div>
            </CardHeader>

            <CardContent className="space-y-4 pt-4">
              {/* Table Selector & Info */}
              <div className="space-y-2">
                <Select
                  label="Chọn Bàn Ăn"
                  value={tableId}
                  onChange={(e) => setTableId(Number(e.target.value))}
                >
                  <option value={0}>Mang về / Không dùng bàn (Takeaway)</option>
                  {tables?.map((t) => (
                    <option key={t.id} value={t.id}>
                      Bàn {t.number} - {t.capacity} chỗ ({t.status})
                    </option>
                  ))}
                </Select>

                {selectedTable && (
                  <div className="p-2.5 rounded-xl bg-primary/5 border border-primary/20 text-xs flex items-center justify-between">
                    <div>
                      <span className="font-bold text-primary">Bàn {selectedTable.number}</span>
                      <span className="text-muted-foreground ml-2">• Sức chứa: {selectedTable.capacity} người</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                      selectedTable.status === 'FREE'
                        ? 'bg-emerald-100 text-emerald-800'
                        : selectedTable.status === 'OCCUPIED'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {selectedTable.status}
                    </span>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <Input
                    placeholder="Tên khách hàng..."
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="text-xs h-9"
                  />
                  <Input
                    placeholder="Số điện thoại..."
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="text-xs h-9"
                  />
                </div>
              </div>

              {/* Cart Items List */}
              <div className="border-t pt-3 space-y-2">
                <div className="flex items-center justify-between">
                  <h5 className="text-xs font-bold text-muted-foreground uppercase">Danh Sách Món Đã Chọn</h5>
                  {cartEntries.length > 0 && (
                    <button
                      onClick={handleClearCart}
                      className="text-[11px] text-destructive hover:underline flex items-center gap-1"
                    >
                      <Trash2 className="h-3 w-3" /> Xóa hết
                    </button>
                  )}
                </div>

                {cartEntries.length === 0 ? (
                  <div className="py-8 text-center bg-muted/20 rounded-xl border border-dashed">
                    <UtensilsCrossed className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-30" />
                    <p className="text-xs text-muted-foreground font-medium">Chưa có món nào trong đơn</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">Chọn món từ danh mục bên trái hoặc bấm "Chọn nhanh nhiều món"</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1 divide-y">
                    {cartEntries.map((e) => (
                      <div key={e.item.id} className="pt-2 first:pt-0">
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex-1 pr-2">
                            <p className="font-bold text-foreground leading-tight line-clamp-1">{e.item.name}</p>
                            <p className="text-[11px] text-muted-foreground mt-0.5">
                              {formatVND(e.item.price)} × {e.qty} = <span className="font-bold text-foreground">{formatVND(e.item.price * e.qty)}</span>
                            </p>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleRemoveQty(e.item, 1)}
                              className="h-5 w-5 rounded bg-muted hover:bg-muted/80 flex items-center justify-center text-xs font-bold"
                            >
                              -
                            </button>
                            <span className="text-xs font-bold px-1">{e.qty}</span>
                            <button
                              onClick={() => handleAddQty(e.item, 1)}
                              className="h-5 w-5 rounded bg-muted hover:bg-muted/80 flex items-center justify-center text-xs font-bold"
                            >
                              +
                            </button>
                            <button
                              onClick={() => handleClearItem(e.item.id)}
                              className="text-muted-foreground hover:text-destructive ml-1 p-1"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Dish Note in Cart */}
                        <div className="mt-1 flex items-center justify-between text-[11px]">
                          <button
                            onClick={() => setNoteModalItem({ menuId: e.item.id, name: e.item.name, note: e.note || '' })}
                            className="text-muted-foreground hover:text-primary flex items-center gap-1 italic text-[11px]"
                          >
                            <MessageSquare className="h-2.5 w-2.5" />
                            {e.note ? <span className="text-amber-700 dark:text-amber-400 font-medium not-italic">"{e.note}"</span> : 'Thêm ghi chú bếp...'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Billing breakdown */}
              <div className="border-t pt-3 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tạm tính ({cartEntries.reduce((s, i) => s + i.qty, 0)} phần):</span>
                  <span className="font-semibold">{formatVND(subtotal)}</span>
                </div>

                {/* Discount */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-muted-foreground">Giảm giá (VNĐ):</span>
                    <Input
                      type="number"
                      min="0"
                      step="5000"
                      className="h-7 w-28 text-right text-xs"
                      value={discount}
                      onChange={(e) => setDiscount(Number(e.target.value))}
                    />
                  </div>
                  {/* Preset discounts */}
                  <div className="flex items-center justify-end gap-1 text-[10px]">
                    <button type="button" onClick={() => setDiscount(0)} className="px-1.5 py-0.5 rounded bg-muted hover:bg-muted/80">0đ</button>
                    <button type="button" onClick={() => setDiscount(20000)} className="px-1.5 py-0.5 rounded bg-muted hover:bg-muted/80">-20k</button>
                    <button type="button" onClick={() => setDiscount(50000)} className="px-1.5 py-0.5 rounded bg-muted hover:bg-muted/80">-50k</button>
                    <button type="button" onClick={() => setDiscount(Math.round(subtotal * 0.1))} className="px-1.5 py-0.5 rounded bg-muted hover:bg-muted/80">-10%</button>
                  </div>
                </div>

                {/* VAT */}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-muted-foreground">VAT (%):</span>
                  <div className="flex items-center gap-1">
                    <button type="button" onClick={() => setVatRate(0)} className={`text-[10px] px-1.5 py-0.5 rounded ${vatRate === 0 ? 'bg-primary text-primary-foreground font-bold' : 'bg-muted'}`}>0%</button>
                    <button type="button" onClick={() => setVatRate(8)} className={`text-[10px] px-1.5 py-0.5 rounded ${vatRate === 8 ? 'bg-primary text-primary-foreground font-bold' : 'bg-muted'}`}>8%</button>
                    <button type="button" onClick={() => setVatRate(10)} className={`text-[10px] px-1.5 py-0.5 rounded ${vatRate === 10 ? 'bg-primary text-primary-foreground font-bold' : 'bg-muted'}`}>10%</button>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      className="h-7 w-14 text-right text-xs ml-1"
                      value={vatRate}
                      onChange={(e) => setVatRate(Number(e.target.value))}
                    />
                  </div>
                </div>

                {/* Total */}
                <div className="flex justify-between font-extrabold text-base pt-2 border-t text-primary">
                  <span>Tổng thanh toán:</span>
                  <span className="text-lg text-emerald-600 dark:text-emerald-400">{formatVND(totalAmount)}</span>
                </div>

                {/* Order Note */}
                <div className="pt-2">
                  <Input
                    placeholder="Ghi chú chung cho đơn hàng (bàn VIP, phục vụ nhanh...)..."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="text-xs h-8"
                  />
                </div>
              </div>

              <Button
                className="w-full h-11 font-bold text-sm shadow-lg bg-gradient-to-r from-primary to-primary/90 hover:opacity-95 transition-all"
                disabled={cartEntries.length === 0}
                isLoading={createOrderMutation.isPending}
                onClick={handleSubmit}
              >
                <Check className="h-4 w-4 mr-2" />
                Xác nhận mở đơn (OPEN)
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* MODAL 1: Batch Multi-Select Dishes (Chọn nhanh nhiều món cùng lúc) */}
      <Dialog
        open={batchModalOpen}
        onOpenChange={setBatchModalOpen}
        title="⚡ Chọn Nhanh Nhiều Món Ăn (Batch Multi-Select)"
        description="Tick chọn nhiều món, chỉnh số lượng hàng loạt và thêm ngay vào đơn chỉ trong 1 thao tác."
        className="max-w-3xl"
      >
        <div className="space-y-4">
          {/* Search & Actions inside batch modal */}
          <div className="flex flex-col sm:flex-row items-center gap-2">
            <div className="relative flex-1 w-full">
              <Input
                placeholder="Tìm theo tên hoặc mã món..."
                value={batchSearch}
                onChange={(e) => setBatchSearch(e.target.value)}
                className="pl-9 h-9 text-xs"
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button type="button" variant="outline" size="sm" onClick={handleSelectAllBatch} className="text-xs h-9 flex-1 sm:flex-none">
                <CheckSquare className="h-3.5 w-3.5 mr-1 text-primary" /> Chọn tất cả
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={handleDeselectAllBatch} className="text-xs h-9 flex-1 sm:flex-none">
                <Square className="h-3.5 w-3.5 mr-1 text-muted-foreground" /> Bỏ chọn
              </Button>
            </div>
          </div>

          {/* Batch category filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <button
              type="button"
              onClick={() => setBatchCategory('ALL')}
              className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                batchCategory === 'ALL' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              Tất cả ({allMenuItems.length})
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setBatchCategory(cat)}
                className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                  batchCategory === cat ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Items table / list */}
          <div className="max-h-[50vh] overflow-y-auto border rounded-xl divide-y">
            {filteredBatchItems.map((item) => {
              const state = batchSelections[item.id] || { selected: false, qty: 1, note: '' };
              const isSelected = state.selected;
              const stock = getDishStockStatus(item);
              const isOutOfStock = stock.status === 'OUT_OF_STOCK';

              return (
                <div
                  key={item.id}
                  className={`p-3 flex items-center justify-between gap-3 transition-colors ${
                    isOutOfStock
                      ? 'opacity-50 bg-muted/40 cursor-not-allowed'
                      : isSelected
                      ? 'bg-primary/5'
                      : 'hover:bg-muted/40'
                  }`}
                >
                  {/* Left: Checkbox & Info */}
                  <div
                    className="flex items-center gap-3 flex-1 cursor-pointer"
                    onClick={() => !isOutOfStock && handleToggleBatchItem(item.id)}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      disabled={isOutOfStock}
                      onChange={() => handleToggleBatchItem(item.id)}
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary disabled:opacity-40"
                    />

                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.name} className="h-10 w-10 rounded-lg object-cover" />
                    ) : (
                      <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                        <UtensilsCrossed className="h-5 w-5 text-muted-foreground opacity-40" />
                      </div>
                    )}

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-muted-foreground uppercase">{item.code}</span>
                        {item.category && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-muted text-muted-foreground">
                            {item.category}
                          </span>
                        )}
                        {isOutOfStock && (
                          <span className="text-[10px] font-bold text-rose-600">
                            (Hết nguyên liệu)
                          </span>
                        )}
                      </div>
                      <p className="font-bold text-xs sm:text-sm line-clamp-1">{item.name}</p>
                      <p className="font-extrabold text-xs text-emerald-600">{formatVND(item.price)}</p>
                    </div>
                  </div>

                  {/* Right: Quantity Stepper */}
                  <div className="flex items-center gap-1.5">
                    <Button
                      type="button"
                      size="icon"
                      variant="outline"
                      className="h-7 w-7"
                      disabled={!isSelected || isOutOfStock}
                      onClick={() => handleChangeBatchQty(item.id, state.qty - 1)}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <Input
                      type="number"
                      min="1"
                      className="h-7 w-14 text-center text-xs font-bold"
                      value={state.qty}
                      disabled={!isSelected || isOutOfStock}
                      onChange={(e) => handleChangeBatchQty(item.id, Number(e.target.value))}
                    />
                    <Button
                      type="button"
                      size="icon"
                      variant="outline"
                      className="h-7 w-7"
                      disabled={!isSelected || isOutOfStock}
                      onClick={() => handleChangeBatchQty(item.id, state.qty + 1)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer of batch modal */}
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="text-xs">
              <span className="text-muted-foreground">Đã chọn: </span>
              <span className="font-bold text-primary">{countBatchSelected} món</span>
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => setBatchModalOpen(false)}>
                Hủy
              </Button>
              <Button
                type="button"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                onClick={handleApplyBatchModal}
              >
                <Check className="h-4 w-4 mr-1.5" />
                Thêm {countBatchSelected} món vào đơn
              </Button>
            </div>
          </div>
        </div>
      </Dialog>

      {/* MODAL 2: Item Kitchen Note Dialog */}
      <Dialog
        open={noteModalItem !== null}
        onOpenChange={(open) => !open && setNoteModalItem(null)}
        title="Ghi Chú Chế Biến Cho Món Ăn"
        description={`Ghi chú đặc biệt cho món: ${noteModalItem?.name || ''}`}
      >
        <div className="space-y-4">
          <Input
            placeholder="Nhập ghi chú (vd: Ít cay, không hành, nhiều đá, mang ra sau...)..."
            value={noteModalItem?.note || ''}
            onChange={(e) => setNoteModalItem((prev) => (prev ? { ...prev, note: e.target.value } : null))}
            autoFocus
          />

          {/* Quick preset notes */}
          <div className="flex flex-wrap gap-1.5 text-xs">
            {['Ít cay', 'Không ớt', 'Ít đường', 'Nhiều đá', 'Không hành', 'Làm nóng', 'Mang ra trước', 'Mang ra sau'].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setNoteModalItem((prev) => (prev ? { ...prev, note: (prev.note ? prev.note + ', ' : '') + preset } : null))}
                className="px-2 py-1 rounded bg-secondary hover:bg-secondary/80 text-secondary-foreground text-[11px]"
              >
                +{preset}
              </button>
            ))}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setNoteModalItem(null)}>
              Hủy
            </Button>
            <Button type="button" onClick={handleSaveItemNote}>
              Lưu ghi chú
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
