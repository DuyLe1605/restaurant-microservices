import * as React from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useOrders } from './use-orders';
import { orderApi } from '@/api/order.api';
import { SaleOrder, OrderDetailStatus, OrderDetail } from '@/types/order';
import { toast } from 'sonner';

export interface KitchenTicket {
  orderId: number;
  tableNumber: string;
  orderTime: string;
  customerName?: string;
  note?: string;
  items: Array<OrderDetail & { currentStatus: OrderDetailStatus }>;
}

export function useKitchen() {
  const qc = useQueryClient();
  const { data: ordersData, isLoading, refetch } = useOrders({ status: 'OPEN', size: 50 });

  const orders: SaleOrder[] = ordersData?.content || (Array.isArray(ordersData) ? ordersData : []);

  // Build Kitchen tickets directly from MySQL persisted item status
  const tickets: KitchenTicket[] = React.useMemo(() => {
    return orders.map((order) => {
      const items = (order.items || []).map((item) => {
        const currentStatus = (item.status as OrderDetailStatus) || 'ORDERED';
        return {
          ...item,
          currentStatus,
        };
      });

      return {
        orderId: order.id,
        tableNumber: order.tableNumber || (order.tableId ? `Bàn ${order.tableId}` : 'Mang về'),
        orderTime: order.orderTime || order.createdAt || new Date().toISOString(),
        customerName: order.customerName,
        note: order.note,
        items,
      };
    });
  }, [orders]);

  const updateItemStatus = async (orderId: number, itemIndex: number, newStatus: OrderDetailStatus) => {
    const targetTicket = tickets.find((t) => t.orderId === orderId);
    if (!targetTicket) return;
    const targetItem = targetTicket.items[itemIndex];
    if (!targetItem) return;

    const statusNames: Record<OrderDetailStatus, string> = {
      ORDERED: 'Chờ nấu',
      COOKING: 'Đang nấu',
      COOKED: 'Đã nấu xong',
      SERVED: 'Đã ra món',
      CANCELED: 'Đã hủy',
    };

    // Optimistic cache update in React Query
    qc.setQueryData(['orders', { status: 'OPEN', size: 50 }], (old: any) => {
      if (!old) return old;
      const content = (old.content || []).map((ord: SaleOrder) => {
        if (ord.id !== orderId) return ord;
        const updatedItems = (ord.items || []).map((it, idx) => {
          if (idx === itemIndex || it.id === targetItem.id) {
            return { ...it, status: newStatus };
          }
          return it;
        });
        return { ...ord, items: updatedItems };
      });
      return { ...old, content };
    });

    try {
      await orderApi.updateItemStatus(orderId, targetItem.id, newStatus);
      qc.invalidateQueries({ queryKey: ['orders'] });
      qc.invalidateQueries({ queryKey: ['tables'] });
      toast.success(`Món "${targetItem.menuName || 'Món ăn'}" -> ${statusNames[newStatus]}`);
    } catch (err: any) {
      qc.invalidateQueries({ queryKey: ['orders'] });
      toast.error('Lỗi lưu trạng thái món vào CSDL: ' + (err.message || ''));
    }
  };

  const markAllTicket = async (orderId: number, newStatus: OrderDetailStatus) => {
    const targetTicket = tickets.find((t) => t.orderId === orderId);
    if (!targetTicket) return;

    // Optimistic cache update
    qc.setQueryData(['orders', { status: 'OPEN', size: 50 }], (old: any) => {
      if (!old) return old;
      const content = (old.content || []).map((ord: SaleOrder) => {
        if (ord.id !== orderId) return ord;
        const updatedItems = (ord.items || []).map((it) => ({ ...it, status: newStatus }));
        return { ...ord, items: updatedItems };
      });
      return { ...old, content };
    });

    try {
      await orderApi.updateAllTicketStatus(orderId, newStatus);
      qc.invalidateQueries({ queryKey: ['orders'] });
      qc.invalidateQueries({ queryKey: ['tables'] });
      toast.success(`Toàn bộ vé #${orderId} đã lưu trạng thái: ${newStatus}`);
    } catch (err: any) {
      qc.invalidateQueries({ queryKey: ['orders'] });
      toast.error('Lỗi cập nhật vé vào CSDL: ' + (err.message || ''));
    }
  };

  return {
    tickets,
    isLoading,
    refetch,
    updateItemStatus,
    markAllTicket,
  };
}
