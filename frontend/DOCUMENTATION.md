# 💻 TÀI LIỆU FRONTEND: ỨNG DỤNG WEB NHÀ HÀNG HIỆN ĐẠI (REACT 18 + TYPESCRIPT)

> **Công nghệ**: React 18 · TypeScript · Vite · Tailwind CSS · TanStack React Query v5 · Zustand · Lucide Icons · Sonner Toast · React Router v6  
> **Kiến trúc**: Single Page Application (SPA) · Component-driven Architecture  
> **Vị trí thư mục**: `D:\restaurant-microservices\frontend`

---

## 1. Cấu Trúc Mã Nguồn Frontend

```
D:\restaurant-microservices\frontend\src\
├── api/                         # Khai báo các hàm gọi API RESTful (Axios Client)
│   ├── axios-instance.ts            # Cấu hình Axios, Interceptor đính kèm Bearer JWT Token
│   ├── auth.api.ts                  # API đăng nhập, đăng ký
│   ├── menu.api.ts                  # API thực đơn, công thức BOM
│   ├── order.api.ts                 # API bán hàng POS, cập nhật trạng thái bếp KDS
│   ├── table.api.ts                 # API sơ đồ bàn, chuyển bàn, ghép bàn, mã QR
│   ├── ingredient.api.ts            # API nguyên liệu kho
│   ├── inventory.api.ts             # API phiếu nhập xuất kho
│   ├── report.api.ts                # API dashboard và báo cáo tài chính
│   └── shift.api.ts                 # API quản lý ca làm việc
├── components/                  # Các thành phần giao diện tái sử dụng
│   ├── layout/                      # Khung giao diện chính
│   │   ├── app-layout.tsx               # Layout chuẩn có Sidebar & Header
│   │   ├── app-sidebar.tsx              # Sidebar phân tầng 6 nhóm chức năng khoa học
│   │   └── protected-route.tsx          # Kiểm tra JWT Token trước khi cho phép vào trang
│   ├── shared/                      # Component tiện ích dùng chung
│   │   ├── error-boundary.tsx           # Bắt lỗi runtime JavaScript, chống trắng màn hình
│   │   ├── page-header.tsx              # Tiêu đề trang chuẩn
│   │   ├── loading-spinner.tsx          # Hiệu ứng xoay khi tải dữ liệu
│   │   ├── empty-state.tsx              # Hiển thị khi danh sách trống
│   │   └── confirm-dialog.tsx           # Hộp thoại xác nhận thao tác nguy hiểm (Xóa, Hủy)
│   └── ui/                          # Thư viện UI nguyên tử (Buttons, Inputs, Dialogs, Tables)
├── hooks/                       # Custom React Hooks tích hợp TanStack React Query
│   ├── use-auth.ts                  # Hook đăng nhập, đăng xuất
│   ├── use-menu.ts                  # Hook dữ liệu thực đơn, định mức BOM
│   ├── use-kitchen.ts               # Hook điều phối màn hình bếp KDS (lưu realtime vào MySQL)
│   ├── use-tables.ts                # Hook sơ đồ bàn và đơn hàng trực tiếp trên bàn
│   ├── use-orders.ts                # Hook sổ đơn hàng
│   ├── use-ingredients.ts           # Hook danh mục nguyên liệu
│   └── use-reports.ts               # Hook báo cáo doanh thu & tồn kho
├── pages/                       # Toàn bộ màn hình chức năng của hệ thống
│   ├── auth/                        # Trang Đăng nhập (`/login`), Đăng ký (`/register`)
│   ├── dashboard.tsx                # Bảng điều khiển kinh doanh tổng thể (`/dashboard`)
│   ├── order/                       # Bán hàng POS (`/orders/create`), Danh sách đơn (`/orders`)
│   ├── kitchen/                     # Màn hình Bếp & Quầy Bar KDS (`/kitchen`)
│   ├── table/                       # Sơ đồ bàn ăn tương tác thời gian thực (`/tables`)
│   ├── menu/                        # Thực đơn & Định Lượng BOM tích hợp (`/menu`)
│   ├── ingredient/                  # Danh mục nguyên liệu kho (`/ingredients`)
│   ├── inventory/                   # Phiếu nhập xuất kho (`/inventory/receipts`)
│   ├── qr/                          # Quản lý mã QR bàn ăn (`/qr`)
│   ├── shift/                       # Mở ca, chốt ca, kiểm tiền (`/shifts`)
│   ├── expense/                     # Sổ chi phí vận hành (`/expenses`)
│   ├── report/                      # Báo cáo doanh thu (`/reports/revenue`), Tồn kho (`/reports/stock`)
│   ├── user/                        # Quản trị nhân viên & phân quyền (`/users`)
│   ├── public/                      # Khách quét QR tự gọi món (`/public/order`)
│   └── not-found.tsx                # Trang lỗi 404 cao cấp khi vào sai đường dẫn
├── stores/                      # Quản lý State toàn cục bằng Zustand
│   └── auth-store.ts                # Lưu trữ JWT Token và thông tin User đăng nhập
├── types/                       # Định nghĩa TypeScript Type & Interface nghiêm ngặt
├── App.tsx                      # Cấu hình Routing của toàn bộ ứng dụng
└── main.tsx                     # Điểm khởi chạy React, kích hoạt Future Flags v7 & Error Boundary
```

---

## 2. Chi Tiết Các Màn Hình Chức Năng Đột Phá

### 2.1. Sơ Đồ Bàn Ăn Thời Gian Thực (`/tables`)
- **Hiển thị trực quan theo khu vực**: Tầng 1, Tầng 2, Sân vườn, Phòng VIP.
- **Thẻ đơn hàng trực tiếp (Live Order Card)**: Bàn có khách hiển thị ngay: Mã đơn hàng (🧾 `#ORD`), Tên khách (👤), Tóm tắt các món đang ăn và Số tiền tạm tính.
- **Chuyển bàn / Ghép bàn nguyên tử**: Chuyển giao đơn hàng tức thời sang bàn mới chỉ với 1 click, tự động cập nhật trạng thái bàn nguồn và bàn đích trong database.

### 2.2. Màn Hình Bếp & Quầy Bar KDS (`/kitchen`)
- **Hiển thị lệnh gọi món thời gian thực**: Phân loại theo phân khu (Bếp Nóng, Bếp Khai vị & Lẩu, Quầy Bar).
- **Bộ đếm thời gian theo màu**: Xanh (<10 phút), Vàng (10-20 phút), Đỏ nhấp nháy (>20 phút cảnh báo trễ món).
- **Điều phối trạng thái nấu**:
  - Chạm chuyển từng món: *Chờ nấu $\rightarrow$ Đang nấu $\rightarrow$ Đã xong $\rightarrow$ Đã ra món*.
  - Nút tác vụ nhanh: *"Nấu tất cả"*, *"Nấu xong hết"*, *"Ra món hết"*.
  - **Lưu cố định vào MySQL**: Trạng thái được cập nhật trực tiếp vào `order_db.sale_order_detail`, bảo lưu 100% khi chuyển trang hoặc tải lại.

### 2.3. Thực Đơn & Công Thức Định Mức BOM (`/menu`)
- **Tích hợp 2 trong 1**: Quản lý giá bán món ăn và ma trận Định mức nguyên vật liệu tiêu hao (Food Cost) trên cùng một giao diện.
- **Chỉnh sửa định mức trực tiếp (Inline Editable)**:
  - Bộ điều khiển số lượng `-` và `+` bước nhảy 0.05.
  - Ô nhập số thập phân trực tiếp.
  - Nút icon ✏️ sửa nhanh qua popup.
- **Tự động tính toán Food Cost**: Tự động nhân đơn giá nhập nguyên liệu x định lượng để hiển thị Giá vốn BOM và tỷ lệ % Food Cost ngay lập tức.
- **Auto-Save vào MySQL**: Tự động lưu vào cơ sở dữ liệu khi thay đổi, ghi nhớ Tab và Món ăn đang chọn khi điều hướng trang.

### 2.4. Bán Hàng Tại Quầy POS (`/orders/create`)
- Giao diện cảm ứng chạm nhanh, tìm kiếm món ăn theo mã hoặc tên.
- Tự động kiểm tra đối soát tồn kho nguyên liệu trước khi nhận đơn.
- Hỗ trợ thêm ghi chú khẩu vị cho từng món ăn (ít cay, không đường,...).

### 2.5. Khách Tự Gọi Món Qua Mã QR Bàn (`/public/order`)
- Khách dùng điện thoại quét mã QR dán tại bàn để mở thực đơn điện tử.
- Chọn món và gửi lệnh trực tiếp vào hệ thống mà không cần cài đặt ứng dụng.
- Đơn hàng tự động đồng bộ sang màn hình POS của thu ngân và màn hình Bếp KDS.

### 2.6. Khả Năng Phòng Ngừa Lỗi Toàn Diện
- **Error Boundary**: Bọc toàn bộ ứng dụng, hiển thị giao diện báo lỗi thân thiện kèm nút *"Tải lại trang"* và *"Về trang chủ"* khi có ngoại lệ phát sinh.
- **Trang 404 Not Found**: Định tuyến các liên kết sai hoặc trang không tồn tại về trang 404 có các nút điều hướng nhanh.
- **React Router Future Flags**: Bật sẵn `v7_startTransition` và `v7_relativeSplatPath`, làm sạch hoàn toàn warning trong console.

### 2.7. Hệ Thống Xuất Báo Cáo & In Ấn Đa Năng Chuẩn Doanh Nghiệp (`export-utils.ts`)
- **Xuất file Excel (CSV UTF-8 BOM)**:
  - Khắc phục triệt để lỗi hiển thị tiếng Việt trên Microsoft Excel Windows bằng cách chèn Byte Order Mark (`\uFEFF`).
  - Tự động bổ sung Metadata phần đầu (Kỳ thống kê, Thời gian lập, Bộ phận) và Dòng tổng hợp (KPI Tổng doanh thu, Chi phí, Số lượng đơn).
- **Mẫu in ấn & Xuất PDF chuyên nghiệp**:
  - Tự động định dạng trang in A4 chuẩn tài chính doanh nghiệp: Header nhà hàng, Thẻ KPI tóm tắt, Bảng số liệu viền nét cao, Dòng tổng cộng và Phần ký tên 3 bên (Người Lập Biểu, Kế Toán, Giám Đốc/Chủ Quán).

### 2.8. Bộ Lọc Thời Gian Nâng Cao (Khoảng ngày & Ngày cụ thể) Với Nút Chọn Nhanh (Presets)
- **Lọc theo ngày cụ thể**: Cho phép người quản lý kiểm tra và xuất báo cáo cho riêng 1 ngày phát sinh giao dịch (`startDate === endDate`). Tên file và tiêu đề tự động đổi thành `Bao_Cao_..._Ngay_YYYY-MM-DD.csv`.
- **Lọc theo khoảng ngày**: Linh hoạt chọn từ ngày bắt đầu đến ngày kết thúc.
- **Hàng nút Preset chọn nhanh**: `Hôm nay`, `Hôm qua`, `7 ngày qua`, `Tháng này`, `30 ngày qua`, `Tất cả` giúp thao tác tức thì chỉ với 1 click.
- **Phủ sóng đồng bộ trên 6 phân hệ cốt lõi**:
  - Nhập kho (`/inventory/receipts`)
  - Xuất kho (`/inventory/issues`)
  - Doanh thu & Lợi nhuận (`/reports/revenue`)
  - Đơn hàng & POS (`/orders`)
  - Chi phí vận hành (`/expenses`)
  - Tồn kho nguyên liệu (`/reports/stock`)

### 2.9. Kiểm Soát Quyền Truy Cập & Phân Quyền Vai Trò (RBAC Integration)
- **Bảo vệ Route đa tầng**: Kết hợp `ProtectedRoute` và ma trận phân quyền `RBAC-MATRIX.md`, chặn truy cập trái phép trực tiếp từ URL.
- **Sidebar tự động thích ứng**: Nhân viên (`USER`) chỉ thấy các màn hình phục vụ trực tiếp (Bán hàng, Sơ đồ bàn, Bếp KDS), tự động ẩn các mục nhạy cảm (Doanh thu, Quản trị người dùng, Định mức giá vốn).

---

## 3. Hướng Dẫn Khởi Chạy Frontend

1. Di chuyển vào thư mục frontend:
   ```bash
   cd D:\restaurant-microservices\frontend
   ```
2. Cài đặt các gói phụ thuộc (nếu chưa cài):
   ```bash
   npm install
   ```
3. Khởi chạy máy chủ phát triển (Vite Dev Server):
   ```bash
   npm run dev
   ```
4. Mở trình duyệt truy cập:
   ```
   http://localhost:5174/
   ```
   - **Tài khoản đăng nhập**: `admin` / `admin123`
