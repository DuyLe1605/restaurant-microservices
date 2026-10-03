# 📋 Backend - Progress Tracking

> Cập nhật lần cuối: 2026-09-23
> Tổng tiến độ Backend: ██████████ 100%

---

## Phase 1: Infrastructure █████ 100%

| # | Task | Status | Ghi chú |
|---|---|---|---|
| 1.1 | docker-compose.yml (MySQL x 7, RabbitMQ, Services) | ✅ DONE | Đã hoàn thành cấu hình networks, volumes, healthchecks |
| 1.2 | service-discovery (Eureka Server) | ✅ DONE | Port 8761, cấu hình standalone và discovery |
| 1.3 | api-gateway (Spring Cloud Gateway) | ✅ DONE | Port 8080, JWT Filter, CORS, Route Locator |
| 1.4 | Root pom.xml aggregator | ✅ DONE | Quản lý đa module cho toàn bộ 9 backend services |

---

## Phase 2: Auth Service █████ 100%

| # | Task | Status | Ghi chú |
|---|---|---|---|
| 2.1 | Khởi tạo Spring Boot 3.x project | ✅ DONE | Maven, Java 17, Spring Cloud, Actuator |
| 2.2 | Entity: User, AuditLog | ✅ DONE | JPA Entity, Audit timestamps, BCrypt pass |
| 2.3 | Repository: UserRepository, AuditLogRepository | ✅ DONE | Spring Data JPA |
| 2.4 | JwtService (generate/validate token) | ✅ DONE | jjwt 0.12.5, HMAC-SHA, claims, refresh tokens |
| 2.5 | SecurityConfig (Spring Security 6) | ✅ DONE | Stateless, BCrypt, SecurityFilterChain |
| 2.6 | AuthController: POST /api/auth/login | ✅ DONE | Xác thực username/password, generate tokens, audit log |
| 2.7 | AuthController: POST /api/auth/register | ✅ DONE | Validate regex, unique username, publish event |
| 2.8 | AuthController: GET /api/auth/verify | ✅ DONE | Verify token, trả user profile |
| 2.9 | AuthController: POST /api/auth/refresh | ✅ DONE | Refresh access token |
| 2.10 | AuthController: POST /api/auth/logout | ✅ DONE | Logout handler |
| 2.11 | DTOs + Validation + Constants | ✅ DONE | Không hardcode, không magic numbers |
| 2.12 | GlobalExceptionHandler | ✅ DONE | Chuẩn hóa ErrorResponse, 400, 401, 404, 409, 500 |
| 2.13 | RabbitMQ: Publish user.created & user.login | ✅ DONE | Exchange: restaurant.exchange |
| 2.14 | Dockerfile | ✅ DONE | Multi-stage build |

---

## Phase 3: User Service █████ 100%

| # | Task | Status | Ghi chú |
|---|---|---|---|
| 3.1 | Khởi tạo Spring Boot 3.x project | ✅ DONE | Port 8082, MySQL user_db |
| 3.2 | Entity: User + Repository | ✅ DONE | Tìm kiếm phân trang, lọc theo role & active |
| 3.3 | UserController: GET /api/users | ✅ DONE | Search, filter, sort, pagination |
| 3.4 | UserController: GET /api/users/{id} | ✅ DONE | Lấy chi tiết user |
| 3.5 | UserController: POST /api/users | ✅ DONE | Tạo user mới |
| 3.6 | UserController: PUT /api/users/{id} | ✅ DONE | Cập nhật thông tin |
| 3.7 | UserController: PUT /api/users/{id}/change-password | ✅ DONE | Đổi mật khẩu có xác thực mật khẩu cũ |
| 3.8 | UserController: DELETE /api/users/{id} | ✅ DONE | Chặn tự xóa tài khoản của mình |
| 3.9 | UserController: GET /api/users/count | ✅ DONE | Đếm tổng user đang active |
| 3.10 | RabbitMQ Consumer & Publisher | ✅ DONE | Sync user.created từ auth-service; Publish user.updated/deleted |
| 3.11 | Dockerfile + Clean Architecture | ✅ DONE | Controller, Service, Repository, DTO, Constants |

---

## Phase 4: Menu Service █████ 100%

| # | Task | Status | Ghi chú |
|---|---|---|---|
| 4.1 | Khởi tạo Spring Boot 3.x project | ✅ DONE | Port 8083, MySQL menu_db |
| 4.2 | Entity: MenuItem, Recipe + Repository | ✅ DONE | JPA Entity, code unique, price BigDecimal |
| 4.3 | MenuItemController: CRUD | ✅ DONE | GET phân trang, GET by id/code, POST, PUT, DELETE |
| 4.4 | RecipeController: GET theo menuId | ✅ DONE | Danh sách nguyên liệu theo công thức món |
| 4.5 | RecipeController: POST (replace all) | ✅ DONE | Transactional lưu danh sách công thức |
| 4.6 | RecipeController: DELETE | ✅ DONE | Xóa recipe |
| 4.7 | RecipeController: POST /check-inventory | ✅ DONE | Tự động tổng hợp và kiểm tra tồn kho |
| 4.8 | OpenFeign: InventoryClient | ✅ DONE | Giao tiếp sync với inventory-service |
| 4.9 | DTOs + Validation + MenuConstants | ✅ DONE | Chuẩn Clean Code |
| 4.10 | Dockerfile | ✅ DONE | Multi-stage build |

---

## Phase 5: Inventory Service █████ 100%

| # | Task | Status | Ghi chú |
|---|---|---|---|
| 5.1 | Khởi tạo Spring Boot 3.x project | ✅ DONE | Port 8084, MySQL inventory_db |
| 5.2 | Entities (8 tables) + Repositories | ✅ DONE | Category, Ingredient, Receipt, Issue, Log, Adjustment |
| 5.3 | IngredientCategoryController: CRUD | ✅ DONE | Quản lý danh mục nguyên liệu |
| 5.4 | IngredientController: CRUD + Stock | ✅ DONE | GET tồn kho, cảnh báo low-stock, thêm/sửa/xóa |
| 5.5 | InventoryReceiptController: CRUD | ✅ DONE | Quản lý phiếu nhập PENDING |
| 5.6 | InventoryReceiptController: Complete | ✅ DONE | Chốt phiếu nhập, ghi log kho (+qty), update giá nhập |
| 5.7 | InventoryIssueController: Manual Issue | ✅ DONE | Xuất kho thủ công, kiểm tra tồn kho trước khi xuất |
| 5.8 | Stock calculation logic | ✅ DONE | Tính tồn kho tức thời từ `inventory_log` |
| 5.9 | StockAdjustmentController: Điều chỉnh kho | ✅ DONE | Kiểm kê điều chỉnh số lượng thực tế & ghi log |
| 5.10 | OpenFeign: MenuClient | ✅ DONE | Lấy công thức món để khấu trừ kho tự động |
| 5.11 | RabbitMQ Consumer: order.completed | ✅ DONE | Lắng nghe đơn hàng hoàn thành để tự động xuất kho |
| 5.12 | RabbitMQ Publisher: inventory.stock.updated | ✅ DONE | Broadcast thay đổi tồn kho |
| 5.13 | Dockerfile | ✅ DONE | Multi-stage build |

---

## Phase 6: Table Service █████ 100%

| # | Task | Status | Ghi chú |
|---|---|---|---|
| 6.1 | Khởi tạo Spring Boot 3.x project | ✅ DONE | Port 8086, MySQL table_db |
| 6.2 | Entity: RestaurantTable, Reservation | ✅ DONE | TableStatus (FREE, OCCUPIED, RESERVED), ReservationStatus |
| 6.3 | TableController: CRUD + Status Update | ✅ DONE | Cập nhật trạng thái bàn cho order-service |
| 6.4 | TableController: GET by-token | ✅ DONE | Public endpoint phục vụ quét mã QR gọi món |
| 6.5 | ReservationController: CRUD | ✅ DONE | Đặt bàn theo khung thời gian |
| 6.6 | Reservation: Logic kiểm tra trùng lịch (Overlap) | ✅ DONE | Query JPQL kiểm tra conflict slot thời gian |
| 6.7 | QrController: generate / clear / details | ✅ DONE | Sinh UUID orderToken gán cho bàn ăn |
| 6.8 | Dockerfile | ✅ DONE | Multi-stage build |

---

## Phase 7: Order Service █████ 100%

| # | Task | Status | Ghi chú |
|---|---|---|---|
| 7.1 | Khởi tạo Spring Boot 3.x project | ✅ DONE | Port 8085, MySQL order_db |
| 7.2 | Entities: SaleOrder, SaleOrderDetail, Expense | ✅ DONE | OrderStatus, OrderDetailStatus, OrderSource |
| 7.3 | OrderController: GET /orders | ✅ DONE | Phân trang, lọc theo status, bàn |
| 7.4 | OrderController: POST /orders | ✅ DONE | Kiểm tra bàn FREE, tính subtotal, VAT, discount |
| 7.5 | OrderController: PUT /orders/{id} | ✅ DONE | Sửa thông tin khi đơn còn OPEN |
| 7.6 | OrderController: POST /add-items | ✅ DONE | Gọi thêm món vào đơn đang mở |
| 7.7 | OrderController: POST /complete | ✅ DONE | Chuyển SERVED & phát event order.completed trừ kho |
| 7.8 | OrderController: POST /pay | ✅ DONE | Chuyển PAID, giải phóng bàn FREE, phát event order.paid |
| 7.9 | OrderController: POST /cancel | ✅ DONE | Hủy đơn, giải phóng bàn FREE |
| 7.10 | OrderController: GET /invoice | ✅ DONE | Xuất hóa đơn chi tiết đầy đủ thông tin thanh toán |
| 7.11 | PublicOrderController: QR Order Flow | ✅ DONE | /api/public-order/start và /submit cho khách tự gọi món |
| 7.12 | ExpenseController: CRUD | ✅ DONE | Quản lý chi phí nhà hàng & phát event expense.created |
| 7.13 | OpenFeign: TableClient & MenuClient | ✅ DONE | Tích hợp đồng bộ trạng thái bàn & giá món |
| 7.14 | RabbitMQ: Publisher | ✅ DONE | order.created, order.completed, order.paid, order.cancelled, expense.created |
| 7.15 | Dockerfile | ✅ DONE | Multi-stage build |

---

## Phase 8: Report Service █████ 100%

| # | Task | Status | Ghi chú |
|---|---|---|---|
| 8.1 | Khởi tạo Spring Boot 3.x project | ✅ DONE | Port 8087, MySQL report_db |
| 8.2 | Synced Entities: Order, Expense, StockSnapshot | ✅ DONE | Lưu dữ liệu đồng bộ bất đồng bộ từ các service |
| 8.3 | DashboardController: GET /dashboard | ✅ DONE | Doanh thu ngày, chi phí ngày, lợi nhuận, đơn gần đây, cảnh báo kho |
| 8.4 | ReportController: GET /revenue | ✅ DONE | Báo cáo doanh thu theo dải ngày (daily breakdown) |
| 8.5 | ReportController: GET /revenue/{day} | ✅ DONE | Xem chi tiết các đơn hàng phát sinh trong ngày |
| 8.6 | ReportController: GET /stock | ✅ DONE | Báo cáo mức tồn kho (CRITICAL, WARNING, NORMAL) |
| 8.7 | RabbitMQ Consumers | ✅ DONE | Lắng nghe order.paid, expense.created, inventory.stock.updated |
| 8.8 | Dockerfile | ✅ DONE | Multi-stage build |

---

## 📊 Tổng Kết Toàn Diện Backend

| Phase | Tasks | Done | Progress |
|---|:---:|:---:|:---:|
| Phase 1: Infrastructure | 4 | 4 | ✅ 100% |
| Phase 2: Auth Service | 14 | 14 | ✅ 100% |
| Phase 3: User Service | 11 | 11 | ✅ 100% |
| Phase 4: Menu Service | 10 | 10 | ✅ 100% |
| Phase 5: Inventory Service | 13 | 13 | ✅ 100% |
| Phase 6: Table Service | 8 | 8 | ✅ 100% |
| Phase 7: Order Service | 15 | 15 | ✅ 100% |
| Phase 8: Report Service | 8 | 8 | ✅ 100% |
| **TỔNG CỘNG** | **83** | **83** | **🎉 100%** |

---

### Tiêu Chuẩn Clean Code & Architecture Đã Áp Dụng
1. **Không Hardcode, Không Magic Numbers**: Mọi hằng số độ dài, regex, timeout, exchange/queue name, mã lỗi đều tập trung trong các class `*Constants.java` và Enum (`Role`, `OrderStatus`, `TableStatus`, `ReceiptStatus`, `IssueType`, v.v.).
2. **Layered Architecture chuẩn mực**:
   - `controller`: Tiếp nhận request, validation `@Valid`, chuẩn hóa `ApiResponse<T>`.
   - `service` / `service.impl`: Xử lý business logic, quản lý `@Transactional`.
   - `repository`: Spring Data JPA tối ưu query.
   - `entity`: JPA entity với audit columns (`createdAt`, `updatedAt`).
   - `dto`: Tách bạch rõ Request DTO và Response DTO.
   - `exception`: Global Exception Handling tập trung với `ErrorResponse` chi tiết.
   - `messaging`: Tách biệt event DTO, publisher và consumer qua RabbitMQ.
   - `client`: Giao tiếp liên service đồng bộ qua Spring Cloud OpenFeign.
