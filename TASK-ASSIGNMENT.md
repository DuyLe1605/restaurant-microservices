# 👥 PHÂN CÔNG DỰ ÁN - HỆ THỐNG QUẢN LÝ NHÀ HÀNG MICROSERVICES

## Thông Tin Nhóm

| STT | Họ và Tên | Email | Vai Trò | Tỷ Lệ Đóng Góp |
|:---:|-----------|-------|---------|:--------------:|
| 1 | **Lê Minh Duy** | leminhduy160505@gmail.com | Team Lead | 20% |
| 2 | **Phạm Chấn Hưng** | Hung08072005az@gmail.com | Backend Developer | 20% |
| 3 | **Nguyễn Mạnh Đức** | cimonwork@gmail.com | Frontend Developer | 20% |
| 4 | **Trần Đức Mạnh** | manhkun2005@gmail.com | Backend Developer | 20% |
| 5 | **Đàm Quang Sáng** | damquangsang2706@gmail.com | Frontend Developer | 20% |

---

## 📋 Phân Công Chi Tiết Từng Thành Viên & Vị Trí File Code

---

### 1. Lê Minh Duy — Team Lead (20%)

**Phụ trách:** Kiến trúc hệ thống, Infrastructure, Auth Service, Order Service, Table Service, Documentation

#### 🏗️ Infrastructure & Service Discovery
- Thiết lập cấu trúc dự án và quản lý phụ thuộc: [`backend/pom.xml`](backend/pom.xml), [`README.md`](README.md), [`DOCUMENTATION.md`](DOCUMENTATION.md)
- Service Discovery (Eureka Server): [`backend/service-discovery/src/main/java/com/restaurant/discovery/ServiceDiscoveryApplication.java`](backend/service-discovery/src/main/java/com/restaurant/discovery/ServiceDiscoveryApplication.java), [`backend/service-discovery/src/main/resources/application.yml`](backend/service-discovery/src/main/resources/application.yml), [`backend/service-discovery/Dockerfile`](backend/service-discovery/Dockerfile)
- API Gateway Setup: [`backend/api-gateway/src/main/java/com/restaurant/gateway/ApiGatewayApplication.java`](backend/api-gateway/src/main/java/com/restaurant/gateway/ApiGatewayApplication.java), [`backend/api-gateway/src/main/resources/application.yml`](backend/api-gateway/src/main/resources/application.yml), [`backend/api-gateway/Dockerfile`](backend/api-gateway/Dockerfile)
- Docker Compose & CSDL khởi tạo: [`backend/docker-compose.yml`](backend/docker-compose.yml), [`backend/init-all-databases.sql`](backend/init-all-databases.sql)

#### 🔐 Auth Service
- Cấu hình bảo mật & JWT: [`JwtService.java`](backend/auth-service/src/main/java/com/restaurant/auth/service/JwtService.java), [`JwtServiceImpl.java`](backend/auth-service/src/main/java/com/restaurant/auth/service/impl/JwtServiceImpl.java), [`SecurityConfig.java`](backend/auth-service/src/main/java/com/restaurant/auth/config/SecurityConfig.java)
- Entity & Repository: [`User.java`](backend/auth-service/src/main/java/com/restaurant/auth/entity/User.java), [`Role.java`](backend/auth-service/src/main/java/com/restaurant/auth/enums/Role.java), [`UserRepository.java`](backend/auth-service/src/main/java/com/restaurant/auth/repository/UserRepository.java)
- Service & Controller: [`AuthService.java`](backend/auth-service/src/main/java/com/restaurant/auth/service/AuthService.java), [`AuthServiceImpl.java`](backend/auth-service/src/main/java/com/restaurant/auth/service/impl/AuthServiceImpl.java), [`AuthController.java`](backend/auth-service/src/main/java/com/restaurant/auth/controller/AuthController.java)
- RabbitMQ Messaging: [`RabbitMQConfig.java`](backend/auth-service/src/main/java/com/restaurant/auth/config/RabbitMQConfig.java), [`UserEventPublisher.java`](backend/auth-service/src/main/java/com/restaurant/auth/messaging/UserEventPublisher.java), [`UserEventDto.java`](backend/auth-service/src/main/java/com/restaurant/auth/messaging/UserEventDto.java)
- DTOs & Config: [`AuthRequest.java`](backend/auth-service/src/main/java/com/restaurant/auth/dto/AuthRequest.java), [`AuthResponse.java`](backend/auth-service/src/main/java/com/restaurant/auth/dto/AuthResponse.java), [`DataInitializer.java`](backend/auth-service/src/main/java/com/restaurant/auth/config/DataInitializer.java), [`application.yml`](backend/auth-service/src/main/resources/application.yml)

#### 🍽️ Table Service
- Entity & Enums: [`RestaurantTable.java`](backend/table-service/src/main/java/com/restaurant/table/entity/RestaurantTable.java), [`Reservation.java`](backend/table-service/src/main/java/com/restaurant/table/entity/Reservation.java), [`TableStatus.java`](backend/table-service/src/main/java/com/restaurant/table/enums/TableStatus.java), [`ReservationStatus.java`](backend/table-service/src/main/java/com/restaurant/table/enums/ReservationStatus.java)
- Repository: [`RestaurantTableRepository.java`](backend/table-service/src/main/java/com/restaurant/table/repository/RestaurantTableRepository.java), [`ReservationRepository.java`](backend/table-service/src/main/java/com/restaurant/table/repository/ReservationRepository.java)
- Service Layer: [`TableService.java`](backend/table-service/src/main/java/com/restaurant/table/service/TableService.java), [`TableServiceImpl.java`](backend/table-service/src/main/java/com/restaurant/table/service/impl/TableServiceImpl.java), [`ReservationService.java`](backend/table-service/src/main/java/com/restaurant/table/service/ReservationService.java), [`ReservationServiceImpl.java`](backend/table-service/src/main/java/com/restaurant/table/service/impl/ReservationServiceImpl.java), [`QrService.java`](backend/table-service/src/main/java/com/restaurant/table/service/QrService.java), [`QrServiceImpl.java`](backend/table-service/src/main/java/com/restaurant/table/service/impl/QrServiceImpl.java)
- Controllers: [`TableController.java`](backend/table-service/src/main/java/com/restaurant/table/controller/TableController.java), [`ReservationController.java`](backend/table-service/src/main/java/com/restaurant/table/controller/ReservationController.java), [`QrController.java`](backend/table-service/src/main/java/com/restaurant/table/controller/QrController.java)
- DTOs & Exceptions: [`TableRequest.java`](backend/table-service/src/main/java/com/restaurant/table/dto/TableRequest.java), [`TableResponse.java`](backend/table-service/src/main/java/com/restaurant/table/dto/TableResponse.java), [`ReservationRequest.java`](backend/table-service/src/main/java/com/restaurant/table/dto/ReservationRequest.java), [`ReservationResponse.java`](backend/table-service/src/main/java/com/restaurant/table/dto/ReservationResponse.java), [`QrTokenResponse.java`](backend/table-service/src/main/java/com/restaurant/table/dto/QrTokenResponse.java), [`GlobalExceptionHandler.java`](backend/table-service/src/main/java/com/restaurant/table/exception/GlobalExceptionHandler.java)

#### 🛒 Order Service
- Entity & Enums: [`SaleOrder.java`](backend/order-service/src/main/java/com/restaurant/order/entity/SaleOrder.java), [`SaleOrderDetail.java`](backend/order-service/src/main/java/com/restaurant/order/entity/SaleOrderDetail.java), [`Expense.java`](backend/order-service/src/main/java/com/restaurant/order/entity/Expense.java), [`OrderStatus.java`](backend/order-service/src/main/java/com/restaurant/order/enums/OrderStatus.java), [`OrderDetailStatus.java`](backend/order-service/src/main/java/com/restaurant/order/enums/OrderDetailStatus.java), [`OrderSource.java`](backend/order-service/src/main/java/com/restaurant/order/enums/OrderSource.java)
- Repository: [`SaleOrderRepository.java`](backend/order-service/src/main/java/com/restaurant/order/repository/SaleOrderRepository.java), [`SaleOrderDetailRepository.java`](backend/order-service/src/main/java/com/restaurant/order/repository/SaleOrderDetailRepository.java), [`ExpenseRepository.java`](backend/order-service/src/main/java/com/restaurant/order/repository/ExpenseRepository.java)
- OpenFeign Clients: [`TableClient.java`](backend/order-service/src/main/java/com/restaurant/order/client/TableClient.java), [`MenuClient.java`](backend/order-service/src/main/java/com/restaurant/order/client/MenuClient.java), [`CheckInventoryDto.java`](backend/order-service/src/main/java/com/restaurant/order/client/CheckInventoryDto.java), [`MenuItemDto.java`](backend/order-service/src/main/java/com/restaurant/order/client/MenuItemDto.java), [`TableDto.java`](backend/order-service/src/main/java/com/restaurant/order/client/TableDto.java)
- Service Layer: [`OrderService.java`](backend/order-service/src/main/java/com/restaurant/order/service/OrderService.java), [`OrderServiceImpl.java`](backend/order-service/src/main/java/com/restaurant/order/service/impl/OrderServiceImpl.java), [`PublicOrderService.java`](backend/order-service/src/main/java/com/restaurant/order/service/PublicOrderService.java), [`PublicOrderServiceImpl.java`](backend/order-service/src/main/java/com/restaurant/order/service/impl/PublicOrderServiceImpl.java), [`ExpenseService.java`](backend/order-service/src/main/java/com/restaurant/order/service/ExpenseService.java), [`ExpenseServiceImpl.java`](backend/order-service/src/main/java/com/restaurant/order/service/impl/ExpenseServiceImpl.java)
- Controllers: [`OrderController.java`](backend/order-service/src/main/java/com/restaurant/order/controller/OrderController.java), [`PublicOrderController.java`](backend/order-service/src/main/java/com/restaurant/order/controller/PublicOrderController.java), [`ExpenseController.java`](backend/order-service/src/main/java/com/restaurant/order/controller/ExpenseController.java)
- RabbitMQ Messaging: [`OrderEventPublisher.java`](backend/order-service/src/main/java/com/restaurant/order/messaging/OrderEventPublisher.java), [`OrderPaidEventDto.java`](backend/order-service/src/main/java/com/restaurant/order/dto/OrderPaidEventDto.java), [`OrderCompletedEventDto.java`](backend/order-service/src/main/java/com/restaurant/order/dto/OrderCompletedEventDto.java), [`ExpenseCreatedEventDto.java`](backend/order-service/src/main/java/com/restaurant/order/dto/ExpenseCreatedEventDto.java)

#### 🛡️ Phase 12 Hardening & Documentation
- Xử lý Transaction Rollback fail-fast khi chiếm bàn thất bại: [`OrderServiceImpl.java`](backend/order-service/src/main/java/com/restaurant/order/service/impl/OrderServiceImpl.java)
- Cấu hình OpenFeign timeouts cho Order Service: [`application.yml`](backend/order-service/src/main/resources/application.yml)
- Bổ sung `version` column phục vụ khóa lạc quan trong DB init: [`init-all-databases.sql`](backend/init-all-databases.sql)
- Toàn bộ tài liệu Backend: [`backend/DOCUMENTATION.md`](backend/DOCUMENTATION.md), [`backend/IMPLEMENTATION.md`](backend/IMPLEMENTATION.md), [`backend/TRACKING.md`](backend/TRACKING.md)

---

### 2. Phạm Chấn Hưng — Backend Developer (20%)

**Phụ trách:** API Gateway Security, User Service, Report Service, Frontend Table/Reservation

#### 🚪 API Gateway Security
- Bộ lọc xác thực JWT tại Gateway: [`AuthenticationFilter.java`](backend/api-gateway/src/main/java/com/restaurant/gateway/filter/AuthenticationFilter.java)
- Tiện ích giải mã và kiểm tra JWT token: [`JwtUtil.java`](backend/api-gateway/src/main/java/com/restaurant/gateway/config/JwtUtil.java)

#### 👤 User Service
- Entity & Enums: [`User.java`](backend/user-service/src/main/java/com/restaurant/user/entity/User.java), [`Role.java`](backend/user-service/src/main/java/com/restaurant/user/enums/Role.java)
- Cấu hình & Bảo mật: [`SecurityConfig.java`](backend/user-service/src/main/java/com/restaurant/user/config/SecurityConfig.java), [`RabbitMQConfig.java`](backend/user-service/src/main/java/com/restaurant/user/config/RabbitMQConfig.java), [`DataInitializer.java`](backend/user-service/src/main/java/com/restaurant/user/config/DataInitializer.java), [`application.yml`](backend/user-service/src/main/resources/application.yml)
- Repository: [`UserRepository.java`](backend/user-service/src/main/java/com/restaurant/user/repository/UserRepository.java)
- Service & Controller: [`UserService.java`](backend/user-service/src/main/java/com/restaurant/user/service/UserService.java), [`UserServiceImpl.java`](backend/user-service/src/main/java/com/restaurant/user/service/impl/UserServiceImpl.java), [`UserController.java`](backend/user-service/src/main/java/com/restaurant/user/controller/UserController.java)
- Messaging Event: [`UserEventConsumer.java`](backend/user-service/src/main/java/com/restaurant/user/messaging/UserEventConsumer.java), [`UserEventPublisher.java`](backend/user-service/src/main/java/com/restaurant/user/messaging/UserEventPublisher.java), [`UserEventDto.java`](backend/user-service/src/main/java/com/restaurant/user/messaging/UserEventDto.java)
- DTOs & Exceptions: [`UserCreateRequest.java`](backend/user-service/src/main/java/com/restaurant/user/dto/UserCreateRequest.java), [`UserUpdateRequest.java`](backend/user-service/src/main/java/com/restaurant/user/dto/UserUpdateRequest.java), [`UserResponse.java`](backend/user-service/src/main/java/com/restaurant/user/dto/UserResponse.java), [`ChangePasswordRequest.java`](backend/user-service/src/main/java/com/restaurant/user/dto/ChangePasswordRequest.java)

#### 📊 Report Service
- Entity: [`ReportOrderSummary.java`](backend/report-service/src/main/java/com/restaurant/report/entity/ReportOrderSummary.java), [`ReportExpenseSummary.java`](backend/report-service/src/main/java/com/restaurant/report/entity/ReportExpenseSummary.java), [`ReportStockSnapshot.java`](backend/report-service/src/main/java/com/restaurant/report/entity/ReportStockSnapshot.java)
- Repository: [`ReportOrderSummaryRepository.java`](backend/report-service/src/main/java/com/restaurant/report/repository/ReportOrderSummaryRepository.java), [`ReportExpenseSummaryRepository.java`](backend/report-service/src/main/java/com/restaurant/report/repository/ReportExpenseSummaryRepository.java), [`ReportStockSnapshotRepository.java`](backend/report-service/src/main/java/com/restaurant/report/repository/ReportStockSnapshotRepository.java)
- Service & Controllers: [`ReportService.java`](backend/report-service/src/main/java/com/restaurant/report/service/ReportService.java), [`ReportServiceImpl.java`](backend/report-service/src/main/java/com/restaurant/report/service/impl/ReportServiceImpl.java), [`ReportController.java`](backend/report-service/src/main/java/com/restaurant/report/controller/ReportController.java), [`DashboardController.java`](backend/report-service/src/main/java/com/restaurant/report/controller/DashboardController.java)
- Event Consumer (RabbitMQ): [`ReportEventConsumer.java`](backend/report-service/src/main/java/com/restaurant/report/messaging/ReportEventConsumer.java)
- DTOs & Config: [`DailyRevenueDto.java`](backend/report-service/src/main/java/com/restaurant/report/dto/DailyRevenueDto.java), [`DashboardResponse.java`](backend/report-service/src/main/java/com/restaurant/report/dto/DashboardResponse.java), [`RevenueReportResponse.java`](backend/report-service/src/main/java/com/restaurant/report/dto/RevenueReportResponse.java), [`RabbitMQConfig.java`](backend/report-service/src/main/java/com/restaurant/report/config/RabbitMQConfig.java)

#### 🖥️ Frontend Table & Reservation
- Types & API: [`frontend/src/types/table.ts`](frontend/src/types/table.ts), [`frontend/src/api/table.api.ts`](frontend/src/api/table.api.ts)
- Hooks: [`frontend/src/hooks/use-tables.ts`](frontend/src/hooks/use-tables.ts), [`frontend/src/hooks/use-reservations.ts`](frontend/src/hooks/use-reservations.ts)
- Giao diện: [`frontend/src/pages/table/table-list.tsx`](frontend/src/pages/table/table-list.tsx), [`frontend/src/pages/reservation/reservation-list.tsx`](frontend/src/pages/reservation/reservation-list.tsx), [`frontend/src/pages/qr/qr-manage.tsx`](frontend/src/pages/qr/qr-manage.tsx)

#### 🛡️ Phase 12 Hardening
- Khử độc header `X-User-Id`, `X-User-Roles` giả mạo từ client tại Gateway: [`AuthenticationFilter.java`](backend/api-gateway/src/main/java/com/restaurant/gateway/filter/AuthenticationFilter.java)
- Kiểm tra cờ active, chống IDOR và thêm endpoint `/me`: [`UserController.java`](backend/user-service/src/main/java/com/restaurant/user/controller/UserController.java), [`UserServiceImpl.java`](backend/user-service/src/main/java/com/restaurant/user/service/impl/UserServiceImpl.java)
- Idempotent upsert cho bản ghi stock snapshot: [`ReportStockSnapshotRepository.java`](backend/report-service/src/main/java/com/restaurant/report/repository/ReportStockSnapshotRepository.java), [`ReportEventConsumer.java`](backend/report-service/src/main/java/com/restaurant/report/messaging/ReportEventConsumer.java)

---

### 3. Nguyễn Mạnh Đức — Frontend Developer (20%)

**Phụ trách:** Frontend Core Setup, UI Components, Auth Pages, Layout, User Management, Dashboard

#### ⚙️ Frontend Core Init & Setup
- Thiết lập cấu hình Vite, React, TypeScript, Tailwind, PostCSS: [`frontend/package.json`](frontend/package.json), [`frontend/vite.config.ts`](frontend/vite.config.ts), [`frontend/tailwind.config.js`](frontend/tailwind.config.js), [`frontend/postcss.config.js`](frontend/postcss.config.js), [`frontend/tsconfig.json`](frontend/tsconfig.json)
- App Entry point & CSS: [`frontend/src/main.tsx`](frontend/src/main.tsx), [`frontend/src/App.tsx`](frontend/src/App.tsx), [`frontend/src/index.css`](frontend/src/index.css)
- HTTP Client Axios Instance: [`frontend/src/api/axios-instance.ts`](frontend/src/api/axios-instance.ts)

#### 🧩 Shared UI & Layout Components
- Layout & Navigation: [`app-layout.tsx`](frontend/src/components/layout/app-layout.tsx), [`app-header.tsx`](frontend/src/components/layout/app-header.tsx), [`app-sidebar.tsx`](frontend/src/components/layout/app-sidebar.tsx), [`protected-route.tsx`](frontend/src/components/layout/protected-route.tsx)
- Shared Components: [`confirm-dialog.tsx`](frontend/src/components/shared/confirm-dialog.tsx), [`empty-state.tsx`](frontend/src/components/shared/empty-state.tsx), [`error-boundary.tsx`](frontend/src/components/shared/error-boundary.tsx), [`loading-spinner.tsx`](frontend/src/components/shared/loading-spinner.tsx), [`page-header.tsx`](frontend/src/components/shared/page-header.tsx), [`stats-card.tsx`](frontend/src/components/shared/stats-card.tsx), [`status-badge.tsx`](frontend/src/components/shared/status-badge.tsx)
- UI Library (shadcn/ui): [`button.tsx`](frontend/src/components/ui/button.tsx), [`input.tsx`](frontend/src/components/ui/input.tsx), [`card.tsx`](frontend/src/components/ui/card.tsx), [`dialog.tsx`](frontend/src/components/ui/dialog.tsx), [`select.tsx`](frontend/src/components/ui/select.tsx), [`table.tsx`](frontend/src/components/ui/table.tsx), [`badge.tsx`](frontend/src/components/ui/badge.tsx)

#### 🔐 Auth Frontend & User Management
- Types & Zustand Store: [`frontend/src/types/auth.ts`](frontend/src/types/auth.ts), [`frontend/src/stores/auth-store.ts`](frontend/src/stores/auth-store.ts)
- API Client & Hooks: [`frontend/src/api/auth.api.ts`](frontend/src/api/auth.api.ts), [`frontend/src/hooks/use-auth.ts`](frontend/src/hooks/use-auth.ts)
- Trang đăng nhập & đăng ký: [`frontend/src/pages/auth/login.tsx`](frontend/src/pages/auth/login.tsx), [`frontend/src/pages/auth/register.tsx`](frontend/src/pages/auth/register.tsx)
- Quản lý người dùng: [`frontend/src/api/user.api.ts`](frontend/src/api/user.api.ts), [`frontend/src/hooks/use-users.ts`](frontend/src/hooks/use-users.ts), [`frontend/src/pages/user/user-list.tsx`](frontend/src/pages/user/user-list.tsx)
- Trang Dashboard & Ca làm việc: [`frontend/src/pages/dashboard.tsx`](frontend/src/pages/dashboard.tsx), [`frontend/src/pages/shift/shift-manage.tsx`](frontend/src/pages/shift/shift-manage.tsx), [`frontend/src/pages/not-found.tsx`](frontend/src/pages/not-found.tsx)
- Tiện ích xử lý dữ liệu: [`format-currency.ts`](frontend/src/lib/format-currency.ts), [`format-date.ts`](frontend/src/lib/format-date.ts), [`constants.ts`](frontend/src/lib/constants.ts)

#### 🛡️ Phase 12 Hardening
- Cấu hình khóa lạc quan `@Version` cho thực thể bàn: [`RestaurantTable.java`](backend/table-service/src/main/java/com/restaurant/table/entity/RestaurantTable.java)
- Xử lý xung đột `ObjectOptimisticLockingFailureException` và trả về mã lỗi 409: [`GlobalExceptionHandler.java`](backend/table-service/src/main/java/com/restaurant/table/exception/GlobalExceptionHandler.java), [`TableServiceImpl.java`](backend/table-service/src/main/java/com/restaurant/table/service/impl/TableServiceImpl.java)
- Tài liệu Frontend: [`frontend/DOCUMENTATION.md`](frontend/DOCUMENTATION.md), [`frontend/IMPLEMENTATION.md`](frontend/IMPLEMENTATION.md), [`frontend/TRACKING.md`](frontend/TRACKING.md)

---

### 4. Trần Đức Mạnh — Backend Developer (20%)

**Phụ trách:** Menu Service, Inventory Service, Backend Server

#### 📜 Menu Service
- Entity & Enums: [`MenuItem.java`](backend/menu-service/src/main/java/com/restaurant/menu/entity/MenuItem.java), [`Recipe.java`](backend/menu-service/src/main/java/com/restaurant/menu/entity/Recipe.java)
- Repository: [`MenuItemRepository.java`](backend/menu-service/src/main/java/com/restaurant/menu/repository/MenuItemRepository.java), [`RecipeRepository.java`](backend/menu-service/src/main/java/com/restaurant/menu/repository/RecipeRepository.java)
- OpenFeign Client sang Inventory Service: [`InventoryClient.java`](backend/menu-service/src/main/java/com/restaurant/menu/client/InventoryClient.java)
- Service Layer: [`MenuItemService.java`](backend/menu-service/src/main/java/com/restaurant/menu/service/MenuItemService.java), [`MenuItemServiceImpl.java`](backend/menu-service/src/main/java/com/restaurant/menu/service/impl/MenuItemServiceImpl.java), [`RecipeService.java`](backend/menu-service/src/main/java/com/restaurant/menu/service/RecipeService.java), [`RecipeServiceImpl.java`](backend/menu-service/src/main/java/com/restaurant/menu/service/impl/RecipeServiceImpl.java)
- Controllers: [`MenuItemController.java`](backend/menu-service/src/main/java/com/restaurant/menu/controller/MenuItemController.java), [`RecipeController.java`](backend/menu-service/src/main/java/com/restaurant/menu/controller/RecipeController.java)
- DTOs & Config: [`MenuItemRequest.java`](backend/menu-service/src/main/java/com/restaurant/menu/dto/MenuItemRequest.java), [`MenuItemResponse.java`](backend/menu-service/src/main/java/com/restaurant/menu/dto/MenuItemResponse.java), [`RecipeRequest.java`](backend/menu-service/src/main/java/com/restaurant/menu/dto/RecipeRequest.java), [`RecipeResponse.java`](backend/menu-service/src/main/java/com/restaurant/menu/dto/RecipeResponse.java), [`CheckInventoryRequest.java`](backend/menu-service/src/main/java/com/restaurant/menu/dto/CheckInventoryRequest.java), [`CheckInventoryResponse.java`](backend/menu-service/src/main/java/com/restaurant/menu/dto/CheckInventoryResponse.java)

#### 📦 Inventory Service
- Entity: [`Ingredient.java`](backend/inventory-service/src/main/java/com/restaurant/inventory/entity/Ingredient.java), [`IngredientCategory.java`](backend/inventory-service/src/main/java/com/restaurant/inventory/entity/IngredientCategory.java), [`InventoryReceipt.java`](backend/inventory-service/src/main/java/com/restaurant/inventory/entity/InventoryReceipt.java), [`InventoryReceiptDetail.java`](backend/inventory-service/src/main/java/com/restaurant/inventory/entity/InventoryReceiptDetail.java), [`InventoryIssue.java`](backend/inventory-service/src/main/java/com/restaurant/inventory/entity/InventoryIssue.java), [`InventoryIssueDetail.java`](backend/inventory-service/src/main/java/com/restaurant/inventory/entity/InventoryIssueDetail.java), [`StockAdjustment.java`](backend/inventory-service/src/main/java/com/restaurant/inventory/entity/StockAdjustment.java), [`InventoryLog.java`](backend/inventory-service/src/main/java/com/restaurant/inventory/entity/InventoryLog.java)
- Repository: [`IngredientRepository.java`](backend/inventory-service/src/main/java/com/restaurant/inventory/repository/IngredientRepository.java), [`InventoryReceiptRepository.java`](backend/inventory-service/src/main/java/com/restaurant/inventory/repository/InventoryReceiptRepository.java), [`InventoryIssueRepository.java`](backend/inventory-service/src/main/java/com/restaurant/inventory/repository/InventoryIssueRepository.java), [`InventoryLogRepository.java`](backend/inventory-service/src/main/java/com/restaurant/inventory/repository/InventoryLogRepository.java)
- Service Layer: [`IngredientService.java`](backend/inventory-service/src/main/java/com/restaurant/inventory/service/IngredientService.java), [`IngredientServiceImpl.java`](backend/inventory-service/src/main/java/com/restaurant/inventory/service/impl/IngredientServiceImpl.java), [`InventoryReceiptService.java`](backend/inventory-service/src/main/java/com/restaurant/inventory/service/InventoryReceiptService.java), [`InventoryIssueService.java`](backend/inventory-service/src/main/java/com/restaurant/inventory/service/InventoryIssueService.java), [`StockAdjustmentService.java`](backend/inventory-service/src/main/java/com/restaurant/inventory/service/StockAdjustmentService.java)
- RabbitMQ Messaging: [`InventoryEventPublisher.java`](backend/inventory-service/src/main/java/com/restaurant/inventory/messaging/InventoryEventPublisher.java), [`OrderCompletedConsumer.java`](backend/inventory-service/src/main/java/com/restaurant/inventory/messaging/OrderCompletedConsumer.java)

#### 🖥️ Backend Server
- Khởi tạo Express.js mock server: [`backend-server/package.json`](backend-server/package.json), [`backend-server/package-lock.json`](backend-server/package-lock.json)

#### 🛡️ Phase 12 Hardening
- Idempotent consumer khử trùng lặp thông điệp bằng `existsByOrderTag`: [`OrderCompletedConsumer.java`](backend/inventory-service/src/main/java/com/restaurant/inventory/messaging/OrderCompletedConsumer.java)
- Cấu hình OpenFeign timeouts cho Menu và Inventory Service: [`application.yml`](backend/menu-service/src/main/resources/application.yml), [`application.yml`](backend/inventory-service/src/main/resources/application.yml)

---

### 5. Đàm Quang Sáng — Frontend Developer (20%)

**Phụ trách:** Frontend Menu, Inventory, Order, Report Pages, Mock Data & Tài Liệu Phản Biện

#### 🥗 Menu & Ingredient Pages
- Types: [`frontend/src/types/menu.ts`](frontend/src/types/menu.ts), [`frontend/src/types/ingredient.ts`](frontend/src/types/ingredient.ts)
- API Client: [`frontend/src/api/menu.api.ts`](frontend/src/api/menu.api.ts), [`frontend/src/api/ingredient.api.ts`](frontend/src/api/ingredient.api.ts)
- Hooks: [`frontend/src/hooks/use-menu.ts`](frontend/src/hooks/use-menu.ts), [`frontend/src/hooks/use-ingredients.ts`](frontend/src/hooks/use-ingredients.ts)
- Giao diện: [`frontend/src/pages/menu/menu-list.tsx`](frontend/src/pages/menu/menu-list.tsx), [`frontend/src/pages/recipe/recipe-manage.tsx`](frontend/src/pages/recipe/recipe-manage.tsx), [`frontend/src/pages/ingredient/ingredient-list.tsx`](frontend/src/pages/ingredient/ingredient-list.tsx)

#### 📦 Inventory Pages
- Types & API: [`frontend/src/types/inventory.ts`](frontend/src/types/inventory.ts), [`frontend/src/api/inventory.api.ts`](frontend/src/api/inventory.api.ts)
- Hooks: [`frontend/src/hooks/use-inventory.ts`](frontend/src/hooks/use-inventory.ts)
- Giao diện: [`frontend/src/pages/inventory/receipt-list.tsx`](frontend/src/pages/inventory/receipt-list.tsx), [`frontend/src/pages/inventory/issue-list.tsx`](frontend/src/pages/inventory/issue-list.tsx)

#### 🛒 Order & Kitchen Pages
- Types: [`frontend/src/types/order.ts`](frontend/src/types/order.ts), [`frontend/src/types/expense.ts`](frontend/src/types/expense.ts)
- API Client: [`frontend/src/api/order.api.ts`](frontend/src/api/order.api.ts), [`frontend/src/api/public-order.api.ts`](frontend/src/api/public-order.api.ts), [`frontend/src/api/expense.api.ts`](frontend/src/api/expense.api.ts)
- Hooks: [`frontend/src/hooks/use-orders.ts`](frontend/src/hooks/use-orders.ts), [`frontend/src/hooks/use-kitchen.ts`](frontend/src/hooks/use-kitchen.ts), [`frontend/src/hooks/use-expenses.ts`](frontend/src/hooks/use-expenses.ts)
- Giao diện:
  - Danh sách & Tạo đơn hàng: [`frontend/src/pages/order/order-list.tsx`](frontend/src/pages/order/order-list.tsx), [`frontend/src/pages/order/order-create.tsx`](frontend/src/pages/order/order-create.tsx)
  - Xem và in hóa đơn: [`frontend/src/pages/order/invoice-view.tsx`](frontend/src/pages/order/invoice-view.tsx)
  - Màn hình bếp KDS: [`frontend/src/pages/kitchen/kitchen-display.tsx`](frontend/src/pages/kitchen/kitchen-display.tsx)
  - Khách tự quét mã đặt món: [`frontend/src/pages/public/public-order.tsx`](frontend/src/pages/public/public-order.tsx)
  - Quản lý chi phí: [`frontend/src/pages/expense/expense-list.tsx`](frontend/src/pages/expense/expense-list.tsx)

#### 📈 Report Pages & Mock Data
- Types & API: [`frontend/src/types/report.ts`](frontend/src/types/report.ts), [`frontend/src/api/report.api.ts`](frontend/src/api/report.api.ts)
- Hooks: [`frontend/src/hooks/use-reports.ts`](frontend/src/hooks/use-reports.ts)
- Giao diện báo cáo: [`frontend/src/pages/report/revenue-report.tsx`](frontend/src/pages/report/revenue-report.tsx), [`frontend/src/pages/report/stock-report.tsx`](frontend/src/pages/report/stock-report.tsx)
- Mock Data phát triển: [`frontend/src/api/mock-data.ts`](frontend/src/api/mock-data.ts)

#### 🛡️ Phase 12 Hardening & Tài Liệu Phản Biện Đồ Án
- Script trích xuất bộ câu hỏi phản biện SOA: [`backend-server/generate_defense_doc.js`](backend-server/generate_defense_doc.js)
- Tài liệu Word bảo vệ đồ án: [`GIAI_DAP_BAO_VE_MON_HOC_SOA_MICROSERVICES.docx`](GIAI_DAP_BAO_VE_MON_HOC_SOA_MICROSERVICES.docx) (Trả lời 10 câu hỏi cốt lõi về Microservices, Data Consistency, Idempotency, Gateway Security, Distributed Tracing)

---

## 📅 Timeline Phát Triển

| Giai đoạn | Thời gian | Nội dung | Người thực hiện |
|-----------|-----------|----------|-----------------|
| Phase 1 | 16-17/09 | Infrastructure (Eureka, Gateway, Docker) | Duy |
| Phase 2 | 18-19/09 | Auth Service + Frontend Init | Duy, Hưng, Đức |
| Phase 3 | 19-20/09 | User Service | Hưng |
| Phase 4 | 20-21/09 | Frontend Auth + Layout | Đức |
| Phase 5 | 22-23/09 | Menu Service + FE Menu | Mạnh, Sáng |
| Phase 6 | 23-25/09 | Inventory Service + FE Inventory | Mạnh, Sáng |
| Phase 7 | 25-26/09 | Table Service + FE Table | Duy, Hưng |
| Phase 8 | 27-29/09 | Order Service + FE Order | Duy, Sáng |
| Phase 9 | 29-30/09 | Report Service + FE Report | Hưng, Sáng |
| Phase 10 | 01-02/10 | User Management, Dashboard, Utilities | Đức, Sáng |
| Phase 11 | 02-04/10 | Documentation + Integration | Duy, Đức, Mạnh |
| Phase 12 | 05-06/10 | Security Hardening, Idempotency, Concurrency & Defense Q&A Doc | Duy, Hưng, Mạnh, Đức, Sáng |

---

## 🔄 Hướng Dẫn Cập Nhật Tính Năng Mới

Khi cần thêm tính năng mới, tham chiếu bảng phân công ở trên để xác định ai phụ trách module nào:

1. **Tính năng Backend mới:**
   - Auth/Infrastructure → **Lê Minh Duy**
   - User Service → **Phạm Chấn Hưng**
   - Menu/Inventory → **Trần Đức Mạnh**
   - Order/Table → **Lê Minh Duy**
   - Report → **Phạm Chấn Hưng**

2. **Tính năng Frontend mới:**
   - Layout/Auth/Dashboard/User → **Nguyễn Mạnh Đức**
   - Menu/Inventory/Order/Report Pages → **Đàm Quang Sáng**
   - Table/Reservation → **Phạm Chấn Hưng**

3. **Quy ước commit message:**
   - `feat(module): description` — Tính năng mới
   - `fix(module): description` — Sửa lỗi
   - `docs: description` — Tài liệu
   - `chore: description` — Cấu hình, cleanup
   - `refactor(module): description` — Tái cấu trúc
