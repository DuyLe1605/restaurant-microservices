export interface Expense {
  id: number;
  expenseType: string;
  amount: number;
  description?: string;
  createdBy?: number;
  expenseDate: string;
  createdAt?: string;
}
