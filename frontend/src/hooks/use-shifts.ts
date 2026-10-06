import * as React from 'react';
import { WorkShift, OpenShiftRequest, CloseShiftRequest } from '@/types/shift';
import { toast } from 'sonner';

const CURRENT_SHIFT_KEY = 'gourmet_haven_active_shift';
const SHIFT_HISTORY_KEY = 'gourmet_haven_shift_history';

export function useShifts() {
  const [currentShift, setCurrentShift] = React.useState<WorkShift | null>(() => {
    try {
      const stored = localStorage.getItem(CURRENT_SHIFT_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [history, setHistory] = React.useState<WorkShift[]>(() => {
    try {
      const stored = localStorage.getItem(SHIFT_HISTORY_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
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
