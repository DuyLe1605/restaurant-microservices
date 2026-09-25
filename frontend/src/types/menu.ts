export interface MenuItem {
  id: number;
  code: string;
  name: string;
  price: number;
  category?: string;
  description?: string;
  imageUrl?: string;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface RecipeItem {
  unitPrice?: number;
  ingredientUnit?: string;
  id?: number;
  menuId?: number;
  ingredientId: number;
  ingredientName?: string;
  unit?: string;
  qty: number;
}

export interface CheckInventoryMissing {
  ingredientId: number;
  ingredientName: string;
  needed: number;
  available: number;
  unit: string;
}

export interface CheckInventoryResponse {
  sufficient: boolean;
  missing: CheckInventoryMissing[];
}
