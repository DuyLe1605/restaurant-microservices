ORDER SERVICE DATABASE
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

