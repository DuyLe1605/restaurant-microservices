import api from './axios-instance';
import { ApiResponse } from '@/types/common';
import { RestaurantTable, TableStatus, Reservation, QrTokenDetails } from '@/types/table';

export const tableApi = {
  getAll: async (): Promise<RestaurantTable[]> => {
    const res = await api.get<ApiResponse<RestaurantTable[]>>('/tables');
    return res.data?.data ?? [];
  },
  getById: async (id: number): Promise<RestaurantTable> => {
    const res = await api.get<ApiResponse<RestaurantTable>>(`/tables/${id}`);
    return res.data.data;
  },
  getByToken: async (token: string): Promise<RestaurantTable> => {
    const res = await api.get<ApiResponse<RestaurantTable>>(`/tables/by-token/${token}`);
    return res.data.data;
  },
  create: async (payload: Partial<RestaurantTable>): Promise<RestaurantTable> => {
    const res = await api.post<ApiResponse<RestaurantTable>>('/tables', payload);
    return res.data.data;
  },
  update: async (id: number, payload: Partial<RestaurantTable>): Promise<RestaurantTable> => {
    const res = await api.put<ApiResponse<RestaurantTable>>(`/tables/${id}`, payload);
    return res.data.data;
  },
  updateStatus: async (id: number, status: TableStatus): Promise<RestaurantTable> => {
    const res = await api.put<ApiResponse<RestaurantTable>>(`/tables/${id}/status`, { status });
    return res.data.data;
  },
  delete: async (id: number): Promise<void> => {
    await api.delete(`/tables/${id}`);
  },
  transferTable: async (sourceId: number, targetTableId: number, reason?: string): Promise<any> => {
    const res = await api.post<ApiResponse<any>>(`/tables/${sourceId}/transfer`, { targetTableId, reason });
    return res.data.data;
  },
  mergeTables: async (primaryId: number, mergedTableIds: number[]): Promise<any> => {
    const res = await api.post<ApiResponse<any>>(`/tables/${primaryId}/merge`, { mergedTableIds });
    return res.data.data;
  },
  // Reservations
  getReservations: async (tableId?: number): Promise<Reservation[]> => {
    const res = await api.get<ApiResponse<Reservation[]>>('/reservations', { params: { tableId } });
    return res.data?.data ?? [];
  },
  getReservationById: async (id: number): Promise<Reservation> => {
    const res = await api.get<ApiResponse<Reservation>>(`/reservations/${id}`);
    return res.data.data;
  },
  createReservation: async (payload: any): Promise<Reservation> => {
    const res = await api.post<ApiResponse<Reservation>>('/reservations', payload);
    return res.data.data;
  },
  updateReservation: async (id: number, payload: any): Promise<Reservation> => {
    const res = await api.put<ApiResponse<Reservation>>(`/reservations/${id}`, payload);
    return res.data.data;
  },
  deleteReservation: async (id: number): Promise<void> => {
    await api.delete(`/reservations/${id}`);
  },
  // QR
  generateQr: async (tableId: number): Promise<QrTokenDetails> => {
    const res = await api.post<ApiResponse<QrTokenDetails>>(`/qr/${tableId}/generate`);
    return res.data.data;
  },
  clearQr: async (tableId: number): Promise<void> => {
    await api.delete(`/qr/${tableId}/clear`);
  },
  getQrDetails: async (tableId: number): Promise<QrTokenDetails> => {
    const res = await api.get<ApiResponse<QrTokenDetails>>(`/qr/${tableId}`);
    return res.data.data;
  },
};
