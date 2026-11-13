# BUG LOG – SMART CRM L02

Tài liệu ghi nhận các lỗi thực tế phát hiện trong quá trình phát triển và kiểm thử, nguyên nhân, cách khắc phục và kết quả xác nhận.

## BUG-01 – Thông báo kiểm tra dữ liệu trên biểu mẫu

1. **Mã và mức độ:** BUG-01 – Minor. Lỗi chủ yếu ảnh hưởng trải nghiệm người dùng và nội dung thông báo; không làm sai lệch dữ liệu nghiệp vụ.

2. **Phát hiện bởi:** Kiểm thử thủ công giao diện trong quá trình hoàn thiện BT2, với tình huống để trống trường bắt buộc trên biểu mẫu.

3. **Triệu chứng:** Khi để trống trường bắt buộc và gửi biểu mẫu, trình duyệt hiển thị thông báo mặc định bằng tiếng Anh: "Please select an item in the list." thay vì thông báo tiếng Việt của ứng dụng.

4. **Cách tái lập:**
   - Đăng nhập vào Smart CRM.
   - Mở biểu mẫu tạo phiếu bảo hành.
   - Để trống trường Khách hàng hoặc các trường bắt buộc.
   - Nhấn nút Tạo phiếu bảo hành.

5. **Nguyên nhân:** Cơ chế HTML constraint validation chặn sự kiện submit trước khi hàm `handleSubmit` của React được thực thi. Do đó, phần kiểm tra dữ liệu và thông báo lỗi tùy chỉnh của ứng dụng không được chạy.

6. **Cách sửa:** Thêm thuộc tính `noValidate` vào thẻ `form`, giữ các thuộc tính `required` và sử dụng logic kiểm tra dữ liệu trong `handleSubmit`. Phần kiểm tra tùy chỉnh xử lý các trường bắt buộc và độ dài mô tả sự cố tối thiểu 10 ký tự.

7. **Commit và xác nhận:** Phần sửa lỗi nằm trong commit `12c17c10ae7af3c2e23790f8d2d5df1cfd961bfd` (tag `v0.2`), cùng commit triển khai biểu mẫu Frontend cho BT2, không có commit sửa lỗi riêng. Diff xác nhận có `noValidate` và logic kiểm tra dữ liệu tùy chỉnh trong `TicketCreateForm.jsx`. Đã xác nhận trên giao diện: biểu mẫu hiển thị thông báo tiếng Việt khi dữ liệu không hợp lệ và không tạo phiếu.

## BUG-02 – Tính hạn cam kết sai quy tắc nghiệp vụ

1. **Mã và mức độ:** BUG-02 – Major. Lỗi ảnh hưởng trực tiếp đến quy tắc tính hạn cam kết theo SLA, có thể làm sai thời hạn xử lý phiếu. Đây là chức năng nghiệp vụ quan trọng và cần được khắc phục.

2. **Phát hiện bởi:** Đối chiếu kết quả tạo phiếu với QT-04 trong SRS và kiểm thử nghiệp vụ.

3. **Triệu chứng:** Hạn cam kết ban đầu được tính bằng cách cộng cố định 3 ngày lịch vào thời điểm tiếp nhận, không phụ thuộc mức ưu tiên. Chủ nhật cũng bị tính vào thời hạn xử lý.

4. **Cách tái lập:**
   - Tạo phiếu bảo hành với các mức ưu tiên khác nhau.
   - Kiểm tra thời điểm tiếp nhận và hạn cam kết trên giao diện hoặc PostgreSQL.
   - Đối chiếu kết quả với quy tắc SLA trong SRS.
   - Thử trường hợp thời điểm tiếp nhận hoặc thời hạn xử lý đi qua Chủ nhật.

5. **Nguyên nhân:** Repository sử dụng câu SQL cộng cố định `INTERVAL '3 days'`. Logic này không phân biệt ba mức ưu tiên và không loại trừ ngày Chủ nhật.

6. **Cách sửa:** Bổ sung hàm `calculateDueDate` trong Ticket Service, xác định số ngày theo mức ưu tiên:
   - CAO = 1 ngày làm việc.
   - TRUNG_BINH = 3 ngày làm việc.
   - THAP = 5 ngày làm việc.

   Hàm bỏ qua Chủ nhật theo múi giờ `Asia/Ho_Chi_Minh`. Service tính `received_at` và `due_date`, sau đó truyền hai giá trị này sang Repository để lưu vào PostgreSQL thay vì sử dụng phép cộng cố định 3 ngày lịch.

   Bổ sung kiểm thử ba mức ưu tiên, trường hợp tiếp nhận vào Chủ nhật và mức ưu tiên không hợp lệ.

7. **Commit và xác nhận:** Phần sửa lỗi nằm trong commit `12c17c10ae7af3c2e23790f8d2d5df1cfd961bfd` (tag `v0.2`), cùng commit triển khai nghiệp vụ BT2, không có commit sửa lỗi riêng. Diff xác nhận logic `calculateDueDate`, việc truyền `received_at`, `due_date` sang Repository và các bài kiểm thử liên quan. Trên phiên bản hiện tại, 17/17 Unit Test PASS; các bài kiểm thử SLA theo ba mức ưu tiên, bỏ qua Chủ nhật và từ chối mức ưu tiên không hợp lệ đều PASS.

## BUG-03 – Thiếu HTTP Security Headers

1. **Mã và mức độ:** BUG-03 – Minor. Cấu hình bảo mật HTTP còn thiếu và làm lộ thông tin framework; chưa ghi nhận bằng chứng khai thác hoặc rò rỉ dữ liệu.

2. **Phát hiện bởi:** Kiểm tra bảo mật thủ công A02 – Security Misconfiguration theo OWASP Top 10:2025.

3. **Triệu chứng:** Phản hồi HTTP từ Express có header `X-Powered-By: Express` và chưa thiết lập đầy đủ các HTTP Security Headers cơ bản.

4. **Cách tái lập:**
   - Khởi động ứng dụng bằng Docker Compose.
   - Mở Windows PowerShell.
   - Chạy lệnh:

   ```powershell
   curl.exe -i http://localhost:8080/api/tickets
   ```

   - Kiểm tra các header trong phản hồi HTTP.

5. **Nguyên nhân:** Ứng dụng Express chưa tích hợp middleware chuyên trách để thiết lập các HTTP Security Headers và loại bỏ header tiết lộ framework.

6. **Cách sửa:** Cài đặt thư viện Helmet và thêm `app.use(helmet())` trong `src/backend/src/app.js` trước các middleware và route. Khởi động lại ứng dụng và kiểm tra phản hồi. Kết quả xác nhận không còn `X-Powered-By`, đồng thời có các header bảo mật như `Content-Security-Policy`, `X-Content-Type-Options` và `X-Frame-Options`.

7. **Commit và xác nhận:** Commit sửa lỗi riêng `6887409ae74c7ff5ca147fe9261f07275199fc72` – `fix(security): add HTTP security headers (BUG-03)`, ngày 06/11/2026. Đã kiểm tra lại trên phiên bản Docker hiện tại bằng PowerShell; phản hồi không còn `X-Powered-By` và có các HTTP Security Headers. Ảnh minh chứng mới: `docs/screenshots/TC-12-A02-security-headers.png`.

## BUG-04 – API cập nhật phiếu bảo hành phát sinh ReferenceError

1. **Mã và mức độ:** BUG-04 – Major. Lỗi khiến chức năng cập nhật phiếu bảo hành không hoạt động với dữ liệu hợp lệ, API trả HTTP 500 thay vì cập nhật thành công.

2. **Phát hiện bởi:** Kiểm thử API thủ công trong quá trình rà soát API Contract ngày 13/11/2026.

3. **Triệu chứng:** Khi gửi yêu cầu PUT `/api/tickets/:id` với dữ liệu hợp lệ, Backend trả HTTP 500 với mã lỗi `INTERNAL_SERVER_ERROR`. Log Backend ghi nhận lỗi `ReferenceError`.

4. **Cách tái lập:**
   - Đăng nhập bằng tài khoản ADMIN.
   - Gửi GET `/api/tickets` để lấy danh sách phiếu.
   - Chọn một phiếu chưa bị hủy.
   - Gửi PUT `/api/tickets/:id` với các trường `issue_desc` và `priority` hợp lệ.
   - Kiểm tra phản hồi API và log Backend.

5. **Nguyên nhân:** Trong hàm `update()` của `src/backend/src/services/ticketService.js`, đối tượng truyền sang Repository sử dụng biến `priority` chưa được khai báo trong phạm vi hàm. Giá trị ưu tiên thực tế được lưu trong `merged.priority`, khiến JavaScript phát sinh `ReferenceError`.

6. **Cách sửa:** Thay thuộc tính `priority` bằng `priority: merged.priority` khi gọi `repository.update()`. Sau đó build lại Docker Backend để đưa mã nguồn mới vào container.

7. **Commit và xác nhận:** Phần sửa lỗi được thực hiện trong commit `cc588d2` – `Complete BT3 testing, security and Docker deployment`. Sau khi build lại Backend, kiểm thử PUT với phiếu ID 4 trả HTTP 200, không có lỗi `INTERNAL_SERVER_ERROR`, phản hồi trả về đúng `ticket_id` và giữ nguyên mức ưu tiên. Kết quả: PASS.