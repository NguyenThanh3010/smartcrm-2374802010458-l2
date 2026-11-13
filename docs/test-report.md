# TEST REPORT – SMART CRM L02

## 1. Thông tin kiểm thử

- Dự án: Smart CRM – Mekong Mobile
- Luồng nghiệp vụ: L02 – Tiếp nhận và phân loại yêu cầu bảo hành
- Track: SE
- Ngày kiểm thử được ghi nhận: 13/11/2026
- Hệ điều hành: Windows 11
- Môi trường thực thi: Docker Compose
- Node.js trong container: 24
- PostgreSQL: 18.4
- Cơ sở dữ liệu kiểm thử: `smartcrm_test`
- Công cụ kiểm thử: Node.js Test Runner (`node:test`), PostgreSQL, Docker Compose, PowerShell và `curl.exe`.

API System Test khởi chạy Express server trên một cổng ngẫu nhiên tại địa chỉ `127.0.0.1`, không sử dụng cố định cổng 3000.

## 2. Phạm vi và kết quả tổng quan

Các chức năng được kiểm thử gồm:

- Tiếp nhận và tạo phiếu bảo hành.
- Kiểm tra dữ liệu đầu vào, quan hệ giữa khách hàng và thiết bị.
- Kiểm tra phiếu đang xử lý và điều kiện bảo hành.
- Tính thời hạn xử lý theo mức độ ưu tiên và quy tắc bỏ qua Chủ nhật.
- Kiểm tra lưu trữ khách hàng, số điện thoại và tính duy nhất dữ liệu.
- Kiểm tra xác thực, phân quyền ADMIN/STAFF và quyền sở hữu phiếu.
- Kiểm tra mật khẩu băm, mã hóa dữ liệu khách hàng và xử lý dữ liệu bị chỉnh sửa.
- Kiểm tra khả năng chạy lại Migration và Seed.

### 2.1. Tổng hợp kết quả

| Nội dung | Kết quả |
|---|---:|
| Số test case trong báo cáo | 12 |
| Số test case PASS | 12 |
| Số test case FAIL | 0 |
| Số bài kiểm thử tự động | 29 |
| Unit Test | 17 |
| Integration Test | 2 |
| API / System Test | 5 |
| Crypto Test | 5 |
| Kiểm tra Migration và Seed | PASS |

Các test case là những tình huống kiểm thử được tổng hợp từ 29 bài kiểm thử tự động và các bước kiểm tra bổ sung. Vì vậy, số test case không đồng nhất với số bài kiểm thử tự động.

### 2.2. Kết quả kiểm thử tự động

| Nhóm kiểm thử | Số lượng | Kết quả |
|---|---:|---|
| Unit Test | 17 | 17/17 PASS |
| Integration Test | 2 | 2/2 PASS |
| API / System Test | 5 | 5/5 PASS |
| Crypto Test | 5 | 5/5 PASS |
| **Tổng cộng** | **29** | **29/29 PASS** |

## 3. Chi tiết các test case

| Mã test case | Tiền điều kiện | Các bước thực hiện | Dữ liệu thử | Kết quả mong đợi | Mức ưu tiên | Kết quả thực tế | PASS/FAIL |
|---|---|---|---|---|---|---|---|
| TC-01 – Luồng đúng: Tạo phiếu bảo hành | Backend hoạt động; database có khách hàng, thiết bị và dữ liệu tham chiếu hợp lệ; có Bearer token. | 1. Gửi POST `/api/tickets`. 2. Kiểm tra phản hồi. 3. Kiểm tra phiếu và lịch sử trạng thái trong database. | Khách hàng và thiết bị hợp lệ; mô tả lỗi hợp lệ; mức ưu tiên `TRUNG_BINH`; phụ kiện `SAC`. | API trả HTTP 201; phiếu có mã phiếu, trạng thái `MOI`; database lưu phiếu và lịch sử trạng thái ban đầu. | High | Unit Test Happy path và API-01 PASS. API trả HTTP 201; phiếu được tạo, có mã phiếu, trạng thái `MOI` và một bản ghi lịch sử trạng thái tương ứng. | PASS |
| TC-02 – Biên: Mô tả đúng 10 ký tự | Có dữ liệu khách hàng và thiết bị hợp lệ. | 1. Nhập mô tả đúng 10 ký tự. 2. Thực hiện tạo phiếu. 3. Kiểm tra kết quả. | `1234567890` | Hệ thống chấp nhận mô tả đúng giới hạn tối thiểu. | High | Unit Test xác nhận mô tả đúng 10 ký tự được chấp nhận. | PASS |
| TC-03 – Biên/Dữ liệu sai: Mô tả dưới 10 ký tự | Backend hoạt động; dữ liệu khách hàng và thiết bị hợp lệ. | 1. Gửi yêu cầu tạo phiếu với mô tả ngắn hơn 10 ký tự. 2. Kiểm tra kết quả và mã lỗi. | Unit Test: `Lỗi`; API Test: mô tả `Lỗi`. | Hệ thống từ chối dữ liệu; API trả HTTP 400, mã lỗi `VALIDATION_FAILED`; không tạo phiếu mới. | High | Unit Test xác nhận mô tả ngắn bị từ chối. API-02 trả HTTP 400, mã lỗi `VALIDATION_FAILED` và thông tin lỗi tại `issue_desc`. | PASS |
| TC-04 – Dữ liệu sai: Thiết bị không tồn tại | Backend hoạt động; khách hàng thử nghiệm tồn tại. | 1. Gửi yêu cầu tạo phiếu. 2. Sử dụng mã thiết bị không tồn tại. 3. Kiểm tra kết quả. | Mã khách hàng hợp lệ; mã thiết bị `99999`. | Hệ thống từ chối tạo phiếu và trả lỗi không tìm thấy thiết bị. | Medium | Unit Test xác nhận hệ thống trả lỗi `RESOURCE_NOT_FOUND` và thông tin lỗi tại `device_id`. | PASS |
| TC-05 – Dữ liệu sai: Thiết bị không thuộc khách hàng | Có khách hàng A và thiết bị thuộc khách hàng B. | 1. Chọn khách hàng A. 2. Gửi yêu cầu tạo phiếu với thiết bị của B. 3. Kiểm tra kết quả. | Mã khách hàng A và mã thiết bị thuộc khách hàng B. | Hệ thống từ chối yêu cầu vì thiết bị không thuộc khách hàng được chọn. | High | Unit Test xác nhận hệ thống trả lỗi `VALIDATION_FAILED` và thông tin lỗi tại `device_id`. | PASS |
| TC-06 – Dữ liệu sai: Thiết bị đã có phiếu đang xử lý | Có thiết bị đang gắn với một phiếu bảo hành chưa hoàn tất. | 1. Gửi yêu cầu tạo phiếu mới cho thiết bị đó. 2. Kiểm tra phản hồi. | Thiết bị đã có phiếu với trạng thái `MOI`. | Hệ thống từ chối tạo phiếu mới và trả lỗi `ACTIVE_TICKET_EXISTS`. | High | Unit Test xác nhận hệ thống từ chối tạo phiếu trùng cho thiết bị đang có phiếu xử lý. | PASS |
| TC-07 – Dữ liệu sai: Thiết bị hết hạn bảo hành | Backend hoạt động; có dữ liệu thiết bị đã hết hạn bảo hành. | 1. Gửi yêu cầu tạo phiếu. 2. Kiểm tra mã lỗi và thông tin lỗi. | Ngày mua `2020-01-01`; thời hạn bảo hành 12 tháng. | Hệ thống trả lỗi `WARRANTY_APPROVAL_REQUIRED`, yêu cầu phê duyệt thủ công thay vì tự động tiếp nhận. | Medium | Unit Test xác nhận hệ thống trả lỗi `WARRANTY_APPROVAL_REQUIRED` và thông tin lỗi tại `device_id`. | PASS |
| TC-08 – Kiểm tra SLA theo mức ưu tiên | Có dữ liệu ngày tiếp nhận cố định để kiểm tra. | 1. Tính hạn xử lý với ba mức ưu tiên. 2. Kiểm tra trường hợp đi qua Chủ nhật. 3. Đối chiếu kết quả. | Ngày tiếp nhận `2026-10-30`; mức ưu tiên `CAO`, `TRUNG_BINH`, `THAP`. | Hệ thống tính hạn xử lý đúng theo từng mức ưu tiên và không tính Chủ nhật vào thời gian xử lý. | High | Unit Test xác nhận hạn xử lý lần lượt là 31/10, 03/11 và 05/11/2026 theo ba mức ưu tiên; quy tắc bỏ qua Chủ nhật hoạt động đúng. | PASS |
| TC-09 – Kiểm tra ngày tiếp nhận vào Chủ nhật | Có dữ liệu ngày tiếp nhận cố định. | 1. Thiết lập ngày tiếp nhận là Chủ nhật. 2. Tính hạn xử lý. 3. Kiểm tra ngày bắt đầu tính SLA. | Ngày tiếp nhận `2026-11-01`, Chủ nhật. | Việc tính thời hạn xử lý bắt đầu từ thứ Hai tiếp theo. | Medium | Unit Test xác nhận thời gian bắt đầu tính SLA được chuyển sang thứ Hai, với kết quả đúng cho cả ba mức ưu tiên. | PASS |
| TC-10 – Dữ liệu sai: Mức ưu tiên không hợp lệ | Backend hoạt động. | 1. Gọi hàm tính hạn xử lý với mức ưu tiên không được hỗ trợ. 2. Kiểm tra kết quả. | Mức ưu tiên `KHAN_CAP`. | Hệ thống từ chối mức ưu tiên không hợp lệ bằng lỗi phù hợp. | Medium | Unit Test xác nhận `calculateDueDate` ném lỗi khi nhận mức ưu tiên không hợp lệ. | PASS |
| TC-11 – Chất lượng dữ liệu và mã hóa thông tin khách hàng | PostgreSQL hoạt động; sử dụng database kiểm thử riêng. | 1. Tạo và truy vấn lại khách hàng. 2. Thử tạo khách hàng trùng số điện thoại. 3. Chạy các bài kiểm thử mã hóa và giải mã. 4. Kiểm tra dữ liệu đã mã hóa trong database Docker. | Khách hàng thử nghiệm; số điện thoại hợp lệ và số điện thoại bị trùng; dữ liệu tiếng Việt; ciphertext bị chỉnh sửa. | Dữ liệu được lưu và truy vấn đúng; số điện thoại trùng bị từ chối; dữ liệu nhạy cảm được mã hóa và giải mã đúng; dữ liệu mã hóa bị chỉnh sửa bị từ chối. | High | IT-01 và IT-02 PASS. Cả 5 Crypto Test PASS: mã hóa/giải mã tiếng Việt, ciphertext khác nhau, hỗ trợ NULL, phát hiện dữ liệu bị chỉnh sửa và HMAC ổn định. Kiểm tra database Docker xác nhận 3/3 khách hàng có thông tin được mã hóa. | PASS |
| TC-12 – Bảo mật, phân quyền và khả năng tái lập | Backend và database kiểm thử hoạt động; có tài khoản ADMIN và hai tài khoản STAFF phục vụ kiểm tra. | 1. Kiểm tra ID người tạo và quyền xem, cập nhật, hủy phiếu của STAFF. 2. Kiểm tra ADMIN xem tất cả phiếu. 3. Kiểm tra ADMIN tạo tài khoản STAFF và STAFF đăng nhập. 4. Kiểm tra API khi thiếu token. 5. Thực hiện các kiểm tra bảo mật A02, A05, A07 và JSON không hợp lệ. 6. Chạy lại Migration và Seed trên database kiểm thử để kiểm tra tính tái lập. 7. Kiểm thử thủ công PUT /api/tickets/:id sau khi sửa BUG-04. | Hai tài khoản STAFF A và B; tài khoản ADMIN; phiếu do A tạo; token thiếu hoặc bị chỉnh sửa; mật khẩu sai; dữ liệu SQL Injection; JSON không hợp lệ; phiếu ID 4 và request PUT cập nhật mô tả. | STAFF chỉ được truy cập phiếu thuộc quyền của mình; ADMIN xem được tất cả phiếu; API từ chối yêu cầu chưa xác thực hoặc không đủ quyền; lỗi được xử lý an toàn; PUT hợp lệ trả HTTP 200 và response phản ánh dữ liệu sau cập nhật; Migration và Seed chạy lại không lỗi hoặc tạo dữ liệu trùng. | High | 7 bài kiểm thử Unit Test liên quan đến quyền sở hữu, phân quyền và ánh xạ mã lỗi cùng API-03, API-04, API-05 đều PASS. Các kiểm tra bảo mật bổ sung A01, A02, A05, A07 và JSON không hợp lệ có kết quả phù hợp theo security-test.md. Ngày 13/11/2026, migration 004_normalize_ticket_accessories.sql được áp dụng thành công trên database kiểm thử; Migration và Seed hoàn tất không lỗi. Kiểm tra database xác nhận ba phiếu mẫu có phụ kiện lần lượt là ["KHAC"], ["SAC"] và []. Kiểm thử thủ công BUG-04 ngày 13/11/2026: PUT /api/tickets/4 trả HTTP 200; phiếu ID 4 được cập nhật thành công và mức ưu tiên được giữ nguyên như dữ liệu trước cập nhật. | PASS |

## 4. Phân loại kiểm thử và ánh xạ bài kiểm thử tự động

### 4.1. Ánh xạ 29 bài kiểm thử tự động vào 12 test case

| Test case | Bài kiểm thử tự động tương ứng |
|---|---|
| TC-01 | `Happy path: tạo phiếu khi dữ liệu hợp lệ`; `API-01: API tạo phiếu hợp lệ trả về HTTP 201`. |
| TC-02 | `Boundary: chấp nhận mô tả đúng 10 ký tự`. |
| TC-03 | `Invalid data: từ chối mô tả ngắn hơn 10 ký tự`; `API-02: API từ chối mô tả lỗi ngắn hơn 10 ký tự`. |
| TC-04 | `Not found: từ chối khi thiết bị không tồn tại`. |
| TC-05 | `Validation: từ chối khi thiết bị không thuộc khách hàng`. |
| TC-06 | `Conflict: từ chối thiết bị đã có phiếu đang xử lý`. |
| TC-07 | `Warranty: yêu cầu phê duyệt khi thiết bị đã hết hạn bảo hành`. |
| TC-08 | `Due date: áp dụng SLA theo ba mức ưu tiên và bỏ qua Chủ nhật`. |
| TC-09 | `Due date: tiếp nhận vào Chủ nhật thì bắt đầu tính từ thứ Hai`. |
| TC-10 | `Due date: invalid priority throws Error`. |
| TC-11 | `IT-01: PostgreSQL lưu và truy vấn lại khách hàng`; `IT-02: PostgreSQL từ chối số điện thoại bị trùng`; 5 bài kiểm thử trong `customer-crypto.test.js`. |
| TC-12 | 6 bài kiểm thử Unit Test về quyền sở hữu và phân quyền; `HTTP mapping: mã lỗi nghiệp vụ được ánh xạ đúng status`; `API-03`; `API-04`; `API-05`. |

### 4.2. Tổng hợp theo loại kiểm thử

| Nhóm kiểm thử | Test case | Kết quả |
|---|---|---|
| Luồng đúng (Happy path) | TC-01 | PASS |
| Kiểm thử biên (Boundary) | TC-02, TC-03 | PASS |
| Dữ liệu sai (Invalid data) | TC-03 đến TC-07, TC-10 | PASS |
| Bảo mật và chất lượng dữ liệu | TC-11, TC-12 | PASS |
| Khả năng tái lập (Repeatability) | TC-12 | PASS |
| Kiểm thử hồi quy thủ công API PUT (BUG-04) | TC-12 | PASS |

**Kiểm tra giá trị biên:** TC-02 xác nhận dữ liệu đúng ngưỡng 10 ký tự được chấp nhận; TC-03 xác nhận dữ liệu ngắn hơn ngưỡng bị từ chối.

**Kiểm tra bảo mật và chất lượng dữ liệu:** TC-11 và TC-12 bao gồm kiểm tra tính duy nhất dữ liệu, mã hóa dữ liệu khách hàng, xác thực, phân quyền và quyền sở hữu phiếu A01.

## 5. Kết quả kiểm tra bảo mật

Các kiểm tra bảo mật thủ công được ghi chi tiết trong `docs/security-test.md`.

| Mã OWASP | Nội dung | Kết quả |
|---|---|---|
| A01 | Broken Access Control | PASS trong phạm vi kiểm thử quyền sở hữu phiếu và phân quyền ADMIN/STAFF. |
| A02 | Security Misconfiguration | PASS trong phạm vi kiểm tra HTTP Security Headers sau khi tích hợp Helmet. |
| A04 | Cryptographic Failures | PASS trong phạm vi kiểm tra bcrypt, AES-256-GCM và HMAC-SHA256. |
| A05 | Injection | PASS trong phạm vi kiểm tra dữ liệu tìm kiếm khách hàng có dấu hiệu SQL Injection. |
| A07 | Authentication Failures | PASS trong các tình huống thiếu token, token bị chỉnh sửa và đăng nhập sai mật khẩu. |

### 5.1. Kiểm tra bảo mật bổ sung

- JSON không hợp lệ: API trả HTTP 400, mã lỗi `INVALID_JSON`.
- Phản hồi lỗi không làm lộ stack trace, tên bảng hoặc chuỗi kết nối trong tình huống đã kiểm tra.
- Mật khẩu được băm bằng bcrypt trước khi lưu vào `password_hash`.
- Ba trường `full_name`, `phone` và `address` của khách hàng được mã hóa bằng AES-256-GCM.
- Số điện thoại được tra cứu bằng HMAC-SHA256 và API che số điện thoại khi trả dữ liệu phiếu bảo hành.

Các kết quả trên chỉ phản ánh những tình huống đã kiểm tra, không thay thế đánh giá bảo mật chuyên sâu hoặc kiểm thử xâm nhập.


## 6. Kiểm tra Migration và Seed có thể chạy lại

Sử dụng database kiểm thử riêng `smartcrm_test` thông qua dịch vụ `test-db` trong Docker Compose.

**Các bước thực hiện:**

1. Build lại image kiểm thử để cập nhật migration mới.
2. Chạy lệnh kiểm thử để áp dụng migration còn thiếu và nạp dữ liệu mẫu.
3. Chạy lại cùng lệnh trên database kiểm thử.
4. Kiểm tra log Migration, Seed và kết quả các bài kiểm thử.

**Lệnh thực hiện tại thư mục gốc dự án:**

```bash
docker compose --profile test build test
docker compose --profile test run --rm test
```

**Kết quả ghi nhận:**

- Lần chạy sau khi build lại image: Migration 001, 002 và 003 được nhận diện đã áp dụng; migration `004_normalize_ticket_accessories.sql` được thực thi thành công. Tài khoản ADMIN sẵn sàng, quá trình mã hóa dữ liệu và Seed hoàn thành; 29/29 bài kiểm thử PASS.
- Lần chạy tiếp theo: Cả bốn migration 001, 002, 003 và 004 đều được nhận diện đã áp dụng và bỏ qua. Tài khoản ADMIN đã tồn tại; không có khách hàng mới cần mã hóa; Seed hoàn thành; 29/29 bài kiểm thử tiếp tục PASS.

Dữ liệu phụ kiện của ba phiếu mẫu trong database kiểm thử sau khi chạy Seed:

| Phiếu mẫu | Giá trị `accessories` |
|---|---|
| `L02-DEMO-001` | `["KHAC"]` |
| `L02-DEMO-002` | `["SAC"]` |
| `L02-DEMO-003` | `[]` |

Số lượng bản ghi trong database kiểm thử được ghi nhận:

| Bảng | Số lượng bản ghi |
|---|---:|
| `app_user` | 1 |
| `customer` | 3 |
| `device` | 4 |
| `issue_category` | 6 |
| `service_center` | 2 |
| `ticket` | 3 |
| `ticket_status_log` | 1 |

**Kết luận:** Migration 001–004 và Seed có thể chạy lại trên database kiểm thử mà không phát sinh lỗi hoặc tạo dữ liệu trùng lặp trong phạm vi đã kiểm tra. Migration 004 chuẩn hóa dữ liệu phụ kiện cũ về các mã thống nhất với Backend.

## 7. Minh chứng kiểm thử

Ảnh minh chứng được lưu trong thư mục `docs/screenshots/`.

### 7.1. Ảnh kiểm thử chức năng

- `TC-01.png`
- `TC-02.png`
- `TC-03.png`
- `TC-04.png`
- `TC-05.png`
- `TC-06.png`
- `TC-07.png`
- `TC-08.png`
- `TC-09.png`
- `TC-10.png`
- `TC-11.png`

### 7.2. Ảnh kiểm thử tự động và bảo mật

- `TC-12-automated-tests.png`: Kết quả 29 bài kiểm thử tự động.
- `TC-12-A01-unit-tests.png`: Kiểm thử quyền sở hữu phiếu và phân quyền ADMIN/STAFF ở Unit Test.
- `TC-12-A01-api-authorization.png`: Kiểm thử phân quyền qua API, tạo tài khoản STAFF và quyền truy cập phiếu.
- `TC-12-A02-security-headers.png`: HTTP Security Headers sau khi tích hợp Helmet.
- `TC-12-A04-database-encryption.png`: Kiểm tra dữ liệu khách hàng được mã hóa trong PostgreSQL.
- `TC-12-A04-crypto-tests.png`: Kết quả 5 bài kiểm thử mã hóa và HMAC.
- `TC-12-A05-injection.png`: API từ chối dữ liệu có dấu hiệu SQL Injection.
- `TC-12-A07-authentication.png`: Kiểm tra thiếu token, token bị chỉnh sửa và đăng nhập sai mật khẩu.
- `TC-12-invalid-json-response.png`: API xử lý JSON không hợp lệ.
- `TC-12-migration-seed-repeatability.png`: Kiểm tra Migration và Seed có thể chạy lại sau khi bổ sung migration 004.

### 7.3. Ảnh minh chứng cập nhật ngày 13/11/2026

Hai ảnh sau được chụp lại sau khi bổ sung migration 004 và chạy kiểm thử lần cuối:

- `TC-12-automated-tests.png`: Kết quả 29/29 bài kiểm thử tự động PASS.
- `TC-12-migration-seed-repeatability.png`: Kết quả chạy lại cả bốn migration, Seed thành công và dữ liệu mẫu không bị nhân đôi.