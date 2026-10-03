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
| **Tính sẵn sàng & Chịu tải**| Khi lượng truy cập tăng vọt, toàn bộ hệ thống bị nghẽn | Độc lập chịu tải: POS và Bếp vẫn hoạt động trơn tru dù khách quét QR gọi món ồ ạt |

---

## 3. Bản Đồ Điều Hướng Tài Liệu

- 📘 **Tài liệu Chi tiết Phân Hệ PHP Monolith**: `C:\xampp\htdocs\php-restaurant-main-main\DOCUMENTATION.md`
- ⚙️ **Tài liệu Chi tiết Phân Hệ Backend Microservices**: `D:\restaurant-microservices\backend\DOCUMENTATION.md`
- 💻 **Tài liệu Chi tiết Phân Hệ Frontend Web App**: `D:\restaurant-microservices\frontend\DOCUMENTATION.md`
- 🌐 **Tài liệu Kiến trúc Tổng Thể**: `D:\restaurant-microservices\DOCUMENTATION.md`
