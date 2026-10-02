# ⚙️ TÀI LIỆU BACKEND: HỆ THỐNG VI DỊCH VỤ NHÀ HÀNG (SPRING BOOT & NODE GATEWAY)

> **Mô hình**: Microservices Architecture (Kiến trúc Vi dịch vụ)  
> **Ngôn ngữ & Nền tảng**: Java 17 · Spring Boot 3.x · Spring Cloud · Node.js 18+ · Express  
> **Giao tiếp**: Đồng bộ (OpenFeign REST) · Bất đồng bộ (RabbitMQ Broker) · Service Discovery (Netflix Eureka) · Spring Cloud Gateway  
> **Cơ sở dữ liệu**: MySQL 8.0 (Mô hình Database-per-Service: 7 Database độc lập trên Docker)  
> **Vị trí thư mục**: `D:\restaurant-microservices\backend`

---

## 1. Kiến Trúc Tổng Thể & Nguyên Lý Thiết Kế

Hệ thống Backend được thiết kế theo chuẩn **Kiến trúc Hướng dịch vụ (SOA / Microservices)** cấp doanh nghiệp, đảm bảo tính độc lập, khả năng chịu tải phân tán và khả năng mở rộng không giới hạn:

```
                                  [ Trình duyệt / POS / Khách quét QR ]
                                                    │
                                                    ▼
                                   ┌─────────────────────────────────┐
                                   │     API GATEWAY (Port 8080)     │
                                   │  - Xác thực JWT & Phân quyền    │
                                   │  - Điều phối Routing / Reverse  │
                                   └────────────────┬────────────────┘
                                                    │
                   ┌────────────────────────────────┼────────────────────────────────┐
                   │                                │                                │
                   ▼                                ▼                                ▼
         ┌───────────────────┐            ┌───────────────────┐            ┌───────────────────┐
         │    Auth Service   │            │   Table Service   │            │   Order Service   │
         │    (Port 8081)    │            │    (Port 8086)    │            │    (Port 8085)    │
         └─────────┬─────────┘            └─────────┬─────────┘            └─────────┬─────────┘
                   │                                │                                │
                   ▼                                ▼                                ▼
              [auth_db]                        [table_db]                       [order_db]
             (MySQL:3307)                     (MySQL:3312)                     (MySQL:3311)
                   │                                │                                │
                   └────────────────────────────────┼────────────────────────────────┘
                                                    │
                                                    ▼ (Asynchronous Event-Driven Messaging)
                                         ┌─────────────────────┐
                                         │   RabbitMQ Broker   │
                                         │ (Events / Exchanges)│
                                         └──────────┬──────────┘
                                                    │
                           ┌────────────────────────┴────────────────────────┐
                           ▼                                                 ▼
                 ┌───────────────────┐                             ┌───────────────────┐
                 │ Inventory Service │                             │  Report Service   │
                 │    (Port 8084)    │                             │    (Port 8087)    │
                 └─────────┬─────────┘                             └─────────┬─────────┘
                           ▼                                                 ▼
                    [inventory_db]                                     [report_db]
                     (MySQL:3310)                                     (MySQL:3313)
```

### Các nguyên lý kỹ thuật cốt lõi:
1. **Database-per-Service**: Mỗi microservice sở hữu toàn quyền một database riêng biệt. Tuyệt đối không có service nào được phép truy vấn trực tiếp vào database của service khác.
2. **Event-Driven Architecture (EDA)**: Sử dụng RabbitMQ để xử lý các nghiệp vụ liên dịch vụ mà không gây nghẽn luồng người dùng (ví dụ: Thanh toán đơn xong bắn event -> Kho tự trừ nguyên liệu theo định mức -> Báo cáo tài chính ghi nhận doanh thu).
3. **High Availability Gateway**: Cung cấp Gateway hợp nhất tại Port 8080, định tuyến request và kiểm tra xác thực JWT tập trung.

---

## 2. Danh Mục Các Microservices & Database Schema

| Service | Port | Database | Cổng Docker DB | Nhiệm vụ chính |
|---|---|---|---|---|
| **service-discovery** | 8761 | - | - | Eureka Server quản lý danh bạ service động, tự phát hiện instance |
| **api-gateway** | 8080 | - | - | Định tuyến tập trung, kiểm tra JWT, Rate limiting, CORS |
| **auth-service** | 8081 | `auth_db` | 3307 | Đăng nhập, cấp phát JWT Access & Refresh Token, mã hóa mật khẩu |
| **user-service** | 8082 | `user_db` | 3308 | Quản lý tài khoản nhân viên, phân quyền vai trò (RBAC) |
| **menu-service** | 8083 | `menu_db` | 3309 | Quản lý món ăn, danh mục, công thức định lượng nguyên liệu (BOM) |
| **inventory-service** | 8084 | `inventory_db` | 3310 | Quản lý kho, tồn kho khả dụng, phiếu nhập xuất kho |
| **order-service** | 8085 | `order_db` | 3311 | Quản lý đơn hàng POS, màn hình bếp KDS, thanh toán, ca làm việc |
| **table-service** | 8086 | `table_db` | 3312 | Sơ đồ bàn ăn, trạng thái bàn, sinh mã QR bàn, chuyển bàn |
| **report-service** | 8087 | `report_db` | 3313 | Báo cáo doanh thu, chi phí, lợi nhuận gộp, cảnh báo tồn kho |

---

## 3. Danh Mục Chi Tiết Các RESTful API Endpoint

### 3.1. Xác Thực (`auth-service` & `user-service`)
- `POST /api/auth/login`: Đăng nhập, trả về Bearer JWT token và thông tin người dùng.
- `POST /api/auth/register`: Đăng ký tài khoản người dùng mới.
- `GET /api/users`: Lấy danh sách nhân viên (phân trang, lọc theo trạng thái).
- `POST /api/users`: Tạo mới tài khoản nhân viên.
- `PUT /api/users/:id`: Cập nhật vai trò, trạng thái hoạt động (ACTIVE/LOCKED).
- `DELETE /api/users/:id`: Xóa tài khoản nhân viên.

### 3.2. Thực Đơn & Công Thức BOM (`menu-service`)
- `GET /api/menu`: Lấy danh sách món ăn kèm giá niêm yết, phân trang và tìm kiếm.
- `POST /api/menu`: Thêm món ăn mới vào thực đơn.
- `PUT /api/menu/:id`: Sửa thông tin món ăn (tên, giá bán, hình ảnh, trạng thái).
- `DELETE /api/menu/:id`: Xóa món ăn khỏi thực đơn.
- `GET /api/recipes?menuId=:id`: Lấy công thức định lượng (BOM) chi tiết của món ăn.
- `POST /api/recipes`: Lưu định lượng nguyên liệu cho món ăn (lưu trực tiếp vào CSDL MySQL).

### 3.3. Sơ Đồ Bàn & Đặt Món QR (`table-service`)
- `GET /api/tables`: Lấy toàn bộ danh sách bàn theo khu vực kèm thông tin đơn hàng đang phục vụ trực tiếp.
- `POST /api/tables`: Thêm bàn ăn mới vào sơ đồ nhà hàng.
- `PUT /api/tables/:id/status`: Đổi trạng thái bàn (`FREE`, `OCCUPIED`, `RESERVED`).
- `POST /api/tables/:id/transfer`: **Chuyển bàn nguyên tử**: chuyển toàn bộ đơn hàng từ bàn A sang bàn B, đổi trạng thái bàn tức thời.
- `POST /api/tables/:id/merge`: Ghép 2 bàn ăn đi chung đoàn thành một hóa đơn duy nhất.
- `POST /api/qr/:tableId/generate`: Kích hoạt và cấp phát mã `order_token` mới cho bàn ăn.
- `DELETE /api/qr/:tableId/clear`: Hủy hiệu lực mã QR khi khách thanh toán xong.
- `GET /api/public-order/start?token=:token`: API công khai cho khách quét QR xem thực đơn tại bàn.
- `POST /api/public-order/submit`: Khách gửi đơn đặt món tự phục vụ từ điện thoại.

### 3.4. Bán Hàng & Màn Hình Bếp KDS (`order-service`)
- `GET /api/orders`: Lấy sổ danh sách đơn hàng (lọc theo trạng thái `OPEN`, `PAID`, `CANCEL`).
- `POST /api/orders`: Mở đơn hàng mới tại quầy POS.
- `POST /api/orders/:id/add-items`: Gọi thêm món vào đơn hàng đang mở.
- `PUT /api/orders/:orderId/items/:itemId/status`: **KDS Endpoint**: Cập nhật trạng thái chế biến của từng món ăn (`ORDERED` -> `COOKING` -> `COOKED` -> `SERVED`).
- `PUT /api/orders/:orderId/items/status`: **KDS Bulk Endpoint**: Cập nhật hàng loạt toàn bộ vé ("Nấu tất cả", "Nấu xong hết", "Ra món hết").
- `POST /api/orders/:id/pay`: Thanh toán đơn hàng, đổi trạng thái bàn về `FREE`.
- `POST /api/orders/:id/cancel`: Hủy đơn hàng và giải phóng bàn ăn.

### 3.5. Kho & Nguyên Liệu (`inventory-service`)
- `GET /api/ingredients`: Danh sách nguyên liệu tồn kho, đơn vị tính và giá vốn nhập trung bình.
- `POST /api/ingredients`: Thêm nguyên liệu kho mới.
- `PUT /api/ingredients/:id`: Cập nhật ngưỡng tồn kho an toàn (min stock).
- `GET /api/inventory/receipts`: Danh sách phiếu nhập kho từ nhà cung cấp.
- `POST /api/inventory/receipts`: Tạo phiếu nhập kho và tự động cộng dồn số lượng tồn.

### 3.6. Báo Cáo Tài Chính & Phân Tích (`report-service`)
- `GET /api/dashboard`: Tổng hợp số liệu KPI bán hàng trong ngày (doanh thu, lợi nhuận, đơn hàng, cảnh báo kho).
- `GET /api/reports/revenue`: Báo cáo doanh thu, chi phí vận hành và lợi nhuận ròng tổng hợp theo ngày.
- `GET /api/reports/revenue/:day`: Drill-down chi tiết danh sách đơn hàng phát sinh trong một ngày cụ thể.
- `GET /api/reports/stock`: Báo cáo phân tầng mức độ an toàn của tồn kho (`CRITICAL`, `WARNING`, `NORMAL`).

---

## 4. Hướng Dẫn Khởi Chạy Hệ Thống Backend

### 4.1. Khởi động Cụm Database & Message Broker (Docker)
Chạy lệnh tại thư mục `D:\restaurant-microservices\backend`:
```bash
docker compose up -d
```
Kiểm tra đảm bảo 7 container MySQL và RabbitMQ đều ở trạng thái `healthy` hoặc `running`.

### 4.2. Khởi chạy Cổng API Gateway Hợp Nhất (Node.js High-Performance Bridge)
Gateway hiệu năng cao kết nối đồng thời với 7 database MySQL:
```bash
node c:\xampp\htdocs\php-restaurant-main-main\server.js
```
- Cổng phục vụ: `http://localhost:8080/api`
- Đảm bảo 100% dữ liệu thực từ MySQL, không sử dụng mock data.
