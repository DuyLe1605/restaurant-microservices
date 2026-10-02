export type ShiftStatus = 'OPEN' | 'CLOSED';

export interface WorkShift {
  id: number;
  shiftCode: string;
  cashierId?: number;
  cashierName: string;
  startTime: string;
  endTime?: string;
  status: ShiftStatus;
  openingCash: number;
  cashSales: number;
  cardSales: number;
  totalSales: number;
  orderCount: number;
  expectedCash: number;
  actualCash?: number;
  difference?: number;
  handoverNote?: string;
  createdAt: string;
}

export interface OpenShiftRequest {
  cashierName: string;
  openingCash: number;
}

export interface CloseShiftRequest {
  actualCash: number;
  handoverNote?: string;
}
