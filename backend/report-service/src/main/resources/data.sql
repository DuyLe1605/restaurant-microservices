REPORT SERVICE DATABASE
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
