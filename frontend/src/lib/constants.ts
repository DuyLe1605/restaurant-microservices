export const APP_NAME = "Gourmet Haven";
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

export const USER_ROLES = {
  ADMIN: 'ADMIN',
  MANAGER: 'MANAGER',
  USER: 'USER',
} as const;

export const ORDER_STATUSES = {
  OPEN: 'OPEN',
  SERVED: 'SERVED',
  PAID: 'PAID',
  CANCEL: 'CANCEL',
} as const;

export const TABLE_STATUSES = {
  FREE: 'FREE',
  OCCUPIED: 'OCCUPIED',
  RESERVED: 'RESERVED',
} as const;

export const RECEIPT_STATUSES = {
  PENDING: 'PENDING',
  COMPLETED: 'COMPLETED',
} as const;

export const STOCK_STATUS_LEVELS = {
  CRITICAL: 'CRITICAL',
  WARNING: 'WARNING',
  NORMAL: 'NORMAL',
} as const;

export const DEFAULT_PAGE_SIZE = 10;
