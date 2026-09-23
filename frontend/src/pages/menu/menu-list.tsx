import * as React from 'react';
import { useSearchParams } from 'react-router-dom';
import { useMenuItems, useCreateMenuItem, useUpdateMenuItem, useDeleteMenuItem, useRecipes, useSaveRecipe } from '@/hooks/use-menu';
import { useIngredients } from '@/hooks/use-ingredients';
import { PageHeader } from '@/components/shared/page-header';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { EmptyState } from '@/components/shared/empty-state';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { formatVND } from '@/lib/format-currency';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Dialog } from '@/components/ui/dialog';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  BookOpen,
  FlaskConical,
  Layers,
  Utensils,
  DollarSign,
  TrendingUp,
  Percent,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { MenuItem, RecipeItem } from '@/types/menu';
import { Ingredient } from '@/types/ingredient';
import { toast } from 'sonner';

export function MenuListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || localStorage.getItem('last_menu_tab') || 'items';

  const [search, setSearch] = React.useState('');
  const [category, setCategory] = React.useState('');
  const [page, setPage] = React.useState(0);

  // Queries
  const { data, isLoading } = useMenuItems({ search, category: category || undefined, page, size: 50 });
  const { data: ingredientsData } = useIngredients({ size: 100 });
  const createMutation = useCreateMenuItem();
  const updateMutation = useUpdateMenuItem();
  const deleteMutation = useDeleteMenuItem();
  const saveRecipeMutation = useSaveRecipe();

  const menuItems: MenuItem[] = data?.content || [];
  const allIngredients: Ingredient[] = ingredientsData?.content || [];

  // Menu Categories List
  const categories = React.useMemo(() => {
    const set = new Set<string>();
    menuItems.forEach((m) => {
      if (m.category) set.add(m.category);
    });
    return Array.from(set);
  }, [menuItems]);

  // Modal State: Them / Sua Mon
  const [dishDialogOpen, setDishDialogOpen] = React.useState(false);
  const [editingItem, setEditingItem] = React.useState<MenuItem | null>(null);
  const [code, setCode] = React.useState('');
  const [name, setName] = React.useState('');
  const [price, setPrice] = React.useState<number>(0);
  const [itemCategory, setItemCategory] = React.useState('');
  const [description, setDescription] = React.useState('');

  // Delete Dish State
  const [deleteId, setDeleteId] = React.useState<number | null>(null);

  // BOM Recipe Dialog for a specific dish
  const [bomDish, setBomDish] = React.useState<MenuItem | null>(null);
  const { data: dishRecipes } = useRecipes(bomDish?.id || 0);
  const [dishRecipeItems, setDishRecipeItems] = React.useState<RecipeItem[]>([]);

  // Add ingredient inputs in BOM Dialog
  const [newIngId, setNewIngId] = React.useState<number>(0);
  const [newIngQty, setNewIngQty] = React.useState<number>(0.1);

  // Tab 2: Full Matrix Selection
  const [matrixMenuId, setMatrixMenuId] = React.useState<number | null>(() => {
    const saved = localStorage.getItem('last_selected_bom_menu_id');
    return saved ? Number(saved) : null;
  });
  const { data: matrixRecipes } = useRecipes(matrixMenuId || (menuItems[0]?.id ?? 0));
  const [matrixItems, setMatrixItems] = React.useState<RecipeItem[]>([]);

  // Synchronize BOM dialog items when recipes load
  React.useEffect(() => {
    if (dishRecipes && Array.isArray(dishRecipes)) {
      setDishRecipeItems(dishRecipes);
    } else {
      setDishRecipeItems([]);
    }
  }, [dishRecipes]);

  // Synchronize matrix recipes
  React.useEffect(() => {
    if (matrixRecipes && Array.isArray(matrixRecipes)) {
      setMatrixItems(matrixRecipes);
    } else {
      setMatrixItems([]);
    }
  }, [matrixRecipes]);

  React.useEffect(() => {
    if (menuItems.length > 0) {
      const saved = localStorage.getItem('last_selected_bom_menu_id');
      const found = saved ? menuItems.find((m) => m.id === Number(saved)) : null;
      if (found) {
        setMatrixMenuId(found.id);
      } else if (matrixMenuId === null) {
        setMatrixMenuId(menuItems[0].id);
      }
    }
  }, [menuItems]);

  // Handlers for Dish CRUD
  const handleOpenCreateDish = () => {
    setEditingItem(null);
    setCode('DISH-' + Math.floor(100 + Math.random() * 900));
    setName('');
    setPrice(150000);
    setItemCategory(categories[0] || 'Món chính');
    setDescription('');
    setDishDialogOpen(true);
  };

  const handleOpenEditDish = (item: MenuItem) => {
    setEditingItem(item);
    setCode(item.code);
    setName(item.name);
    setPrice(item.price);
    setItemCategory(item.category || '');
    setDescription(item.description || '');
    setDishDialogOpen(true);
  };

  const handleSaveDish = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingItem) {
      updateMutation.mutate(
        {
          id: editingItem.id,
          payload: { code, name, price, category: itemCategory, description, active: editingItem.active },
        },
        {
          onSuccess: () => {
            setDishDialogOpen(false);
            toast.success('Cập nhật món ăn thành công');
          },
        }
      );
    } else {
      createMutation.mutate(
        { code, name, price, category: itemCategory, description, active: true },
        {
          onSuccess: () => {
            setDishDialogOpen(false);
            toast.success('Thêm món ăn mới thành công');
          },
        }
      );
    }
  };

  // Handlers for BOM Recipe Dialog
  const handleOpenBomDialog = (dish: MenuItem) => {
    setBomDish(dish);
    setNewIngId(0);
    setNewIngQty(0.1);
  };

  const handleAddIngredientToDish = () => {
    if (!newIngId || newIngQty <= 0) {
      toast.error('Vui lòng chọn nguyên liệu và nhập số lượng lớn hơn 0');
      return;
    }
    const ing = allIngredients.find((i) => i.id === newIngId);
    if (!ing) return;

    if (dishRecipeItems.some((r) => r.ingredientId === newIngId)) {
      toast.warning('Nguyên liệu này đã có trong công thức món!');
      return;
    }

    const newItem: RecipeItem = {
      menuId: bomDish!.id,
      ingredientId: ing.id,
      qty: newIngQty,
      ingredientName: ing.name,
      ingredientUnit: ing.unit,
      unitPrice: ing.purchasePrice,
    };

    setDishRecipeItems((prev) => [...prev, newItem]);
    setNewIngId(0);
    setNewIngQty(0.1);
  };

  const handleRemoveIngredientFromDish = (index: number) => {
    setDishRecipeItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveBomForDish = () => {
    if (!bomDish) return;
    saveRecipeMutation.mutate(
      { menuId: bomDish.id, items: dishRecipeItems },
      {
        onSuccess: () => {
          toast.success('Đã lưu định lượng công thức cho món: ' + bomDish.name);
          setBomDish(null);
        },
      }
    );
  };

  // Calculations for Dialog
  const bomCost = React.useMemo(() => {
    return dishRecipeItems.reduce((sum, item) => {
      const price = item.unitPrice || 0;
      return sum + price * item.qty;
    }, 0);
  }, [dishRecipeItems]);

  const bomFoodCostRatio = bomDish?.price ? ((bomCost / bomDish.price) * 100).toFixed(1) : '0';

  // Matrix Active Dish
  const matrixSelectedDish = menuItems.find((m) => m.id === matrixMenuId);
  const matrixCost = React.useMemo(() => {
    return matrixItems.reduce((sum, item) => {
      const price = item.unitPrice || 0;
      return sum + price * item.qty;
    }, 0);
  }, [matrixItems]);
  const matrixFoodCostRatio = matrixSelectedDish?.price ? ((matrixCost / matrixSelectedDish.price) * 100).toFixed(1) : '0';

  
  // Auto-save helper for immediate persistence to MySQL
  const autoSaveMatrixRecipe = (updatedItems: RecipeItem[]) => {
    if (!matrixMenuId) return;
    saveRecipeMutation.mutate(
      { menuId: matrixMenuId, items: updatedItems },
      {
        onSuccess: () => {
          toast.success('Đã lưu định mức mới vào CSDL!', { duration: 1500 });
        },
      }
    );
  };

  const handleSaveMatrixRecipe = () => {
    if (!matrixMenuId) return;
    saveRecipeMutation.mutate(
      { menuId: matrixMenuId, items: matrixItems },
      {
        onSuccess: () => {
          toast.success('Lưu công thức định mức thành công!');
        },
      }
    );
  };

  if (isLoading) {
    return <LoadingSpinner text="Đang tải thực đơn và định mức..." />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Thực Đơn & Định Lượng (BOM)"
        description="Quản lý toàn bộ danh mục món ăn, giá bán và công thức định mức nguyên vật liệu tiêu hao (Food Cost) tích hợp."
      >
        <Button onClick={handleOpenCreateDish} className="gap-2">
          <Plus className="h-4 w-4" />
          Thêm Món Mới
        </Button>
      </PageHeader>

      {/* Tabs Header */}
      <div className="flex border-b">
        <button
          onClick={() => { setSearchParams({ tab: 'items' }); localStorage.setItem('last_menu_tab', 'items'); }}
          className={'flex items-center gap-2 px-5 py-2.5 text-xs font-bold border-b-2 transition-all ' + (
            currentTab === 'items'
              ? 'border-primary text-primary bg-primary/5'
              : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50'
          )}
        >
          <Utensils className="h-4 w-4" />
          Danh Sách Món Ăn ({menuItems.length})
        </button>

        <button
          onClick={() => { setSearchParams({ tab: 'recipes' }); localStorage.setItem('last_menu_tab', 'recipes'); }}
          className={'flex items-center gap-2 px-5 py-2.5 text-xs font-bold border-b-2 transition-all ' + (
            currentTab === 'recipes'
              ? 'border-primary text-primary bg-primary/5'
              : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50'
          )}
        >
          <FlaskConical className="h-4 w-4" />
          Tổng Quan Định Mức & Food Cost (BOM)
          <span className="text-[10px] bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 px-1.5 py-0.5 rounded-full font-black">
            BOM
          </span>
        </button>
      </div>

      {/* TAB 1: DANH SÁCH MÓN ĂN */}
      {currentTab === 'items' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Input
                placeholder="Tìm theo tên món hoặc mã món..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            </div>

            <div className="w-full sm:w-60">
              <Select value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="">-- Tất cả danh mục --</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          {/* Table */}
          {menuItems.length === 0 ? (
            <EmptyState
              icon={<BookOpen className="h-10 w-10 text-muted-foreground/60" />}
              title="Không tìm thấy món ăn"
              description="Thử thay đổi bộ lọc tìm kiếm hoặc thêm món mới vào thực đơn."
              actionText="Thêm món ngay"
              onAction={handleOpenCreateDish}
            />
          ) : (
            <div className="rounded-xl border bg-card overflow-hidden shadow-sm">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">Mã</TableHead>
                    <TableHead>Món ăn</TableHead>
                    <TableHead>Danh mục</TableHead>
                    <TableHead className="text-right">Giá bán</TableHead>
                    <TableHead className="text-center">Định lượng (BOM)</TableHead>
                    <TableHead className="text-center">Trạng thái</TableHead>
                    <TableHead className="text-right">Hành động</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {menuItems.map((item) => (
                    <TableRow key={item.id} className="hover:bg-muted/40">
                      <TableCell className="font-mono text-xs font-bold text-muted-foreground">
                        {item.code}
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-3">
                          {item.imageUrl && (
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                              className="h-10 w-10 rounded-lg object-cover border"
                            />
                          )}
                          <div>
                            <p className="font-bold text-sm leading-tight">{item.name}</p>
                            {item.description && (
                              <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                                {item.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-muted text-muted-foreground">
                          {item.category || 'Món chính'}
                        </span>
                      </TableCell>

                      <TableCell className="text-right font-black text-sm text-foreground">
                        {formatVND(item.price)}
                      </TableCell>

                      <TableCell className="text-center">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs font-semibold gap-1.5 border-purple-200 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/30"
                          onClick={() => handleOpenBomDialog(item)}
                        >
                          <FlaskConical className="h-3.5 w-3.5" />
                          Định Lượng
                        </Button>
                      </TableCell>

                      <TableCell className="text-center">
                        <span
                          className={'inline-block px-2 py-0.5 rounded-full text-[11px] font-bold ' + (
                            item.active
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-muted text-muted-foreground'
                          )}
                        >
                          {item.active ? 'Đang phục vụ' : 'Tạm ngưng'}
                        </span>
                      </TableCell>

                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0"
                            onClick={() => handleOpenEditDish(item)}
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10"
                            onClick={() => setDeleteId(item.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: MA TRẬN ĐỊNH MỨC & FOOD COST */}
      {currentTab === 'recipes' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Dish Selector */}
          <div className="lg:col-span-4 space-y-3">
            <h3 className="font-bold text-xs uppercase tracking-wider text-muted-foreground px-1">
              Chọn Món Cần Định Mức
            </h3>
            <div className="rounded-xl border bg-card p-2 space-y-1 max-h-[600px] overflow-y-auto">
              {menuItems.map((m) => {
                const isSelected = m.id === matrixMenuId;
                return (
                  <button
                    key={m.id}
                    onClick={() => {
    setMatrixMenuId(m.id);
    localStorage.setItem('last_selected_bom_menu_id', String(m.id));
  }}
                    className={'w-full text-left p-3 rounded-lg flex items-center justify-between text-xs transition-all ' + (
                      isSelected
                        ? 'bg-primary text-primary-foreground font-bold shadow-sm'
                        : 'hover:bg-muted text-foreground'
                    )}
                  >
                    <div>
                      <p className="leading-tight">{m.name}</p>
                      <p className={'text-[11px] font-mono mt-0.5 ' + (isSelected ? 'text-primary-foreground/80' : 'text-muted-foreground')}>
                        {m.code} - {formatVND(m.price)}
                      </p>
                    </div>
                    {isSelected && <CheckCircle2 className="h-4 w-4 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right: Recipe Editor */}
          <div className="lg:col-span-8 space-y-4">
            {matrixSelectedDish && (
              <Card className="border">
                <CardHeader className="bg-muted/30 pb-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <span className="text-[11px] font-mono text-muted-foreground">{matrixSelectedDish.code}</span>
                      <CardTitle className="text-base font-black">{matrixSelectedDish.name}</CardTitle>
                    </div>
                    <div className="flex gap-4">
                      <div className="text-right">
                        <p className="text-[10px] uppercase text-muted-foreground font-bold">Giá Bán</p>
                        <p className="text-sm font-black text-primary">{formatVND(matrixSelectedDish.price)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] uppercase text-muted-foreground font-bold">Giá Vốn BOM</p>
                        <p className="text-sm font-black text-rose-600 dark:text-rose-400">{formatVND(matrixCost)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] uppercase text-muted-foreground font-bold">% Food Cost</p>
                        <p className={'text-sm font-black ' + (Number(matrixFoodCostRatio) > 40 ? 'text-rose-600' : 'text-emerald-600')}>
                          {matrixFoodCostRatio}%
                        </p>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-4 space-y-4">
                  {/* Table of BOM items */}
                  {matrixItems.length === 0 ? (
                    <div className="py-8 text-center border border-dashed rounded-xl">
                      <FlaskConical className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
                      <p className="text-xs text-muted-foreground">Món này chưa được cấu hình định lượng nguyên liệu.</p>
                    </div>
                  ) : (
                    <div className="rounded-lg border overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/30">
                            <TableHead className="text-xs">Nguyên liệu</TableHead>
                            <TableHead className="text-xs text-center w-28">Định lượng</TableHead>
                            <TableHead className="text-xs text-center w-20">Đơn vị</TableHead>
                            <TableHead className="text-xs text-right">Đơn giá nhập</TableHead>
                            <TableHead className="text-xs text-right">Thành tiền vốn</TableHead>
                            <TableHead className="text-xs text-right w-12"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {matrixItems.map((item, idx) => (
                            <TableRow key={idx} className="hover:bg-muted/30">
                              <TableCell className="font-semibold text-xs py-2">{item.ingredientName}</TableCell>
                              <TableCell className="text-center py-2">
                                <div className="inline-flex items-center gap-1.5 justify-center">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const nextQty = Math.max(0.01, Number((item.qty - 0.05).toFixed(3)));
                                      const updated = matrixItems.map((p, i) => i === idx ? { ...p, qty: nextQty } : p);
                                      setMatrixItems(updated);
                                      autoSaveMatrixRecipe(updated);
                                    }}
                                    className="h-6 w-6 rounded bg-muted hover:bg-muted/80 text-foreground font-black text-xs flex items-center justify-center transition-colors"
                                    title="Giảm 0.05"
                                  >
                                    -
                                  </button>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    min="0.001"
                                    value={item.qty}
                                    onChange={(e) => {
                                      const val = Math.max(0, Number(e.target.value));
                                      setMatrixItems((prev) => prev.map((p, i) => i === idx ? { ...p, qty: val } : p));
                                    }}
                                    className="h-7 w-20 text-center font-mono font-bold text-xs px-1 border-primary/40 focus:border-primary"
                                    title="Nhập trực tiếp số lượng định mức"
                                    onBlur={() => autoSaveMatrixRecipe(matrixItems)}
                                  />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const nextQty = Number((item.qty + 0.05).toFixed(3));
                                      const updated = matrixItems.map((p, i) => i === idx ? { ...p, qty: nextQty } : p);
                                      setMatrixItems(updated);
                                      autoSaveMatrixRecipe(updated);
                                    }}
                                    className="h-6 w-6 rounded bg-muted hover:bg-muted/80 text-foreground font-black text-xs flex items-center justify-center transition-colors"
                                    title="Tăng 0.05"
                                  >
                                    +
                                  </button>
                                </div>
                              </TableCell>
                              <TableCell className="text-center text-xs font-semibold text-muted-foreground py-2">{item.ingredientUnit}</TableCell>
                              <TableCell className="text-right text-xs py-2 text-muted-foreground">{formatVND(item.unitPrice || 0)}</TableCell>
                              <TableCell className="text-right text-xs font-black text-rose-600 dark:text-rose-400 py-2">
                                {formatVND((item.unitPrice || 0) * item.qty)}
                              </TableCell>
                              <TableCell className="text-right py-2">
                                <div className="flex items-center justify-end gap-1">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-7 w-7 p-0 text-muted-foreground hover:text-primary"
                                    title="Chỉnh sửa định mức"
                                    onClick={() => {
                                      const currentVal = item.qty;
                                      const promptVal = window.prompt('Nhập số lượng định mức mới cho ' + item.ingredientName + ' (' + item.ingredientUnit + '):', String(currentVal));
                                      if (promptVal !== null) {
                                        const num = Number(promptVal);
                                        if (!isNaN(num) && num > 0) {
                                          const updated = matrixItems.map((p, i) => i === idx ? { ...p, qty: num } : p);
                                          setMatrixItems(updated);
                                          autoSaveMatrixRecipe(updated);
                                        }
                                      }
                                    }}
                                  >
                                    <Edit2 className="h-3.5 w-3.5" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10"
                                    title="Xóa nguyên liệu"
                                    onClick={() => {
                                      const updated = matrixItems.filter((_, i) => i !== idx);
                                      setMatrixItems(updated);
                                      autoSaveMatrixRecipe(updated);
                                    }}
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}

                  {/* Add ingredient row */}
                  <div className="p-3 bg-muted/30 rounded-xl border flex flex-col sm:flex-row gap-2 items-end">
                    <div className="flex-1 w-full">
                      <label className="text-[11px] font-bold text-muted-foreground mb-1 block">Chọn nguyên liệu thêm vào:</label>
                      <Select value={newIngId} onChange={(e) => setNewIngId(Number(e.target.value))}>
                        <option value={0}>-- Chọn nguyên liệu kho --</option>
                        {allIngredients.map((i) => (
                          <option key={i.id} value={i.id}>
                            {i.name} ({i.unit} - {formatVND(i.purchasePrice)})
                          </option>
                        ))}
                      </Select>
                    </div>

                    <div className="w-full sm:w-28">
                      <label className="text-[11px] font-bold text-muted-foreground mb-1 block">Định mức:</label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0.001"
                        value={newIngQty}
                        onChange={(e) => setNewIngQty(Number(e.target.value))}
                      />
                    </div>

                    <Button
                      size="sm"
                      onClick={() => {
                        if (!newIngId || newIngQty <= 0) return;
                        const ing = allIngredients.find((i) => i.id === newIngId);
                        if (!ing) return;
                        if (matrixItems.some((r) => r.ingredientId === newIngId)) {
                          toast.warning('Nguyên liệu này đã có!');
                          return;
                        }
                        const updated = [
                          ...matrixItems,
                          {
                            menuId: matrixMenuId!,
                            ingredientId: ing.id,
                            qty: newIngQty,
                            ingredientName: ing.name,
                            ingredientUnit: ing.unit,
                            unitPrice: ing.purchasePrice,
                          },
                        ];
                        setMatrixItems(updated);
                        autoSaveMatrixRecipe(updated);
                        setNewIngId(0);
                        setNewIngQty(0.1);
                      }}
                      className="gap-1 font-bold text-xs"
                    >
                      <Plus className="h-3.5 w-3.5" /> Thêm
                    </Button>
                  </div>

                  <div className="flex justify-end pt-2">
                    <Button onClick={handleSaveMatrixRecipe} isLoading={saveRecipeMutation.isPending} className="font-bold gap-2">
                      <CheckCircle2 className="h-4 w-4" />
                      Lưu Công Thức Định Mức (BOM)
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* DIALOG 1: THÊM / SỬA MÓN ĂN */}
      <Dialog
        open={dishDialogOpen}
        onOpenChange={setDishDialogOpen}
        title={editingItem ? 'Sửa Thông Tin Món Ăn' : 'Thêm Món Ăn Mới'}
        description="Điền thông tin mã món, giá bán và nhóm thực đơn."
      >
        <form onSubmit={handleSaveDish} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-muted-foreground mb-1 block">Mã món (*)</label>
              <Input value={code} onChange={(e) => setCode(e.target.value)} required />
            </div>
            <div>
              <label className="text-xs font-bold text-muted-foreground mb-1 block">Giá bán (VND) (*)</label>
              <Input
                type="number"
                min="0"
                step="1000"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                required
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-muted-foreground mb-1 block">Tên món ăn (*)</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="VD: Bò Wagyu A5 Truffle..." required />
          </div>

          <div>
            <label className="text-xs font-bold text-muted-foreground mb-1 block">Danh mục món</label>
            <Select value={itemCategory} onChange={(e) => setItemCategory(e.target.value)}>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
              <option value="Món chính">Món chính</option>
              <option value="Khai vị">Khai vị</option>
              <option value="Hải sản cao cấp">Hải sản cao cấp</option>
              <option value="Tráng miệng">Tráng miệng</option>
              <option value="Đồ uống & Rượu">Đồ uống & Rượu</option>
            </Select>
          </div>

          <div>
            <label className="text-xs font-bold text-muted-foreground mb-1 block">Mô tả món</label>
            <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Nguyên liệu chính, phương pháp chế biến..." />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t">
            <Button variant="outline" type="button" onClick={() => setDishDialogOpen(false)}>
              Hủy
            </Button>
            <Button type="submit" className="font-bold">
              {editingItem ? 'Lưu Thay Đổi' : 'Thêm Món'}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* DIALOG 2: ĐỊNH LƯỢNG BOM CHO 1 MÓN */}
      <Dialog
        open={bomDish !== null}
        onOpenChange={(open) => !open && setBomDish(null)}
        title={'Định Lượng Nguyên Liệu (BOM) - ' + (bomDish?.name || '')}
        description="Xác định định mức nguyên vật liệu tiêu hao cho 1 phần ăn và tính toán Food Cost %."
      >
        <div className="space-y-4">
          {/* Header metrics */}
          <div className="grid grid-cols-3 gap-2 p-3 bg-muted/40 rounded-xl text-center">
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase">Giá Bán</p>
              <p className="text-xs font-black text-primary">{formatVND(bomDish?.price || 0)}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase">Giá Vốn (BOM)</p>
              <p className="text-xs font-black text-rose-600 dark:text-rose-400">{formatVND(bomCost)}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase">% Food Cost</p>
              <p className={'text-xs font-black ' + (Number(bomFoodCostRatio) > 40 ? 'text-rose-600' : 'text-emerald-600')}>
                {bomFoodCostRatio}%
              </p>
            </div>
          </div>

          {/* Current items table */}
          {dishRecipeItems.length === 0 ? (
            <div className="py-6 text-center border border-dashed rounded-lg">
              <FlaskConical className="h-6 w-6 text-muted-foreground/40 mx-auto mb-1" />
              <p className="text-xs text-muted-foreground">Chưa có nguyên liệu nào trong công thức.</p>
            </div>
          ) : (
            <div className="rounded-lg border max-h-56 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/20">
                    <TableHead className="text-[11px]">Nguyên liệu</TableHead>
                    <TableHead className="text-[11px] text-center">Số lượng</TableHead>
                    <TableHead className="text-[11px] text-right">Giá vốn</TableHead>
                    <TableHead className="text-[11px] text-right w-10"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dishRecipeItems.map((item, idx) => (
                    <TableRow key={idx} className="hover:bg-muted/30">
                      <TableCell className="text-xs font-semibold py-2">
                        {item.ingredientName}
                      </TableCell>
                      <TableCell className="text-xs text-center py-2">
                        <div className="inline-flex items-center gap-1 justify-center">
                          <button
                            type="button"
                            onClick={() => {
                              const nextQty = Math.max(0.01, Number((item.qty - 0.05).toFixed(3)));
                              setDishRecipeItems((prev) => prev.map((p, i) => i === idx ? { ...p, qty: nextQty } : p));
                            }}
                            className="h-5 w-5 rounded bg-muted hover:bg-muted/80 text-foreground font-black text-xs flex items-center justify-center"
                          >
                            -
                          </button>
                          <Input
                            type="number"
                            step="0.01"
                            min="0.001"
                            value={item.qty}
                            onChange={(e) => {
                              const val = Math.max(0, Number(e.target.value));
                              setDishRecipeItems((prev) => prev.map((p, i) => i === idx ? { ...p, qty: val } : p));
                            }}
                            className="h-6 w-16 text-center font-mono font-bold text-xs px-1"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const nextQty = Number((item.qty + 0.05).toFixed(3));
                              setDishRecipeItems((prev) => prev.map((p, i) => i === idx ? { ...p, qty: nextQty } : p));
                            }}
                            className="h-5 w-5 rounded bg-muted hover:bg-muted/80 text-foreground font-black text-xs flex items-center justify-center"
                          >
                            +
                          </button>
                          <span className="text-[11px] text-muted-foreground font-medium ml-1">{item.ingredientUnit}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-right font-bold text-rose-600 dark:text-rose-400 py-2">
                        {formatVND((item.unitPrice || 0) * item.qty)}
                      </TableCell>
                      <TableCell className="text-right py-2">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              const promptVal = window.prompt('Nhập định mức mới cho ' + item.ingredientName + ' (' + item.ingredientUnit + '):', String(item.qty));
                              if (promptVal !== null) {
                                const num = Number(promptVal);
                                if (!isNaN(num) && num > 0) {
                                  setDishRecipeItems((prev) => prev.map((p, i) => i === idx ? { ...p, qty: num } : p));
                                }
                              }
                            }}
                            className="text-muted-foreground hover:text-primary p-1"
                            title="Sửa định mức"
                          >
                            <Edit2 className="h-3 w-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveIngredientFromDish(idx)}
                            className="text-muted-foreground hover:text-destructive p-1"
                            title="Xóa nguyên liệu"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Add ingredient controls */}
          <div className="p-3 bg-muted/30 rounded-xl border space-y-2">
            <p className="text-[11px] font-bold text-muted-foreground uppercase">Thêm Nguyên Liệu Vào Món:</p>
            <div className="flex gap-2 items-center">
              <div className="flex-1">
                <Select value={newIngId} onChange={(e) => setNewIngId(Number(e.target.value))}>
                  <option value={0}>-- Chọn nguyên liệu --</option>
                  {allIngredients.map((ing) => (
                    <option key={ing.id} value={ing.id}>
                      {ing.name} ({ing.unit} - {formatVND(ing.purchasePrice)})
                    </option>
                  ))}
                </Select>
              </div>
              <div className="w-24">
                <Input
                  type="number"
                  step="0.01"
                  min="0.001"
                  value={newIngQty}
                  onChange={(e) => setNewIngQty(Number(e.target.value))}
                  placeholder="Số lượng"
                />
              </div>
              <Button size="sm" type="button" onClick={handleAddIngredientToDish} className="font-bold text-xs">
                <Plus className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          {/* Dialog Action Buttons */}
          <div className="flex justify-end gap-2 pt-2 border-t">
            <Button variant="outline" type="button" onClick={() => setBomDish(null)}>
              Đóng
            </Button>
            <Button
              type="button"
              onClick={handleSaveBomForDish}
              isLoading={saveRecipeMutation.isPending}
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold"
            >
              <CheckCircle2 className="h-4 w-4 mr-1.5" />
              Lưu Định Lượng BOM
            </Button>
          </div>
        </div>
      </Dialog>

      {/* CONFIRM DIALOG: Xóa Món */}
      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Xác Nhận Xóa Món Ăn"
        description="Bạn có chắc chắn muốn xóa món này khỏi thực đơn? Công thức định lượng liên quan cũng sẽ bị xóa vĩnh viễn."
        confirmText="Xóa Món"
        cancelText="Giữ Lại"
        isDanger={true}
        onConfirm={() => {
          if (deleteId) {
            deleteMutation.mutate(deleteId, {
              onSuccess: () => {
                setDeleteId(null);
                toast.success('Đã xóa món khỏi thực đơn');
              },
            });
          }
        }}
      />
    </div>
  );
}
