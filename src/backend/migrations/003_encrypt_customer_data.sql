-- Mở rộng kiểu dữ liệu để lưu ciphertext AES-256-GCM.
ALTER TABLE customer
    ALTER COLUMN full_name TYPE TEXT,
    ALTER COLUMN phone TYPE TEXT,
    ALTER COLUMN address TYPE TEXT;

-- Mã tra cứu HMAC-SHA256 của số điện thoại.
-- Tạm thời cho phép NULL để chuyển đổi dữ liệu hiện có.
ALTER TABLE customer
    ADD COLUMN phone_lookup_hash VARCHAR(64);