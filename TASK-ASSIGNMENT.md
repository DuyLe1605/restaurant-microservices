# 👥 PHÂN CÔNG DỰ ÁN - HỆ THỐNG QUẢN LÝ NHÀ HÀNG MICROSERVICES

## Thông Tin Nhóm

| STT | Họ và Tên | Email | Vai Trò | Tỷ Lệ Đóng Góp |
|-----|-----------|-------|---------|-----------------|
| 1 | Lê Minh Duy | leminhduy160505@gmail.com | Team Lead | 20% |
| 2 | Phạm Chấn Hưng | Hung08072005az@gmail.com | Backend Developer | 20% |
| 3 | Nguyễn Mạnh Đức | cimonwork@gmail.com | Frontend Developer | 20% |
| 4 | Trần Đức Mạnh | manhkun2005@gmail.com | Backend Developer | 20% |
| 5 | Đàm Quang Sáng | damquangsang2706@gmail.com | Frontend Developer | 20% |

---

## 📋 Phân Công Chi Tiết

### 1. Lê Minh Duy — Team Lead (20%)

**Phụ trách:** Kiến trúc hệ thống, Infrastructure, Auth Service, Order Service, Table Service

| Module | Công việc cụ thể |
|--------|-------------------|
| **Infrastructure** | Thiết lập project structure, Service Discovery (Eureka), API Gateway, Docker Compose, Database init scripts |
| **Auth Service** | JWT Security config, Entity/Repository, Service/Controller, RabbitMQ messaging |
| **Table Service** | Entity, DTOs, Service layer, Controllers (Table, Reservation, QR) |
| **Order Service** | Entity (SaleOrder, Expense), DTOs, Service layer, Order Controller, Public Order (QR Self-Ordering), Kitchen Controller |
| **Documentation** | README, Backend docs |
| **Phase 12 Hardening** | Fail-fast rollback trong createOrder khi chiếm bàn lỗi, cấu hình Feign timeouts cho order-service, bổ sung version column trong DB init |

---

### 2. Phạm Chấn Hưng — Backend Developer (20%)

**Phụ trách:** User Service, Report Service, API Gateway Security, Frontend Table/Reservation

| Module | Công việc cụ thể |
|--------|-------------------|
| **API Gateway** | JWT Authentication Filter, Route Security config |
| **User Service** | Entity, Repository, Config, DTOs, Exceptions, Service/Controller, RabbitMQ messaging |
| **Report Service** | Entity, Config, DTOs, Repository, Service/Controller, RabbitMQ Event Consumer |
| **Frontend** | Table list page, Reservation list page, QR manage page |
| **Phase 12 Hardening** | Khử độc header giả mạo tại Gateway, kiểm tra cờ active, chống IDOR và thêm /me tại user-service, idempotent upsert stock snapshot |

---

### 3. Nguyễn Mạnh Đức — Frontend Developer (20%)

**Phụ trách:** Frontend Core Setup, UI Components, Auth Pages, Layout, User Management, Dashboard

| Module | Công việc cụ thể |
|--------|-------------------|
| **Frontend Init** | Vite + React + TypeScript project setup, Tailwind CSS, shadcn/ui components |
| **Auth Frontend** | Auth types, store (Zustand), API client (Axios), Login page, Register page |
| **Layout** | App Header, Sidebar, Layout wrapper, Protected Route, App routing |
| **Shared Components** | Confirm Dialog, Empty State, Error Boundary, Loading Spinner, Page Header, Stats Card, Status Badge |
| **User Management** | User API, hooks, User list page |
| **Dashboard** | Dashboard page |
| **Utilities** | Format currency, Format date, Constants |
| **Frontend Docs** | Frontend DOCUMENTATION.md, IMPLEMENTATION.md, TRACKING.md |
| **Phase 12 Hardening** | Khóa lạc quan @Version cho RestaurantTable, bắt ObjectOptimisticLockingFailureException, kiểm tra xung đột trạng thái bàn |

---

### 4. Trần Đức Mạnh — Backend Developer (20%)

**Phụ trách:** Menu Service, Inventory Service, Backend Server

| Module | Công việc cụ thể |
|--------|-------------------|
| **Menu Service** | Entity, Config, DTOs, Repository, Exceptions, Service (MenuItem + Recipe), Controllers, OpenFeign client |
| **Inventory Service** | Entity, Enums, Config, DTOs, Repository, Exceptions, Service layer, Controllers, RabbitMQ messaging, OpenFeign client |
| **Backend Server** | Express.js backend server setup |
| **Phase 12 Hardening** | Idempotent consumer khử trùng thông điệp existsByOrderTag trong OrderCompletedConsumer, cấu hình Feign timeouts inventory |

---

### 5. Đàm Quang Sáng — Frontend Developer (20%)

**Phụ trách:** Frontend Menu, Inventory, Order, Report Pages

| Module | Công việc cụ thể |
|--------|-------------------|
| **Menu Frontend** | Menu types, Ingredient types, API clients, Hooks, Menu list page, Recipe manage page, Ingredient list page |
| **Inventory Frontend** | Inventory types, API, Hooks, Receipt list page, Issue list page |
| **Order Frontend** | Order types, Expense types, API clients, Hooks, Order list/create pages, Invoice view, Kitchen display, Public order, Expense list |
| **Report Frontend** | Report types, API, Hooks, Revenue report page, Stock report page |
| **Mock Data** | Mock data for development/testing |
| **Phase 12 Hardening** | Viết công cụ generate_defense_doc.js, xuất bản tài liệu Word GIAI_DAP_BAO_VE_MON_HOC_SOA_MICROSERVICES.docx 10 câu hỏi bảo vệ đồ án |

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
   - Auth/Infrastructure → Lê Minh Duy
   - User Service → Phạm Chấn Hưng
   - Menu/Inventory → Trần Đức Mạnh
   - Order/Table → Lê Minh Duy
   - Report → Phạm Chấn Hưng

2. **Tính năng Frontend mới:**
   - Layout/Auth/Dashboard/User → Nguyễn Mạnh Đức
   - Menu/Inventory/Order/Report Pages → Đàm Quang Sáng
   - Table/Reservation → Phạm Chấn Hưng

3. **Quy ước commit message:**
   - `feat(module): description` — Tính năng mới
   - `fix(module): description` — Sửa lỗi
   - `docs: description` — Tài liệu
   - `chore: description` — Cấu hình, cleanup
   - `refactor(module): description` — Tái cấu trúc
