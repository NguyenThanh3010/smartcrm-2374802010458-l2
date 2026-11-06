# TEST REPORT – SMART CRM L02

## 1. Thông tin kiểm thử

- Dự án: Smart CRM L02
- Ngày kiểm thử: 06/11/2026
- Môi trường: Windows 11
- Node.js: v24.14.0
- npm: 11.9.0
- PostgreSQL: 18.4
- Cơ sở dữ liệu kiểm thử: smartcrm_test
- Địa chỉ API kiểm thử: http://localhost:3000
- Công cụ kiểm thử: Node.js Test Runner, PostgreSQL và curl.

## 2. Phạm vi và kết quả tổng quan

Các chức năng được kiểm thử gồm:

- Tiếp nhận và tạo phiếu bảo hành.
- Kiểm tra dữ liệu đầu vào và điều kiện bảo hành.
- Kiểm tra thiết bị, khách hàng và phiếu bảo hành đang xử lý.
- Tính thời hạn xử lý theo mức độ ưu tiên và ngày tiếp nhận.
- Kiểm tra lưu trữ dữ liệu khách hàng trên PostgreSQL.
- Kiểm tra API, xác thực và một số tình huống bảo mật.

### Tổng hợp kết quả

| Nội dung | Kết quả |
|---|---:|
| Số test case trong báo cáo | 12 |
| Số PASS | 12 |
| Số FAIL | 0 |
| Số bài kiểm thử tự động | 16 |
| Unit test | 11 |
| Integration test | 2 |
| API/System test | 3 |

Ghi chú: 12 test case trong báo cáo là các tình huống kiểm thử được tổng hợp từ 16 bài kiểm thử tự động và các kiểm tra bảo mật thủ công. Không đồng nhất số test case với số bài kiểm thử tự động.

## 3. Chi tiết các test case

| Mã test case | Tiền điều kiện | Các bước thực hiện | Dữ liệu thử | Kết quả mong đợi | Mức ưu tiên | Kết quả thực tế | PASS/FAIL |
|---|---|---|---|---|---|---|---|
| TC-01 – Luồng đúng: Tạo phiếu bảo hành | Backend hoạt động; cơ sở dữ liệu có khách hàng và thiết bị hợp lệ; có Bearer token hợp lệ. | 1. Gửi yêu cầu POST /api/tickets. 2. Kiểm tra phản hồi API. 3. Kiểm tra phiếu và lịch sử trạng thái. | Khách hàng và thiết bị hợp lệ; mô tả sự cố từ 10 ký tự trở lên; mức ưu tiên hợp lệ. | API trả HTTP 201; phiếu được tạo; trạng thái ban đầu là MOI; có lịch sử trạng thái tương ứng. | High | Unit test Happy path và API-01 đều PASS; API trả HTTP 201, phiếu được tạo với trạng thái MOI và có lịch sử trạng thái. | PASS |
| TC-02 – Biên: Mô tả đúng 10 ký tự | Có dữ liệu khách hàng và thiết bị hợp lệ. | 1. Nhập mô tả đúng 10 ký tự. 2. Thực hiện tạo phiếu. 3. Kiểm tra kết quả. | `0123456789` | Hệ thống chấp nhận mô tả tại ngưỡng tối thiểu và cho phép xử lý tạo phiếu. | High | Bài kiểm thử xác nhận mô tả đúng 10 ký tự được chấp nhận. | PASS |
| TC-03 – Biên/Dữ liệu sai: Mô tả dưới 10 ký tự | Backend hoạt động; dữ liệu khách hàng và thiết bị hợp lệ. | 1. Gửi yêu cầu tạo phiếu với mô tả 9 ký tự. 2. Kiểm tra mã trạng thái và mã lỗi. | `123456789` | Hệ thống từ chối dữ liệu; API trả HTTP 400 với mã lỗi VALIDATION_FAILED; không tạo phiếu mới. | High | Unit test xác nhận mô tả ngắn bị từ chối; API-02 trả HTTP 400 và mã lỗi VALIDATION_FAILED. | PASS |
| TC-04 – Dữ liệu sai: Thiết bị không tồn tại | Backend hoạt động; khách hàng thử nghiệm tồn tại. | 1. Gửi yêu cầu tạo phiếu. 2. Sử dụng mã thiết bị không có trong cơ sở dữ liệu. 3. Kiểm tra kết quả. | Mã khách hàng hợp lệ; mã thiết bị không tồn tại. | Hệ thống từ chối tạo phiếu vì không tìm thấy thiết bị. | Medium | Bài kiểm thử xác nhận hệ thống từ chối trường hợp thiết bị không tồn tại. | PASS |
| TC-05 – Dữ liệu sai: Thiết bị không thuộc khách hàng | Có ít nhất hai khách hàng và thiết bị thuộc khách hàng khác. | 1. Chọn khách hàng A. 2. Gửi yêu cầu với thiết bị thuộc khách hàng B. 3. Kiểm tra kết quả. | Mã khách hàng A và mã thiết bị thuộc khách hàng B. | Hệ thống từ chối yêu cầu vì thiết bị không thuộc khách hàng được chọn. | High | Bài kiểm thử xác nhận hệ thống từ chối thiết bị không thuộc khách hàng. | PASS |
| TC-06 – Dữ liệu sai: Thiết bị đã có phiếu đang xử lý | Có thiết bị đang gắn với một phiếu bảo hành chưa hoàn tất. | 1. Gửi yêu cầu tạo phiếu mới cho thiết bị đó. 2. Kiểm tra kết quả trả về. | Thiết bị đã có phiếu đang xử lý. | Hệ thống từ chối tạo phiếu trùng cho thiết bị đang có phiếu xử lý. | High | Bài kiểm thử xác nhận hệ thống từ chối tạo phiếu khi thiết bị đã có phiếu đang xử lý. | PASS |
| TC-07 – Dữ liệu sai: Thiết bị hết hạn bảo hành | Có thiết bị đã hết thời hạn bảo hành. | 1. Gửi yêu cầu tạo phiếu cho thiết bị. 2. Kiểm tra mã lỗi và thông tin lỗi trả về. | Thiết bị có ngày mua từ năm 2020, thời hạn bảo hành 12 tháng. | Hệ thống không tự động tiếp nhận phiếu mà yêu cầu phê duyệt thủ công; trả mã lỗi WARRANTY_APPROVAL_REQUIRED và thông tin lỗi tại device_id. | Medium | Bài kiểm thử xác nhận hệ thống trả lỗi WARRANTY_APPROVAL_REQUIRED và có thông tin lỗi tại device_id. | PASS |
| TC-08 – Tái lập/Hồi quy: Kiểm tra SLA theo mức ưu tiên | Đã sửa lỗi BUG-02; có dữ liệu ngày tiếp nhận cố định để kiểm tra. | 1. Kiểm tra thời hạn xử lý với ba mức ưu tiên. 2. Kiểm tra cách tính khi có ngày Chủ nhật. 3. Đối chiếu kết quả với quy tắc SLA. | Ba mức ưu tiên: cao, trung bình, thấp; ngày tiếp nhận có trường hợp đi qua Chủ nhật. | Thời hạn xử lý được tính đúng theo từng mức ưu tiên và không tính Chủ nhật vào thời gian xử lý. | High | Các bài kiểm thử xác nhận SLA theo ba mức ưu tiên và quy tắc bỏ qua Chủ nhật hoạt động đúng sau khi sửa lỗi. | PASS |
| TC-09 – Kiểm tra ngày tiếp nhận vào Chủ nhật | Backend hoạt động; có dữ liệu ngày tiếp nhận cố định. | 1. Thiết lập ngày tiếp nhận là Chủ nhật. 2. Tính thời hạn xử lý. 3. Kiểm tra ngày bắt đầu tính SLA. | Ngày tiếp nhận rơi vào Chủ nhật. | Việc tính thời hạn xử lý bắt đầu từ thứ Hai tiếp theo. | Medium | Bài kiểm thử xác nhận trường hợp tiếp nhận vào Chủ nhật bắt đầu tính từ thứ Hai. | PASS |
| TC-10 – Dữ liệu sai: Mức ưu tiên không hợp lệ | Backend hoạt động; có dữ liệu tạo phiếu hợp lệ. | 1. Gửi yêu cầu với mức ưu tiên không nằm trong các giá trị được hỗ trợ. 2. Kiểm tra kết quả. | Mức ưu tiên không hợp lệ. | Hệ thống từ chối dữ liệu mức ưu tiên không hợp lệ. | Medium | Bài kiểm thử xác nhận hệ thống từ chối mức ưu tiên không hợp lệ. | PASS |
| TC-11 – Chất lượng dữ liệu: Lưu khách hàng và kiểm tra số điện thoại trùng | PostgreSQL hoạt động; đang sử dụng cơ sở dữ liệu smartcrm_test. | 1. Tạo khách hàng mới. 2. Truy vấn lại khách hàng vừa tạo. 3. Thử tạo khách hàng khác với cùng số điện thoại. | Một số điện thoại hợp lệ; sử dụng lại số điện thoại đó ở lần tạo thứ hai. | Dữ liệu khách hàng được lưu và truy vấn lại chính xác; cơ sở dữ liệu từ chối số điện thoại trùng. | High | Hai bài kiểm thử Integration xác nhận lưu/truy vấn khách hàng thành công và từ chối số điện thoại trùng với lỗi PostgreSQL 23505. | PASS |
| TC-12 – Bảo mật: Xác thực và xử lý dữ liệu bất thường | Backend hoạt động; API và các kiểm tra bảo mật đã được thực hiện. | 1. Gửi yêu cầu không có Bearer token. 2. Thử token bị chỉnh sửa. 3. Thử đăng nhập sai mật khẩu. 4. Gửi JSON không hợp lệ. 5. Thử dữ liệu truy vấn có dấu hiệu SQL Injection. 6. Kiểm tra HTTP Security Headers. | Không có token; token sai chữ ký; mật khẩu sai; JSON `{bad-json`; chuỗi `0901234567' OR '1'='1`. | API từ chối yêu cầu không hợp lệ; lần lượt trả các mã lỗi phù hợp như 401, 400, 422; có các HTTP Security Headers và không để lộ X-Powered-By. | High | HTTP mapping và API-03 đều PASS; API trả 401 AUTH_REQUIRED khi thiếu token. Các kiểm tra thủ công ghi nhận những phản hồi bảo mật tương ứng. | PASS |

## 4. Phân loại kiểm thử
### Ánh xạ test case với các bài kiểm thử tự động

| Test case | Bài kiểm thử tự động tương ứng |
|---|---|
| TC-01 | Happy path: tạo phiếu khi dữ liệu hợp lệ; API-01: API tạo phiếu hợp lệ trả về HTTP 201. |
| TC-02 | Boundary: chấp nhận mô tả đúng 10 ký tự. |
| TC-03 | Invalid data: từ chối mô tả ngắn hơn 10 ký tự; API-02: API từ chối mô tả lỗi ngắn hơn 10 ký tự. |
| TC-04 | Not found: từ chối khi thiết bị không tồn tại. |
| TC-05 | Validation: từ chối khi thiết bị không thuộc khách hàng. |
| TC-06 | Conflict: từ chối thiết bị đã có phiếu đang xử lý. |
| TC-07 | Warranty: yêu cầu phê duyệt khi thiết bị đã hết hạn bảo hành. |
| TC-08 | Due date: áp dụng SLA theo ba mức ưu tiên và bỏ qua Chủ nhật. |
| TC-09 | Due date: tiếp nhận vào Chủ nhật thì bắt đầu tính từ thứ Hai. |
| TC-10 | Due date: invalid priority throws Error. |
| TC-11 | IT-01: PostgreSQL lưu và truy vấn lại khách hàng; IT-02: PostgreSQL từ chối số điện thoại bị trùng. |
| TC-12 | HTTP mapping: mã lỗi nghiệp vụ được ánh xạ đúng status; API-03: API yêu cầu Bearer token hợp lệ. Ngoài ra, TC-12 tổng hợp các kiểm tra bảo mật thủ công. |

Tổng cộng: 16 bài kiểm thử tự động được phân bổ vào 12 test case.

| Nhóm kiểm thử | Test case | Kết quả |
|---|---|---|
| Luồng đúng (Happy path) | TC-01 | PASS |
| Kiểm thử biên (Boundary) | TC-02, TC-03 | PASS |
| Dữ liệu sai (Invalid data) | TC-03 đến TC-07, TC-10 | PASS |
| Bảo mật/Chất lượng dữ liệu | TC-11, TC-12 | PASS |
| Tái lập/Hồi quy (Reproducibility/Regression) | TC-08, TC-09 | PASS |

## 5. Phạm vi bảo mật chưa kiểm thử đầy đủ

- OWASP A01 – Broken Access Control: Chưa kiểm thử đầy đủ việc phân quyền và giới hạn dữ liệu giữa nhiều tài khoản vì phiên bản hiện tại chủ yếu sử dụng một tài khoản demo, chưa có đầy đủ cơ chế phân quyền và sở hữu dữ liệu theo người dùng.

- OWASP A04 – Cryptographic Failures: Đã kiểm tra cấu hình AUTH_TOKEN_SECRET có tồn tại, không dùng giá trị mặc định và có độ dài 64 ký tự. Tuy nhiên, chưa thể kiểm thử việc lưu trữ mật khẩu dạng băm trong cơ sở dữ liệu vì phiên bản hiện tại chưa có bảng tài khoản người dùng lưu mật khẩu.

Các nội dung trên được ghi nhận là giới hạn phạm vi kiểm thử, không tính là PASS.

## 6. Lệnh chạy lại toàn bộ kiểm thử

Mở terminal tại thư mục `src/backend`:

```powershell
$env:DB_NAME="smartcrm_test"
npm test
```

Kết quả đã ghi nhận ở lần chạy trước: 16/16 bài kiểm thử tự động thành công, gồm:

- 11 Unit tests.
- 2 Integration tests.
- 3 API/System tests.

Cần chạy lại lệnh trên sau khi hoàn tất các thay đổi cuối cùng để xác nhận kết quả trước khi nộp.

## 7. Minh chứng kiểm thử

Ảnh chụp kết quả được lưu trong thư mục `docs/screenshots/`.

### Ảnh kiểm thử chức năng

- TC-01.png
- TC-02.png
- TC-03.png
- TC-04.png
- TC-05.png
- TC-06.png
- TC-07.png
- TC-08.png
- TC-09.png
- TC-10.png
- TC-11.png

### Ảnh kiểm thử bảo mật (TC-12)

- TC-12-automated-tests.png: Kết quả chạy hai bài kiểm thử tự động HTTP mapping và API-03.
- TC-12-A07-missing-token.png: Kiểm tra API khi thiếu Bearer token.
- TC-12-A07-token-tamper.png: Kiểm tra token bị chỉnh sửa.
- TC-12-A07-invalid-login.png: Kiểm tra đăng nhập sai mật khẩu.
- TC-12-A02-security-headers.png: Kiểm tra HTTP Security Headers.
- TC-12-A05-injection.png: Kiểm tra dữ liệu có dấu hiệu SQL Injection.
- TC-12-invalid-json-response.png: Kiểm tra phản hồi khi gửi JSON không hợp lệ.