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

### 3.4. Bán Hàng, Tách Đơn & Màn Hình Bếp KDS (`order-service`)
- `GET /api/orders`: Lấy sổ danh sách đơn hàng (lọc theo trạng thái `OPEN`, `PAID`, `CANCEL`).
- `POST /api/orders`: Mở đơn hàng mới tại quầy POS, hỗ trợ phân loại Khách Vãng Lai và Khách Thành Viên tích điểm.
- `POST /api/orders/:id/add-items`: Gọi thêm món vào đơn hàng đang mở.
- `POST /api/orders/:id/split`: **Tách đơn hàng độc lập**: Hỗ trợ đầy đủ thông tin khách hàng mới (`customerName`, `customerPhone`), tra cứu/áp dụng ưu đãi hội viên, chiết khấu trực tiếp (`discount`), thuế suất VAT (`vatRate`), ghi chú đơn (`note`), và danh sách món tách (`items`). Tự động trừ số lượng khỏi đơn gốc và tạo đơn mới trong một giao dịch CSDL nguyên tử.
- `PUT /api/orders/:orderId/items/:itemId/status`: **KDS Endpoint**: Cập nhật trạng thái chế biến của từng món ăn (`ORDERED` -> `COOKING` -> `COOKED` -> `SERVED`).
- `PUT /api/orders/:orderId/items/status`: **KDS Bulk Endpoint**: Cập nhật hàng loạt toàn bộ vé ("Nấu tất cả", "Nấu xong hết", "Ra món hết").
- `POST /api/orders/:id/complete`: Hoàn thành phục vụ đơn hàng (`SERVED`), tự động gửi event trừ tồn kho nguyên liệu theo định mức.
- `GET /api/orders/:id/invoice`: Trích xuất hóa đơn thanh toán chi tiết kèm bảng tính thuế VAT, giảm giá và thông tin nhà hàng.
- `POST /api/orders/:id/pay`: Thanh toán đơn hàng (`PAID`), giải phóng bàn ăn về `FREE`, và tự động **tích điểm thưởng & đánh giá duy trì/nâng hạng hội viên** theo doanh số tháng.
- `POST /api/orders/:id/cancel`: Hủy đơn hàng và giải phóng bàn ăn.

### 3.5. Hệ Thống Khách Hàng & Hội Viên Tích Điểm (`Customer Loyalty System`)
Hệ thống tài khoản khách hàng lưu trữ bằng Tên và Số điện thoại độc nhất, tích hợp trực tiếp vào quy trình bán hàng và thanh toán:
- `GET /api/customers`: Lấy danh sách hội viên phân trang (hỗ trợ lọc từ khóa tên/SĐT và phân loại hạng thẻ).
- `GET /api/customers/lookup?phone=:phone`: Tra cứu nhanh hồ sơ hội viên theo số điện thoại (trả về điểm khả dụng, hạng thẻ, mức chiết khấu, và tiến độ chi tiêu trong tháng).
- `POST /api/customers`: Đăng ký tài khoản hội viên mới hoặc cập nhật hồ sơ khách hàng.
- `PUT /api/customers/:id`: Cập nhật thông tin liên hệ, ghi chú khách hàng.

#### Quy chế Tích điểm & Xếp hạng Hội viên theo Tháng:
- **Tỷ lệ quy đổi điểm**: `10.000 VNĐ = 1 điểm` (tương đương hoàn tiền 1%).
- **Giá trị điểm thưởng**: `1 điểm = 100 VNĐ`, cho phép cấn trừ trực tiếp khi thanh toán đơn hàng.
- **Phân hạng thẻ & Điều kiện duy trì / nâng hạng tháng**:
  - 🥉 **Hạng Đồng (BRONZE)**: Mặc định khi đăng ký mới / Chi tiêu tháng `< 2.000.000 VNĐ` (Chiết khấu `0%`, Hệ số điểm `1.0x`).
  - 🥈 **Hạng Bạc (SILVER)**: Đạt chỉ tiêu chi tiêu tháng `>= 2.000.000 VNĐ` (Chiết khấu `5%`, Hệ số điểm `1.2x`).
  - 🥇 **Hạng Vàng (GOLD)**: Đạt chỉ tiêu chi tiêu tháng `>= 5.000.000 VNĐ` (Chiết khấu `10%`, Hệ số điểm `1.5x`).
  - 💎 **Hạng Kim Cương (DIAMOND)**: Đạt chỉ tiêu chi tiêu tháng `>= 10.000.000 VNĐ` (Chiết khấu `15%`, Hệ số điểm `2.0x`).
- **Cơ chế chu kỳ tháng**: Doanh số tích lũy tháng (`currentMonthSpent`) được tự động kiểm tra và làm mới theo chu kỳ tháng (`YYYY-MM`), giúp đánh giá duy trì hoặc thăng hạng khách hàng chính xác theo tháng mà không bị mất điểm thưởng tích lũy lâu dài.

### 3.6. Kho & Nguyên Liệu (`inventory-service`)
- `GET /api/ingredients`: Danh sách nguyên liệu tồn kho, đơn vị tính và giá vốn nhập trung bình.
- `POST /api/ingredients`: Thêm nguyên liệu kho mới.
- `PUT /api/ingredients/:id`: Cập nhật ngưỡng tồn kho an toàn (min stock).
- `GET /api/inventory/receipts`: Danh sách phiếu nhập kho từ nhà cung cấp (hỗ trợ xem chi tiết mặt hàng trong cột thao tác).
- `POST /api/inventory/receipts`: Tạo phiếu nhập kho và tự động cộng dồn số lượng tồn.
- `GET /api/inventory/issues`: Danh sách phiếu xuất kho chế biến / hủy hỏng.

### 3.7. Báo Cáo Tài Chính, Xuất Excel & In Ấn A4 (`report-service`)
- `GET /api/dashboard`: Tổng hợp số liệu KPI bán hàng trong ngày (doanh thu, lợi nhuận, đơn hàng, cảnh báo kho).
- `GET /api/reports/revenue`: Báo cáo doanh thu, chi phí vận hành và lợi nhuận ròng tổng hợp theo ngày.
- `GET /api/reports/revenue/:day`: Drill-down chi tiết danh sách đơn hàng phát sinh trong một ngày cụ thể.
- `GET /api/reports/stock`: Báo cáo phân tầng mức độ an toàn của tồn kho (`CRITICAL`, `WARNING`, `NORMAL`).
- **Tính năng Xuất Báo Cáo Cao Cấp**:
  - **Excel Xuất Bản**: Xuất dữ liệu đa cột có tiêu đề thương hiệu nhà hàng, định dạng tiền tệ Việt Nam (VNĐ), viền bảng và tổng cộng tự động.
  - **In Biên Bản A4 Chuẩn Nghiệp Vụ**: Hỗ trợ in mẫu biểu A4 chuẩn hoá với logo nhà hàng, thời gian in, bảng chi tiết và các ô ký duyệt (Người lập biểu, Kế toán trưởng, Giám đốc / Quản lý).
  - **Tối ưu Giao diện Bảng**: Thu gọn toàn bộ nút thao tác vào trong Menu Thao tác (Dropdown Action Menu) giúp bảng biểu thông thoáng, hiện đại.

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
