import * as React from 'react';
import { WorkShift, OpenShiftRequest, CloseShiftRequest } from '@/types/shift';
import { toast } from 'sonner';

const CURRENT_SHIFT_KEY = 'gourmet_haven_active_shift';
const SHIFT_HISTORY_KEY = 'gourmet_haven_shift_history';

const defaultShift: WorkShift = {
  id: 1,
  shiftCode: 'CA-SANG-' + new Date().toISOString().slice(0, 10).replace(/-/g, ''),
  cashierName: 'Nguyễn Văn Quản Lý',
  startTime: new Date(Date.now() - 4 * 3600000).toISOString(),
  status: 'OPEN',
  openingCash: 2000000, // 2 triệu tiền lẻ thối
  cashSales: 4850000,
  cardSales: 7920000,
  totalSales: 12770000,
  orderCount: 14,
  expectedCash: 6850000, // 2.000.000 + 4.850.000
  createdAt: new Date(Date.now() - 4 * 3600000).toISOString(),
};

const defaultHistory: WorkShift[] = [
  {
    id: 99,
    shiftCode: 'CA-TOI-HOM-QUA',
    cashierName: 'Trần Thị Thu Ngân',
    startTime: new Date(Date.now() - 20 * 3600000).toISOString(),
    endTime: new Date(Date.now() - 12 * 3600000).toISOString(),
    status: 'CLOSED',
    openingCash: 2000000,
    cashSales: 9400000,
    cardSales: 15300000,
    totalSales: 24700000,
    orderCount: 28,
    expectedCash: 11400000,
    actualCash: 11400000,
    difference: 0,
    handoverNote: 'Ca tối đông khách cuối tuần, két tiền khớp 100%. Đã bàn giao lại đủ 2 triệu tiền mồi.',
    createdAt: new Date(Date.now() - 20 * 3600000).toISOString(),
  },
];

export function useShifts() {
  const [currentShift, setCurrentShift] = React.useState<WorkShift | null>(() => {
    try {
      const stored = localStorage.getItem(CURRENT_SHIFT_KEY);
      return stored ? JSON.parse(stored) : defaultShift;
    } catch {
      return defaultShift;
    }
  });

  const [history, setHistory] = React.useState<WorkShift[]>(() => {
    try {
      const stored = localStorage.getItem(SHIFT_HISTORY_KEY);
      return stored ? JSON.parse(stored) : defaultHistory;
    } catch {
      return defaultHistory;
    }
  });

  // Persist shifts
  React.useEffect(() => {
    if (currentShift) {
      localStorage.setItem(CURRENT_SHIFT_KEY, JSON.stringify(currentShift));
    } else {
      localStorage.removeItem(CURRENT_SHIFT_KEY);
    }
  }, [currentShift]);

  React.useEffect(() => {
    localStorage.setItem(SHIFT_HISTORY_KEY, JSON.stringify(history));
  }, [history]);

  const openShift = (data: OpenShiftRequest) => {
    const newShift: WorkShift = {
      id: Date.now(),
      shiftCode: 'CA-' + Math.floor(100 + Math.random() * 900),
      cashierName: data.cashierName || 'Thu ngân ca',
      startTime: new Date().toISOString(),
      status: 'OPEN',
      openingCash: Number(data.openingCash) || 0,
      cashSales: 0,
      cardSales: 0,
      totalSales: 0,
      orderCount: 0,
      expectedCash: Number(data.openingCash) || 0,
      createdAt: new Date().toISOString(),
    };

    setCurrentShift(newShift);
    toast.success(`Đã mở ca làm việc mới #${newShift.shiftCode}`);
  };

  const closeShift = (data: CloseShiftRequest) => {
    if (!currentShift) return;

    const actual = Number(data.actualCash) || 0;
    const diff = actual - currentShift.expectedCash;

    const closed: WorkShift = {
      ...currentShift,
      endTime: new Date().toISOString(),
      status: 'CLOSED',
      actualCash: actual,
      difference: diff,
      handoverNote: data.handoverNote || '',
    };

    setHistory((prev) => [closed, ...prev]);
    setCurrentShift(null);
    toast.success(`Đã chốt két và đóng ca làm việc thành công`);
  };

  return {
    currentShift,
    history,
    openShift,
    closeShift,
  };
}
