# BUG LOG – SMART CRM L02

Tài liệu ghi nhận các lỗi thực tế phát hiện trong quá trình kiểm thử, nguyên nhân, cách khắc phục và kết quả xác nhận.

## BUG-01 – Thông báo kiểm tra dữ liệu trên biểu mẫu

1. **Mã và mức độ:** BUG-01 – Minor. Lỗi chủ yếu ảnh hưởng trải nghiệm người dùng và nội dung thông báo; không làm sai lệch dữ liệu nghiệp vụ.
2. **Phát hiện bởi:** Kiểm thử thủ công giao diện trong quá trình hoàn thiện BT2, với tình huống để trống trường bắt buộc trên biểu mẫu.
3. **Triệu chứng:** Khi để trống trường bắt buộc và gửi biểu mẫu, trình duyệt hiển thị thông báo mặc định bằng tiếng Anh: "Please select an item in the list." thay vì thông báo tiếng Việt của ứng dụng.
4. **Cách tái lập:**
   - Đăng nhập vào Smart CRM.
   - Mở biểu mẫu tạo phiếu bảo hành.
   - Để trống trường Khách hàng hoặc các trường bắt buộc.
   - Nhấn nút Tạo phiếu bảo hành.
5. **Nguyên nhân:** Cơ chế HTML constraint validation chặn sự kiện submit trước khi hàm handleSubmit của React được thực thi. Do đó, phần kiểm tra dữ liệu và thông báo lỗi tùy chỉnh của ứng dụng không được chạy.
6. **Cách sửa:** Thêm thuộc tính noValidate vào thẻ form, giữ các thuộc tính required và sử dụng logic kiểm tra dữ liệu hiện có trong handleSubmit. Kết quả được kiểm tra lại trên giao diện: biểu mẫu hiển thị thông báo tiếng Việt khi thiếu thông tin và khi mô tả sự cố ngắn hơn 10 ký tự.
7. **Commit và xác nhận:** Đã xác nhận thủ công trên giao diện, biểu mẫu không tạo phiếu khi dữ liệu bắt buộc chưa hợp lệ. Phần sửa lỗi được triển khai trong commit BT2 `12c17c1` (chưa có commit sửa lỗi riêng).

## BUG-02 – Tính hạn cam kết sai quy tắc nghiệp vụ

1. **Mã và mức độ:** BUG-02 – Major. Lỗi ảnh hưởng trực tiếp đến quy tắc tính hạn cam kết theo SLA, có thể làm sai thời hạn xử lý phiếu. Đây là chức năng nghiệp vụ quan trọng và cần được khắc phục.
2. **Phát hiện bởi:** Đối chiếu kết quả tạo phiếu với QT-04 trong SRS và kiểm thử nghiệp vụ.
3. **Triệu chứng:** Hạn cam kết được tính bằng cách cộng cố định 3 ngày lịch vào thời điểm tiếp nhận, không phụ thuộc mức ưu tiên. Chủ nhật cũng bị tính vào thời hạn xử lý.
4. **Cách tái lập:**
   - Tạo phiếu bảo hành với mức ưu tiên Trung bình vào thứ Sáu.
   - Kiểm tra thời điểm nhận phiếu và hạn cam kết trên giao diện hoặc PostgreSQL.
   - Đối chiếu kết quả với quy tắc SLA trong SRS.
5. **Nguyên nhân:** Repository sử dụng câu SQL cộng cố định INTERVAL '3 days'. Logic này không phân biệt ba mức ưu tiên và không loại trừ ngày Chủ nhật.
6. **Cách sửa:** Bổ sung hàm calculateDueDate trong Ticket Service, xác định số ngày theo mức ưu tiên: CAO = 1, TRUNG_BINH = 3, THAP = 5. Hàm bỏ qua Chủ nhật. Service truyền received_at và due_date đã tính sang Repository để lưu vào PostgreSQL. Bổ sung các bài kiểm thử cho ba mức ưu tiên, trường hợp tiếp nhận vào Chủ nhật và mức ưu tiên không hợp lệ.
7. **Commit và xác nhận:** Bộ Unit Test hiện tại có 11 bài và đã chạy thành công 11/11 PASS, 0 FAIL. Các bài kiểm thử liên quan xác nhận SLA theo ba mức ưu tiên, bỏ qua Chủ nhật và từ chối mức ưu tiên không hợp lệ. Commit triển khai phần sửa lỗi: `12c17c1` (chưa có commit sửa lỗi riêng).

## BUG-03 – Thiếu HTTP Security Headers

1. **Mã và mức độ:** BUG-03 – Minor. Cấu hình bảo mật HTTP còn thiếu và làm lộ thông tin framework; chưa ghi nhận bằng chứng khai thác hoặc rò rỉ dữ liệu.
2. **Phát hiện bởi:** Kiểm tra bảo mật thủ công A02 – Security Misconfiguration theo OWASP Top 10:2025.
3. **Triệu chứng:** Phản hồi HTTP từ Express có header `X-Powered-By: Express` và chưa thiết lập đầy đủ các HTTP Security Headers cơ bản.
4. **Cách tái lập:**
   - Khởi động Backend.
   - Mở PowerShell.
   - Chạy `curl.exe -i http://localhost:3000/`.
   - Kiểm tra các header trong phản hồi HTTP.
5. **Nguyên nhân:** Ứng dụng Express chưa tích hợp middleware chuyên trách để thiết lập các HTTP Security Headers và loại bỏ header tiết lộ framework.
6. **Cách sửa:** Cài đặt thư viện Helmet và thêm `app.use(helmet())` trong `src/backend/src/app.js` trước các middleware và route. Khởi động lại Backend và kiểm tra phản hồi. Kết quả xác nhận không còn `X-Powered-By`, đồng thời có các header bảo mật như `X-Content-Type-Options` và `X-Frame-Options`.
7. **Commit và xác nhận:** Đã kiểm tra lại bằng curl.exe; ảnh minh chứng lưu tại `docs/screenshots/TC-12-A02-security-headers.png`. Commit sửa lỗi riêng: `6887409` – fix(security): add HTTP security headers (BUG-03).