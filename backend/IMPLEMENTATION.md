# 🍽️ Restaurant Microservices - Backend Implementation

> **Tech Stack**: Spring Boot 3.x · Java 17 · Spring Cloud · MySQL · RabbitMQ · Docker
> **Kiến trúc**: Microservices (8 services + 2 infra)
> **Giao tiếp**: OpenFeign (sync) + RabbitMQ (async)
> **Database**: Database per Service

---

## 📐 Kiến Trúc Tổng Thể

```
D:\restaurant-microservices\backend\
├── docker-compose.yml
├── service-discovery/          # Eureka Server       (Port 8761)
├── api-gateway/                # Spring Cloud Gateway (Port 8080)
├── auth-service/               # Xác thực, JWT       (Port 8081)
├── user-service/               # Quản lý user CRUD   (Port 8082)
├── menu-service/               # Thực đơn + Công thức(Port 8083)
├── inventory-service/          # Kho, nhập/xuất kho  (Port 8084)
├── order-service/              # Đơn hàng, thanh toán(Port 8085)
├── table-service/              # Bàn, đặt chỗ, QR   (Port 8086)
├── report-service/             # Báo cáo, dashboard  (Port 8087)
└── notification-service/       # Thông báo realtime  (Port 8088) [MỞ RỘNG]
```

---

## 🐳 Docker Compose

| Container | Image | Port | Database |
|---|---|---|---|
| mysql-auth | mysql:8.0 | 3307 | auth_db |
| mysql-user | mysql:8.0 | 3308 | user_db |
| mysql-menu | mysql:8.0 | 3309 | menu_db |
| mysql-inventory | mysql:8.0 | 3310 | inventory_db |
| mysql-order | mysql:8.0 | 3311 | order_db |
| mysql-table | mysql:8.0 | 3312 | table_db |
| mysql-report | mysql:8.0 | 3313 | report_db |
| rabbitmq | rabbitmq:3-management | 5672/15672 | — |
| service-discovery | Custom | 8761 | — |
| api-gateway | Custom | 8080 | — |

---

## 🔑 SERVICE 1: Auth Service (Port 8081)

### Database: auth_db
```sql
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(60) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    fullname VARCHAR(100),
    role ENUM('ADMIN','MANAGER','USER') NOT NULL,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE audit_log (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT,
    action VARCHAR(100),
    target VARCHAR(100),
    detail TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### API Endpoints
| Method | Endpoint | Mô tả | Auth |
|---|---|---|---|
| POST | /api/auth/login | Đăng nhập → JWT | Public |
| POST | /api/auth/register | Đăng ký | Public |
| POST | /api/auth/logout | Đăng xuất | JWT |
| GET | /api/auth/verify | Xác thực token | JWT |
| POST | /api/auth/refresh | Làm mới token | JWT |

### Logic: POST /api/auth/login
```
Input:  { username, password, remember? }
Validate: username bắt buộc + regex ^[A-Za-z0-9._-]+$, password bắt buộc
Flow:
  1. findByUsername → 401 nếu không có
  2. BCrypt.matches → 401 nếu sai
  3. user.active == true → 403 nếu khóa
  4. Generate JWT { id, username, fullname, role, exp }
  5. Log audit(login_success)
  6. Publish event: user.login → RabbitMQ
Output: { token, user: { id, username, fullname, role } }
```

### Logic: POST /api/auth/register
```
Input:  { fullname(max100), username(3-60, regex), password(min6), confirmPassword, role }
Flow:
  1. Validate → check trùng username(409)
  2. BCrypt.encode → INSERT user
  3. Publish: user.created → RabbitMQ
```

### Project Structure
```
auth-service/
├── src/main/java/com/restaurant/auth/
│   ├── AuthApplication.java
│   ├── config/ (SecurityConfig, RabbitMQConfig)
│   ├── controller/AuthController.java
│   ├── dto/ (LoginRequest, RegisterRequest, AuthResponse)
│   ├── entity/ (User, AuditLog)
│   ├── repository/ (UserRepository, AuditLogRepository)
│   ├── service/ (AuthService, JwtService)
│   └── exception/GlobalExceptionHandler.java
├── Dockerfile
└── pom.xml
```

---

## 👤 SERVICE 2: User Service (Port 8082)

### Database: user_db
```sql
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(60) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    fullname VARCHAR(100),
    role ENUM('ADMIN','MANAGER','USER') NOT NULL,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### API Endpoints
| Method | Endpoint | Auth |
|---|---|---|
| GET | /api/users | ADMIN |
| GET | /api/users/{id} | ADMIN |
| POST | /api/users | ADMIN |
| PUT | /api/users/{id} | ADMIN |
| DELETE | /api/users/{id} | ADMIN |
| GET | /api/users/count | Internal |

### Logic
- POST: Validate username(3-60, regex, unique) + password(min6) + role → BCrypt → INSERT → Publish user.created
- DELETE: Check userId != currentUser(400) → DELETE → Publish user.deleted
- RabbitMQ Consumer: user.created từ auth-service → sync
- RabbitMQ Publisher: user.updated, user.deleted

---

## 🍕 SERVICE 3: Menu Service (Port 8083)

### Database: menu_db
```sql
CREATE TABLE menu_item (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    price DECIMAL(14,2) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE recipe (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    menu_id BIGINT NOT NULL,
    ingredient_id BIGINT NOT NULL,
    qty DECIMAL(10,3) NOT NULL,
    FOREIGN KEY (menu_id) REFERENCES menu_item(id) ON DELETE CASCADE
);
```

### API Endpoints - Menu
| Method | Endpoint | Auth |
|---|---|---|
| GET | /api/menu (phân trang, search) | ALL |
| GET | /api/menu/{id} | ALL |
| POST | /api/menu | ADMIN/MANAGER |
| PUT | /api/menu/{id} | ADMIN/MANAGER |
| DELETE | /api/menu/{id} | ADMIN/MANAGER |

### API Endpoints - Recipe
| Method | Endpoint | Auth |
|---|---|---|
| GET | /api/recipes?menuId={id} | ADMIN/MANAGER |
| POST | /api/recipes | ADMIN/MANAGER |
| DELETE | /api/recipes/{id} | ADMIN/MANAGER |
| POST | /api/recipes/check-inventory | Internal |

### Logic: POST /api/recipes (Replace all)
```
Input: { menuId, items: [{ ingredientId, qty }] }
Flow: Validate menuId → OpenFeign check ingredientId exists
  → DELETE old → INSERT new (transaction)
```

### Logic: POST /api/recipes/check-inventory (Internal)
```
Input: { items: [{ menuId, qty }] }
Flow: Lấy recipe → tính cần = recipe.qty × orderQty → gộp theo ingredientId
  → OpenFeign inventory-service: GET /api/ingredients/{id}/stock → so sánh
Output: { sufficient, missing: [{ ingredientName, needed, available }] }
```

### OpenFeign → inventory-service

---

## 📦 SERVICE 4: Inventory Service (Port 8084)

### Database: inventory_db
```sql
CREATE TABLE ingredient_category (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT
);

CREATE TABLE ingredient (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50),
    unit VARCHAR(20),
    purchase_price DECIMAL(14,2),
    min_stock INT DEFAULT 0,
    description TEXT,
    main_supplier VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE inventory_receipt (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    created_by BIGINT,
    supplier VARCHAR(100),
    receipt_date DATE,
    status ENUM('PENDING','COMPLETED') DEFAULT 'PENDING',
    note TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE inventory_receipt_detail (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    receipt_id BIGINT NOT NULL,
    ingredient_id BIGINT NOT NULL,
    qty DECIMAL(10,3),
    unit_price DECIMAL(14,2),
    FOREIGN KEY (receipt_id) REFERENCES inventory_receipt(id) ON DELETE CASCADE,
    FOREIGN KEY (ingredient_id) REFERENCES ingredient(id)
);

CREATE TABLE inventory_issue (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    created_by BIGINT,
    issue_type ENUM('SALE','MANUAL','WASTE') DEFAULT 'SALE',
    issue_date DATE,
    status ENUM('PENDING','COMPLETED') DEFAULT 'PENDING',
    note TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE inventory_issue_detail (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    issue_id BIGINT NOT NULL,
    ingredient_id BIGINT NOT NULL,
    qty DECIMAL(10,3),
    FOREIGN KEY (issue_id) REFERENCES inventory_issue(id) ON DELETE CASCADE,
    FOREIGN KEY (ingredient_id) REFERENCES ingredient(id)
);

CREATE TABLE inventory_log (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    ingredient_id BIGINT NOT NULL,
    qty_change DECIMAL(10,3),
    type ENUM('RECEIPT','ISSUE','ADJUST','EXPIRE'),
    related_id BIGINT,
    note TEXT,
    created_by BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ingredient_id) REFERENCES ingredient(id)
);

CREATE TABLE stock_adjustment (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    ingredient_id BIGINT NOT NULL,
    old_qty INT, new_qty INT,
    adjust_date DATE, reason VARCHAR(100), note TEXT,
    adjusted_by BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ingredient_id) REFERENCES ingredient(id)
);
```

### API Endpoints - Ingredient
| Method | Endpoint | Auth |
|---|---|---|
| GET | /api/ingredients (phân trang) | ALL |
| GET | /api/ingredients/{id} | ALL |
| GET | /api/ingredients/{id}/stock | ALL |
| POST | /api/ingredients | ADMIN/MANAGER |
| PUT | /api/ingredients/{id} | ADMIN/MANAGER |
| DELETE | /api/ingredients/{id} | ADMIN/MANAGER |

### API Endpoints - Category
| GET/POST/PUT/DELETE | /api/ingredient-categories | ADMIN/MANAGER |

### API Endpoints - Receipt (Phiếu nhập)
| Method | Endpoint | Auth |
|---|---|---|
| GET | /api/inventory/receipts | ADMIN/MANAGER |
| POST | /api/inventory/receipts | ADMIN/MANAGER |
| PUT | /api/inventory/receipts/{id} (chỉ PENDING) | ADMIN/MANAGER |
| DELETE | /api/inventory/receipts/{id} (chỉ PENDING) | ADMIN/MANAGER |
| POST | /api/inventory/receipts/{id}/complete | ADMIN/MANAGER |

### API Endpoints - Issue (Phiếu xuất)
| Method | Endpoint | Auth |
|---|---|---|
| GET | /api/inventory/issues | ADMIN/MANAGER |
| POST | /api/inventory/issues | ADMIN/MANAGER |
| POST | /api/inventory/issues/from-order | Internal |

### Logic: POST /api/inventory/receipts
```
Input: { supplier?(2-100), receiptDate(<=today,>=2020), note?(max500),
         items: [{ ingredientId, qty(>0,<=99999,max3dec), unitPrice(>=0,<=1tỷ) }] }
Validate: >= 1 item, no duplicate ingredientId
Flow: BEGIN → INSERT receipt(PENDING) → INSERT details → COMMIT
```

### Logic: POST .../complete
```
Flow: findById(404) → status==PENDING(400) → GET details
  → BEGIN → forEach: INSERT log(+qty, RECEIPT) + UPDATE ingredient.purchase_price
  → SET COMPLETED → COMMIT → Publish inventory.stock.updated
```

### Logic: POST .../issues/from-order
```
Flow: OpenFeign menu-service lấy recipe → tính ingredientNeeded
  → BEGIN → INSERT issue(SALE,COMPLETED) + INSERT details + INSERT log(-qty)
  → COMMIT → Publish inventory.stock.updated
```

### Logic: GET .../stock
```sql
SELECT COALESCE(SUM(qty_change), 0) FROM inventory_log WHERE ingredient_id = ?
```

### RabbitMQ
- Consumer: order.completed → auto xuất kho
- Publisher: inventory.stock.updated, inventory.receipt.created

---

## 🛒 SERVICE 5: Order Service (Port 8085)

### Database: order_db
```sql
CREATE TABLE sale_order (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    table_id BIGINT,
    waiter_id BIGINT,
    cashier_id BIGINT,
    order_time DATETIME,
    status ENUM('OPEN','SERVED','PAID','CANCEL') DEFAULT 'OPEN',
    discount DECIMAL(14,2) DEFAULT 0,
    vat_rate DECIMAL(4,2) DEFAULT 0,
    total_amount DECIMAL(14,2),
    source ENUM('INTERNAL','QR') DEFAULT 'INTERNAL',
    customer_name VARCHAR(100),
    customer_phone VARCHAR(30),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE sale_order_detail (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    sale_order_id BIGINT NOT NULL,
    menu_id BIGINT NOT NULL,
    qty INT,
    price DECIMAL(14,2),
    status ENUM('ORDERED','COOKED','SERVED','CANCELED') DEFAULT 'ORDERED',
    FOREIGN KEY (sale_order_id) REFERENCES sale_order(id) ON DELETE CASCADE
);

CREATE TABLE expense (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    expense_type VARCHAR(50),
    amount DECIMAL(14,2),
    description TEXT,
    created_by BIGINT,
    expense_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### API Endpoints - Order
| Method | Endpoint | Auth |
|---|---|---|
| GET | /api/orders (filter, search, paginate) | ALL |
| GET | /api/orders/{id} | ALL |
| POST | /api/orders | ALL |
| PUT | /api/orders/{id} (chỉ OPEN) | ALL |
| DELETE | /api/orders/{id} (OPEN/CANCEL) | ADMIN/MANAGER |
| POST | /api/orders/{id}/complete | ALL |
| POST | /api/orders/{id}/pay | ALL |
| POST | /api/orders/{id}/cancel | ALL |
| POST | /api/orders/{id}/add-items | ALL |
| GET | /api/orders/{id}/invoice | ALL |

### API Endpoints - Public (QR)
| GET | /api/public-order/start?token= | Public |
| POST | /api/public-order/submit | Public |

### API Endpoints - Expense
| GET/POST/PUT/DELETE | /api/expenses | ADMIN/MANAGER |

### State Machine
```
OPEN ──complete()──→ SERVED ──pay()──→ PAID
OPEN ──pay()───────────────────────→ PAID  (auto xuất kho)
OPEN ──cancel()────────────────────→ CANCEL (trả bàn)
```

### Logic: POST /api/orders
```
Input: { tableId, orderTime?, discount?, vatRate?, items: [{ menuId, qty }] }
Flow:
  1. OpenFeign table-service: GET table → check FREE
  2. OpenFeign menu-service: GET prices + check inventory
  3. Validate discount(>=0, <subtotal), vatRate(0-100)
  4. Tính total = (subtotal - discount) × (1 + vatRate/100)
  5. INSERT order(OPEN) + details
  6. OpenFeign table-service: SET OCCUPIED
  7. Publish: order.created
```

### Logic: POST .../pay
```
Flow:
  1. status IN (OPEN, SERVED) → else 400
  2. IF OPEN → publish order.completed (inventory xuất kho)
  3. SET PAID, cashier_id = currentUser
  4. OpenFeign table-service: SET FREE
  5. Publish: order.paid
```

### OpenFeign → table-service, menu-service
### RabbitMQ Publisher: order.created, order.completed, order.paid, order.cancelled

---

## 🪑 SERVICE 6: Table Service (Port 8086)

### Database: table_db
```sql
CREATE TABLE restaurant_table (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    number VARCHAR(10) UNIQUE NOT NULL,
    status ENUM('FREE','OCCUPIED','RESERVED') DEFAULT 'FREE',
    order_token VARCHAR(64) UNIQUE NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE reservation (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    table_id BIGINT NOT NULL,
    customer_name VARCHAR(100) NOT NULL,
    party_size INT DEFAULT 1,
    start_time DATETIME NOT NULL,
    end_time DATETIME NOT NULL,
    status ENUM('PENDING','CONFIRMED','CANCELLED') DEFAULT 'PENDING',
    created_by BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (table_id) REFERENCES restaurant_table(id)
);
```

### API Endpoints - Table
| Method | Endpoint | Auth |
|---|---|---|
| GET | /api/tables | ALL |
| GET | /api/tables/{id} | ALL |
| POST | /api/tables | ADMIN/MANAGER |
| PUT | /api/tables/{id} | ADMIN/MANAGER |
| DELETE | /api/tables/{id} | ADMIN/MANAGER |
| PUT | /api/tables/{id}/status | Internal/ALL |
| GET | /api/tables/by-token/{token} | Public |

### API Endpoints - Reservation
| GET/POST/PUT/DELETE | /api/reservations | ADMIN/MANAGER |

### API Endpoints - QR
| POST | /api/qr/{tableId}/generate | ADMIN/MANAGER |
| DELETE | /api/qr/{tableId}/clear | ADMIN/MANAGER |
| GET | /api/qr/{tableId}/download | ADMIN/MANAGER |

### Logic: Reservation overlap check
```sql
WHERE table_id=? AND status!='CANCELLED' AND start_time < endTime AND end_time > startTime
```

---

## 📊 SERVICE 7: Report Service (Port 8087)

### Database: report_db (Synced via RabbitMQ)
```sql
CREATE TABLE report_order_summary (
    id BIGINT PRIMARY KEY,
    order_date DATE, total_amount DECIMAL(14,2), status VARCHAR(20),
    table_number VARCHAR(10), cashier_name VARCHAR(100), source VARCHAR(20),
    synced_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE report_expense_summary (
    id BIGINT PRIMARY KEY,
    expense_type VARCHAR(50), amount DECIMAL(14,2), expense_date DATE,
    synced_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE report_stock_snapshot (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    ingredient_id BIGINT, ingredient_name VARCHAR(100),
    current_qty DECIMAL(10,3), min_stock INT, unit VARCHAR(20),
    snapshot_date DATE, synced_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### API Endpoints
| GET | /api/dashboard | ALL |
| GET | /api/reports/revenue?start=&end= | ADMIN/MANAGER |
| GET | /api/reports/revenue/{day} | ADMIN/MANAGER |
| GET | /api/reports/stock | ADMIN/MANAGER |

### RabbitMQ Consumers
order.paid → sync orders | expense.created → sync expenses | inventory.stock.updated → sync stock

---

## 🐰 RabbitMQ Event Map

| Event | Publisher | Consumer(s) |
|---|---|---|
| user.created | auth-service | user-service |
| user.updated | user-service | auth-service |
| user.deleted | user-service | auth-service |
| order.created | order-service | notification-service |
| order.completed | order-service | inventory-service |
| order.paid | order-service | report-service |
| order.cancelled | order-service | report-service |
| expense.created | order-service | report-service |
| inventory.stock.updated | inventory-service | report-service, notification-service |
| inventory.receipt.created | inventory-service | report-service |

---

## 🔐 Phân Quyền

| Chức năng | ADMIN | MANAGER | USER |
|---|:---:|:---:|:---:|
| Dashboard | ✅ | ✅ | ✅ |
| User CRUD | ✅ | ❌ | ❌ |
| Menu/Recipe | ✅ | ✅ | ❌ |
| Ingredient/Category | ✅ | ✅ | ❌ |
| Nhập/Xuất kho | ✅ | ✅ | ❌ |
| Đơn hàng (xem/tạo/sửa) | ✅ | ✅ | ✅ |
| Xóa đơn hàng | ✅ | ✅ | ❌ |
| Bàn/Đặt chỗ/QR | ✅ | ✅ | ❌ |
| Báo cáo | ✅ | ✅ | ❌ |
| Chi phí | ✅ | ✅ | ❌ |

---

## 📁 Common Dependencies (pom.xml)

```
spring-boot-starter-web, data-jpa, validation, security
spring-cloud-starter-netflix-eureka-client
spring-cloud-starter-openfeign
spring-boot-starter-amqp (RabbitMQ)
mysql-connector-j
jjwt-api, jjwt-impl, jjwt-jackson (io.jsonwebtoken 0.12.x)
lombok, mapstruct
spring-boot-devtools, spring-boot-starter-test
```
