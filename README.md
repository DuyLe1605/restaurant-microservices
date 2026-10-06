# 🍽️ Restaurant Management System - Microservices

Hệ thống quản lý nhà hàng xây dựng theo kiến trúc Microservices.
Dự án môn học **Phần mềm hướng dịch vụ (SOA)**.

---

## Tech Stack

### Backend
| Công nghệ | Mô tả |
|---|---|
| Java 17 | Ngôn ngữ chính |
| Spring Boot 3.x | Framework |
| Spring Cloud Gateway | API Gateway |
| Netflix Eureka | Service Discovery |
| Spring Cloud OpenFeign | Giao tiếp đồng bộ giữa services |
| RabbitMQ | Message broker (bất đồng bộ) |
| Spring Security + JWT | Xác thực & Phân quyền |
| Spring Data JPA | ORM |
| MySQL 8.0 | Database (per service) |
| Docker + Docker Compose | Containerization |
| Lombok + MapStruct | Utility |

### Frontend
| Công nghệ | Mô tả |
|---|---|
| React 18 | UI Library |
| TypeScript | Type safety |
| Vite | Build tool |
| Tailwind CSS | Utility-first CSS |
| shadcn/ui | UI Component library |
| Axios | HTTP Client |
| TanStack Query v5 | Server state management |
| Zustand | Client state management |
| React Hook Form + Zod | Form handling + validation |
| Recharts | Charts |
| React Router v6 | Routing |

---

## Kiến Trúc

```
                    ┌──────────────┐
                    │   Frontend   │
                    │ React + TS   │
                    └──────┬───────┘
                           │
                    ┌──────▼───────┐
                    │ API Gateway  │ :8080
                    │ Spring Cloud │
                    └──────┬───────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
     ┌────────▼──┐  ┌──────▼────┐  ┌───▼───────┐
     │ Auth :8081│  │User :8082 │  │Menu :8083 │
     └───────────┘  └───────────┘  └───────────┘
              │            │            │
     ┌────────▼──────┐  ┌──▼────────┐  ┌──▼──────┐
     │Inventory:8084 │  │Order:8085 │  │Table:8086│
     └───────────────┘  └───────────┘  └──────────┘
              │            │
     ┌────────▼──────┐  ┌──▼──────────┐
     │Report  :8087  │  │Notification │
     └───────────────┘  │    :8088    │
                        └─────────────┘

     ← Eureka Service Discovery :8761 →
     ← RabbitMQ Message Broker :5672 →
```

---

## Cấu Trúc Thư Mục

```
D:\restaurant-microservices\
├── README.md                    # File này
├── backend/
│   ├── IMPLEMENTATION.md        # Tổng quan BE: kiến trúc, DB, API, logic
│   ├── TRACKING.md              # Tracking tiến độ BE (93 tasks)
│   ├── docker-compose.yml
│   ├── service-discovery/
│   ├── api-gateway/
│   ├── auth-service/
│   ├── user-service/
│   ├── menu-service/
│   ├── inventory-service/
│   ├── order-service/
│   ├── table-service/
│   ├── report-service/
│   └── notification-service/
└── frontend/
    ├── IMPLEMENTATION.md        # Tổng quan FE: structure, UI, components
    ├── TRACKING.md              # Tracking tiến độ FE (100 tasks)
    └── src/
        ├── api/
        ├── hooks/
        ├── components/
        ├── pages/
        ├── stores/
        ├── types/
        └── lib/
```

---

## Thứ Tự Triển Khai

| Phase | Nội dung | BE Tasks | FE Tasks |
|---|---|---|---|
| 1 | Infrastructure (Docker, Eureka, Gateway) | 4 | — |
| 2 | Auth Service | 15 | 9 |
| 3 | User Service | 11 | — |
| 4 | Menu + Recipe | 10 | 8 |
| 5 | Inventory | 13 | 8 |
| 6 | Table + Reservation + QR | 8 | 8 |
| 7 | Order (phức tạp nhất) | 16 | 12 |
| 8 | Report + Dashboard | 9 | 6 |
| 9 | Frontend remaining pages | — | 19 |
| 10 | Integration + Polish | 7 | 7 |
| 11 | Documentation & Deliverables | 4 | 3 |
| 12 | Hardening: Idempotency, Concurrency, Security & Defense Q&A | 5 | 2 |

---

## 🎓 Tài Liệu Bảo Vệ Đồ Án Môn Học

- **File Word Báo Cáo Giải Đáp 10 Câu Hỏi Bảo Vệ**: `GIAI_DAP_BAO_VE_MON_HOC_SOA_MICROSERVICES.docx` (Chi tiết kiến trúc, bảng biểu, trích dẫn code và toàn bộ các giải pháp khắc phục lỗi phân tán).
- **Công cụ sinh tài liệu tự động**: `backend-server/generate_defense_doc.js`.

---

## Quick Start (sau khi hoàn thành)

```bash
# Backend
cd backend
docker-compose up -d

# Frontend
cd frontend
npm install
npm run dev
```

---

## Tài Liệu Chi Tiết

- **Backend**: Xem [backend/IMPLEMENTATION.md](backend/IMPLEMENTATION.md)
- **Backend Tracking**: Xem [backend/TRACKING.md](backend/TRACKING.md)
- **Frontend**: Xem [frontend/IMPLEMENTATION.md](frontend/IMPLEMENTATION.md)
- **Frontend Tracking**: Xem [frontend/TRACKING.md](frontend/TRACKING.md)
