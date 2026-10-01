export interface StockAlert {
  ingredientId: number;
  ingredientName: string;
  currentQty: number;
  minStock: number;
  unit: string;
  statusLevel: 'CRITICAL' | 'WARNING' | 'NORMAL';
}

export interface OrderSummary {
  id: number;
  orderDate: string;
  totalAmount: number;
  status: string;
  tableNumber?: string;
  cashierName?: string;
  source: string;
}

export interface DashboardMetrics {
  todayRevenue: number;
  todayExpense: number;
  todayProfit: number;
  todayOrderCount: number;
  lowStockAlerts: StockAlert[];
  recentOrders: OrderSummary[];
}

export interface DailyRevenue {
  date: string;
  revenue: number;
  expense: number;
  profit: number;
  orderCount: number;
}

export interface RevenueReport {
  startDate: string;
  endDate: string;
  totalRevenue: number;
  totalExpense: number;
  totalProfit: number;
  totalOrders: number;
  dailyDetails: DailyRevenue[];
}
