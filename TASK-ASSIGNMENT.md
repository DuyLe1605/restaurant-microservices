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
- [`backend/pom.xml`](backend/pom.xml): Khởi tạo Maven multi-module parent, khai báo phiên bản Spring Boot 3.x, Spring Cloud 2023, Lombok, MapStruct và quản lý dependency chung cho toàn bộ backend.
- [`ServiceDiscoveryApplication.java`](backend/service-discovery/src/main/java/com/restaurant/discovery/ServiceDiscoveryApplication.java) & [`application.yml`](backend/service-discovery/src/main/resources/application.yml): Thiết lập máy chủ Netflix Eureka Server cổng `8761`, tắt tự đăng ký chính nó (`register-with-eureka: false`), làm trung tâm định tuyến và theo dõi trạng thái sống chết của các microservices.
- [`ApiGatewayApplication.java`](backend/api-gateway/src/main/java/com/restaurant/gateway/ApiGatewayApplication.java) & [`application.yml`](backend/api-gateway/src/main/resources/application.yml): Cấu hình Spring Cloud Gateway cổng `8080`, định tuyến động qua Eureka (`discovery.locator.enabled: true`), ánh xạ các route `/api/auth/**`, `/api/orders/**`, `/api/tables/**`,... và tích hợp xác thực tập trung.
- [`docker-compose.yml`](backend/docker-compose.yml): Viết cấu hình Docker Compose cho toàn bộ 11 container (7 MySQL độc lập theo từng service, RabbitMQ, Service Discovery, Gateway và các Microservices) kèm healthcheck.
- [`init-all-databases.sql`](backend/init-all-databases.sql): Kịch bản SQL tạo mới toàn bộ cơ sở dữ liệu (`auth_db`, `user_db`, `menu_db`, `inventory_db`, `order_db`, `table_db`, `report_db`) cùng bảng biểu và dữ liệu mẫu khởi tạo.

#### 🔐 Auth Service (Cổng 8081)
- [`JwtService.java`](backend/auth-service/src/main/java/com/restaurant/auth/service/JwtService.java) & [`JwtServiceImpl.java`](backend/auth-service/src/main/java/com/restaurant/auth/service/impl/JwtServiceImpl.java): Xây dựng logic sinh Access Token, Refresh Token bằng HMAC-SHA256, kiểm tra tính hợp lệ và trích xuất `userId`, `username`, `roles` từ payload.
- [`SecurityConfig.java`](backend/auth-service/src/main/java/com/restaurant/auth/config/SecurityConfig.java): Cấu hình Spring Security, mã hóa mật khẩu bằng `BCryptPasswordEncoder`, vô hiệu hóa CSRF và thiết lập chế độ Stateless Session.
- [`User.java`](backend/auth-service/src/main/java/com/restaurant/auth/entity/User.java) & [`UserRepository.java`](backend/auth-service/src/main/java/com/restaurant/auth/repository/UserRepository.java): Thực thể lưu trữ thông tin đăng nhập, mật khẩu băm, vai trò (`Role`), trạng thái hoạt động cùng truy vấn tìm kiếm theo username/email.
- [`AuthService.java`](backend/auth-service/src/main/java/com/restaurant/auth/service/AuthService.java) & [`AuthServiceImpl.java`](backend/auth-service/src/main/java/com/restaurant/auth/service/impl/AuthServiceImpl.java): Xử lý nghiệp vụ đăng ký tài khoản mới, kiểm tra trùng lặp email/username, kiểm tra mật khẩu khi đăng nhập, cấp phát JWT và cơ chế nhớ đăng nhập (Remember-me).
- [`AuthController.java`](backend/auth-service/src/main/java/com/restaurant/auth/controller/AuthController.java): Cung cấp các REST API công khai: `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/refresh-token`.
- [`RabbitMQConfig.java`](backend/auth-service/src/main/java/com/restaurant/auth/config/RabbitMQConfig.java) & [`UserEventPublisher.java`](backend/auth-service/src/main/java/com/restaurant/auth/messaging/UserEventPublisher.java): Phát sự kiện `user.created` lên RabbitMQ Topic Exchange để đồng bộ tài khoản người dùng sang `user-service` theo hướng bất đồng bộ.

#### 🍽️ Table Service (Cổng 8086)
- [`RestaurantTable.java`](backend/table-service/src/main/java/com/restaurant/table/entity/RestaurantTable.java): Thực thể bàn ăn (số bàn, số ghế, khu vực, trạng thái `TableStatus`: `AVAILABLE`, `OCCUPIED`, `RESERVED`, `OUT_OF_SERVICE`).
- [`Reservation.java`](backend/table-service/src/main/java/com/restaurant/table/entity/Reservation.java): Thực thể đặt bàn trước (tên khách, SĐT, số khách, thời gian bắt đầu, trạng thái `PENDING`, `CONFIRMED`, `SEATED`, `CANCELLED`).
- [`TableServiceImpl.java`](backend/table-service/src/main/java/com/restaurant/table/service/impl/TableServiceImpl.java): Nghiệp vụ CRUD bàn ăn, cập nhật trạng thái bàn, kiểm tra bàn trống.
- [`ReservationServiceImpl.java`](backend/table-service/src/main/java/com/restaurant/table/service/impl/ReservationServiceImpl.java): Nghiệp vụ tiếp nhận đặt bàn, xác nhận đặt bàn, gán bàn cho khách đặt trước và hủy đặt bàn.
- [`QrServiceImpl.java`](backend/table-service/src/main/java/com/restaurant/table/service/impl/QrServiceImpl.java): Sinh mã định danh / token QR Code gắn liền với từng bàn để khách hàng quét mã tự gọi món.
- [`TableController.java`](backend/table-service/src/main/java/com/restaurant/table/controller/TableController.java), [`ReservationController.java`](backend/table-service/src/main/java/com/restaurant/table/controller/ReservationController.java), [`QrController.java`](backend/table-service/src/main/java/com/restaurant/table/controller/QrController.java): Cung cấp bộ API quản lý bàn, đặt bàn và sinh mã QR.

#### 🛒 Order Service (Cổng 8085)
- [`SaleOrder.java`](backend/order-service/src/main/java/com/restaurant/order/entity/SaleOrder.java) & [`SaleOrderDetail.java`](backend/order-service/src/main/java/com/restaurant/order/entity/SaleOrderDetail.java): Thực thể hóa đơn bán hàng, lưu mã đơn, bàn số, nguồn (`DINE_IN`, `TAKEAWAY`, `QR_SELF_ORDER`), trạng thái đơn (`PENDING`, `CONFIRMED`, `PREPARING`, `SERVED`, `PAID`, `CANCELLED`) và chi tiết món.
- [`Expense.java`](backend/order-service/src/main/java/com/restaurant/order/entity/Expense.java): Thực thể quản lý phiếu chi phí vận hành nhà hàng.
- [`TableClient.java`](backend/order-service/src/main/java/com/restaurant/order/client/TableClient.java) & [`MenuClient.java`](backend/order-service/src/main/java/com/restaurant/order/client/MenuClient.java): OpenFeign Clients gọi đồng bộ sang `table-service` để cập nhật trạng thái bàn sang `OCCUPIED` và sang `menu-service` để kiểm tra món ăn/giá tiền.
- [`OrderServiceImpl.java`](backend/order-service/src/main/java/com/restaurant/order/service/impl/OrderServiceImpl.java): Nghiệp vụ tạo đơn hàng, thêm món, cập nhật trạng thái đơn, thanh toán hóa đơn tính thuế VAT và giảm giá.
- [`PublicOrderServiceImpl.java`](backend/order-service/src/main/java/com/restaurant/order/service/impl/PublicOrderServiceImpl.java): Nghiệp vụ dành riêng cho khách tự quét QR đặt món trực tiếp tại bàn.
- [`OrderEventPublisher.java`](backend/order-service/src/main/java/com/restaurant/order/messaging/OrderEventPublisher.java): Bắn sự kiện `order.paid` và `order.completed` lên RabbitMQ để thông báo cho `inventory-service` trừ tồn kho và `report-service` cộng doanh thu.
- [`OrderController.java`](backend/order-service/src/main/java/com/restaurant/order/controller/OrderController.java), [`PublicOrderController.java`](backend/order-service/src/main/java/com/restaurant/order/controller/PublicOrderController.java), [`ExpenseController.java`](backend/order-service/src/main/java/com/restaurant/order/controller/ExpenseController.java): REST API quản trị đơn hàng, KDS bếp, khách tự gọi món và quản lý chi phí.

#### 🛡️ Phase 12 Hardening
- [`OrderServiceImpl.java`](backend/order-service/src/main/java/com/restaurant/order/service/impl/OrderServiceImpl.java): Thêm cơ chế fail-fast rollback bằng `@Transactional` khi gọi Feign chiếm bàn thất bại, bảo đảm tính toàn vẹn dữ liệu đơn hàng.
- [`application.yml`](backend/order-service/src/main/resources/application.yml): Cấu hình OpenFeign timeouts (`connectTimeout: 3000ms`, `readTimeout: 5000ms`) chống tắc nghẽn thread pool.
- [`init-all-databases.sql`](backend/init-all-databases.sql): Bổ sung cột `version` cho bảng `tables` để hỗ trợ cơ chế khóa lạc quan (Optimistic Locking).
- Tài liệu toàn diện: [`README.md`](README.md), [`DOCUMENTATION.md`](DOCUMENTATION.md), [`backend/DOCUMENTATION.md`](backend/DOCUMENTATION.md), [`backend/IMPLEMENTATION.md`](backend/IMPLEMENTATION.md), [`backend/TRACKING.md`](backend/TRACKING.md).

---

### 2. Phạm Chấn Hưng — Backend Developer (20%)

**Phụ trách:** API Gateway Security, User Service, Report Service, Frontend Table/Reservation

#### 🚪 API Gateway Security
- [`AuthenticationFilter.java`](backend/api-gateway/src/main/java/com/restaurant/gateway/filter/AuthenticationFilter.java): Global Filter tại Gateway chặn toàn bộ request đến các route nội bộ, bóc tách JWT từ header `Authorization: Bearer <token>`, kiểm tra tính hợp lệ và chuyển tiếp thông tin user qua header `X-User-Id`, `X-User-Roles`.
- [`JwtUtil.java`](backend/api-gateway/src/main/java/com/restaurant/gateway/config/JwtUtil.java): Lớp tiện ích kiểm tra chữ ký token và trích xuất Claims tại tầng Gateway.

#### 👤 User Service (Cổng 8082)
- [`User.java`](backend/user-service/src/main/java/com/restaurant/user/entity/User.java) & [`UserRepository.java`](backend/user-service/src/main/java/com/restaurant/user/repository/UserRepository.java): Thực thể thông tin nhân viên, họ tên, số điện thoại, email, vai trò (`ADMIN`, `MANAGER`, `STAFF`, `CHEF`) và trạng thái kích hoạt.
- [`UserServiceImpl.java`](backend/user-service/src/main/java/com/restaurant/user/service/impl/UserServiceImpl.java) & [`UserController.java`](backend/user-service/src/main/java/com/restaurant/user/controller/UserController.java): Nghiệp vụ CRUD nhân viên, phân trang, đổi mật khẩu, phân quyền và khóa/mở tài khoản nhân viên.
- [`UserEventConsumer.java`](backend/user-service/src/main/java/com/restaurant/user/messaging/UserEventConsumer.java): Consumer lắng nghe sự kiện `user.created` từ `auth-service` phát qua RabbitMQ để tự động khởi tạo hồ sơ nhân viên tương ứng.

#### 📊 Report Service (Cổng 8087)
- [`ReportOrderSummary.java`](backend/report-service/src/main/java/com/restaurant/report/entity/ReportOrderSummary.java), [`ReportExpenseSummary.java`](backend/report-service/src/main/java/com/restaurant/report/entity/ReportExpenseSummary.java), [`ReportStockSnapshot.java`](backend/report-service/src/main/java/com/restaurant/report/entity/ReportStockSnapshot.java): Các thực thể tổng hợp dữ liệu báo cáo doanh thu theo ngày/tháng, chi phí và tồn kho.
- [`ReportServiceImpl.java`](backend/report-service/src/main/java/com/restaurant/report/service/impl/ReportServiceImpl.java), [`ReportController.java`](backend/report-service/src/main/java/com/restaurant/report/controller/ReportController.java), [`DashboardController.java`](backend/report-service/src/main/java/com/restaurant/report/controller/DashboardController.java): Tổng hợp số liệu thống kê doanh thu, tỷ lệ bàn, đơn hàng phục vụ cho biểu đồ Dashboard.
- [`ReportEventConsumer.java`](backend/report-service/src/main/java/com/restaurant/report/messaging/ReportEventConsumer.java): Lắng nghe các event `order.paid`, `expense.created`, `stock.snapshot` từ RabbitMQ để cập nhật số liệu báo cáo tự động theo thời gian thực.

#### 🖥️ Frontend Table & Reservation
- [`frontend/src/api/table.api.ts`](frontend/src/api/table.api.ts) & [`table.ts`](frontend/src/types/table.ts): Định nghĩa kiểu dữ liệu TypeScript và gọi API bàn ăn, đặt bàn, sinh token QR.
- [`use-tables.ts`](frontend/src/hooks/use-tables.ts), [`use-reservations.ts`](frontend/src/hooks/use-reservations.ts): React Query hooks quản lý cache dữ liệu bàn ăn và lịch đặt trước.
- [`table-list.tsx`](frontend/src/pages/table/table-list.tsx), [`reservation-list.tsx`](frontend/src/pages/reservation/reservation-list.tsx), [`qr-manage.tsx`](frontend/src/pages/qr/qr-manage.tsx): Giao diện sơ đồ bàn, danh sách đặt bàn và quản lý/in mã QR cho từng bàn.

#### 🛡️ Phase 12 Hardening
- [`AuthenticationFilter.java`](backend/api-gateway/src/main/java/com/restaurant/gateway/filter/AuthenticationFilter.java): Thêm cơ chế làm sạch (sanitize) xóa sạch mọi header `X-User-Id`, `X-User-Roles` do client gửi lên trước khi Gateway gắn giá trị đã xác thực vào request.
- [`UserController.java`](backend/user-service/src/main/java/com/restaurant/user/controller/UserController.java) & [`UserServiceImpl.java`](backend/user-service/src/main/java/com/restaurant/user/service/impl/UserServiceImpl.java): Thêm endpoint `GET /api/users/me`, kiểm tra cờ `active` và chống lỗ hổng leo thang đặc quyền IDOR.
- [`ReportStockSnapshotRepository.java`](backend/report-service/src/main/java/com/restaurant/report/repository/ReportStockSnapshotRepository.java) & [`ReportEventConsumer.java`](backend/report-service/src/main/java/com/restaurant/report/messaging/ReportEventConsumer.java): Cài đặt cơ chế Idempotent upsert để ghi nhận snapshot tồn kho mà không sợ bị trùng lặp dữ liệu khi nhận lại message.

---

### 3. Nguyễn Mạnh Đức — Frontend Developer (20%)

**Phụ trách:** Frontend Core Setup, UI Components, Auth Pages, Layout, User Management, Dashboard

#### ⚙️ Frontend Core Init & Setup
- [`frontend/package.json`](frontend/package.json), [`vite.config.ts`](frontend/vite.config.ts), [`tailwind.config.js`](frontend/tailwind.config.js), [`postcss.config.js`](frontend/postcss.config.js), [`tsconfig.json`](frontend/tsconfig.json): Khởi tạo dự án React 18, Vite, TypeScript, cấu hình Tailwind CSS và đường dẫn alias `@/`.
- [`main.tsx`](frontend/src/main.tsx), [`App.tsx`](frontend/src/App.tsx), [`index.css`](frontend/src/index.css): Cấu hình Theme, font chữ, React Router v6 và React Query Client Provider.
- [`axios-instance.ts`](frontend/src/api/axios-instance.ts): Cấu hình Axios interceptor tự động đính kèm JWT token vào mọi request và xử lý chuyển hướng khi gặp lỗi 401 Unauthorized.

#### 🧩 Shared UI & Layout Components
- [`app-layout.tsx`](frontend/src/components/layout/app-layout.tsx), [`app-header.tsx`](frontend/src/components/layout/app-header.tsx), [`app-sidebar.tsx`](frontend/src/components/layout/app-sidebar.tsx), [`protected-route.tsx`](frontend/src/components/layout/protected-route.tsx): Khung sườn ứng dụng, thanh điều hướng sidebar phân quyền theo vai trò, header hiển thị thông tin đăng nhập và cơ chế bảo vệ route.
- [`confirm-dialog.tsx`](frontend/src/components/shared/confirm-dialog.tsx), [`empty-state.tsx`](frontend/src/components/shared/empty-state.tsx), [`error-boundary.tsx`](frontend/src/components/shared/error-boundary.tsx), [`loading-spinner.tsx`](frontend/src/components/shared/loading-spinner.tsx), [`page-header.tsx`](frontend/src/components/shared/page-header.tsx), [`stats-card.tsx`](frontend/src/components/shared/stats-card.tsx), [`status-badge.tsx`](frontend/src/components/shared/status-badge.tsx): Bộ component dùng chung cho toàn bộ giao diện dự án.
- Bộ thư viện UI primitives (shadcn/ui): [`button.tsx`](frontend/src/components/ui/button.tsx), [`input.tsx`](frontend/src/components/ui/input.tsx), [`card.tsx`](frontend/src/components/ui/card.tsx), [`dialog.tsx`](frontend/src/components/ui/dialog.tsx), [`select.tsx`](frontend/src/components/ui/select.tsx), [`table.tsx`](frontend/src/components/ui/table.tsx), [`badge.tsx`](frontend/src/components/ui/badge.tsx).

#### 🔐 Auth Frontend & User Management
- [`auth.ts`](frontend/src/types/auth.ts), [`auth-store.ts`](frontend/src/stores/auth-store.ts), [`auth.api.ts`](frontend/src/api/auth.api.ts), [`use-auth.ts`](frontend/src/hooks/use-auth.ts): Quản lý trạng thái đăng nhập toàn cục bằng Zustand (lưu token, user profile, hàm login/logout).
- [`login.tsx`](frontend/src/pages/auth/login.tsx), [`register.tsx`](frontend/src/pages/auth/register.tsx): Trang đăng nhập và đăng ký tài khoản với form validation.
- [`user.api.ts`](frontend/src/api/user.api.ts), [`use-users.ts`](frontend/src/hooks/use-users.ts), [`user-list.tsx`](frontend/src/pages/user/user-list.tsx): Giao diện danh sách người dùng, modal thêm mới, chỉnh sửa và phân quyền nhân viên.
- [`dashboard.tsx`](frontend/src/pages/dashboard.tsx), [`shift-manage.tsx`](frontend/src/pages/shift/shift-manage.tsx), [`not-found.tsx`](frontend/src/pages/not-found.tsx): Trang tổng quan Dashboard với thẻ số liệu thống kê và quản lý ca làm việc.
- [`format-currency.ts`](frontend/src/lib/format-currency.ts), [`format-date.ts`](frontend/src/lib/format-date.ts), [`constants.ts`](frontend/src/lib/constants.ts): Hàm tiện ích định dạng tiền tệ Việt Nam (VNĐ), ngày tháng và danh mục hằng số.

#### 🛡️ Phase 12 Hardening
- [`RestaurantTable.java`](backend/table-service/src/main/java/com/restaurant/table/entity/RestaurantTable.java): Thêm trường `@Version private Long version;` hỗ trợ khóa lạc quan khi nhiều luồng cùng đặt/chiếm 1 bàn ăn.
- [`GlobalExceptionHandler.java`](backend/table-service/src/main/java/com/restaurant/table/exception/GlobalExceptionHandler.java) & [`TableServiceImpl.java`](backend/table-service/src/main/java/com/restaurant/table/service/impl/TableServiceImpl.java): Bắt ngoại lệ `ObjectOptimisticLockingFailureException` và chuyển đổi thành mã lỗi HTTP `409 CONFLICT` thân thiện.
- Tài liệu Frontend: [`frontend/DOCUMENTATION.md`](frontend/DOCUMENTATION.md), [`frontend/IMPLEMENTATION.md`](frontend/IMPLEMENTATION.md), [`frontend/TRACKING.md`](frontend/TRACKING.md).

---

### 4. Trần Đức Mạnh — Backend Developer (20%)

**Phụ trách:** Menu Service, Inventory Service, Backend Server

#### 📜 Menu Service (Cổng 8083)
- [`MenuItem.java`](backend/menu-service/src/main/java/com/restaurant/menu/entity/MenuItem.java), [`Recipe.java`](backend/menu-service/src/main/java/com/restaurant/menu/entity/Recipe.java): Thực thể món ăn (tên món, giá bán, ảnh, danh mục, trạng thái còn/hết) và công thức định lượng nguyên liệu cho món ăn.
- [`MenuItemRepository.java`](backend/menu-service/src/main/java/com/restaurant/menu/repository/MenuItemRepository.java), [`RecipeRepository.java`](backend/menu-service/src/main/java/com/restaurant/menu/repository/RecipeRepository.java): Tầng truy vấn dữ liệu thực đơn và công thức chế biến.
- [`InventoryClient.java`](backend/menu-service/src/main/java/com/restaurant/menu/client/InventoryClient.java): OpenFeign Client gọi sang `inventory-service` để kiểm tra số lượng nguyên liệu trong kho trước khi xác nhận món còn phục vụ được hay không.
- [`MenuItemServiceImpl.java`](backend/menu-service/src/main/java/com/restaurant/menu/service/impl/MenuItemServiceImpl.java), [`RecipeServiceImpl.java`](backend/menu-service/src/main/java/com/restaurant/menu/service/impl/RecipeServiceImpl.java): Xử lý logic nghiệp vụ quản lý thực đơn, thiết lập công thức và kiểm tra nguyên liệu chế biến.
- [`MenuItemController.java`](backend/menu-service/src/main/java/com/restaurant/menu/controller/MenuItemController.java), [`RecipeController.java`](backend/menu-service/src/main/java/com/restaurant/menu/controller/RecipeController.java): Bộ REST API phục vụ hiển thị thực đơn và quản lý công thức món ăn.

#### 📦 Inventory Service (Cổng 8084)
- Các thực thể kho: [`Ingredient.java`](backend/inventory-service/src/main/java/com/restaurant/inventory/entity/Ingredient.java) (nguyên liệu, đơn vị tính, ngưỡng cảnh báo tồn), [`IngredientCategory.java`](backend/inventory-service/src/main/java/com/restaurant/inventory/entity/IngredientCategory.java) (danh mục), [`InventoryReceipt.java`](backend/inventory-service/src/main/java/com/restaurant/inventory/entity/InventoryReceipt.java) (phiếu nhập kho), [`InventoryReceiptDetail.java`](backend/inventory-service/src/main/java/com/restaurant/inventory/entity/InventoryReceiptDetail.java), [`InventoryIssue.java`](backend/inventory-service/src/main/java/com/restaurant/inventory/entity/InventoryIssue.java) (phiếu xuất kho), [`StockAdjustment.java`](backend/inventory-service/src/main/java/com/restaurant/inventory/entity/StockAdjustment.java) (phiếu kiểm kê/điều chỉnh kho), [`InventoryLog.java`](backend/inventory-service/src/main/java/com/restaurant/inventory/entity/InventoryLog.java) (nhật ký biến động kho).
- Tầng Repository: [`IngredientRepository.java`](backend/inventory-service/src/main/java/com/restaurant/inventory/repository/IngredientRepository.java), [`InventoryReceiptRepository.java`](backend/inventory-service/src/main/java/com/restaurant/inventory/repository/InventoryReceiptRepository.java), [`InventoryIssueRepository.java`](backend/inventory-service/src/main/java/com/restaurant/inventory/repository/InventoryIssueRepository.java), [`InventoryLogRepository.java`](backend/inventory-service/src/main/java/com/restaurant/inventory/repository/InventoryLogRepository.java).
- Tầng Service: [`IngredientServiceImpl.java`](backend/inventory-service/src/main/java/com/restaurant/inventory/service/impl/IngredientServiceImpl.java), [`InventoryReceiptServiceImpl.java`](backend/inventory-service/src/main/java/com/restaurant/inventory/service/impl/InventoryReceiptServiceImpl.java), [`InventoryIssueServiceImpl.java`](backend/inventory-service/src/main/java/com/restaurant/inventory/service/impl/InventoryIssueServiceImpl.java), [`StockAdjustmentServiceImpl.java`](backend/inventory-service/src/main/java/com/restaurant/inventory/service/impl/StockAdjustmentServiceImpl.java): Xử lý logic nhập hàng, xuất nguyên liệu chế biến, kiểm kho và tự động ghi nhật ký kho.
- Messaging: [`InventoryEventPublisher.java`](backend/inventory-service/src/main/java/com/restaurant/inventory/messaging/InventoryEventPublisher.java) phát snapshot tồn kho sang `report-service`. [`OrderCompletedConsumer.java`](backend/inventory-service/src/main/java/com/restaurant/inventory/messaging/OrderCompletedConsumer.java) tiêu thụ sự kiện `order.completed` từ `order-service` để tự động trừ tồn kho nguyên liệu theo công thức món ăn đã bán.

#### 🖥️ Backend Server
- [`backend-server/package.json`](backend-server/package.json), [`package-lock.json`](backend-server/package-lock.json): Thiết lập môi trường Node.js / Express cho các module server phụ trợ.

#### 🛡️ Phase 12 Hardening
- [`OrderCompletedConsumer.java`](backend/inventory-service/src/main/java/com/restaurant/inventory/messaging/OrderCompletedConsumer.java): Thêm kiểm tra Idempotency bằng `existsByOrderTag` dựa trên mã đơn hàng, ngăn ngừa trừ kho lặp lại khi message RabbitMQ bị gửi lại (at-least-once delivery).
- [`application.yml`](backend/menu-service/src/main/resources/application.yml) & [`application.yml`](backend/inventory-service/src/main/resources/application.yml): Cấu hình Feign timeouts bảo vệ liên lạc đồng bộ giữa Menu và Inventory.

---

### 5. Đàm Quang Sáng — Frontend Developer (20%)

**Phụ trách:** Frontend Menu, Inventory, Order, Report Pages & Tài Liệu Phản Biện

#### 🥗 Menu & Ingredient Pages
- [`menu.ts`](frontend/src/types/menu.ts), [`ingredient.ts`](frontend/src/types/ingredient.ts): Khai báo kiểu TypeScript cho thực đơn, danh mục và nguyên liệu.
- [`menu.api.ts`](frontend/src/api/menu.api.ts), [`ingredient.api.ts`](frontend/src/api/ingredient.api.ts): Các hàm gọi REST API thực đơn và nguyên vật liệu.
- [`use-menu.ts`](frontend/src/hooks/use-menu.ts), [`use-ingredients.ts`](frontend/src/hooks/use-ingredients.ts): Custom hooks kết nối React Query quản lý state thực đơn.
- [`menu-list.tsx`](frontend/src/pages/menu/menu-list.tsx), [`recipe-manage.tsx`](frontend/src/pages/recipe/recipe-manage.tsx), [`ingredient-list.tsx`](frontend/src/pages/ingredient/ingredient-list.tsx): Giao diện danh sách món ăn, modal cấu hình công thức định lượng món và trang quản lý nguyên liệu.

#### 📦 Inventory Pages
- [`inventory.ts`](frontend/src/types/inventory.ts), [`inventory.api.ts`](frontend/src/api/inventory.api.ts), [`use-inventory.ts`](frontend/src/hooks/use-inventory.ts): Types, API client và hooks quản lý kho hàng.
- [`receipt-list.tsx`](frontend/src/pages/inventory/receipt-list.tsx), [`issue-list.tsx`](frontend/src/pages/inventory/issue-list.tsx): Giao diện tạo và duyệt phiếu nhập kho, phiếu xuất kho nguyên liệu.

#### 🛒 Order & Kitchen Pages
- [`order.ts`](frontend/src/types/order.ts), [`expense.ts`](frontend/src/types/expense.ts): Types cho đơn bán hàng, trạng thái món và phiếu chi phí.
- [`order.api.ts`](frontend/src/api/order.api.ts), [`public-order.api.ts`](frontend/src/api/public-order.api.ts), [`expense.api.ts`](frontend/src/api/expense.api.ts): API client gọi sang Order Service.
- [`use-orders.ts`](frontend/src/hooks/use-orders.ts), [`use-kitchen.ts`](frontend/src/hooks/use-kitchen.ts), [`use-expenses.ts`](frontend/src/hooks/use-expenses.ts): Hooks xử lý dữ liệu đơn hàng và màn hình bếp.
- Giao diện:
  - [`order-list.tsx`](frontend/src/pages/order/order-list.tsx): Quản lý danh sách đơn hàng của nhà hàng.
  - [`order-create.tsx`](frontend/src/pages/order/order-create.tsx): Màn hình POS nhân viên chọn bàn, chọn món, ghi chú, tạo đơn.
  - [`invoice-view.tsx`](frontend/src/pages/order/invoice-view.tsx): Màn hình xuất hóa đơn thanh toán chi tiết.
  - [`kitchen-display.tsx`](frontend/src/pages/kitchen/kitchen-display.tsx): Màn hình bếp KDS hiển thị các món đang chế biến theo thời gian thực.
  - [`public-order.tsx`](frontend/src/pages/public/public-order.tsx): Giao diện khách hàng tự quét mã QR tại bàn để gọi món trên điện thoại.
  - [`expense-list.tsx`](frontend/src/pages/expense/expense-list.tsx): Trang theo dõi và thêm mới các khoản chi phí hoạt động.

#### 📈 Report Pages
- [`report.ts`](frontend/src/types/report.ts), [`report.api.ts`](frontend/src/api/report.api.ts), [`use-reports.ts`](frontend/src/hooks/use-reports.ts): Types, API và hooks báo cáo thống kê.
- [`revenue-report.tsx`](frontend/src/pages/report/revenue-report.tsx), [`stock-report.tsx`](frontend/src/pages/report/stock-report.tsx): Màn hình biểu đồ Recharts phân tích doanh thu theo kỳ và báo cáo biến động tồn kho.

#### 🛡️ Phase 12 Hardening & Tài Liệu Phản Biện Đồ Án
- [`generate_defense_doc.js`](backend-server/generate_defense_doc.js): Script tự động tạo tài liệu Word chuẩn format.
- [`GIAI_DAP_BAO_VE_MON_HOC_SOA_MICROSERVICES.docx`](GIAI_DAP_BAO_VE_MON_HOC_SOA_MICROSERVICES.docx): Tài liệu Word chuyên sâu giải đáp 10 câu hỏi cốt lõi khi bảo vệ đồ án SOA (Sự khác biệt Monolith vs Microservices, Data Consistency, Event-driven RabbitMQ, OpenFeign vs REST, Circuit Breaker & Timeout, Gateway Authentication, Idempotency và Distributed Tracing).

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
