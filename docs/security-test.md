# SECURITY TEST REPORT – SMART CRM L02

## 1. Mục tiêu và môi trường kiểm thử

Thực hiện kiểm tra bảo mật đối với module tiếp nhận và phân loại yêu cầu bảo hành, tập trung vào các nhóm tham khảo theo OWASP Top 10:2025 gồm A01, A02, A04, A05 và A07.

**Môi trường kiểm thử:**

- Hệ điều hành: Windows 11.
- Môi trường chạy ứng dụng: Docker Compose.
- Backend: Node.js 24.
- Database: PostgreSQL 18.4.
- Địa chỉ ứng dụng kiểm thử: `http://localhost:8080`.
- Công cụ: Node.js Test Runner, PostgreSQL, Docker Compose, PowerShell và `curl.exe`.

## 2. Tổng hợp kết quả

| Mã OWASP | Nội dung | Kết quả |
|---|---|---|
| A01 | Broken Access Control | PASS trong phạm vi kiểm thử quyền sở hữu phiếu và phân quyền ADMIN/STAFF |
| A02 | Security Misconfiguration | PASS trong phạm vi kiểm tra HTTP Security Headers |
| A04 | Cryptographic Failures | PASS trong phạm vi kiểm tra bcrypt, AES-256-GCM và HMAC-SHA256 |
| A05 | Injection | PASS trong phạm vi kiểm tra dữ liệu có dấu hiệu SQL Injection tại API tra cứu khách hàng |
| A07 | Authentication Failures | PASS trong ba tình huống xác thực đã thực hiện |

Ngoài ra, dự án thực hiện kiểm tra bổ sung đối với phản hồi API khi nhận JSON không hợp lệ.

Bộ kiểm thử tự động hiện tại đạt 29/29 PASS, gồm 17 Unit Test, 2 Integration Test, 5 API / System Test và 5 Crypto Test.

## 3. Chi tiết kiểm thử

### 3.1. A01 – Broken Access Control

**Trạng thái:** PASS trong phạm vi kiểm thử quyền sở hữu phiếu và phân quyền ADMIN/STAFF.

**Cơ chế triển khai:**

- Bảng `app_user` quản lý tài khoản với hai vai trò `ADMIN` và `STAFF`.
- Middleware xác thực tài khoản trước khi cho phép truy cập API.
- Token chứa ID người dùng, tên đăng nhập và vai trò.
- Bảng `ticket` có cột `created_by` để lưu ID nhân viên tạo phiếu.
- Nhân viên chỉ được truy cập phiếu thuộc quyền sở hữu của mình; ADMIN được xem toàn bộ phiếu.

**Kiểm thử Unit Test:**

Đã thực hiện 6 bài kiểm thử trong `tests/ticket-service.test.js`:

1. Phiếu mới lưu ID nhân viên đang đăng nhập.
2. Nhân viên B không xem được phiếu của A.
3. Nhân viên B không cập nhật được phiếu của A.
4. Nhân viên B không hủy được phiếu của A.
5. Nhân viên chỉ lấy danh sách phiếu của mình.
6. ADMIN được xem tất cả phiếu.

**Kết quả:** 6/6 PASS.

**Kiểm thử API:**

API-05 trong `tests/api-system.test.js` thực hiện:

- Tạo hai tài khoản STAFF A và B.
- Nhân viên A tạo phiếu và được phép xem phiếu của mình.
- Nhân viên B không được xem, cập nhật hoặc hủy phiếu của A.
- Phiếu của A không xuất hiện trong danh sách của B.
- ADMIN vẫn xem được phiếu của A.
- STAFF không được phép tạo tài khoản STAFF khác.

API-04 kiểm tra thêm quyền ADMIN tạo tài khoản STAFF và xác nhận tài khoản STAFF có thể đăng nhập.

**Kết quả:** API-04 và API-05 PASS.

**Kết luận:** Các tình huống kiểm thử quyền sở hữu và phân quyền đã thực hiện đều đạt yêu cầu.

**Giới hạn:** Chưa thực hiện kiểm thử xâm nhập hoặc đánh giá toàn diện tất cả API và tình huống phân quyền có thể xảy ra.

**Minh chứng:**
- `tests/ticket-service.test.js`
- `tests/api-system.test.js`
- `docs/screenshots/TC-12-A01-unit-tests.png`
- `docs/screenshots/TC-12-A01-api-authorization.png`

### 3.2. A02 – Security Misconfiguration

**Thực hiện:** Gửi yêu cầu GET `/api/tickets` không có Bearer token đến ứng dụng hiện tại và kiểm tra HTTP response headers.

**Kết quả kiểm tra:**

- HTTP status: `401 Unauthorized`, đúng với trường hợp chưa xác thực.
- Có `Content-Security-Policy`.
- Có `X-Content-Type-Options: nosniff`.
- Có `X-Frame-Options: SAMEORIGIN`.
- Có `Strict-Transport-Security`.
- Có `Referrer-Policy`.
- Không xuất hiện header `X-Powered-By`.

Các HTTP Security Headers được trả về ngay cả khi API từ chối yêu cầu do thiếu Bearer token.

**Cách khắc phục đã triển khai:** Tích hợp middleware Helmet bằng `app.use(helmet())` trong `src/backend/src/app.js`.

**Kết luận:** PASS trong phạm vi kiểm tra HTTP Security Headers trên phiên bản hiện tại.

**Minh chứng:** `docs/screenshots/TC-12-A02-security-headers.png`

### 3.3. A04 – Cryptographic Failures

**Trạng thái:** PASS trong phạm vi kiểm tra mật khẩu, mã hóa dữ liệu khách hàng và cơ chế tra cứu số điện thoại.

#### 1. Bảo vệ mật khẩu tài khoản

- Mật khẩu được băm bằng `bcryptjs` trước khi lưu vào cột `password_hash` của bảng `app_user`.
- Khi đăng nhập, Backend sử dụng bcrypt để so sánh mật khẩu nhập vào với giá trị đã băm.
- API-04 kiểm tra mật khẩu tài khoản STAFF mới tạo khác mật khẩu gốc và có định dạng bcrypt.
- Kiểm tra database Docker xác nhận mật khẩu tài khoản ADMIN có tiền tố `$2b$` và độ dài 60 ký tự.

**Kết quả:** Đạt yêu cầu trong phạm vi kiểm tra lưu trữ và xác thực mật khẩu.

#### 2. Khóa bí mật và token

- `AUTH_TOKEN_SECRET` được cấu hình trong `.env`, không lưu trực tiếp trong mã nguồn.
- Cơ chế xác thực tạo chữ ký bằng HMAC-SHA256.
- Dịch vụ xác thực yêu cầu khóa bí mật có độ dài tối thiểu 32 byte.
- `DATA_ENCRYPTION_KEY` và `PHONE_LOOKUP_KEY` là hai khóa riêng biệt, mỗi khóa có độ dài 32 byte.
- File `.env` được loại trừ khỏi Git bằng `.gitignore` và khỏi Docker build context bằng `.dockerignore`.

**Lưu ý:** Token hiện tại sử dụng cấu trúc `payload.signature` với chữ ký HMAC-SHA256, không phải JWT chuẩn ba phần.

#### 3. Mã hóa dữ liệu khách hàng

- Sử dụng AES-256-GCM để mã hóa ba trường `full_name`, `phone` và `address` trước khi lưu vào PostgreSQL.
- Sử dụng HMAC-SHA256 tạo `phone_lookup_hash` để tìm kiếm và kiểm tra tính duy nhất của số điện thoại mà không cần dùng số điện thoại dạng văn bản thông thường làm khóa tra cứu.
- Backend giải mã thông tin khách hàng khi cần hiển thị hoặc xử lý.
- API che số điện thoại trước khi trả thông tin phiếu bảo hành cho Frontend.

#### 4. Kết quả kiểm thử

**Crypto Test:** 5/5 PASS trong `tests/customer-crypto.test.js`, gồm:

1. Mã hóa và giải mã dữ liệu tiếng Việt.
2. Mỗi lần mã hóa tạo ciphertext khác nhau.
3. Hỗ trợ giá trị `null`.
4. Từ chối dữ liệu mã hóa bị chỉnh sửa.
5. HMAC của cùng số điện thoại luôn giống nhau.

**Kiểm tra database Docker:**

| Nội dung | Kết quả |
|---|---:|
| Tổng khách hàng | 3 |
| Họ tên được mã hóa | 3/3 |
| Số điện thoại được mã hóa | 3/3 |
| Địa chỉ được mã hóa | 3/3 |
| HMAC số điện thoại hợp lệ | 3/3 |
| Hash mật khẩu ADMIN | `$2b$`, dài 60 ký tự |

**Kiểm tra Repository và API đã thực hiện trước đó:**

- Customer Repository tìm kiếm khách hàng bằng số điện thoại và giải mã thông tin thành công.
- Ticket Repository giải mã tên và số điện thoại khách hàng khi truy vấn phiếu.
- Ticket API trả về thông tin tên khách hàng và che số điện thoại theo định dạng của ứng dụng.

**Kết luận:** PASS trong phạm vi kiểm tra cơ chế băm mật khẩu, mã hóa dữ liệu khách hàng và tra cứu bằng HMAC.

**Giới hạn:** Chưa thực hiện đánh giá chuyên sâu về luân chuyển khóa, khả năng khôi phục dữ liệu khi mất khóa và toàn bộ dữ liệu khác ngoài ba trường khách hàng được mã hóa.

**Minh chứng:**
- `tests/customer-crypto.test.js`
- `tests/customer-repository.integration.test.js`
- `tests/api-system.test.js`
- `docs/screenshots/TC-12-A04-database-encryption.png`
- `docs/screenshots/TC-12-A04-crypto-tests.png`

### 3.4. A05 – Injection

**Thực hiện:** Gửi dữ liệu có dấu hiệu SQL Injection đến API tra cứu khách hàng:

`GET /api/customers?phone=...`

**Dữ liệu thử:**

`0901234567' OR '1'='1`

**Cơ chế bảo vệ đã kiểm tra:**

- `customerService.getByPhone()` kiểm tra định dạng số điện thoại bằng biểu thức chính quy.
- Dữ liệu không đáp ứng định dạng 10 chữ số bắt đầu bằng `0` bị từ chối trước khi truy vấn database.
- `customerRepository.findByPhone()` sử dụng truy vấn SQL có tham số `$1` và giá trị `phoneLookupHash(phone)`, không ghép trực tiếp dữ liệu đầu vào vào câu SQL.

**Kết quả thực tế:**

- HTTP status: `422`.
- Mã lỗi: `INVALID_PHONE`.
- Thông báo: Số điện thoại phải gồm 10 chữ số và bắt đầu bằng 0.
- Không trả về danh sách khách hàng.

**Kết luận:** PASS trong phạm vi kiểm tra dữ liệu có dấu hiệu SQL Injection tại API tra cứu khách hàng. Kết quả này không thay thế kiểm thử toàn diện các dạng Injection khác.

**Minh chứng:**
- `src/backend/src/services/customerService.js`
- `src/backend/src/repositories/customerRepository.js`
- `docs/screenshots/TC-12-A05-injection.png`

### 3.5. A07 – Authentication Failures

Đã thực hiện ba tình huống kiểm tra xác thực trên phiên bản hiện tại.

**1. Thiếu Bearer token**

- Gửi GET `/api/tickets` không có header Authorization.
- HTTP status: `401`.
- Mã lỗi: `AUTH_REQUIRED`.
- Kết quả: PASS.

**2. Token bị chỉnh sửa**

- Đăng nhập bằng tài khoản hợp lệ để lấy token.
- Thay đổi một ký tự trong phần chữ ký HMAC-SHA256 của token.
- Gửi token đã chỉnh sửa đến API.
- HTTP status: `401`.
- Mã lỗi: `AUTH_TOKEN_INVALID`.
- Kết quả: PASS.

**3. Đăng nhập sai mật khẩu**

- Sử dụng tên đăng nhập ADMIN đúng nhưng mật khẩu không chính xác.
- HTTP status: `401`.
- Mã lỗi: `AUTH_INVALID_CREDENTIALS`.
- Kết quả: PASS.

**Tổng hợp:**

| Tình huống | HTTP status | Mã lỗi | Kết quả |
|---|---:|---|---|
| Thiếu Bearer token | 401 | `AUTH_REQUIRED` | PASS |
| Token bị chỉnh sửa | 401 | `AUTH_TOKEN_INVALID` | PASS |
| Đăng nhập sai mật khẩu | 401 | `AUTH_INVALID_CREDENTIALS` | PASS |

**Kết luận:** 3/3 tình huống xác thực đạt yêu cầu trong phạm vi đã thực hiện.

**Minh chứng:** `docs/screenshots/TC-12-A07-authentication.png`

### 3.6. Kiểm tra bổ sung – Xử lý JSON không hợp lệ

**Thực hiện:** Gửi yêu cầu POST đến `/api/auth/login` với nội dung JSON sai định dạng.

**Dữ liệu thử:**

`{bad-json`

**Kết quả thực tế:**

- HTTP status: `400 Bad Request`.
- Mã lỗi: `INVALID_JSON`.
- Thông báo: Nội dung JSON không hợp lệ.
- Phản hồi không chứa stack trace, tên bảng database hoặc chuỗi kết nối.

**Kết luận:** API từ chối JSON sai định dạng và trả thông báo lỗi phù hợp.

**Minh chứng:** `docs/screenshots/TC-12-invalid-json-response.png`

## 4. Kết luận chung

Dự án đã thực hiện các kiểm tra bảo mật cơ bản trên phiên bản sau Buổi 15.

Các nhóm có kết quả phù hợp trong phạm vi kiểm thử gồm:

- **A01:** Kiểm tra phân quyền ADMIN/STAFF và quyền sở hữu phiếu theo `created_by`.
- **A02:** Kiểm tra HTTP Security Headers sau khi tích hợp Helmet.
- **A04:** Kiểm tra mật khẩu bcrypt, dữ liệu khách hàng AES-256-GCM và tra cứu số điện thoại bằng HMAC-SHA256.
- **A05:** Kiểm tra dữ liệu có dấu hiệu SQL Injection tại API tra cứu khách hàng và cơ chế truy vấn tham số.
- **A07:** Kiểm tra thiếu token, token bị chỉnh sửa và đăng nhập sai mật khẩu.
- **Kiểm tra bổ sung:** API xử lý JSON sai định dạng bằng HTTP 400 và mã lỗi `INVALID_JSON`.

Bộ kiểm thử tự động hiện tại đạt 29/29 PASS, gồm:

- 17 Unit Test.
- 2 Integration Test.
- 5 API / System Test.
- 5 Crypto Test.

Các kết quả chỉ phản ánh phạm vi đã kiểm tra, không thay thế đánh giá bảo mật chuyên sâu hoặc kiểm thử xâm nhập.

Các nội dung chưa được đánh giá chuyên sâu gồm kiểm thử xâm nhập, kiểm thử toàn diện mọi API và tình huống phân quyền, luân chuyển khóa và khả năng khôi phục dữ liệu khi mất khóa.

## 5. Danh sách ảnh minh chứng trên phiên bản hiện tại

Các ảnh dưới đây được chụp lại sau Buổi 15, thay thế các ảnh minh chứng cũ tương ứng.

| STT | File ảnh | Nội dung |
|---|---|---|
| 1 | `TC-12-A01-unit-tests.png` | 6 bài Unit Test về quyền sở hữu và phân quyền – 6/6 PASS |
| 2 | `TC-12-A01-api-authorization.png` | API-04 và API-05 về tạo tài khoản STAFF, phân quyền và quyền sở hữu phiếu |
| 3 | `TC-12-A02-security-headers.png` | HTTP Security Headers trên phiên bản hiện tại |
| 4 | `TC-12-A04-database-encryption.png` | Kết quả kiểm tra bcrypt, mã hóa ba trường khách hàng và HMAC trong PostgreSQL |
| 5 | `TC-12-A04-crypto-tests.png` | 5 Crypto Test – 5/5 PASS |
| 6 | `TC-12-A05-injection.png` | API từ chối dữ liệu có dấu hiệu SQL Injection |
| 7 | `TC-12-A07-authentication.png` | Ba tình huống xác thực – 3/3 PASS |
| 8 | `TC-12-invalid-json-response.png` | API xử lý JSON không hợp lệ |
| 9 | `TC-12-automated-tests.png` | Toàn bộ 29 bài kiểm thử tự động – 29/29 PASS |
| 10 | `TC-12-migration-seed-repeatability.png` | Đối chiếu Migration, Seed và số lượng bản ghi trước/sau khi chạy lại |