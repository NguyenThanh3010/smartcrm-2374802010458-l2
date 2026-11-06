# TEST PLAN – SMART CRM – MEKONG MOBILE
**Luồng nghiệp vụ:** L02 – Tiếp nhận và phân loại yêu cầu bảo hành  
**Track:** SE

## 1. Phạm vi kiểm thử

Kiểm thử tập trung vào module tiếp nhận và phân loại phiếu bảo hành, bao gồm các nội dung:

- Kiểm tra dữ liệu đầu vào khi tạo phiếu: khách hàng, thiết bị, trung tâm bảo hành, nhóm sự cố, mô tả lỗi, mức ưu tiên và phụ kiện.
- Kiểm tra quan hệ giữa khách hàng và thiết bị; ngăn chặn tạo phiếu mới khi thiết bị đã có phiếu chưa đóng.
- Kiểm tra điều kiện bảo hành dựa trên ngày mua và thời hạn bảo hành; xác định các trường hợp cần quản lý phê duyệt.
- Kiểm tra tính toán hạn cam kết theo ba mức ưu tiên và quy tắc bỏ qua Chủ nhật.
- Kiểm tra tính duy nhất và định dạng chuẩn của số điện thoại khách hàng.
- Kiểm tra việc tạo phiếu, sinh mã phiếu, lưu trạng thái ban đầu và lịch sử trạng thái.
- Kiểm tra phản hồi API, xác thực Bearer token và xử lý dữ liệu không hợp lệ.

**Phạm vi chủ ý không kiểm thử:** Kiểm thử hiệu năng và tải với số lượng bản ghi lớn; kiểm thử chấp nhận người dùng (UAT) chưa được thực hiện trong phạm vi BT3. Việc kiểm thử phân quyền và giới hạn dữ liệu giữa nhiều tài khoản cũng chưa được thực hiện đầy đủ.

## 2. Loại kiểm thử và số lượng

Bộ kiểm thử tự động gồm 16 bài kiểm thử (test functions), được tổng hợp thành 12 test case trong `docs/test-report.md`.

| Tầng kiểm thử | Số lượng | Nội dung |
|---|---:|---|
| Unit Test | 11 | Kiểm tra logic tạo phiếu, dữ liệu biên, dữ liệu sai, quan hệ thiết bị, điều kiện bảo hành, tính hạn cam kết và ánh xạ mã lỗi HTTP |
| Integration Test | 2 | Kiểm tra lưu và truy vấn dữ liệu khách hàng trên PostgreSQL; kiểm tra ràng buộc duy nhất của số điện thoại |
| API / System Test | 3 | Kiểm tra API tạo phiếu hợp lệ, phản hồi khi dữ liệu không hợp lệ và cơ chế xác thực Bearer token |

Các test case được xây dựng từ tiêu chí chấp nhận, luồng ngoại lệ, quy tắc nghiệp vụ và các lỗi đã phát hiện trong quá trình phát triển.

Kỹ thuật lựa chọn dữ liệu bao gồm phân vùng tương đương và kiểm thử giá trị biên, tập trung vào giới hạn độ dài mô tả lỗi từ 10 đến 2.000 ký tự, dữ liệu tham chiếu không hợp lệ và các trường hợp hết hạn bảo hành.

Bên cạnh 16 bài kiểm thử tự động, đã kiểm tra thủ công khả năng chạy lại Migration và Seed trên database smartcrm_test.

Ngoài 16 bài kiểm thử tự động, dự án đã thực hiện một số kiểm tra bảo mật thủ công bằng PowerShell và curl.exe. Các nội dung đã kiểm tra gồm OWASP A02 (Security Misconfiguration), A05 (Injection) và A07 (Authentication Failures). OWASP A01 (Broken Access Control) chưa được kiểm thử đầy đủ do phiên bản hiện tại chủ yếu sử dụng một tài khoản demo, chưa có đầy đủ cơ chế phân quyền và sở hữu dữ liệu theo người dùng. OWASP A04 (Cryptographic Failures) mới kiểm tra cấu hình AUTH_TOKEN_SECRET; chưa kiểm tra được việc lưu trữ mật khẩu dạng băm trong cơ sở dữ liệu do phiên bản hiện tại chưa có bảng tài khoản lưu mật khẩu. Do đó, không kết luận cả 5 nhóm OWASP đều đã kiểm thử thành công. Chi tiết kết quả được ghi nhận trong `docs/security-test.md`; ảnh minh chứng được lưu trong `docs/screenshots/`.

## 3. Tiêu chí thành công

- Hoàn thành 16 bài kiểm thử tự động (test functions), gồm 11 Unit Test, 2 Integration Test và 3 API / System Test; được tổng hợp và ánh xạ vào 12 test case trong Test Report.
- Bộ kiểm thử tự động chạy thành công bằng một lệnh thống nhất `npm test`, không có test case thất bại.
- Kiểm tra các luồng chính, dữ liệu hợp lệ, dữ liệu không hợp lệ, giá trị biên, quan hệ dữ liệu, điều kiện bảo hành và xác thực người dùng.
- Có kiểm thử giá trị biên đối với giới hạn tối thiểu của mô tả sự cố: chấp nhận đúng 10 ký tự và từ chối dữ liệu dưới 10 ký tự.
- Migration và Seed có thể chạy lại trên database kiểm thử mà không tạo bảng hoặc bản ghi trùng lặp.
- Kết quả kiểm thử được ghi nhận cụ thể và có ảnh chụp minh chứng cho từng test case; ảnh được lưu trong `docs/screenshots/`.
- Các lỗi Critical được xử lý trước khi hoàn tất kiểm thử; các lỗi Major được sửa hoặc có hướng xử lý rõ ràng.
- Các kiểm tra bảo mật thủ công trong phạm vi đã thực hiện có kết quả phù hợp; các nội dung chưa kiểm thử đầy đủ được ghi nhận rõ ràng.

### Kết quả kiểm thử hiện tại

| Hạng mục | Kết quả |
|---|---|
| Unit Test | 11/11 PASS |
| Integration Test | 2/2 PASS |
| API / System Test | 3/3 PASS |
| Tổng kiểm thử tự động | 16/16 PASS |
| Migration và Seed | PASS |
| Kiểm tra bảo mật thủ công | Đã kiểm tra A02, A05, A07; A01 chưa kiểm thử đầy đủ; A04 mới kiểm tra một phần |

Kết quả kiểm thử bảo mật chỉ phản ánh các trường hợp đã thực hiện, không thay thế đánh giá bảo mật chuyên sâu hoặc kiểm thử xâm nhập.
## 4. Môi trường và dữ liệu thử

**Môi trường:** Windows 11, Node.js 24.14.0, npm 11.9.0 và PostgreSQL 18.4. Kiểm thử Backend sử dụng Node.js built-in test runner (`node:test`).

**Database kiểm thử:** Sử dụng database riêng `smartcrm_test`, không sử dụng database chính `smartcrm`. Cấu trúc database được khởi tạo bằng migration `001_init.sql` và dữ liệu mẫu được nạp bằng `001_demo_data.sql`.

**Dữ liệu thử:** Sử dụng dữ liệu giả lập gồm khách hàng, thiết bị, nhóm sự cố, trung tâm bảo hành và phiếu bảo hành với các trạng thái khác nhau. Integration Test tạo khách hàng thử nghiệm với số điện thoại ngẫu nhiên và xóa dữ liệu sau khi kiểm tra. API Test tạo phiếu thử nghiệm và xóa phiếu cùng lịch sử trạng thái sau khi kiểm tra.

**Cách thực hiện:**
- Unit Test sử dụng repository giả để kiểm tra logic nghiệp vụ độc lập với PostgreSQL.
- Integration Test kiểm tra thao tác lưu, truy vấn và ràng buộc dữ liệu trên PostgreSQL thực tế.
- API / System Test khởi chạy Express server trên cổng ngẫu nhiên, gửi HTTP request và kiểm tra phản hồi của API.
- Migration và Seed được chạy lại trên database kiểm thử để kiểm tra khả năng tái lập và chống tạo dữ liệu trùng.

Kết quả kiểm thử và ảnh chụp minh chứng được lưu trong `docs/screenshots/`.

**Lệnh chạy bộ kiểm thử:** Thực hiện tại thư mục `src/backend` bằng PowerShell:

```powershell
$env:DB_NAME = "smartcrm_test"
npm test
```

**Tài liệu bảo mật:** Kết quả kiểm tra bảo mật thủ công được ghi trong `docs/security-test.md`. Ảnh minh chứng cho các trường hợp đã kiểm tra thuộc A02, A05 và A07 được lưu trong `docs/screenshots/`. A01 và A04 được ghi nhận là những nội dung chưa kiểm thử đầy đủ.