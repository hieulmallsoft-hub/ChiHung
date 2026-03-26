-- Sample seed data for SportShop
-- Run after schema migration V1__init_schema.sql

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Roles
INSERT INTO roles (id, name, created_at, updated_at)
SELECT gen_random_uuid(), 'ROLE_ADMIN', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name = 'ROLE_ADMIN');

INSERT INTO roles (id, name, created_at, updated_at)
SELECT gen_random_uuid(), 'ROLE_USER', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name = 'ROLE_USER');

-- Admin account: admin@sportshop.vn / admin123
INSERT INTO users (id, email, password, full_name, phone, status, enabled, deleted, created_at, updated_at)
SELECT gen_random_uuid(),
       'admin@sportshop.vn',
       crypt('admin123', gen_salt('bf')),
       'Admin System',
       '0900000000',
       'ACTIVE',
       TRUE,
       FALSE,
       NOW(),
       NOW()
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin@sportshop.vn');

INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u
JOIN roles r ON r.name = 'ROLE_ADMIN'
WHERE u.email = 'admin@sportshop.vn'
  AND NOT EXISTS (
      SELECT 1 FROM user_roles ur WHERE ur.user_id = u.id AND ur.role_id = r.id
  );

-- 10 demo users: user1..user10@sportshop.vn / user123
DO $$
DECLARE i INT;
BEGIN
  FOR i IN 1..10 LOOP
    INSERT INTO users (id, email, password, full_name, phone, status, enabled, deleted, created_at, updated_at)
    SELECT gen_random_uuid(),
           'user' || i || '@sportshop.vn',
           crypt('user123', gen_salt('bf')),
           'User Demo ' || i,
           '09100000' || LPAD(i::TEXT, 2, '0'),
           'ACTIVE',
           TRUE,
           FALSE,
           NOW(),
           NOW()
    WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'user' || i || '@sportshop.vn');

    INSERT INTO user_roles (user_id, role_id)
    SELECT u.id, r.id
    FROM users u
    JOIN roles r ON r.name = 'ROLE_USER'
    WHERE u.email = 'user' || i || '@sportshop.vn'
      AND NOT EXISTS (
          SELECT 1 FROM user_roles ur WHERE ur.user_id = u.id AND ur.role_id = r.id
      );
  END LOOP;
END $$;

-- Categories
INSERT INTO categories (id, name, slug, description, active, deleted, created_at, updated_at)
SELECT gen_random_uuid(), x.name, x.slug, x.description, TRUE, FALSE, NOW(), NOW()
FROM (
  VALUES
    ('Pickleball', 'pickleball', 'San pham cho bo mon pickleball'),
    ('Cau Long', 'cau-long', 'Vot, giay, quan ao cau long'),
    ('Bong Da', 'bong-da', 'Do the thao bong da'),
    ('Gym', 'gym', 'Dung cu va trang phuc gym'),
    ('Chay Bo', 'chay-bo', 'Giay va phu kien running'),
    ('Bong Ro', 'bong-ro', 'Banh, giay, do tap bong ro')
) AS x(name, slug, description)
WHERE NOT EXISTS (SELECT 1 FROM categories c WHERE c.slug = x.slug);

-- Brands
INSERT INTO brands (id, name, slug, description, active, deleted, created_at, updated_at)
SELECT gen_random_uuid(), x.name, x.slug, x.description, TRUE, FALSE, NOW(), NOW()
FROM (
  VALUES
    ('Nike', 'nike', 'Thuong hieu Nike'),
    ('Adidas', 'adidas', 'Thuong hieu Adidas'),
    ('Yonex', 'yonex', 'Thuong hieu Yonex'),
    ('Li-Ning', 'li-ning', 'Thuong hieu Li-Ning'),
    ('Asics', 'asics', 'Thuong hieu Asics'),
    ('Mizuno', 'mizuno', 'Thuong hieu Mizuno'),
    ('Wilson', 'wilson', 'Thuong hieu Wilson'),
    ('Molten', 'molten', 'Thuong hieu Molten')
) AS x(name, slug, description)
WHERE NOT EXISTS (SELECT 1 FROM brands b WHERE b.slug = x.slug);

-- Products (24 rows)
INSERT INTO products (
  id, name, sku, category_id, brand_id, price, sale_price, short_description, description,
  thumbnail_url, stock_quantity, sold_count, status, deleted, created_at, updated_at
)
SELECT
  gen_random_uuid(),
  p.name,
  p.sku,
  c.id,
  b.id,
  p.price,
  p.sale_price,
  p.short_desc,
  p.full_desc,
  CASE p.category_slug
    WHEN 'pickleball' THEN 'https://images.unsplash.com/photo-1710772099352-f8fbb7b30977?auto=format&fit=crop&w=1200&q=80'
    WHEN 'cau-long' THEN 'https://images.unsplash.com/photo-1721760886982-3c643f05813d?auto=format&fit=crop&w=1200&q=80'
    WHEN 'bong-da' THEN 'https://images.unsplash.com/photo-1647426045352-64657a80adaa?auto=format&fit=crop&w=1200&q=80'
    WHEN 'gym' THEN 'https://images.unsplash.com/photo-1745329532589-4f33352c4b10?auto=format&fit=crop&w=1200&q=80'
    WHEN 'chay-bo' THEN 'https://images.unsplash.com/photo-1765914448153-a393fe90beb2?auto=format&fit=crop&w=1200&q=80'
    WHEN 'bong-ro' THEN 'https://images.unsplash.com/photo-1692626343802-3ee09e648120?auto=format&fit=crop&w=1200&q=80'
    ELSE 'https://images.unsplash.com/photo-1745329532589-4f33352c4b10?auto=format&fit=crop&w=1200&q=80'
  END,
  p.stock_qty,
  p.sold_qty,
  'ACTIVE',
  FALSE,
  NOW(),
  NOW()
FROM (
  VALUES
    ('Vot Pickleball Carbon Pro', 'SPK-001', 'pickleball', 'wilson', 1290000, 1090000, 35, 8),
    ('Set Bong Pickleball 3 Qua', 'SPK-002', 'pickleball', 'wilson', 220000, 190000, 50, 12),
    ('Giay Pickleball Grip Max', 'SPK-003', 'pickleball', 'nike', 1790000, 1590000, 20, 6),
    ('Vot Cau Long Yonex Astrox 77', 'SCL-001', 'cau-long', 'yonex', 3290000, 2990000, 15, 10),
    ('Ao Cau Long Dry Fit', 'SCL-002', 'cau-long', 'li-ning', 390000, 320000, 60, 20),
    ('Giay Cau Long Chuyen Dung', 'SCL-003', 'cau-long', 'mizuno', 1490000, 1290000, 28, 9),
    ('Bong Da FIFA Size 5', 'SBD-001', 'bong-da', 'adidas', 520000, 450000, 40, 14),
    ('Giay Da Bong San Co Nhan Tao', 'SBD-002', 'bong-da', 'nike', 1890000, 1650000, 22, 11),
    ('Ao Dau CLB Mau Do', 'SBD-003', 'bong-da', 'adidas', 690000, 590000, 30, 7),
    ('Gang Tay Thu Mon Pro', 'SBD-004', 'bong-da', 'adidas', 790000, 690000, 18, 4),
    ('Ao Ba Lo Gym Compression', 'SGY-001', 'gym', 'nike', 350000, 290000, 70, 21),
    ('Quan Gym Co Gian 4 Chieu', 'SGY-002', 'gym', 'adidas', 420000, 350000, 65, 16),
    ('Day Khang Luc 5 Muc', 'SGY-003', 'gym', 'wilson', 450000, 390000, 55, 13),
    ('Binh Nuoc Gym 1L', 'SGY-004', 'gym', 'nike', 150000, 120000, 90, 30),
    ('Giay Running Asics Gel', 'SRN-001', 'chay-bo', 'asics', 2490000, 2190000, 24, 8),
    ('Dong Ho Chay Bo GPS Mock', 'SRN-002', 'chay-bo', 'adidas', 1990000, 1690000, 16, 5),
    ('Tat Chay Bo Chuyen Dung', 'SRN-003', 'chay-bo', 'nike', 180000, 150000, 95, 26),
    ('Tui Deo Bung Running', 'SRN-004', 'chay-bo', 'adidas', 260000, 220000, 42, 9),
    ('Bong Ro Molten BG5000', 'SBR-001', 'bong-ro', 'molten', 1850000, 1650000, 20, 8),
    ('Giay Bong Ro Co Cao', 'SBR-002', 'bong-ro', 'nike', 2690000, 2390000, 14, 4),
    ('Bang Bao Ve Dau Goi', 'SBR-003', 'bong-ro', 'adidas', 290000, 250000, 52, 15),
    ('Ao Tanktop Bong Ro', 'SBR-004', 'bong-ro', 'nike', 480000, 420000, 31, 7),
    ('Balo The Thao Chong Nuoc', 'SPT-002', 'chay-bo', 'adidas', 850000, 760000, 26, 6),
    ('Khan Lanh The Thao', 'SPT-003', 'gym', 'wilson', 120000, 95000, 110, 35)
) AS p(name, sku, category_slug, brand_slug, price, sale_price, stock_qty, sold_qty)
JOIN categories c ON c.slug = p.category_slug
JOIN brands b ON b.slug = p.brand_slug
CROSS JOIN LATERAL (
  SELECT 'San pham ' || p.name AS short_desc,
         'Mo ta chi tiet cho ' || p.name || ', phu hop tap luyen va thi dau.' AS full_desc
) d
WHERE NOT EXISTS (SELECT 1 FROM products pr WHERE pr.sku = p.sku);

-- Product images (2 per product)
INSERT INTO product_images (id, product_id, image_url, primary_image, sort_order, created_at, updated_at)
SELECT gen_random_uuid(),
       pr.id,
       img.image_url,
       img.primary_image,
       img.sort_order,
       NOW(),
       NOW()
FROM products pr
JOIN categories c ON pr.category_id = c.id
CROSS JOIN LATERAL (
  VALUES
    (
      CASE c.slug
        WHEN 'pickleball' THEN 'https://images.unsplash.com/photo-1710772099352-f8fbb7b30977?auto=format&fit=crop&w=1200&q=80'
        WHEN 'cau-long' THEN 'https://images.unsplash.com/photo-1721760886982-3c643f05813d?auto=format&fit=crop&w=1200&q=80'
        WHEN 'bong-da' THEN 'https://images.unsplash.com/photo-1647426045352-64657a80adaa?auto=format&fit=crop&w=1200&q=80'
        WHEN 'gym' THEN 'https://images.unsplash.com/photo-1745329532589-4f33352c4b10?auto=format&fit=crop&w=1200&q=80'
        WHEN 'chay-bo' THEN 'https://images.unsplash.com/photo-1765914448153-a393fe90beb2?auto=format&fit=crop&w=1200&q=80'
        WHEN 'bong-ro' THEN 'https://images.unsplash.com/photo-1692626343802-3ee09e648120?auto=format&fit=crop&w=1200&q=80'
        ELSE 'https://images.unsplash.com/photo-1745329532589-4f33352c4b10?auto=format&fit=crop&w=1200&q=80'
      END,
      TRUE,
      0
    ),
    (
      CASE c.slug
        WHEN 'pickleball' THEN 'https://images.unsplash.com/photo-1693142518820-78d7a05f1546?auto=format&fit=crop&w=1200&q=80'
        WHEN 'cau-long' THEN 'https://images.unsplash.com/photo-1722003180803-577efd6d2ecc?auto=format&fit=crop&w=1200&q=80'
        WHEN 'bong-da' THEN 'https://images.unsplash.com/photo-1702467430182-f955bb8ced5b?auto=format&fit=crop&w=1200&q=80'
        WHEN 'gym' THEN 'https://images.unsplash.com/photo-1744551154623-4b5336e95c28?auto=format&fit=crop&w=1200&q=80'
        WHEN 'chay-bo' THEN 'https://images.unsplash.com/photo-1748280621226-91f9530fc329?auto=format&fit=crop&w=1200&q=80'
        WHEN 'bong-ro' THEN 'https://images.unsplash.com/photo-1577065039225-69d79b04cf38?auto=format&fit=crop&w=1200&q=80'
        ELSE 'https://images.unsplash.com/photo-1744551154623-4b5336e95c28?auto=format&fit=crop&w=1200&q=80'
      END,
      FALSE,
      1
    )
) AS img(image_url, primary_image, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM product_images pi WHERE pi.product_id = pr.id);

-- Addresses for users
INSERT INTO addresses (id, user_id, receiver_name, receiver_phone, line1, city, state, country, default_address, created_at, updated_at)
SELECT gen_random_uuid(),
       u.id,
       u.full_name,
       COALESCE(u.phone, '0900000000'),
       '123 Duong Nguyen Trai',
       'Ho Chi Minh',
       'Quan 1',
       'Vietnam',
       TRUE,
       NOW(),
       NOW()
FROM users u
WHERE u.email LIKE 'user%@sportshop.vn'
  AND NOT EXISTS (SELECT 1 FROM addresses a WHERE a.user_id = u.id);

-- Coupons
INSERT INTO coupons (id, code, description, discount_type, discount_value, min_order_value, max_discount, usage_limit, usage_count, active, start_at, end_at, created_at, updated_at)
SELECT gen_random_uuid(),
       x.code,
       x.description,
       x.discount_type,
       x.discount_value,
       x.min_order_value,
       x.max_discount,
       x.usage_limit,
       0,
       TRUE,
       NOW() - INTERVAL '1 day',
       NOW() + INTERVAL '6 months',
       NOW(),
       NOW()
FROM (
  VALUES
    ('SPORT10', 'Giam 10% toi da 200k', 'PERCENT', 10::numeric, 500000::numeric, 200000::numeric, 200),
    ('FREESHIP50', 'Giam 50k cho don tu 700k', 'FIXED', 50000::numeric, 700000::numeric, NULL::numeric, 100)
) AS x(code, description, discount_type, discount_value, min_order_value, max_discount, usage_limit)
WHERE NOT EXISTS (SELECT 1 FROM coupons c WHERE c.code = x.code);

-- Simple carts for users
INSERT INTO carts (id, user_id, created_at, updated_at)
SELECT gen_random_uuid(), u.id, NOW(), NOW()
FROM users u
WHERE u.email LIKE 'user%@sportshop.vn'
  AND NOT EXISTS (SELECT 1 FROM carts c WHERE c.user_id = u.id);
