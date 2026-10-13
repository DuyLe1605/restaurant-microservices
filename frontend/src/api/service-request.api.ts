import axios from './axios-instance';

export type ServiceRequestType = 'WATER' | 'TOWEL' | 'CALL_STAFF' | 'EXTRA_UTENSIL' | 'OTHER';
export type ServiceRequestStatus = 'PENDING' | 'RESOLVED' | 'DISMISSED';

export interface ServiceRequest {
  id: number;
  tableNumber: string;
  type: ServiceRequestType;
  typeLabel: string;
  note?: string;
  status: ServiceRequestStatus;
  createdAt: string;
  resolvedAt?: string;
}

export interface CreateServiceRequestDto {
  tableNumber: string;
  type: ServiceRequestType;
  note?: string;
}

const PUBLIC_BASE = '/service-requests/public';
const BASE = '/service-requests';

export const serviceRequestApi = {
  /** PUBLIC – QR page gọi, không cần token */
  createPublic: async (dto: CreateServiceRequestDto): Promise<ServiceRequest> => {
    const res = await axios.post<{ data: ServiceRequest }>(PUBLIC_BASE, dto);
    return res.data.data;
  },

  /** Staff – lấy danh sách đang chờ */
  getPending: async (): Promise<ServiceRequest[]> => {
    const res = await axios.get<{ data: ServiceRequest[] }>(`${BASE}/pending`);
    return res.data.data;
  },

  /** Staff – lấy tất cả */
  getAll: async (): Promise<ServiceRequest[]> => {
    const res = await axios.get<{ data: ServiceRequest[] }>(BASE);
    return res.data.data;
  },

  /** Staff – đếm số pending (cho notification badge) */
  countPending: async (): Promise<number> => {
    const res = await axios.get<{ data: { count: number } }>(`${BASE}/count-pending`);
    return res.data.data.count;
  },

  /** Staff – xác nhận đã xử lý */
  resolve: async (id: number): Promise<ServiceRequest> => {
    const res = await axios.patch<{ data: ServiceRequest }>(`${BASE}/${id}/resolve`);
    return res.data.data;
  },

  /** Staff – bỏ qua */
  dismiss: async (id: number): Promise<ServiceRequest> => {
    const res = await axios.patch<{ data: ServiceRequest }>(`${BASE}/${id}/dismiss`);
    return res.data.data;
  },
};
