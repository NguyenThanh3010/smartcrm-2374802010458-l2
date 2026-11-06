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

**Phạm vi chủ ý không kiểm thử:** Hiệu năng và tải với số lượng bản ghi lớn; kiểm thử chấp nhận với người dùng thực tế; các chức năng ngoài luồng L02 như phân công kỹ thuật viên, quản lý tồn kho và thanh toán; kiểm thử bảo mật chuyên sâu thuộc phạm vi Chuyên đề tốt nghiệp 2. Các kiểm tra nhận biết theo năm mục OWASP được thực hiện ở mức kiểm thử thủ công.

## 2. Loại kiểm thử và số lượng

Dự kiến thực hiện 12 test case theo mô hình kim tự tháp kiểm thử:

| Tầng kiểm thử | Số lượng | Nội dung |
|---|---:|---|
| Unit Test | 7 | Kiểm tra logic tạo phiếu, dữ liệu biên, dữ liệu sai, quan hệ thiết bị, điều kiện bảo hành và tính hạn cam kết |
| Integration Test | 2 | Kiểm tra tương tác với PostgreSQL, tính duy nhất dữ liệu khách hàng và khả năng chạy lại migration/seed |
| API / System Test | 3 | Kiểm tra API tạo phiếu, phản hồi khi dữ liệu không hợp lệ và cơ chế xác thực |

Các test case được xây dựng từ tiêu chí chấp nhận, luồng ngoại lệ, quy tắc nghiệp vụ và các lỗi đã phát hiện trong quá trình phát triển.

Kỹ thuật lựa chọn dữ liệu bao gồm phân vùng tương đương và kiểm thử giá trị biên, tập trung vào giới hạn độ dài mô tả lỗi từ 10 đến 2.000 ký tự, dữ liệu tham chiếu không hợp lệ và các trường hợp hết hạn bảo hành.

Bộ kiểm thử bảo mật thủ công đối chiếu năm mục OWASP Top 10:2025 gồm A01, A02, A04, A05 và A07. Postman collection hoặc tệp `.http` được xuất và lưu trong Repository để làm minh chứng.

## 3. Tiêu chí thành công

- Có đủ 12 test case, bao phủ năm loại: luồng đúng, giá trị biên, dữ liệu sai, bảo mật và tính tái lập.
- Mỗi quy tắc nghiệp vụ thuộc phạm vi kiểm thử có ít nhất một test case tương ứng.
- Có ít nhất hai test giá trị biên ở hai phía của cùng một ranh giới và hai test dữ liệu sai.
- Kết quả thực tế được ghi nhận cụ thể; chỉ đánh dấu PASS khi khớp hoàn toàn với kết quả mong đợi.
- Mỗi test case có ảnh chụp minh chứng kết quả chạy thực tế.
- Các lỗi Critical được xử lý trước khi hoàn tất kiểm thử; các lỗi Major được sửa hoặc có hướng xử lý rõ ràng.
- Sau khi sửa lỗi, toàn bộ bộ kiểm thử tự động chạy thành công bằng một lệnh thống nhất là `npm test`.

## 4. Môi trường và dữ liệu thử

**Môi trường:** Windows, Node.js 24.14.0, npm 11.9.0 và PostgreSQL 18. Kiểm thử Backend sử dụng Node.js built-in test runner (`node:test`).

**Dữ liệu thử:** Sử dụng dữ liệu giả lập gồm khách hàng, thiết bị, nhóm sự cố, trung tâm bảo hành và phiếu bảo hành với các trạng thái khác nhau. Các trường hợp kiểm thử cơ sở dữ liệu sử dụng database kiểm thử riêng, được khởi tạo bằng migration và seed; dữ liệu được thiết lập lại phù hợp trước mỗi lần chạy để bảo đảm tính độc lập và khả năng tái lập.

**Cách thực hiện:** Unit Test sử dụng repository giả để cô lập logic nghiệp vụ. Integration Test kiểm tra tương tác với PostgreSQL thực tế. API / System Test kiểm tra các endpoint bằng dữ liệu thử và Bearer token kiểm thử. Kết quả và ảnh chụp được lưu trong `docs/screenshots/`, đặt tên theo mã test case.

Lệnh chạy bộ kiểm thử tự động: `npm test` tại thư mục `src/backend`.