export type TableStatus = 'FREE' | 'OCCUPIED' | 'RESERVED';

export interface RestaurantTable {
  id: number;
  number: string;
  capacity: number;
  status: TableStatus;
  orderToken?: string;
  createdAt?: string;
}

export type ReservationStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED';

export interface Reservation {
  id: number;
  tableId: number;
  tableNumber?: string;
  customerName: string;
  customerPhone?: string;
  partySize: number;
  startTime: string;
  endTime: string;
  status: ReservationStatus;
  createdBy?: number;
  note?: string;
  createdAt?: string;
}

export interface QrTokenDetails {
  tableId: number;
  tableNumber: string;
  orderToken: string;
  qrUrl?: string;
}
