export type OrderStatus = 'OPEN' | 'SERVED' | 'PAID' | 'CANCEL';
export type OrderSource = 'INTERNAL' | 'QR';
export type OrderDetailStatus = 'ORDERED' | 'COOKING' | 'COOKED' | 'SERVED' | 'CANCELED';

export interface OrderDetail {
  id?: number;
  saleOrderId?: number;
  menuId: number;
  menuName?: string;
  qty: number;
  price: number;
  subtotal?: number;
  status?: OrderDetailStatus;
  note?: string;
}

export interface SaleOrder {
  id: number;
  tableId?: number;
  tableNumber?: string;
  waiterId?: number;
  cashierId?: number;
  orderTime: string;
  status: OrderStatus;
  subtotal: number;
  discount: number;
  vatRate: number;
  totalAmount: number;
  source: OrderSource;
  customerName?: string;
  customerPhone?: string;
  note?: string;
  items: OrderDetail[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Invoice {
  orderId: number;
  restaurantName: string;
  restaurantAddress: string;
  tableNumber?: string;
  customerName: string;
  cashierName: string;
  invoiceDate: string;
  items: OrderDetail[];
  subtotal: number;
  discount: number;
  vatAmount: number;
  totalAmount: number;
  paymentStatus: string;
}
