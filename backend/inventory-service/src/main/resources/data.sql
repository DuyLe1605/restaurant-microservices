INVENTORY SERVICE DATABASE
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

