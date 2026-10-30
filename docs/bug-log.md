# BUG LOG – SMART CRM L02

Tài liệu ghi nhận các lỗi thực tế phát hiện trong quá trình kiểm thử, nguyên nhân, cách khắc phục và kết quả xác nhận.

## BUG-01 – Thông báo kiểm tra dữ liệu trên biểu mẫu

1. **Mã và mức độ:** BUG-01 – Medium.
2. **Phát hiện bởi:** Kiểm thử thủ công giao diện trong quá trình hoàn thiện BT2.
3. **Triệu chứng:** Khi để trống trường bắt buộc và gửi biểu mẫu, trình duyệt hiển thị thông báo mặc định bằng tiếng Anh: "Please select an item in the list." thay vì thông báo tiếng Việt của ứng dụng.
4. **Cách tái lập:**
   - Đăng nhập vào Smart CRM.
   - Mở biểu mẫu tạo phiếu bảo hành.
   - Để trống trường Khách hàng hoặc các trường bắt buộc.
   - Nhấn nút Tạo phiếu bảo hành.
5. **Nguyên nhân:** Cơ chế HTML constraint validation chặn sự kiện submit trước khi hàm handleSubmit của React được thực thi. Do đó, phần kiểm tra dữ liệu và thông báo lỗi tùy chỉnh của ứng dụng không được chạy.
6. **Cách sửa:** Thêm thuộc tính noValidate vào thẻ form, giữ các thuộc tính required và sử dụng logic kiểm tra dữ liệu hiện có trong handleSubmit. Kết quả được kiểm tra lại trên giao diện: biểu mẫu hiển thị thông báo tiếng Việt khi thiếu thông tin và khi mô tả sự cố ngắn hơn 10 ký tự.
7. **Commit và xác nhận:** Đã xác nhận thủ công trên giao diện, không phát sinh phiếu khi dữ liệu bắt buộc chưa hợp lệ. Commit sẽ được bổ sung sau khi hoàn tất đợt commit BT2.

## BUG-02 – Tính hạn cam kết sai quy tắc nghiệp vụ

1. **Mã và mức độ:** BUG-02 – High.
2. **Phát hiện bởi:** Đối chiếu kết quả tạo phiếu với QT-04 trong SRS và kiểm thử nghiệp vụ.
3. **Triệu chứng:** Hạn cam kết được tính bằng cách cộng cố định 3 ngày lịch vào thời điểm tiếp nhận, không phụ thuộc mức ưu tiên. Chủ nhật cũng bị tính vào thời hạn xử lý.
4. **Cách tái lập:**
   - Tạo phiếu bảo hành với mức ưu tiên Trung bình vào thứ Sáu.
   - Kiểm tra thời điểm nhận phiếu và hạn cam kết trên giao diện hoặc PostgreSQL.
   - Đối chiếu kết quả với quy tắc SLA trong SRS.
5. **Nguyên nhân:** Repository sử dụng câu SQL cộng cố định INTERVAL '3 days'. Logic này không phân biệt ba mức ưu tiên và không loại trừ ngày Chủ nhật.
6. **Cách sửa:** Bổ sung hàm calculateDueDate trong Ticket Service, xác định số ngày theo mức ưu tiên: CAO = 1, TRUNG_BINH = 3, THAP = 5. Hàm bỏ qua Chủ nhật. Service truyền received_at và due_date đã tính sang Repository để lưu vào PostgreSQL. Bổ sung 3 bài kiểm thử cho ba mức ưu tiên, trường hợp tiếp nhận vào Chủ nhật và mức ưu tiên không hợp lệ.
7. **Commit và xác nhận:** Đã chạy 10 bài unit test: 10 PASS, 0 FAIL. Đã tạo phiếu BH-000005/2026 với mức ưu tiên Trung bình lúc 11:15 ngày 30/10/2026. PostgreSQL xác nhận hạn cam kết là 11:15 ngày 03/11/2026, tương ứng 96 giờ lịch và 72 giờ tính theo ngày làm việc sau khi bỏ qua Chủ nhật. Commit sẽ được bổ sung sau khi hoàn tất đợt commit BT2.