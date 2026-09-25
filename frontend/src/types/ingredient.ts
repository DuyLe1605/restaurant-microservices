export interface IngredientCategory {
  id: number;
  name: string;
  description?: string;
}

export interface Ingredient {
  id: number;
  code: string;
  name: string;
  category?: string;
  unit: string;
  purchasePrice?: number;
  minStock: number;
  currentStock: number;
  description?: string;
  mainSupplier?: string;
  createdAt?: string;
}

export interface IngredientStock {
  ingredientId: number;
  ingredientName: string;
  stock: number;
  unit: string;
}
