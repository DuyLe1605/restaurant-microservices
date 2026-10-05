-- ==========================================================
-- MASTER DATABASE INITIALIZATION & SEED SCRIPT
-- Restaurant Microservices System
-- ==========================================================

-- 1. AUTH SERVICE DATABASE
CREATE DATABASE IF NOT EXISTS auth_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE auth_db;

CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(60) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    fullname VARCHAR(100),
    role VARCHAR(20) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- BCrypt passwords: admin123, manager123, waiter123, chef123, cashier123
INSERT INTO users (id, username, password, fullname, role, active) VALUES
(1, 'admin', '$2a$10$7R9j0YlZp5.8W2dF6g8o2.i5kQ8V2v9tJ6k0q3x5e2b8y5c2e1f4.', 'Nguyễn Quản Trị (Tổng Giám Đốc)', 'ADMIN', 1),
(2, 'manager', '$2a$10$7R9j0YlZp5.8W2dF6g8o2.i5kQ8V2v9tJ6k0q3x5e2b8y5c2e1f4.', 'Lê Quản Lý (Giám Sát Vận Hành)', 'MANAGER', 1),
(3, 'waiter', '$2a$10$7R9j0YlZp5.8W2dF6g8o2.i5kQ8V2v9tJ6k0q3x5e2b8y5c2e1f4.', 'Trần Tuấn Anh (Tổ Trưởng Phục Vụ)', 'USER', 1),
(4, 'chef', '$2a$10$7R9j0YlZp5.8W2dF6g8o2.i5kQ8V2v9tJ6k0q3x5e2b8y5c2e1f4.', 'Phạm Minh Tuấn (Bếp Trưởng)', 'USER', 1),
(5, 'cashier', '$2a$10$7R9j0YlZp5.8W2dF6g8o2.i5kQ8V2v9tJ6k0q3x5e2b8y5c2e1f4.', 'Vũ Thu Ngân (Thu Ngân Trưởng)', 'USER', 1)
ON DUPLICATE KEY UPDATE fullname=VALUES(fullname);

-- 2. USER SERVICE DATABASE
CREATE DATABASE IF NOT EXISTS user_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE user_db;

CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(60) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    fullname VARCHAR(100),
    role VARCHAR(20) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO users (id, username, password, fullname, role, active) VALUES
(1, 'admin', '$2a$10$7R9j0YlZp5.8W2dF6g8o2.i5kQ8V2v9tJ6k0q3x5e2b8y5c2e1f4.', 'Nguyễn Quản Trị (Tổng Giám Đốc)', 'ADMIN', 1),
(2, 'manager', '$2a$10$7R9j0YlZp5.8W2dF6g8o2.i5kQ8V2v9tJ6k0q3x5e2b8y5c2e1f4.', 'Lê Quản Lý (Giám Sát Vận Hành)', 'MANAGER', 1),
(3, 'waiter', '$2a$10$7R9j0YlZp5.8W2dF6g8o2.i5kQ8V2v9tJ6k0q3x5e2b8y5c2e1f4.', 'Trần Tuấn Anh (Tổ Trưởng Phục Vụ)', 'USER', 1),
(4, 'chef', '$2a$10$7R9j0YlZp5.8W2dF6g8o2.i5kQ8V2v9tJ6k0q3x5e2b8y5c2e1f4.', 'Phạm Minh Tuấn (Bếp Trưởng)', 'USER', 1),
(5, 'cashier', '$2a$10$7R9j0YlZp5.8W2dF6g8o2.i5kQ8V2v9tJ6k0q3x5e2b8y5c2e1f4.', 'Vũ Thu Ngân (Thu Ngân Trưởng)', 'USER', 1)
ON DUPLICATE KEY UPDATE fullname=VALUES(fullname);

-- 3. MENU SERVICE DATABASE
CREATE DATABASE IF NOT EXISTS menu_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE menu_db;

CREATE TABLE IF NOT EXISTS menu_item (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    price DECIMAL(14,2) NOT NULL,
    category VARCHAR(50),
    description TEXT,
    image_url VARCHAR(255),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS recipe (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    menu_id BIGINT NOT NULL,
    ingredient_id BIGINT NOT NULL,
    qty DECIMAL(10,3) NOT NULL
);

INSERT INTO menu_item (id, code, name, price, category, description, image_url, active) VALUES
(1, 'WAGYU-A5', 'Bò Wagyu A5 Nướng Sốt Nấm Truffle', 850000.00, 'Món chính', 'Thịt bò Wagyu nhập khẩu Nhật Bản nướng than hoa, sốt nấm Truffle đen.', 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop', 1),
(2, 'KING-CRAB', 'Cua Hoàng Đế Hấp Rượu Vang Trắng', 1850000.00, 'Hải sản cao cấp', 'Cua King Crab tươi sống hấp rượu vang trắng Bordeaux, bơ tỏi và thảo mộc.', 'https://images.unsplash.com/photo-1559742811-822873691df8?w=600&auto=format&fit=crop', 1),
(3, 'SALMON-LEMON', 'Cá Hồi Na Uy Áp Chảo Sốt Bơ Chanh', 360000.00, 'Món chính', 'Phi lê cá hồi Na Uy áp chảo da giòn, sốt bơ chanh vàng kiểu Pháp.', 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=600&auto=format&fit=crop', 1),
(4, 'SOUP-ROYAL', 'Súp Bào Ngư Vi Cá Hoàng Gia', 490000.00, 'Khai vị', 'Bào ngư hảo hạng hầm vi cá và nấm đông cô trong nước thượng canh 12 giờ.', 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600&auto=format&fit=crop', 1),
(5, 'LOBSTER-SALAD', 'Salad Tôm Hùm Sốt Chanh Leo', 280000.00, 'Khai vị', 'Tôm hùm baby luộc cùng xà lách Romaine hữu cơ và sốt chanh leo chua thanh.', 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&auto=format&fit=crop', 1),
(6, 'WINE-MARGAUX', 'Rượu Vang Chateau Margaux 2018', 3200000.00, 'Đồ uống & Rượu', 'Rượu vang đỏ Grand Cru Classe Bordeaux hảo hạng, hương hoa violet và gỗ sồi.', 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=600&auto=format&fit=crop', 1),
(7, 'MOUSSE-GOLD', 'Bánh Mousse Chocolate Bỉ Phủ Vàng', 150000.00, 'Tráng miệng', 'Chocolate Bỉ nguyên chất 70% mềm mịn, phủ bột vàng 24K sang trọng.', 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&auto=format&fit=crop', 1)
ON DUPLICATE KEY UPDATE name=VALUES(name);

INSERT INTO recipe (id, menu_id, ingredient_id, qty) VALUES
(1, 1, 1, 0.250),
(2, 1, 4, 0.020),
(3, 2, 2, 1.200),
(4, 3, 3, 0.200),
(5, 3, 5, 0.050),
(6, 4, 6, 0.100),
(7, 7, 7, 0.080)
ON DUPLICATE KEY UPDATE qty=VALUES(qty);

-- 4. INVENTORY SERVICE DATABASE
CREATE DATABASE IF NOT EXISTS inventory_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE inventory_db;

CREATE TABLE IF NOT EXISTS ingredient_category (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT
);

CREATE TABLE IF NOT EXISTS ingredient (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50),
    unit VARCHAR(20),
    purchase_price DECIMAL(14,2),
    min_stock INT DEFAULT 0,
    description TEXT,
    main_supplier VARCHAR(100),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS inventory_log (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    ingredient_id BIGINT NOT NULL,
    qty_change DECIMAL(10,3) NOT NULL,
    type VARCHAR(20) NOT NULL,
    related_id BIGINT,
    note TEXT,
    created_by BIGINT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO ingredient_category (id, name, description) VALUES
(1, 'Thịt & Hải sản', 'Các loại thịt bò Wagyu, cua King Crab, tôm, cá hồi tươi sống'),
(2, 'Gia vị cao cấp', 'Nấm Truffle Pháp, bơ Elle & Vire, muối hồng Himalaya'),
(3, 'Rau củ hữu cơ', 'Măng tây xanh, xà lách Romaine Đà Lạt, thảo mộc tươi'),
(4, 'Đồ làm bánh', 'Chocolate Bỉ nguyên chất, bột mì Pháp, kem whipping Anchor')
ON DUPLICATE KEY UPDATE name=VALUES(name);

INSERT INTO ingredient (id, code, name, category, unit, purchase_price, min_stock, main_supplier) VALUES
(1, 'ING-WAGYU', 'Bò Wagyu A5 Ribeye', 'Thịt & Hải sản', 'kg', 2800000.00, 5, 'Horeca Food VN'),
(2, 'ING-CRAB', 'Cua King Crab Sống', 'Thịt & Hải sản', 'kg', 1400000.00, 10, 'Hải Sản Đại Dương'),
(3, 'ING-SALMON', 'Cá Hồi Tươi Na Uy', 'Thịt & Hải sản', 'kg', 380000.00, 8, 'Salmar Norway Import'),
(4, 'ING-TRUFFLE', 'Nấm Truffle Đen Pháp', 'Gia vị cao cấp', 'hộp 100g', 950000.00, 4, 'Classic Fine Foods'),
(5, 'ING-BUTTER', 'Bơ Thảo Mộc Elle & Vire', 'Gia vị cao cấp', 'kg', 220000.00, 5, 'Classic Fine Foods'),
(6, 'ING-ABALONE', 'Bào Ngư Xanh Úc', 'Thịt & Hải sản', 'kg', 1650000.00, 3, 'Hải Sản Đại Dương'),
(7, 'ING-CHOCO', 'Chocolate Bỉ Nguyên Chất 70%', 'Đồ làm bánh', 'kg', 320000.00, 3, 'Puratos Grand-Place')
ON DUPLICATE KEY UPDATE name=VALUES(name);

INSERT INTO inventory_log (ingredient_id, qty_change, type, note) VALUES
(1, 8.500, 'RECEIPT', 'Tồn kho khả dụng'),
(2, 6.200, 'RECEIPT', 'Tồn kho khả dụng (Cảnh báo tồn dưới mức tối thiểu 10kg)'),
(3, 12.000, 'RECEIPT', 'Tồn kho khả dụng'),
(4, 2.000, 'RECEIPT', 'Tồn kho khả dụng (Cảnh báo tồn dưới mức tối thiểu 4 hộp)'),
(5, 14.000, 'RECEIPT', 'Tồn kho khả dụng'),
(6, 4.500, 'RECEIPT', 'Tồn kho khả dụng'),
(7, 5.000, 'RECEIPT', 'Tồn kho khả dụng');

-- 5. TABLE SERVICE DATABASE
CREATE DATABASE IF NOT EXISTS table_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE table_db;

CREATE TABLE IF NOT EXISTS restaurant_table (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    number VARCHAR(10) NOT NULL UNIQUE,
    capacity INT NOT NULL DEFAULT 4,
    status VARCHAR(20) NOT NULL DEFAULT 'FREE',
    order_token VARCHAR(64) UNIQUE,
    version BIGINT NOT NULL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS reservation (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    table_id BIGINT NOT NULL,
    customer_name VARCHAR(100) NOT NULL,
    customer_phone VARCHAR(30),
    party_size INT DEFAULT 1,
    start_time DATETIME NOT NULL,
    end_time DATETIME NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    created_by BIGINT,
    note TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO restaurant_table (id, number, capacity, status, order_token) VALUES
(1, 'B-01', 2, 'FREE', 'token-table-01-free'),
(2, 'B-02', 4, 'OCCUPIED', 'token-table-02-occupied'),
(3, 'B-03', 4, 'OCCUPIED', 'token-table-03-occupied'),
(4, 'B-04', 6, 'RESERVED', 'token-table-04-reserved'),
(5, 'B-05', 4, 'FREE', 'token-table-05-free'),
(6, 'B-06', 2, 'FREE', 'token-table-06-free'),
(7, 'VIP-01', 8, 'FREE', 'token-table-vip-01'),
(8, 'VIP-02', 12, 'OCCUPIED', 'token-table-vip-02')
ON DUPLICATE KEY UPDATE number=VALUES(number);

INSERT INTO reservation (id, table_id, customer_name, customer_phone, party_size, start_time, end_time, status, note) VALUES
(1, 4, 'Nguyễn Văn Hùng', '0901234567', 4, NOW() + INTERVAL 1 HOUR, NOW() + INTERVAL 3 HOUR, 'CONFIRMED', 'Kỷ niệm ngày cưới, chuẩn bị thêm nến và hoa tươi'),
(2, 7, 'Trần Thị Thuỷ', '0987654321', 8, NOW() + INTERVAL 1 DAY, NOW() + INTERVAL 27 HOUR, 'PENDING', 'Tiệc sinh nhật gia đình, mang theo bánh kem riêng')
ON DUPLICATE KEY UPDATE customer_name=VALUES(customer_name);

-- 6. ORDER SERVICE DATABASE
CREATE DATABASE IF NOT EXISTS order_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE order_db;

CREATE TABLE IF NOT EXISTS sale_order (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    table_id BIGINT,
    waiter_id BIGINT,
    cashier_id BIGINT,
    order_time DATETIME,
    status VARCHAR(20) NOT NULL DEFAULT 'OPEN',
    subtotal DECIMAL(14,2) DEFAULT 0,
    discount DECIMAL(14,2) DEFAULT 0,
    vat_rate DECIMAL(4,2) DEFAULT 0,
    total_amount DECIMAL(14,2),
    source VARCHAR(20) NOT NULL DEFAULT 'INTERNAL',
    customer_name VARCHAR(100),
    customer_phone VARCHAR(30),
    note TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sale_order_detail (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    sale_order_id BIGINT NOT NULL,
    menu_id BIGINT NOT NULL,
    menu_name VARCHAR(100),
    qty INT NOT NULL,
    price DECIMAL(14,2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ORDERED',
    note TEXT
);

CREATE TABLE IF NOT EXISTS expense (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    expense_type VARCHAR(50) NOT NULL,
    amount DECIMAL(14,2) NOT NULL,
    description TEXT,
    created_by BIGINT,
    expense_date DATE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO sale_order (id, table_id, waiter_id, order_time, status, subtotal, discount, vat_rate, total_amount, source, customer_name, customer_phone) VALUES
(1, 2, 3, NOW() - INTERVAL 30 MINUTE, 'OPEN', 1210000.00, 0.00, 8.00, 1306800.00, 'INTERNAL', 'Anh Nam', '0912345678'),
(2, 3, 3, NOW() - INTERVAL 1 HOUR, 'SERVED', 2340000.00, 100000.00, 8.00, 2427200.00, 'INTERNAL', 'Chị Mai', '0934567890'),
(3, 8, 3, NOW() - INTERVAL 3 HOUR, 'PAID', 5400000.00, 200000.00, 8.00, 5632000.00, 'INTERNAL', 'Bác Thành', '0978901234')
ON DUPLICATE KEY UPDATE status=VALUES(status);

INSERT INTO sale_order_detail (id, sale_order_id, menu_id, menu_name, qty, price, status) VALUES
(1, 1, 1, 'Bò Wagyu A5 Nướng Sốt Nấm Truffle', 1, 850000.00, 'ORDERED'),
(2, 1, 3, 'Cá Hồi Na Uy Áp Chảo Sốt Bơ Chanh', 1, 360000.00, 'ORDERED'),
(3, 2, 2, 'Cua Hoàng Đế Hấp Rượu Vang Trắng', 1, 1850000.00, 'SERVED'),
(4, 2, 4, 'Súp Bào Ngư Vi Cá Hoàng Gia', 1, 490000.00, 'SERVED'),
(5, 3, 1, 'Bò Wagyu A5 Nướng Sốt Nấm Truffle', 2, 850000.00, 'SERVED'),
(6, 3, 6, 'Rượu Vang Chateau Margaux 2018', 1, 3200000.00, 'SERVED'),
(7, 3, 4, 'Súp Bào Ngư Vi Cá Hoàng Gia', 1, 490000.00, 'SERVED')
ON DUPLICATE KEY UPDATE status=VALUES(status);

INSERT INTO expense (id, expense_type, amount, description, expense_date) VALUES
(1, 'Tiền điện kinh doanh tháng 9', 8200000.00, 'Hóa đơn điện lực EVN Quận 1', CURDATE() - INTERVAL 3 DAY),
(2, 'Thuê mặt bằng nhà hàng', 35000000.00, 'Tiền thuê mặt bằng 2 tầng tháng 9', CURDATE() - INTERVAL 20 DAY),
(3, 'Bảo trì hệ thống hút mùi', 2500000.00, 'Bảo dưỡng định kỳ lưới lọc và quạt hút bếp', CURDATE() - INTERVAL 5 DAY)
ON DUPLICATE KEY UPDATE amount=VALUES(amount);

-- 7. REPORT SERVICE DATABASE
CREATE DATABASE IF NOT EXISTS report_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE report_db;

CREATE TABLE IF NOT EXISTS report_order_summary (
    id BIGINT PRIMARY KEY,
    order_date DATE NOT NULL,
    total_amount DECIMAL(14,2) NOT NULL,
    status VARCHAR(20),
    table_number VARCHAR(10),
    cashier_name VARCHAR(100),
    source VARCHAR(20),
    synced_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS report_expense_summary (
    id BIGINT PRIMARY KEY,
    expense_type VARCHAR(50),
    amount DECIMAL(14,2) NOT NULL,
    expense_date DATE NOT NULL,
    synced_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS report_stock_snapshot (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    ingredient_id BIGINT NOT NULL,
    ingredient_name VARCHAR(100),
    current_qty DECIMAL(10,3),
    min_stock INT,
    unit VARCHAR(20),
    snapshot_date DATE,
    synced_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO report_order_summary (id, order_date, total_amount, status, table_number, source) VALUES
(101, CURDATE() - INTERVAL 6 DAY, 22000000.00, 'PAID', 'B-01', 'INTERNAL'),
(102, CURDATE() - INTERVAL 5 DAY, 25500000.00, 'PAID', 'B-02', 'INTERNAL'),
(103, CURDATE() - INTERVAL 4 DAY, 28000000.00, 'PAID', 'VIP-01', 'INTERNAL'),
(104, CURDATE() - INTERVAL 3 DAY, 32000000.00, 'PAID', 'B-03', 'INTERNAL'),
(105, CURDATE() - INTERVAL 2 DAY, 38500000.00, 'PAID', 'VIP-02', 'INTERNAL'),
(106, CURDATE() - INTERVAL 1 DAY, 41000000.00, 'PAID', 'B-04', 'INTERNAL'),
(107, CURDATE(), 28450000.00, 'PAID', 'VIP-02', 'INTERNAL')
ON DUPLICATE KEY UPDATE total_amount=VALUES(total_amount);

INSERT INTO report_expense_summary (id, expense_date, expense_type, amount) VALUES
(201, CURDATE() - INTERVAL 6 DAY, 'Tiêu hao thực phẩm', 7000000.00),
(202, CURDATE() - INTERVAL 5 DAY, 'Tiêu hao thực phẩm', 8500000.00),
(203, CURDATE() - INTERVAL 4 DAY, 'Tiêu hao thực phẩm', 9000000.00),
(204, CURDATE() - INTERVAL 3 DAY, 'Điện nước EVN', 12000000.00),
(205, CURDATE() - INTERVAL 2 DAY, 'Tiêu hao thực phẩm', 14000000.00),
(206, CURDATE() - INTERVAL 1 DAY, 'Tiêu hao thực phẩm', 15000000.00),
(207, CURDATE(), 'Chi phí vận hành', 8200000.00)
ON DUPLICATE KEY UPDATE amount=VALUES(amount);

INSERT INTO report_stock_snapshot (ingredient_id, ingredient_name, current_qty, min_stock, unit, snapshot_date) VALUES
(1, 'Bò Wagyu A5 Ribeye', 8.500, 5, 'kg', CURDATE()),
(2, 'Cua King Crab Sống', 6.200, 10, 'kg', CURDATE()),
(3, 'Cá Hồi Tươi Na Uy', 12.000, 8, 'kg', CURDATE()),
(4, 'Nấm Truffle Đen Pháp', 2.000, 4, 'hộp 100g', CURDATE())
ON DUPLICATE KEY UPDATE current_qty=VALUES(current_qty);
