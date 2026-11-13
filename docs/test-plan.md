# TEST PLAN – SMART CRM – MEKONG MOBILE

**Luồng nghiệp vụ:** L02 – Tiếp nhận và phân loại yêu cầu bảo hành  
**Track:** SE

## 1. Phạm vi kiểm thử

Kiểm thử tập trung vào module tiếp nhận và phân loại phiếu bảo hành, bao gồm:

- Kiểm tra dữ liệu đầu vào khi tạo phiếu, quan hệ giữa khách hàng và thiết bị, và ngăn tạo phiếu mới khi thiết bị đã có phiếu chưa đóng.
- Kiểm tra điều kiện bảo hành, tính hạn cam kết theo mức ưu tiên và quy tắc bỏ qua Chủ nhật.
- Kiểm tra định dạng, tính duy nhất của số điện thoại và việc lưu trữ dữ liệu khách hàng.
- Kiểm tra tạo phiếu, sinh mã phiếu, trạng thái ban đầu và lịch sử trạng thái.
- Kiểm tra API, xác thực Bearer token, phân quyền ADMIN/STAFF và quyền sở hữu phiếu bảo hành. STAFF chỉ được truy cập phiếu do mình tạo; ADMIN được quản lý phiếu trên toàn hệ thống.
- Kiểm tra bảo vệ thông tin: mật khẩu được băm, dữ liệu khách hàng được mã hóa và xử lý lỗi an toàn.

**Phạm vi chưa thực hiện đầy đủ:** Kiểm thử hiệu năng và tải với số lượng bản ghi lớn; kiểm thử chấp nhận người dùng (UAT) và kiểm thử bảo mật chuyên sâu.

## 2. Loại kiểm thử và số lượng

Bộ kiểm thử tự động gồm 29 bài kiểm thử (test functions), được tổng hợp thành 12 test case trong `docs/test-report.md`.

| Tầng kiểm thử | Số lượng | Nội dung |
|---|---:|---|
| Unit Test | 17 | Kiểm tra logic nghiệp vụ, dữ liệu hợp lệ, dữ liệu biên, dữ liệu sai và xử lý lỗi |
| Integration Test | 2 | Kiểm tra lưu trữ, truy vấn và ràng buộc dữ liệu trên PostgreSQL |
| API / System Test | 5 | Kiểm tra API, xác thực, phản hồi lỗi và quyền truy cập |
| Crypto Test | 5 | Kiểm tra mã hóa, giải mã và bảo vệ dữ liệu nhạy cảm |
| **Tổng cộng** | **29** | |

Ngoài kiểm thử tự động, dự án có kiểm tra khả năng chạy lại Migration và Seed, đồng thời thực hiện các kiểm tra bảo mật bổ sung. Các nội dung về quyền sở hữu dữ liệu, mật khẩu băm, mã hóa dữ liệu khách hàng và xử lý lỗi được ghi nhận trong `docs/security-test.md`.

Kỹ thuật lựa chọn dữ liệu bao gồm phân vùng tương đương và kiểm thử giá trị biên, tập trung vào độ dài mô tả lỗi từ 10 đến 2.000 ký tự, dữ liệu tham chiếu không hợp lệ, điều kiện bảo hành và quyền truy cập dữ liệu.

## 3. Tiêu chí thành công

- 29/29 bài kiểm thử tự động chạy thành công, không có bài kiểm thử thất bại.
- Các luồng nghiệp vụ chính, dữ liệu hợp lệ, dữ liệu không hợp lệ và giá trị biên được kiểm tra.
- API kiểm tra đúng xác thực và quyền truy cập; người dùng không được truy cập dữ liệu ngoài quyền sở hữu được cấp.
- Mật khẩu không được lưu dưới dạng văn bản thuần; dữ liệu khách hàng nhạy cảm được mã hóa theo cơ chế của hệ thống.
- Migration và Seed có thể chạy lại mà không phát sinh lỗi hoặc bản ghi trùng lặp.
- Kết quả kiểm thử được ghi nhận trong `docs/test-report.md` và các kiểm tra bảo mật được ghi nhận trong `docs/security-test.md`.
- Các lỗi nghiêm trọng được xử lý trước khi hoàn tất kiểm thử; các lỗi còn lại phải được ghi nhận trong Bug Log.

## 4. Môi trường và dữ liệu thử

**Môi trường:** Windows 11 và Docker Compose. Bộ kiểm thử chạy trong container Node.js 24, sử dụng PostgreSQL 18.4.

**Database kiểm thử:** Sử dụng database riêng `smartcrm_test` thông qua dịch vụ `test-db` trong Docker Compose, tách biệt với database chính của ứng dụng.

**Dữ liệu thử:** Sử dụng dữ liệu giả lập gồm khách hàng, thiết bị, nhóm sự cố, trung tâm bảo hành và phiếu bảo hành. Các bài kiểm thử có thao tác ghi dữ liệu sử dụng môi trường kiểm thử riêng.

**Cách thực hiện:**
- Unit Test kiểm tra logic nghiệp vụ độc lập với database.
- Integration Test kiểm tra thao tác lưu và truy vấn trên PostgreSQL.
- API / System Test kiểm tra request, response, xác thực và quyền truy cập.
- Crypto Test kiểm tra cơ chế mã hóa và giải mã dữ liệu.
- Migration và Seed được chạy lại để kiểm tra khả năng tái lập.

**Lệnh chạy bộ kiểm thử:** Thực hiện tại thư mục gốc dự án bằng terminal có Docker Compose.

Build image kiểm thử:

```bash
docker compose --profile test build test
```

Chạy bộ kiểm thử:

```bash
docker compose --profile test run --rm test
```

**Tài liệu liên quan:** Kết quả chi tiết được trình bày trong `docs/test-report.md`; kết quả kiểm tra bảo mật được ghi trong `docs/security-test.md`.