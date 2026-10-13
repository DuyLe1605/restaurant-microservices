import axios from './axios-instance';

export interface WorkShiftDto {
  id: number;
  shiftCode: string;
  cashierName: string;
  cashierId?: number;
  startTime: string;
  endTime?: string;
  status: 'OPEN' | 'CLOSED';
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

export interface ShiftOrderSummary {
  orderId: number;
  tableNumber: string;
  customerName?: string;
  totalAmount: number;
  paidAt: string;
  source: string;
}

export interface ShiftDetailDto {
  shift: WorkShiftDto;
  orders: ShiftOrderSummary[];
}

export interface OpenShiftRequest {
  cashierName: string;
  openingCash: number;
  cashierId?: number;
}

export interface CloseShiftRequest {
  actualCash: number;
  handoverNote?: string;
}

const BASE = '/shifts';

export const shiftApi = {
  getCurrent: async (): Promise<WorkShiftDto | null> => {
    const res = await axios.get<{ data: WorkShiftDto | null }>(`${BASE}/current`);
    return res.data.data;
  },

  getAll: async (): Promise<WorkShiftDto[]> => {
    const res = await axios.get<{ data: WorkShiftDto[] }>(BASE);
    return res.data.data ?? [];
  },

  getDetail: async (id: number): Promise<ShiftDetailDto> => {
    const res = await axios.get<{ data: ShiftDetailDto }>(`${BASE}/${id}/detail`);
    return res.data.data;
  },

  open: async (req: OpenShiftRequest): Promise<WorkShiftDto> => {
    const res = await axios.post<{ data: WorkShiftDto }>(`${BASE}/open`, req);
    return res.data.data;
  },

  close: async (req: CloseShiftRequest): Promise<WorkShiftDto> => {
    const res = await axios.post<{ data: WorkShiftDto }>(`${BASE}/close`, req);
    return res.data.data;
  },

  getByCashier: async (cashierId: number): Promise<WorkShiftDto[]> => {
    const res = await axios.get<{ data: WorkShiftDto[] }>(`${BASE}/by-cashier/${cashierId}`);
    return res.data.data ?? [];
  },
};
