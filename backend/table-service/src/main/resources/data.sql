TABLE SERVICE DATABASE
CREATE DATABASE IF NOT EXISTS table_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE table_db;

CREATE TABLE IF NOT EXISTS restaurant_table (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    number VARCHAR(10) NOT NULL UNIQUE,
    capacity INT NOT NULL DEFAULT 4,
    status VARCHAR(20) NOT NULL DEFAULT 'FREE',
    order_token VARCHAR(64) UNIQUE,
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

