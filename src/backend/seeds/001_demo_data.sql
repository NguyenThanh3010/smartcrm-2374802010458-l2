-- Smart CRM L02: demo seed data
-- Safe to re-run: unique business keys are checked before inserting.

-- 1. Issue categories
INSERT INTO issue_category (category_code, category_name, description)
VALUES
    ('MAN_HINH', 'Màn hình', 'Lỗi màn hình hiển thị'),
    ('PIN', 'Pin', 'Lỗi pin và thời lượng sử dụng'),
    ('SAC', 'Sạc', 'Lỗi sạc hoặc cổng sạc'),
    ('PHAN_MEM', 'Phần mềm', 'Lỗi hệ điều hành hoặc ứng dụng'),
    ('NUOC_VAO', 'Vào nước', 'Thiết bị có dấu hiệu vào nước'),
    ('KHAC', 'Khác', 'Các lỗi khác')
ON CONFLICT (category_code) DO NOTHING;

-- 2. Service centers
INSERT INTO service_center (center_name, address, phone, is_active)
SELECT v.center_name, v.address, v.phone, TRUE
FROM (VALUES
    ('Trung tâm Mekong - Quận 1', 'Quận 1, TP. Hồ Chí Minh', '0281234567'),
    ('Trung tâm Mekong - Thủ Đức', 'TP. Thủ Đức, TP. Hồ Chí Minh', '0287654321')
) AS v(center_name, address, phone)
WHERE NOT EXISTS (
    SELECT 1
    FROM service_center s
    WHERE s.center_name = v.center_name
);

-- 3. Customers are inserted by seed.js using encrypted values.

-- 4. Devices
INSERT INTO device
    (customer_id, product_id, serial_no, purchase_date, warranty_months)
SELECT c.customer_id, v.product_id, v.serial_no, v.purchase_date, v.warranty_months
FROM (VALUES
    ('{{PHONE_HASH_0901234567}}', 1001::BIGINT, 'SM-MEK-0001', DATE '2026-03-10', 12),
    ('{{PHONE_HASH_0912345678}}', 1002::BIGINT, 'SM-MEK-0002', DATE '2026-04-05', 12),
    ('{{PHONE_HASH_0987654321}}', 1003::BIGINT, 'SM-MEK-0003', DATE '2025-10-20', 12)
) AS v(phone_hash, product_id, serial_no, purchase_date, warranty_months)
JOIN customer c ON c.phone_lookup_hash = v.phone_hash
ON CONFLICT (serial_no) DO NOTHING;

-- 5. Sample warranty tickets
INSERT INTO ticket
    (ticket_code, created_by, customer_id, device_id, center_id, category_id,
     issue_desc, priority, status, due_date, accessories)
SELECT
    'L02-DEMO-001',
    (SELECT user_id FROM app_user WHERE role = 'ADMIN' ORDER BY user_id LIMIT 1),
    c.customer_id, d.device_id, s.center_id, ic.category_id,
    'Màn hình chớp nháy khi sử dụng', 'CAO', 'MOI',
    CURRENT_TIMESTAMP + INTERVAL '3 days',
    '["KHAC"]'::JSONB
FROM customer c
JOIN device d
    ON d.customer_id = c.customer_id
   AND d.serial_no = 'SM-MEK-0001'
JOIN service_center s
    ON s.center_name = 'Trung tâm Mekong - Quận 1'
JOIN issue_category ic ON ic.category_code = 'MAN_HINH'
WHERE c.phone_lookup_hash = '{{PHONE_HASH_0901234567}}'
  AND NOT EXISTS (
      SELECT 1 FROM ticket t WHERE t.ticket_code = 'L02-DEMO-001'
  );

INSERT INTO ticket
    (ticket_code, created_by, customer_id, device_id, center_id, category_id,
     issue_desc, priority, status, due_date, accessories)
SELECT
    'L02-DEMO-002',
    (SELECT user_id FROM app_user WHERE role = 'ADMIN' ORDER BY user_id LIMIT 1),
    c.customer_id, d.device_id, s.center_id, ic.category_id,
    'Pin tụt nhanh dù không sử dụng', 'TRUNG_BINH', 'DANG_XU_LY',
    CURRENT_TIMESTAMP + INTERVAL '5 days',
    '["SAC"]'::JSONB
FROM customer c
JOIN device d
    ON d.customer_id = c.customer_id
   AND d.serial_no = 'SM-MEK-0002'
JOIN service_center s
    ON s.center_name = 'Trung tâm Mekong - Thủ Đức'
JOIN issue_category ic ON ic.category_code = 'PIN'
WHERE c.phone_lookup_hash = '{{PHONE_HASH_0912345678}}'
  AND NOT EXISTS (
      SELECT 1 FROM ticket t WHERE t.ticket_code = 'L02-DEMO-002'
  );

INSERT INTO ticket
    (ticket_code, created_by, customer_id, device_id, center_id, category_id,
     issue_desc, priority, status, due_date, accessories)
SELECT
    'L02-DEMO-003',
    (SELECT user_id FROM app_user WHERE role = 'ADMIN' ORDER BY user_id LIMIT 1),
    c.customer_id, d.device_id, s.center_id, ic.category_id,
    'Thiết bị không nhận sạc', 'THAP', 'CHO_LINH_KIEN',
    CURRENT_TIMESTAMP + INTERVAL '7 days',
    '[]'::JSONB
FROM customer c
JOIN device d
    ON d.customer_id = c.customer_id
   AND d.serial_no = 'SM-MEK-0003'
JOIN service_center s
    ON s.center_name = 'Trung tâm Mekong - Quận 1'
JOIN issue_category ic ON ic.category_code = 'SAC'
WHERE c.phone_lookup_hash = '{{PHONE_HASH_0987654321}}'
  AND NOT EXISTS (
      SELECT 1 FROM ticket t WHERE t.ticket_code = 'L02-DEMO-003'
  );

-- 6. One sample status-history record
INSERT INTO ticket_status_log (ticket_id, old_status, new_status, reason)
SELECT t.ticket_id, 'MOI', 'DANG_XU_LY', 'Dữ liệu mẫu minh họa'
FROM ticket t
WHERE t.ticket_code = 'L02-DEMO-002'
  AND NOT EXISTS (
      SELECT 1
      FROM ticket_status_log l
      WHERE l.ticket_id = t.ticket_id
        AND l.new_status = 'DANG_XU_LY'
        AND l.reason = 'Dữ liệu mẫu minh họa'
  );
-- Device reserved for the successful ticket-creation test.
-- Re-running this seed will not duplicate the serial number.
INSERT INTO device
    (customer_id, product_id, serial_no, purchase_date, warranty_months)
SELECT
    c.customer_id, 1004, 'SM-MEK-0004', DATE '2026-05-01', 12
FROM customer c
WHERE c.phone_lookup_hash = '{{PHONE_HASH_0901234567}}'
ON CONFLICT (serial_no) DO NOTHING;
