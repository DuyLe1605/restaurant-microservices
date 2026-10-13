# 🏆 TÀI LIỆU KIẾN TRÚC TỔNG THỂ: DỰ ÁN HỆ THỐNG QUẢN LÝ NHÀ HÀNG

---

## 1. Bức Tranh Toàn Cảnh Dự Án

Dự án cung cấp một giải pháp chuyển đổi số toàn diện cho chuỗi nhà hàng ẩm thực cao cấp, bao gồm hai giai đoạn tiến hóa kiến trúc phần mềm:

1. **Hệ thống Nguyên Khối Truyền Thống (PHP MVC Monolith)**:
   - Thư mục: `C:\xampp\htdocs\php-restaurant-main-main`
   - Phục vụ nghiên cứu, đối chiếu mô hình kiến trúc và phân tích sự cần thiết của việc phân rã dịch vụ.
   - Tài liệu chi tiết: Xem file [`DOCUMENTATION.md` trong dự án PHP](`file:///c:/xampp/htdocs/php-restaurant-main-main/DOCUMENTATION.md`).

2. **Hệ thống Vi Dịch Vụ Hiện Đại (Cloud-Native Microservices)**:
   - Thư mục: `D:\restaurant-microservices`
   - Ứng dụng các chuẩn thiết kế tiên tiến: Database-per-Service, Event-Driven Architecture qua RabbitMQ, Service Discovery Eureka, API Gateway và Single Page Application (React 18 + TypeScript).
   - Tài liệu chi tiết Backend: Xem file [`backend/DOCUMENTATION.md`](`file:///D:/restaurant-microservices/backend/DOCUMENTATION.md`).
   - Tài liệu chi tiết Frontend: Xem file [`frontend/DOCUMENTATION.md`](`file:///D:/restaurant-microservices/frontend/DOCUMENTATION.md`).

---

## 2. Bảng So Sánh Kiến Trúc Chi Tiết

| Tiêu Chí So Sánh | Hệ Thống Cũ (PHP MVC Monolith) | Hệ Thống Mới (Microservices Architecture) |
|---|---|---|
| **Cấu trúc mã nguồn** | 1 Codebase duy nhất đóng gói toàn bộ chức năng | 8 Microservices độc lập, phân chia rõ ràng theo từng Domain nghiệp vụ |
| **Cơ sở dữ liệu** | 1 MySQL Database tập trung (`restaurant_db`) | **Database-per-Service**: 7 MySQL Databases độc lập trên Docker (Port 3307 - 3313) |
| **Giao tiếp liên dịch vụ** | Gọi hàm nội bộ PHP, JOIN trực tiếp giữa các bảng | **RESTful API (OpenFeign)** đồng bộ + **RabbitMQ Broker** bất đồng bộ |
| **Giao diện người dùng** | Server-side Rendering (HTML + PHP nạp lại toàn trang) | **Single Page Application (React 18 + Vite + TypeScript)**, trải nghiệm người dùng siêu mượt |
| **Màn hình Bếp (KDS)** | Không có hoặc phải F5 tải lại trang liên tục | **KDS Realtime**: Đầu bếp chạm đổi trạng thái, lưu cố định vào CSDL MySQL tức thời |
| **Đặt món tự phục vụ** | Chưa hỗ trợ gọi món qua QR tại bàn | **QR Table Self-Ordering**: Tự động sinh mã token bàn, khách quét QR đặt món trên điện thoại |
| **Quản lý Định mức (BOM)**| Nhập thủ công, không phân tích Food Cost | **Tự động tính toán Food Cost %**, sửa định mức trực tiếp (Inline Editing), auto-save MySQL |
| **Báo cáo & Xuất dữ liệu**| Xuất text thô hoặc không có bộ lọc thời gian | **Export Engine Doanh Nghiệp**: Xuất Excel UTF-8 BOM chuẩn tiếng Việt, in ấn PDF/A4 chuyên nghiệp, lọc linh hoạt theo ngày cụ thể và khoảng ngày với các nút chọn nhanh (Presets) |
| **Phân quyền người dùng** | Quyền đơn giản, phân rã lỏng lẻo | **Ma trận RBAC 3 tầng chặt chẽ**: Bảo vệ đa lớp tại Gateway Filter và Frontend Route Guard theo chuẩn Role-based Access Control |
| **Tính sẵn sàng & Chịu tải**| Khi lượng truy cập tăng vọt, toàn bộ hệ thống bị nghẽn | Độc lập chịu tải: POS và Bếp vẫn hoạt động trơn tru dù khách quét QR gọi món ồ ạt |

---

## 3. Cơ Chế Phân Quyền Vai Trò (RBAC Architecture)

Hệ thống thiết lập cơ chế phân quyền ma trận 3 vai trò chính theo chuẩn doanh nghiệp (chi tiết tại [`RBAC-MATRIX.md`](RBAC-MATRIX.md)):

1. **Quản trị viên (`ADMIN`)**:
   - Toàn quyền cấu hình hệ thống: Quản lý người dùng, tạo tài khoản nhân viên, đổi mật khẩu, phân quyền.
   - Quản trị toàn bộ sơ đồ bàn ăn, thực đơn món, định mức nguyên liệu BOM.
   - Xem và xuất toàn bộ báo cáo doanh thu, chi phí, tồn kho và số liệu kinh doanh.
2. **Quản lý nhà hàng (`MANAGER`)**:
   - Vận hành điểm bán POS, điều phối bàn ăn, duyệt phiếu nhập/xuất kho nguyên vật liệu.
   - Theo dõi báo cáo tài chính, doanh số bán hàng và ký duyệt chứng từ kho.
3. **Nhân viên phục vụ / Thu ngân (`USER`)**:
   - Thực hiện thao tác mở bàn, nhận đơn gọi món tại bàn, gửi lệnh chế biến đến bếp KDS.
   - Thanh toán hóa đơn và in phiếu cho khách hàng; bị chặn tự động truy cập vào cấu hình nhân sự, định mức giá vốn và báo cáo doanh thu nhạy cảm.

---

## 4. Hệ Thống Xuất Báo Cáo, In Ấn A4 & Kiểm Thử Toàn Diện (Export, Print & Test Suite)

Được thiết kế tại module dùng chung [`frontend/src/lib/export-utils.ts`](frontend/src/lib/export-utils.ts) và bộ kịch bản kiểm thử tự động [`scripts/test-e2e-flow.js`](scripts/test-e2e-flow.js):

1. **Xuất Bảng Tính Excel Chuẩn Doanh Nghiệp (`.xlsx`)**:
   - Tích hợp thư viện bảng tính `xlsx` chính quy, tạo trực tiếp file `.xlsx` nguyên bản, không gặp cảnh báo mất dữ liệu hay lỗi locale delimiter.
   - **Phân tách cột chuẩn xác 100%**: Dữ liệu nằm đúng từng cột A, B, C, D... không bị dồn cục vào cột A.
   - **Tự động căn chỉnh độ rộng cột (`colWidths`)**: Tính toán tự động theo độ dài nội dung để không bị khuất chữ hay lỗi `###`.
   - **Sáp nhập ô tiêu đề (`merges`)**: Dòng tiêu đề hệ thống và tên báo cáo được hợp nhất ở đầu trang bảng tính.
   - **Tự động bổ sung Metadata & Hàng Tổng cộng (Summary)**: Kèm khối ký xác nhận 3 bên trang trọng.

2. **Template In Ấn Biên Bản A4 & Xuất PDF Trực Quan**:
   - Chuẩn bố cục trang giấy in A4 chân thực trên màn hình với nền Slate tối, bóng đổ trang giấy và thanh điều khiển chuyên dụng (In ngay, Đóng popup).
   - **Khung thẻ KPI tự động cân đối**: Phân bố lưới cột đồng đều 1 dòng (`grid-template-columns: repeat(N, 1fr)`), không bị rớt dòng lẻ loi.
   - **Bảng kê chi tiết sắc nét**: Căn lề tiền tệ sang phải, trạng thái và mã ở giữa, tên mặt hàng sang trái.
   - **Khối ký xác nhận 3 - 4 bên chuẩn mực**: Tự động chia đều chiều rộng cột, chữ ký và chức danh không bị cắt mép đáy trang.
   - Tự động gộp tiêu đề phụ và kỳ báo cáo để tránh trùng lặp nội dung.

3. **Cột Thao Tác Gọn Gàng Với Menu Thả Xuống (DropdownMenu)**:
   - Thay thế toàn bộ các hàng nút thao tác rải rác trên tất cả các bảng (Đơn hàng, Bàn ăn, Kho hàng, Thực đơn, Chi phí, Ca làm, Nhân sự) bằng nút 3 chấm hiện đại kèm `DropdownMenu`.

4. **Kịch Bản Kiểm Thử Tự Động Toàn Bộ Luồng (End-to-End Test Suite)**:
   - File thực thi: [`scripts/test-e2e-flow.js`](scripts/test-e2e-flow.js).
   - Kiểm thử tự động 17 bước xuyên suốt toàn bộ hệ sinh thái vi dịch vụ:
     1. Xác thực đăng nhập JWT & Quản lý người dùng.
     2. Điều phối bàn ăn: Chuyển bàn (`/transfer`) & Ghép bàn (`/merge`).
     3. Bán hàng POS: Tạo đơn, thêm món, **tách đơn kèm metadata khách hàng & chiết khấu**, phục vụ KDS, xuất hóa đơn và thanh toán giải phóng bàn.
     4. Quản lý kho: Kiểm tra danh mục NVL, phiếu nhập kho, phiếu xuất kho.
     5. Báo cáo thống kê: Doanh thu bán hàng & Phân tầng an toàn tồn kho.
   - Lệnh chạy kiểm thử: `node scripts/test-e2e-flow.js` (Kết quả: Đạt 17/17 bước thành công 100%).

5. **Tự Động Hạch Toán Chi Phí Từ Nhập Kho (Inventory -> Order -> Report)**:
   - Khi hoàn tất phiếu nhập kho (`InventoryReceipt` sang `COMPLETED`), `inventory-service` tự động tính tổng tiền `∑ (qty * unitPrice)` và gọi Feign client sang `order-service` sinh phiếu chi loại `MUA_NGUYEN_LIEU`.
   - `order-service` phát sự kiện RabbitMQ `expense.created` sang `report-service` để cập nhật ngay chi phí vận hành và lợi nhuận ròng của ngày đó.

6. **Tìm Kiếm Thông Minh Không Dấu & Sắp Xếp Ngày Mới Nhất**:
   - **Tìm kiếm không dấu**: Hỗ trợ tìm kiếm theo nhà cung cấp, mã món, tên món... không phân biệt dấu tiếng Việt (ví dụ: gõ `thuc pham sach` tìm được `Công ty TNHH Thực Phẩm Sạch`) trên cả Backend (MySQL `utf8mb4_unicode_ci`) và Frontend (`smartIncludes`).
   - **Sắp xếp mặc định ngày mới nhất**: Báo cáo doanh thu & danh sách phiếu nhập kho sắp xếp theo thứ tự giảm dần (`DESC`) từ Backend Service & Database.
   - **Mở quyền Public xem thực đơn QR**: Gateway cho phép khách hàng quét mã QR xem thực đơn (`GET /api/menu`) không cần token xác thực.

---

## 5. Tự Động Hóa Vận Hành DevOps

- **Khởi động toàn bộ microservices**: Chạy file [`backend/start_all_services.bat`](backend/start_all_services.bat) để tự động khởi chạy Service Discovery, API Gateway và 7 Microservices tuần tự theo độ trễ tối ưu.
- **Dừng toàn bộ microservices**: Chạy file [`backend/stop_all_services.bat`](backend/stop_all_services.bat) để giải phóng toàn bộ cổng kết nối và tiến trình Java Spring Boot sạch sẽ.

---

## 6. Bản Đồ Điều Hướng Tài Liệu

- 📘 **Tài liệu Chi tiết Phân Hệ PHP Monolith**: `C:\xampp\htdocs\php-restaurant-main-main\DOCUMENTATION.md`
- ⚙️ **Tài liệu Chi tiết Phân Hệ Backend Microservices**: [`backend/DOCUMENTATION.md`](backend/DOCUMENTATION.md)
- 💻 **Tài liệu Chi tiết Phân Hệ Frontend Web App**: [`frontend/DOCUMENTATION.md`](frontend/DOCUMENTATION.md)
- 👥 **Phân Công Nhiệm Vụ & Vị Trí File Code Từng Thành Viên**: [`TASK-ASSIGNMENT.md`](TASK-ASSIGNMENT.md)
- 🔐 **Ma Trận Phân Quyền Chi Tiết (RBAC Matrix)**: [`RBAC-MATRIX.md`](RBAC-MATRIX.md)
- 🌐 **Tài liệu Kiến trúc Tổng Thể**: [`DOCUMENTATION.md`](DOCUMENTATION.md)

