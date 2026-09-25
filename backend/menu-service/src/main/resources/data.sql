MENU SERVICE DATABASE
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

