import { NotFoundPage } from '@/pages/not-found';
import * as React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/app-layout';
import { ProtectedRoute } from '@/components/layout/protected-route';

// Pages
import { LoginPage } from '@/pages/auth/login';
import { RegisterPage } from '@/pages/auth/register';
import { DashboardPage } from '@/pages/dashboard';
import { MenuListPage } from '@/pages/menu/menu-list';
import { RecipeManagePage } from '@/pages/recipe/recipe-manage';
import { IngredientListPage } from '@/pages/ingredient/ingredient-list';
import { ReceiptListPage } from '@/pages/inventory/receipt-list';
import { IssueListPage } from '@/pages/inventory/issue-list';
import { TableListPage } from '@/pages/table/table-list';
import { ReservationListPage } from '@/pages/reservation/reservation-list';
import { QrManagePage } from '@/pages/qr/qr-manage';
import { OrderListPage } from '@/pages/order/order-list';
import { OrderCreatePage } from '@/pages/order/order-create';
import { InvoiceViewPage } from '@/pages/order/invoice-view';
import { ExpenseListPage } from '@/pages/expense/expense-list';
import { RevenueReportPage } from '@/pages/report/revenue-report';
import { StockReportPage } from '@/pages/report/stock-report';
import { UserListPage } from '@/pages/user/user-list';
import { PublicOrderPage } from '@/pages/public/public-order';
import { KitchenDisplayPage } from '@/pages/kitchen/kitchen-display';
import { ShiftManagePage } from '@/pages/shift/shift-manage';

export function App() {
  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/public/order" element={<PublicOrderPage />} />

      {/* Protected Layout Routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/orders" element={<OrderListPage />} />
          <Route path="/orders/new" element={<OrderCreatePage />} />
          <Route path="/orders/create" element={<OrderCreatePage />} />
          <Route path="/kitchen" element={<KitchenDisplayPage />} />
          <Route path="/shifts" element={<ShiftManagePage />} />
          <Route path="/orders/:id/invoice" element={<InvoiceViewPage />} />
          <Route path="/tables" element={<TableListPage />} />
          <Route path="/reservations" element={<ReservationListPage />} />
          <Route path="/menu" element={<MenuListPage />} />
          <Route path="/recipes" element={<RecipeManagePage />} />
          <Route path="/ingredients" element={<IngredientListPage />} />
          <Route path="/inventory/receipts" element={<ReceiptListPage />} />
          <Route path="/inventory/issues" element={<IssueListPage />} />
          <Route path="/qr" element={<QrManagePage />} />
          <Route path="/expenses" element={<ExpenseListPage />} />
          <Route path="/reports/revenue" element={<RevenueReportPage />} />
          <Route path="/reports/stock" element={<StockReportPage />} />
          <Route path="/users" element={<UserListPage />} />
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
