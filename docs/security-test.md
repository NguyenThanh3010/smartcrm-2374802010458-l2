# SECURITY TEST REPORT – SMART CRM L02

## 1. Mục tiêu

Thực hiện kiểm tra bảo mật thủ công ở mức cơ bản đối với module tiếp nhận và phân loại yêu cầu bảo hành.

Các nội dung được lựa chọn tham khảo theo OWASP Top 10:2025, tập trung vào A02, A04, A05 và A07. Phạm vi kiểm tra và giới hạn của từng nhóm được ghi nhận cụ thể bên dưới.

## 2. Tổng hợp kết quả

| Mã OWASP | Nội dung | Kết quả |
|---|---|---|
| A01 | Broken Access Control | Chưa kiểm thử đầy đủ |
| A02 | Security Misconfiguration | PASS trong phạm vi kiểm tra HTTP Security Headers |
| A04 | Cryptographic Failures | Kiểm tra một phần, chưa đủ cơ sở kết luận PASS |
| A05 | Injection | PASS trong phạm vi kiểm tra dữ liệu tìm kiếm khách hàng |
| A07 | Authentication Failures | PASS trong các tình huống xác thực đã thực hiện |

Ngoài ra, dự án thực hiện kiểm tra bổ sung đối với phản hồi API khi nhận JSON không hợp lệ.

## 3. Chi tiết kiểm thử

### A01 – Broken Access Control

- **Trạng thái:** Chưa kiểm thử đầy đủ.
- **Lý do:** Phiên bản hiện tại chủ yếu sử dụng một tài khoản demo, chưa có đầy đủ cơ chế phân quyền và sở hữu dữ liệu theo từng người dùng.
- **Giới hạn:** Chưa thể kiểm tra đầy đủ việc ngăn người dùng truy cập dữ liệu hoặc chức năng thuộc tài khoản khác.
- **Kết luận:** Không đánh giá PASS hoặc FAIL cho nhóm này.

Lưu ý: Kiểm tra API khi thiếu Bearer token được xếp vào A07 – Authentication Failures, không phải A01.

### A02 – Security Misconfiguration

- **Thực hiện:** Kiểm tra HTTP Security Headers của phản hồi từ Express.
- **Phát hiện ban đầu:** Phản hồi có header `X-Powered-By: Express` và thiếu một số HTTP Security Headers cơ bản.
- **Cách khắc phục:** Tích hợp middleware Helmet bằng `app.use(helmet())` trong `src/backend/src/app.js`.
- **Kết quả sau khi sửa:** Không còn header `X-Powered-By`; phản hồi có các header bảo mật như `X-Content-Type-Options` và `X-Frame-Options`.
- **Đánh giá:** PASS trong phạm vi kiểm tra các HTTP Security Headers đã thực hiện.

**Minh chứng:** `docs/screenshots/TC-12-A02-security-headers.png`

### A04 – Cryptographic Failures

- **Thực hiện:** Kiểm tra cấu hình `AUTH_TOKEN_SECRET`.
- **Kết quả:** Khóa đã được cấu hình, có độ dài 64 ký tự và không sử dụng giá trị mẫu.
- **Cơ chế ký token:** HMAC-SHA256.
- **Giới hạn:** Chưa kiểm tra đầy đủ việc lưu trữ mật khẩu dạng băm trong cơ sở dữ liệu do phiên bản hiện tại chưa có bảng tài khoản lưu mật khẩu. Chưa thực hiện đánh giá chuyên sâu về quản lý khóa và bảo vệ dữ liệu nhạy cảm.
- **Kết luận:** Mới kiểm tra một phần cấu hình khóa bí mật, chưa đủ cơ sở kết luận nhóm A04 đã được kiểm thử thành công.

Kiểm tra token bị chỉnh sửa chữ ký được ghi nhận tại A07 vì kết quả trực tiếp được xác nhận là API từ chối xác thực token.

### A05 – Injection

- **Thực hiện:** Gửi dữ liệu có dấu hiệu SQL Injection vào tham số `phone` của API tra cứu khách hàng.
- **Dữ liệu thử:** `0901234567' OR '1'='1`
- **Kết quả:** HTTP 422, mã lỗi `INVALID_PHONE`.
- **Kiểm tra mã nguồn:** Repository sử dụng truy vấn SQL có tham số `$1`, không ghép trực tiếp dữ liệu đầu vào vào câu SQL.
- **Đánh giá:** PASS trong phạm vi kiểm tra thực hiện; không thay thế kiểm thử các dạng Injection khác.

**Minh chứng:** `docs/screenshots/TC-12-A05-injection.png`

### A07 – Authentication Failures

Đã thực hiện ba tình huống kiểm tra xác thực:

**1. Thiếu Bearer token**

- Gửi GET `/api/tickets` không có Bearer token.
- Kết quả: HTTP 401 Unauthorized.
- Mã lỗi: `AUTH_REQUIRED`.
- Đánh giá: PASS.

**Minh chứng:** `docs/screenshots/TC-12-A07-missing-token.png`

**2. Token bị chỉnh sửa**

- Thay đổi một ký tự trong chữ ký Bearer token hợp lệ rồi gửi yêu cầu đến API.
- Kết quả: HTTP 401 Unauthorized.
- Mã lỗi: `AUTH_TOKEN_INVALID`.
- Đánh giá: PASS trong phạm vi kiểm tra từ chối token không hợp lệ.

**Minh chứng:** `docs/screenshots/TC-12-A07-token-tamper.png`

**3. Đăng nhập sai mật khẩu**

- Đăng nhập bằng tên đăng nhập đúng nhưng mật khẩu không chính xác.
- Kết quả: HTTP 401 Unauthorized.
- Mã lỗi: `AUTH_INVALID_CREDENTIALS`.
- Đánh giá: PASS.

**Minh chứng:** `docs/screenshots/TC-12-A07-invalid-login.png`

### Kiểm tra bổ sung – Xử lý JSON không hợp lệ

- **Thực hiện:** Gửi yêu cầu JSON sai định dạng đến API.
- **Dữ liệu thử:** `{bad-json`
- **Kết quả:** HTTP 400, mã lỗi `INVALID_JSON`.
- **Đánh giá:** API từ chối dữ liệu không hợp lệ, trả thông báo lỗi an toàn; không xuất hiện stack trace, tên bảng hoặc chuỗi kết nối trong phản hồi.
- **Phạm vi:** Đây là kiểm tra bổ sung về xử lý dữ liệu bất thường, không được tính là kiểm thử toàn diện OWASP A10.

**Minh chứng:** `docs/screenshots/TC-12-invalid-json-response.png`

## 4. Kết luận

Dự án đã thực hiện một số kiểm tra bảo mật thủ công ở mức cơ bản.

Các nhóm đã có kết quả phù hợp trong phạm vi kiểm tra gồm:

- A02 – Kiểm tra HTTP Security Headers sau khi tích hợp Helmet.
- A05 – Kiểm tra dữ liệu có dấu hiệu SQL Injection.
- A07 – Kiểm tra các tình huống xác thực Bearer token và đăng nhập.

A04 mới được kiểm tra một phần thông qua cấu hình khóa bí mật. A01 chưa được kiểm thử đầy đủ do giới hạn về cơ chế phân quyền và sở hữu dữ liệu theo người dùng.

Kiểm tra JSON không hợp lệ là một tình huống bổ sung về xử lý lỗi.

Các kết quả trên không thay thế đánh giá bảo mật chuyên sâu hoặc kiểm thử xâm nhập.

## 5. Danh sách ảnh minh chứng

| STT | File ảnh | Nội dung |
|---|---|---|
| 1 | `TC-12-A02-security-headers.png` | HTTP Security Headers sau khi tích hợp Helmet |
| 2 | `TC-12-A05-injection.png` | API từ chối dữ liệu có dấu hiệu SQL Injection |
| 3 | `TC-12-A07-missing-token.png` | API từ chối yêu cầu thiếu Bearer token |
| 4 | `TC-12-A07-token-tamper.png` | Kiểm tra token bị chỉnh sửa |
| 5 | `TC-12-A07-invalid-login.png` | API từ chối đăng nhập sai mật khẩu |
| 6 | `TC-12-invalid-json-response.png` | API xử lý JSON không hợp lệ |