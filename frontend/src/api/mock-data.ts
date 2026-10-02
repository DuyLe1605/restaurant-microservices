import { MenuItem, RecipeItem } from '@/types/menu';
import { RestaurantTable, Reservation } from '@/types/table';
import { SaleOrder, Invoice } from '@/types/order';
import { Ingredient, IngredientCategory } from '@/types/ingredient';
import { InventoryReceipt, InventoryIssue } from '@/types/inventory';
import { Expense } from '@/types/expense';
import { DashboardMetrics, RevenueReport } from '@/types/report';
import { User } from '@/types/auth';

export const mockCategories: string[] = [
  'Khai vị',
  'Món chính',
  'Hải sản cao cấp',
  'Đồ uống & Rượu',
  'Tráng miệng',
];

export const mockMenuItems: MenuItem[] = [
  {
    id: 1,
    name: 'Bò Wagyu A5 Nướng Sốt Nấm Truffle',
    code: 'WAGYU-A5',
    category: 'Món chính',
    price: 850000,
    active: true,
    imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop',
    description: 'Thịt bò Wagyu nhập khẩu Nhật Bản, sốt nấm Truffle đen và măng tây áp chảo.',
  },
  {
    id: 2,
    name: 'Cua Hoàng Đế Hấp Rượu Vang Trắng',
    code: 'KING-CRAB',
    category: 'Hải sản cao cấp',
    price: 1850000,
    active: true,
    imageUrl: 'https://images.unsplash.com/photo-1559742811-822873691df8?w=600&auto=format&fit=crop',
    description: 'Cua King Crab tươi sống hấp rượu vang trắng vùng Bordeaux, chấm bơ tỏi.',
  },
  {
    id: 3,
    name: 'Cá Hồi Na Uy Áp Chảo Sốt Bơ Chanh',
    code: 'SALMON-LEMON',
    category: 'Món chính',
    price: 360000,
    active: true,
    imageUrl: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=600&auto=format&fit=crop',
    description: 'Phi lê cá hồi Na Uy tươi béo ngậy kèm khoai tây nghiền và sốt bơ chanh vàng.',
  },
  {
    id: 4,
    name: 'Súp Bào Ngư Vi Cá Hoàng Gia',
    code: 'SOUP-ROYAL',
    category: 'Khai vị',
    price: 490000,
    active: true,
    imageUrl: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600&auto=format&fit=crop',
    description: 'Bào ngư hảo hạng hầm với vi cá và nấm đông cô trong nước hầm thượng canh 12 giờ.',
  },
  {
    id: 5,
    name: 'Salad Tôm Hùm Sốt Chanh Leo',
    code: 'LOBSTER-SALAD',
    category: 'Khai vị',
    price: 280000,
    active: true,
    imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&auto=format&fit=crop',
    description: 'Tôm hùm baby luộc cùng xà lách romaine, sốt chanh leo chua ngọt thơm mát.',
  },
  {
    id: 6,
    name: 'Rượu Vang Chateau Margaux 2018',
    code: 'WINE-MARGAUX',
    category: 'Đồ uống & Rượu',
    price: 3200000,
    active: true,
    imageUrl: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=600&auto=format&fit=crop',
    description: 'Rượu vang đỏ thượng hạng Bordeaux, hương vị đậm đà trái cây đen và gỗ sồi.',
  },
  {
    id: 7,
    name: 'Bánh Mousse Chocolate Bỉ Phủ Vàng',
    code: 'MOUSSE-GOLD',
    category: 'Tráng miệng',
    price: 150000,
    active: true,
    imageUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&auto=format&fit=crop',
    description: 'Chocolate Bỉ 70% nguyên chất, mềm mịn, phủ lá vàng thực phẩm 24K sang trọng.',
  }
];

export const mockTables: RestaurantTable[] = [
  { id: 1, number: 'B-01', capacity: 2, status: 'FREE' },
  { id: 2, number: 'B-02', capacity: 4, status: 'OCCUPIED' },
  { id: 3, number: 'B-03', capacity: 4, status: 'OCCUPIED' },
  { id: 4, number: 'B-04', capacity: 6, status: 'RESERVED' },
  { id: 5, number: 'VIP-01', capacity: 8, status: 'FREE' },
  { id: 6, number: 'VIP-02', capacity: 12, status: 'OCCUPIED' },
  { id: 7, number: 'B-05', capacity: 4, status: 'FREE' },
  { id: 8, number: 'B-06', capacity: 2, status: 'FREE' },
];

export const mockReservations: Reservation[] = [
  {
    id: 1,
    customerName: 'Nguyễn Văn Hùng',
    customerPhone: '0901234567',
    partySize: 4,
    startTime: new Date(Date.now() + 3600000).toISOString(),
    endTime: new Date(Date.now() + 7200000).toISOString(),
    status: 'CONFIRMED',
    tableId: 4,
    tableNumber: 'B-04',
    note: 'Kỷ niệm ngày cưới, chuẩn bị thêm nến và hoa tươi',
  },
  {
    id: 2,
    customerName: 'Trần Thị Thuỷ',
    customerPhone: '0987654321',
    partySize: 8,
    startTime: new Date(Date.now() + 86400000).toISOString(),
    endTime: new Date(Date.now() + 90000000).toISOString(),
    status: 'PENDING',
    tableId: 5,
    tableNumber: 'VIP-01',
    note: 'Tiệc sinh nhật gia đình, mang theo bánh kem riêng',
  }
];

export const mockOrders: SaleOrder[] = [
  {
    id: 1,
    tableId: 2,
    tableNumber: 'B-02',
    waiterId: 3,
    source: 'INTERNAL',
    status: 'OPEN',
    subtotal: 1210000,
    vatRate: 8,
    discount: 0,
    totalAmount: 1306800,
    orderTime: new Date(Date.now() - 1800000).toISOString(),
    items: [
      { id: 1, menuId: 1, menuName: 'Bò Wagyu A5 Nướng Sốt Nấm Truffle', qty: 1, price: 850000, subtotal: 850000, status: 'ORDERED' },
      { id: 2, menuId: 3, menuName: 'Cá Hồi Na Uy Áp Chảo Sốt Bơ Chanh', qty: 1, price: 360000, subtotal: 360000, status: 'ORDERED' }
    ]
  },
  {
    id: 2,
    tableId: 3,
    tableNumber: 'B-03',
    waiterId: 3,
    source: 'INTERNAL',
    status: 'SERVED',
    subtotal: 2340000,
    vatRate: 8,
    discount: 100000,
    totalAmount: 2427200,
    orderTime: new Date(Date.now() - 3600000).toISOString(),
    items: [
      { id: 3, menuId: 2, menuName: 'Cua Hoàng Đế Hấp Rượu Vang Trắng', qty: 1, price: 1850000, subtotal: 1850000, status: 'SERVED' },
      { id: 4, menuId: 4, menuName: 'Súp Bào Ngư Vi Cá Hoàng Gia', qty: 1, price: 490000, subtotal: 490000, status: 'SERVED' }
    ]
  },
  {
    id: 3,
    tableId: 6,
    tableNumber: 'VIP-02',
    waiterId: 3,
    source: 'INTERNAL',
    status: 'PAID',
    subtotal: 5400000,
    vatRate: 8,
    discount: 200000,
    totalAmount: 5632000,
    orderTime: new Date(Date.now() - 7200000).toISOString(),
    items: [
      { id: 5, menuId: 1, menuName: 'Bò Wagyu A5 Nướng Sốt Nấm Truffle', qty: 2, price: 850000, subtotal: 1700000, status: 'SERVED' },
      { id: 6, menuId: 6, menuName: 'Rượu Vang Chateau Margaux 2018', qty: 1, price: 3200000, subtotal: 3200000, status: 'SERVED' },
      { id: 7, menuId: 4, menuName: 'Súp Bào Ngư Vi Cá Hoàng Gia', qty: 1, price: 490000, subtotal: 490000, status: 'SERVED' }
    ]
  }
];

export const mockIngredients: Ingredient[] = [
  { id: 1, name: 'Bò Wagyu A5 Ribeye', code: 'ING-WAGYU', unit: 'kg', minStock: 5, currentStock: 8.5, purchasePrice: 2800000, category: 'Thịt & Hải sản' },
  { id: 2, name: 'Cua King Crab Sống', code: 'ING-CRAB', unit: 'kg', minStock: 10, currentStock: 6.2, purchasePrice: 1400000, category: 'Thịt & Hải sản' },
  { id: 3, name: 'Cá Hồi Tươi Na Uy', code: 'ING-SALMON', unit: 'kg', minStock: 8, currentStock: 12.0, purchasePrice: 380000, category: 'Thịt & Hải sản' },
  { id: 4, name: 'Nấm Truffle Đen Pháp', code: 'ING-TRUFFLE', unit: 'hộp 100g', minStock: 4, currentStock: 2, purchasePrice: 950000, category: 'Gia vị cao cấp' },
  { id: 5, name: 'Bơ Thảo Mộc Pháp Elle & Vire', code: 'ING-BUTTER', unit: 'kg', minStock: 5, currentStock: 14.0, purchasePrice: 220000, category: 'Gia vị & Sữa' },
  { id: 6, name: 'Bào Ngư Xanh Úc', code: 'ING-ABALONE', unit: 'kg', minStock: 3, currentStock: 0, purchasePrice: 1650000, category: 'Thịt & Hải sản' },
  { id: 7, name: 'Chocolate Bỉ Nguyên Chất 70%', code: 'ING-CHOCO', unit: 'kg', minStock: 3, currentStock: 5.0, purchasePrice: 320000, category: 'Đồ làm bánh' }
];

export const mockReceipts: InventoryReceipt[] = [
  {
    id: 1,
    supplier: 'Công ty Thực phẩm Nhập khẩu Cao cấp Horeca',
    receiptDate: '2024-09-22',
    status: 'COMPLETED',
    totalAmount: 18500000,
    note: 'Nhập lô Bò Wagyu A5 và Cá hồi Na Uy đầu tuần',
    items: [
      { id: 1, ingredientId: 1, ingredientName: 'Bò Wagyu A5 Ribeye', qty: 5, unitPrice: 2800000, unit: 'kg' },
      { id: 2, ingredientId: 3, ingredientName: 'Cá Hồi Tươi Na Uy', qty: 10, unitPrice: 450000, unit: 'kg' }
    ]
  }
];

export const mockIssues: InventoryIssue[] = [
  {
    id: 1,
    issueType: 'MANUAL',
    issueDate: '2024-09-23',
    status: 'COMPLETED',
    note: 'Xuất nguyên liệu sơ chế cho ca phục vụ trưa',
    items: [
      { id: 1, ingredientId: 1, ingredientName: 'Bò Wagyu A5 Ribeye', qty: 1.2, unit: 'kg' },
      { id: 2, ingredientId: 4, ingredientName: 'Nấm Truffle Đen Pháp', qty: 1, unit: 'hộp 100g' }
    ]
  }
];

export const mockExpenses: Expense[] = [
  { id: 1, expenseType: 'Tiền điện kinh doanh tháng 9', amount: 8200000, expenseDate: '2024-09-20', description: 'Điện lực EVN' },
  { id: 2, expenseType: 'Thuê mặt bằng tầng 1 & 2', amount: 35000000, expenseDate: '2024-09-01', description: 'Chủ nhà Bùi Thị Xuân' },
  { id: 3, expenseType: 'Bảo trì hệ thống hút mùi bếp công nghiệp', amount: 2500000, expenseDate: '2024-09-18', description: 'Công ty Cơ điện Lạnh' }
];

export const mockDashboard: DashboardMetrics = {
  todayRevenue: 28450000,
  todayExpense: 8200000,
  todayProfit: 20250000,
  todayOrderCount: 38,
  lowStockAlerts: [
    { ingredientId: 2, ingredientName: 'Cua King Crab Sống', currentQty: 6.2, minStock: 10, unit: 'kg', statusLevel: 'WARNING' },
    { ingredientId: 4, ingredientName: 'Nấm Truffle Đen Pháp', currentQty: 2.0, minStock: 4, unit: 'hộp 100g', statusLevel: 'CRITICAL' }
  ],
  recentOrders: [
    { id: 1, orderDate: '2024-09-23 11:30', totalAmount: 1306800, status: 'OPEN', tableNumber: 'B-02', source: 'INTERNAL' },
    { id: 2, orderDate: '2024-09-23 10:45', totalAmount: 2427200, status: 'SERVED', tableNumber: 'B-03', source: 'INTERNAL' },
    { id: 3, orderDate: '2024-09-23 09:15', totalAmount: 5632000, status: 'PAID', tableNumber: 'VIP-02', source: 'INTERNAL' }
  ]
};

export const mockRevenueReport: RevenueReport = {
  startDate: '2024-09-17',
  endDate: '2024-09-23',
  totalRevenue: 184500000,
  totalExpense: 62000000,
  totalProfit: 122500000,
  totalOrders: 246,
  dailyDetails: [
    { date: '17/09', revenue: 22000000, expense: 7000000, profit: 15000000, orderCount: 30 },
    { date: '18/09', revenue: 25500000, expense: 8500000, profit: 17000000, orderCount: 34 },
    { date: '19/09', revenue: 28000000, expense: 9000000, profit: 19000000, orderCount: 38 },
    { date: '20/09', revenue: 32000000, expense: 12000000, profit: 20000000, orderCount: 42 },
    { date: '21/09', revenue: 38500000, expense: 14000000, profit: 24500000, orderCount: 50 },
    { date: '22/09', revenue: 41000000, expense: 15000000, profit: 26000000, orderCount: 52 },
    { date: '23/09', revenue: 28450000, expense: 8200000, profit: 20250000, orderCount: 38 },
  ]
};

export const mockUsers: User[] = [
  { id: 1, username: 'admin', fullname: 'Nguyễn Quản Trị (Tổng Giám Đốc)', role: 'ADMIN', active: true, createdAt: '2024-01-01' },
  { id: 2, username: 'manager', fullname: 'Lê Quản Lý (Giám Sát Vận Hành)', role: 'MANAGER', active: true, createdAt: '2024-02-15' },
  { id: 3, username: 'waiter', fullname: 'Trần Tuấn Anh (Tổ Trưởng Phục Vụ)', role: 'USER', active: true, createdAt: '2024-03-01' },
  { id: 4, username: 'chef', fullname: 'Phạm Minh Tuấn (Bếp Trưởng)', role: 'USER', active: true, createdAt: '2024-03-10' },
  { id: 5, username: 'cashier', fullname: 'Vũ Thu Ngân (Thu Ngân Trưởng)', role: 'USER', active: true, createdAt: '2024-04-01' }
];

export const mockRecipes: Record<number, RecipeItem[]> = {
  1: [
    { id: 1, menuId: 1, ingredientId: 1, ingredientName: 'Bò Wagyu A5 Ribeye', unit: 'kg', qty: 0.25 },
    { id: 2, menuId: 1, ingredientId: 4, ingredientName: 'Nấm Truffle Đen Pháp', unit: 'hộp 100g', qty: 0.02 },
    { id: 3, menuId: 1, ingredientId: 5, ingredientName: 'Bơ Thảo Mộc Pháp Elle & Vire', unit: 'kg', qty: 0.03 },
  ],
  2: [
    { id: 4, menuId: 2, ingredientId: 2, ingredientName: 'Cua King Crab Sống', unit: 'kg', qty: 1.2 },
    { id: 5, menuId: 2, ingredientId: 5, ingredientName: 'Bơ Thảo Mộc Pháp Elle & Vire', unit: 'kg', qty: 0.05 },
  ],
  3: [
    { id: 6, menuId: 3, ingredientId: 3, ingredientName: 'Cá Hồi Tươi Na Uy', unit: 'kg', qty: 0.28 },
    { id: 7, menuId: 3, ingredientId: 5, ingredientName: 'Bơ Thảo Mộc Pháp Elle & Vire', unit: 'kg', qty: 0.04 },
  ],
  4: [
    { id: 8, menuId: 4, ingredientId: 6, ingredientName: 'Bào Ngư Xanh Úc', unit: 'kg', qty: 0.15 },
    { id: 9, menuId: 4, ingredientId: 4, ingredientName: 'Nấm Truffle Đen Pháp', unit: 'hộp 100g', qty: 0.01 },
  ],
  7: [
    { id: 10, menuId: 7, ingredientId: 7, ingredientName: 'Chocolate Bỉ Nguyên Chất 70%', unit: 'kg', qty: 0.12 },
    { id: 11, menuId: 7, ingredientId: 5, ingredientName: 'Bơ Thảo Mộc Pháp Elle & Vire', unit: 'kg', qty: 0.02 },
  ],
};

export const mockIngredientCategories: IngredientCategory[] = [
  { id: 1, name: 'Thịt & Gia cầm', description: 'Thịt bò Wagyu, gà thả vườn, heo Iberico' },
  { id: 2, name: 'Hải sản tươi sống', description: 'Cua King Crab, tôm hùm Alaska, cá hồi Na Uy, bào ngư Úc' },
  { id: 3, name: 'Rau củ & Nấm tươi', description: 'Măng tây, nấm Truffle đen, xà lách Romaine, cà chua bi' },
  { id: 4, name: 'Gia vị & Sữa bơ', description: 'Bơ thảo mộc Pháp Elle & Vire, phô mai Parmesan, dầu ô liu' },
  { id: 5, name: 'Đồ uống & Pha chế Bar', description: 'Rượu vang đỏ Bordeaux, siro, hoa quả tươi' },
  { id: 6, name: 'Đồ khô & Đóng hộp', description: 'Chocolate Bỉ 70%, bột mì số 8, gia vị nhập khẩu' },
];
