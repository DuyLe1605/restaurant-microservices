import * as React from 'react';
import { useSearchParams } from 'react-router-dom';
import { useMenuItems, useRecipes, useSaveRecipe } from '@/hooks/use-menu';
import { useIngredients } from '@/hooks/use-ingredients';
import { PageHeader } from '@/components/shared/page-header';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { formatVND } from '@/lib/format-currency';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Dialog } from '@/components/ui/dialog';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import {
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Search,
  Sparkles,
  Layers,
  DollarSign,
  TrendingUp,
  Percent,
  ChefHat,
  Utensils,
  BookOpen,
} from 'lucide-react';
import { RecipeItem, MenuItem } from '@/types/menu';
import { Ingredient } from '@/types/ingredient';
import { toast } from 'sonner';

export function RecipeManagePage() {
  const [searchParams] = useSearchParams();
  const urlMenuId = searchParams.get('menuId') ? Number(searchParams.get('menuId')) : null;

  const { data: menuData, isLoading: isMenuLoading } = useMenuItems({ size: 100 });
  const { data: ingredientsData, isLoading: isIngLoading } = useIngredients({ size: 100 });

  const allMenuItems: MenuItem[] = menuData?.content || [];
  const allIngredients: Ingredient[] = ingredientsData?.content || [];

  const [selectedMenuId, setSelectedMenuId] = React.useState<number | null>(urlMenuId);
  const [menuSearch, setMenuSearch] = React.useState('');

  const { data: currentRecipes, isLoading: isRecipesLoading } = useRecipes(selectedMenuId || 0);
  const saveRecipeMutation = useSaveRecipe();

  const [items, setItems] = React.useState<RecipeItem[]>([]);

  // Modal State: Tạo mới công thức
  const [createModalOpen, setCreateModalOpen] = React.useState(false);
  const [modalMenuId, setModalMenuId] = React.useState<number>(0);
  const [modalItems, setModalItems] = React.useState<RecipeItem[]>([]);

  // Update recipe items when currentRecipes loaded
  React.useEffect(() => {
    if (currentRecipes && Array.isArray(currentRecipes)) {
      setItems(currentRecipes);
    } else {
      setItems([]);
    }
  }, [currentRecipes]);

  // Select first menu item or URL param
  React.useEffect(() => {
    if (urlMenuId) {
      setSelectedMenuId(urlMenuId);
    } else if (allMenuItems.length > 0 && selectedMenuId === null) {
      setSelectedMenuId(allMenuItems[0].id);
    }
  }, [allMenuItems, urlMenuId, selectedMenuId]);

  const selectedMenuItem = allMenuItems.find((m) => m.id === selectedMenuId);

  // Filter menu items on left sidebar
  const filteredMenuItems = React.useMemo(() => {
    return allMenuItems.filter((item) => {
      return (
        !menuSearch ||
        item.name.toLowerCase().includes(menuSearch.toLowerCase()) ||
        item.code.toLowerCase().includes(menuSearch.toLowerCase())
      );
    });
  }, [allMenuItems, menuSearch]);

  // Handlers for current recipe edit
  const handleAddItem = () => {
    if (allIngredients.length === 0) {
      toast.error('Chưa có nguyên liệu nào trong kho để thêm!');
      return;
    }
    const firstIng = allIngredients[0];
    setItems([
      ...items,
      {
        ingredientId: firstIng.id,
        ingredientName: firstIng.name,
        unit: firstIng.unit,
        qty: 1,
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleUpdateItemIngredient = (index: number, ingId: number) => {
    const ing = allIngredients.find((i) => i.id === ingId);
    if (!ing) return;

    setItems((prev) => {
      const copy = [...prev];
      copy[index] = {
        ...copy[index],
        ingredientId: ing.id,
        ingredientName: ing.name,
        unit: ing.unit,
      };
      return copy;
    });
  };

  const handleUpdateItemQty = (index: number, qty: number) => {
    setItems((prev) => {
      const copy = [...prev];
      copy[index] = {
        ...copy[index],
        qty: Math.max(0.001, qty),
      };
      return copy;
    });
  };

  const handleSaveCurrentRecipe = () => {
    if (!selectedMenuId) return;
    saveRecipeMutation.mutate({ menuId: selectedMenuId, items });
  };

  // Calculations for current dish Food Cost
  const currentTotalCost = React.useMemo(() => {
    return items.reduce((sum, item) => {
      const ing = allIngredients.find((i) => i.id === item.ingredientId);
      const price = ing?.purchasePrice || 0;
      return sum + price * item.qty;
    }, 0);
  }, [items, allIngredients]);

  const dishPrice = selectedMenuItem?.price || 0;
  const grossProfit = Math.max(0, dishPrice - currentTotalCost);
  const foodCostRatio = dishPrice > 0 ? ((currentTotalCost / dishPrice) * 100).toFixed(1) : '0';

  // --- Handlers for Create New Recipe Modal ---
  const handleOpenCreateModal = () => {
    // Pick first dish that might not have recipe or first dish
    const initialMenuId = selectedMenuId || (allMenuItems[0]?.id || 0);
    setModalMenuId(initialMenuId);

    if (allIngredients.length > 0) {
      const firstIng = allIngredients[0];
      setModalItems([
        {
          ingredientId: firstIng.id,
          ingredientName: firstIng.name,
          unit: firstIng.unit,
          qty: 1,
        },
      ]);
    } else {
      setModalItems([]);
    }
    setCreateModalOpen(true);
  };

  const handleAddModalItem = () => {
    if (allIngredients.length === 0) return;
    const firstIng = allIngredients[0];
    setModalItems([
      ...modalItems,
      {
        ingredientId: firstIng.id,
        ingredientName: firstIng.name,
        unit: firstIng.unit,
        qty: 1,
      },
    ]);
  };

  const handleRemoveModalItem = (index: number) => {
    setModalItems(modalItems.filter((_, i) => i !== index));
  };

  const handleUpdateModalItem = (index: number, ingId: number) => {
    const ing = allIngredients.find((i) => i.id === ingId);
    if (!ing) return;
    setModalItems((prev) => {
      const copy = [...prev];
      copy[index] = {
        ...copy[index],
        ingredientId: ing.id,
        ingredientName: ing.name,
        unit: ing.unit,
      };
      return copy;
    });
  };

  const handleUpdateModalQty = (index: number, qty: number) => {
    setModalItems((prev) => {
      const copy = [...prev];
      copy[index] = {
        ...copy[index],
        qty: Math.max(0.001, qty),
      };
      return copy;
    });
  };

  const modalMenuItem = allMenuItems.find((m) => m.id === modalMenuId);
  const modalTotalCost = modalItems.reduce((sum, item) => {
    const ing = allIngredients.find((i) => i.id === item.ingredientId);
    return sum + (ing?.purchasePrice || 0) * item.qty;
  }, 0);
  const modalRatio = modalMenuItem && modalMenuItem.price > 0
    ? ((modalTotalCost / modalMenuItem.price) * 100).toFixed(1)
    : '0';

  const handleSaveModalRecipe = () => {
    if (!modalMenuId || modalItems.length === 0) {
      toast.error('Vui lòng chọn món ăn và thêm ít nhất 1 nguyên liệu định lượng!');
      return;
    }

    saveRecipeMutation.mutate(
      { menuId: modalMenuId, items: modalItems },
      {
        onSuccess: () => {
          setSelectedMenuId(modalMenuId);
          setItems(modalItems);
          setCreateModalOpen(false);
          toast.success(`Đã thiết lập công thức mới cho món "${modalMenuItem?.name}" thành công!`);
        },
      }
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quản Lý Công Thức Món (BOM & Food Cost)"
        description="Định lượng nguyên liệu chi tiết cho từng món ăn, tự động tính tỷ lệ giá vốn (Food Cost %) và trừ kho khi bán"
      >
        <div className="flex items-center gap-2">
          <Button
            onClick={handleOpenCreateModal}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-1.5 shadow-sm"
          >
            <Plus className="h-4 w-4" /> Tạo Mới Công Thức
          </Button>

          <Button
            onClick={handleSaveCurrentRecipe}
            isLoading={saveRecipeMutation.isPending}
            disabled={!selectedMenuId}
            className="gap-1.5 font-bold"
          >
            <CheckCircle2 className="h-4 w-4" /> Lưu Công Thức Hiện Tại
          </Button>
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Menu Items Selector */}
        <Card className="h-fit rounded-2xl shadow-sm border">
          <CardHeader className="pb-3 border-b bg-muted/20">
            <CardTitle className="text-base font-bold flex items-center justify-between">
              <span className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-primary" />
                Danh Sách Món Ăn
              </span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                {allMenuItems.length} món
              </span>
            </CardTitle>
            <div className="relative mt-2">
              <Input
                placeholder="Tìm món theo tên hoặc mã..."
                value={menuSearch}
                onChange={(e) => setMenuSearch(e.target.value)}
                className="pl-8 text-xs h-8"
              />
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            </div>
          </CardHeader>

          <CardContent className="p-2">
            {isMenuLoading ? (
              <LoadingSpinner text="Đang tải danh sách món ăn..." />
            ) : (
              <div className="space-y-1 max-h-[550px] overflow-y-auto pr-1">
                {filteredMenuItems.map((item) => {
                  const isSelected = selectedMenuId === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setSelectedMenuId(item.id)}
                      className={`w-full text-left p-2.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-between gap-2 ${
                        isSelected
                          ? 'bg-primary text-primary-foreground shadow-md'
                          : 'hover:bg-muted/70 text-foreground'
                      }`}
                    >
                      <div className="truncate flex-1">
                        <span className={`text-[10px] font-mono block ${isSelected ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                          {item.code}
                        </span>
                        <p className="font-bold truncate text-sm">{item.name}</p>
                        <span className={`text-[11px] font-extrabold ${isSelected ? 'text-primary-foreground' : 'text-emerald-600'}`}>
                          {formatVND(item.price)}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right Column: Recipe Formulation & Food Cost Analysis */}
        <div className="md:col-span-2 space-y-4">
          {selectedMenuItem ? (
            <>
              {/* Financial & Food Cost Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl border bg-card shadow-sm">
                  <span className="text-[11px] text-muted-foreground uppercase font-semibold">Giá bán món</span>
                  <p className="text-base font-black text-foreground mt-1">{formatVND(dishPrice)}</p>
                  <span className="text-[10px] text-muted-foreground">Doanh thu / suất</span>
                </div>

                <div className="p-3 rounded-xl border bg-card shadow-sm">
                  <span className="text-[11px] text-muted-foreground uppercase font-semibold">Giá vốn nguyên liệu</span>
                  <p className="text-base font-black text-amber-600 mt-1">{formatVND(currentTotalCost)}</p>
                  <span className="text-[10px] text-muted-foreground">Theo định lượng kho</span>
                </div>

                <div className="p-3 rounded-xl border bg-card shadow-sm">
                  <span className="text-[11px] text-muted-foreground uppercase font-semibold">Lợi nhuận gộp</span>
                  <p className="text-base font-black text-emerald-600 mt-1">+{formatVND(grossProfit)}</p>
                  <span className="text-[10px] text-muted-foreground">Biên lãi thuần</span>
                </div>

                <div className="p-3 rounded-xl border bg-card shadow-sm">
                  <span className="text-[11px] text-muted-foreground uppercase font-semibold">Tỷ lệ Food Cost</span>
                  <div className="flex items-center gap-1.5 mt-1">
                    <p className={`text-base font-black ${Number(foodCostRatio) > 38 ? 'text-rose-600' : 'text-primary'}`}>
                      {foodCostRatio}%
                    </p>
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-muted">
                      {Number(foodCostRatio) <= 32 ? 'Tối ưu' : Number(foodCostRatio) <= 40 ? 'Hợp lý' : 'Cao'}
                    </span>
                  </div>
                  <span className="text-[10px] text-muted-foreground">Chuẩn: 25% - 35%</span>
                </div>
              </div>

              {/* Recipe Formulation Card */}
              <Card className="rounded-2xl shadow-sm border overflow-hidden">
                <CardHeader className="pb-3 border-b bg-muted/20 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-base font-bold flex items-center gap-2">
                      <ChefHat className="h-5 w-5 text-primary" />
                      Công Thức Định Lượng: {selectedMenuItem.name}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Định mức nguyên liệu cấu thành 1 suất ăn để hệ thống tự động trừ kho khi phục vụ
                    </p>
                  </div>
                  <Button size="sm" onClick={handleAddItem} className="gap-1 text-xs font-bold">
                    <Plus className="h-3.5 w-3.5" /> Thêm nguyên liệu
                  </Button>
                </CardHeader>

                <CardContent className="p-0">
                  {isRecipesLoading ? (
                    <div className="p-8"><LoadingSpinner text="Đang tải công thức..." /></div>
                  ) : items.length === 0 ? (
                    <div className="p-12 text-center space-y-3">
                      <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
                        <Utensils className="h-6 w-6" />
                      </div>
                      <h4 className="font-bold text-sm">Món ăn này chưa được thiết lập công thức</h4>
                      <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                        Hãy thêm các nguyên liệu định mức cho món này để hệ thống tính giá vốn và tự động trừ kho nguyên liệu.
                      </p>
                      <Button size="sm" onClick={handleAddItem} className="font-bold text-xs gap-1">
                        <Plus className="h-3.5 w-3.5" /> Thêm nguyên liệu đầu tiên
                      </Button>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/40 text-xs">
                            <TableHead className="w-64">Nguyên liệu từ kho</TableHead>
                            <TableHead className="w-24">Đơn vị</TableHead>
                            <TableHead className="w-32">Định lượng / Suất</TableHead>
                            <TableHead className="text-right">Giá nhập</TableHead>
                            <TableHead className="text-right">Thành tiền vốn</TableHead>
                            <TableHead className="w-12 text-right"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {items.map((item, idx) => {
                            const ing = allIngredients.find((i) => i.id === item.ingredientId);
                            const unitPrice = ing?.purchasePrice || 0;
                            const lineTotal = unitPrice * item.qty;

                            return (
                              <TableRow key={idx} className="text-xs">
                                <TableCell>
                                  <Select
                                    value={item.ingredientId}
                                    onChange={(e) => handleUpdateItemIngredient(idx, Number(e.target.value))}
                                    className="h-8 text-xs font-semibold"
                                  >
                                    {allIngredients.map((i) => (
                                      <option key={i.id} value={i.id}>
                                        {i.name} ({i.unit})
                                      </option>
                                    ))}
                                  </Select>
                                </TableCell>

                                <TableCell className="font-mono font-semibold text-muted-foreground">
                                  {item.unit}
                                </TableCell>

                                <TableCell>
                                  <Input
                                    type="number"
                                    min="0.001"
                                    step="0.01"
                                    value={item.qty}
                                    onChange={(e) => handleUpdateItemQty(idx, Number(e.target.value))}
                                    className="h-8 text-xs font-bold w-24"
                                  />
                                </TableCell>

                                <TableCell className="text-right font-medium text-muted-foreground">
                                  {formatVND(unitPrice)}
                                </TableCell>

                                <TableCell className="text-right font-bold text-amber-600">
                                  {formatVND(lineTotal)}
                                </TableCell>

                                <TableCell className="text-right">
                                  <button
                                    onClick={() => handleRemoveItem(idx)}
                                    className="text-muted-foreground hover:text-destructive p-1 rounded transition-colors"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          ) : (
            <Card className="p-12 text-center rounded-2xl">
              <p className="text-muted-foreground text-sm">Vui lòng chọn món ăn từ danh sách bên trái hoặc bấm "Tạo Mới Công Thức".</p>
            </Card>
          )}
        </div>
      </div>

      {/* MODAL: Tạo Mới Công Thức (Dedicated Create Recipe Modal) */}
      <Dialog
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        title="➕ Thiết Lập Công Thức Món Ăn Mới"
        description="Chọn món ăn từ thực đơn, thêm danh sách định mức nguyên liệu và tự động tính Food Cost %"
        className="max-w-2xl"
      >
        <div className="space-y-4">
          {/* Select Dish */}
          <div>
            <label className="text-xs font-bold text-muted-foreground block mb-1">
              Chọn món ăn cần tạo công thức: <span className="text-destructive">*</span>
            </label>
            <Select
              value={modalMenuId}
              onChange={(e) => setModalMenuId(Number(e.target.value))}
              className="font-bold text-sm"
            >
              {allMenuItems.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.code}) — Giá bán: {formatVND(m.price)}
                </option>
              ))}
            </Select>
          </div>

          {/* Ingredients list for modal */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-muted-foreground uppercase">
                Định mức nguyên liệu ({modalItems.length} nguyên liệu)
              </span>
              <Button type="button" size="sm" variant="outline" onClick={handleAddModalItem} className="text-xs h-7 gap-1">
                <Plus className="h-3 w-3" /> Thêm dòng
              </Button>
            </div>

            <div className="max-h-56 overflow-y-auto border rounded-xl divide-y">
              {modalItems.map((item, idx) => {
                const ing = allIngredients.find((i) => i.id === item.ingredientId);
                const lineCost = (ing?.purchasePrice || 0) * item.qty;

                return (
                  <div key={idx} className="p-2.5 flex items-center justify-between gap-2 text-xs">
                    <div className="flex-1">
                      <Select
                        value={item.ingredientId}
                        onChange={(e) => handleUpdateModalItem(idx, Number(e.target.value))}
                        className="h-8 text-xs font-semibold"
                      >
                        {allIngredients.map((i) => (
                          <option key={i.id} value={i.id}>
                            {i.name} ({i.unit}) - {formatVND(i.purchasePrice || 0)}
                          </option>
                        ))}
                      </Select>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Input
                        type="number"
                        min="0.001"
                        step="0.01"
                        value={item.qty}
                        onChange={(e) => handleUpdateModalQty(idx, Number(e.target.value))}
                        className="h-8 w-20 text-xs font-bold text-center"
                      />
                      <span className="font-mono text-muted-foreground w-10 text-[11px]">{item.unit}</span>
                      <span className="font-bold text-amber-600 min-w-[70px] text-right">{formatVND(lineCost)}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveModalItem(idx)}
                        className="text-muted-foreground hover:text-destructive p-1"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Financial summary inside modal */}
          <div className="p-3 bg-muted/50 rounded-xl text-xs space-y-1.5 border">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Giá bán món:</span>
              <span className="font-bold">{formatVND(modalMenuItem?.price || 0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tổng giá vốn nguyên liệu (BOM):</span>
              <span className="font-bold text-amber-600">{formatVND(modalTotalCost)}</span>
            </div>
            <div className="flex justify-between font-bold border-t pt-1.5 text-sm">
              <span>Tỷ lệ Food Cost:</span>
              <span className={Number(modalRatio) > 38 ? 'text-rose-600' : 'text-emerald-600'}>
                {modalRatio}%
              </span>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t">
            <Button type="button" variant="outline" onClick={() => setCreateModalOpen(false)}>
              Hủy
            </Button>
            <Button
              type="button"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
              onClick={handleSaveModalRecipe}
            >
              <CheckCircle2 className="h-4 w-4 mr-1.5" />
              Lưu & Kích Hoạt Công Thức
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
