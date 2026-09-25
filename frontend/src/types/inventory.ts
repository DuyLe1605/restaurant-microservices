export type ReceiptStatus = 'PENDING' | 'COMPLETED';
export type IssueType = 'SALE' | 'MANUAL' | 'WASTE';
export type IssueStatus = 'PENDING' | 'COMPLETED';

export interface ReceiptDetail {
  id?: number;
  ingredientId: number;
  ingredientName?: string;
  unit?: string;
  qty: number;
  unitPrice: number;
}

export interface InventoryReceipt {
  id: number;
  createdBy?: number;
  supplier?: string;
  receiptDate: string;
  status: ReceiptStatus;
  note?: string;
  totalAmount: number;
  items: ReceiptDetail[];
  createdAt?: string;
}

export interface IssueDetail {
  id?: number;
  ingredientId: number;
  ingredientName?: string;
  unit?: string;
  qty: number;
}

export interface InventoryIssue {
  id: number;
  createdBy?: number;
  issueType: IssueType;
  issueDate: string;
  status: IssueStatus;
  note?: string;
  items: IssueDetail[];
  createdAt?: string;
}

export interface StockAdjustment {
  id: number;
  ingredientId: number;
  oldQty: number;
  newQty: number;
  adjustDate: string;
  reason?: string;
  note?: string;
  adjustedBy?: number;
  createdAt?: string;
}
