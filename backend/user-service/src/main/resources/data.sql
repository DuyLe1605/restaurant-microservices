USER SERVICE DATABASE
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

