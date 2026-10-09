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

## 4. Hệ Thống Xuất Báo Cáo & Lọc Dữ Liệu Theo Thời Gian (Export & Analytics Engine)

Được thiết kế tại module dùng chung [`frontend/src/lib/export-utils.ts`](frontend/src/lib/export-utils.ts), cung cấp hai luồng xuất dữ liệu chuẩn mực:

1. **Xuất Excel (CSV UTF-8 BOM)**:
   - Thêm tiền tố Byte Order Mark (`\uFEFF`) để Microsoft Excel trên Windows tự động nhận diện bảng mã UTF-8 tiếng Việt có dấu 100%, không bị vỡ font hay biến dạng ký tự.
   - Tự động bổ sung Metadata (Kỳ thống kê, Bộ phận lập, Thời gian xuất) và hàng Tổng cộng (Summary) ở cuối bảng tính.
2. **Template In Ấn A4 & Xuất PDF Trực Quan**:
   - Chuẩn bố cục in ấn A4, tự động căn lề và co giãn cột thông minh.
   - Khung thẻ KPI tóm tắt đầu trang hiển thị doanh thu, chi phí, lợi nhuận, số lượng đơn.
   - Bảng kê chi tiết kẻ viền sắc nét, phần tóm tắt tài chính và khu vực ký tên 3 bên (Người Lập Biểu, Kế Toán, Giám Đốc/Chủ Quán).
3. **Bộ lọc thời gian linh hoạt (Ngày cụ thể & Khoảng ngày)**:
   - Hỗ trợ chọn xuất riêng 1 ngày hoặc một khoảng ngày tuỳ ý.
   - Hàng nút Preset nhanh: `Hôm nay`, `Hôm qua`, `7 ngày qua`, `Tháng này`, `30 ngày qua`, `Tất cả`.
   - Tên file và tiêu đề báo cáo tự động đồng bộ theo ngày: ví dụ `Bao_Cao_Doanh_Thu_Ngay_2026-10-07.csv` hoặc `Bao_Cao_Doanh_Thu_2026-10-01_den_2026-10-07.csv`.

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

