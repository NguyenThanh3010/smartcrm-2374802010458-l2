# Nhật ký thay đổi thiết kế — Smart CRM L02

- Ngày cập nhật: 19/10/2026
- Workflow: L02 — Tiếp nhận và phân loại yêu cầu bảo hành
- Track: SE
- Mục đích: ghi nhận phản hồi BT1 và các quyết định kỹ thuật trong quá trình triển khai module.

## A. Xử lý phản hồi Bài tập 1

### TD-01 — Bổ sung chú thích khóa và lực lượng quan hệ trong ERD

- Phản hồi: ERD cần thể hiện rõ PK, FK và cardinality 1:N.
- Quyết định: SỬA.
- Lý do: giúp người đọc xác định khóa và quan hệ giữa các bảng mà không cần suy luận từ tên cột.
- Ảnh hưởng: `docs/erd.drawio` và tài liệu mô hình dữ liệu.
- Trạng thái: Cần cập nhật sơ đồ gốc; chưa đánh dấu hoàn thành.

### TD-02 — Đưa SQL DDL vào tài liệu nộp

- Phản hồi: bản PDF BT1 cần có nội dung SQL DDL, không chỉ dẫn liên kết tới tệp.
- Quyết định: SỬA trong bản hồ sơ tổng hợp tiếp theo.
- Lý do: người chấm có thể kiểm tra trực tiếp cấu trúc bảng và ràng buộc.
- Ảnh hưởng: bản PDF hồ sơ thiết kế; nguồn DDL đang lưu tại `docs/ddl.sql`.
- Trạng thái: DDL đã được dùng làm nguồn tạo migration; phần đưa DDL vào PDF còn chờ khi hoàn thiện hồ sơ nộp.

### TD-03 — Rà soát số lượng User Story

- Phản hồi: số lượng User Story vượt mức khuyến nghị; giảng viên đề xuất gộp US7 và US8.
- Quyết định: SỬA.
- Lý do: giảm trùng lặp và làm rõ phạm vi từng yêu cầu.
- Ảnh hưởng: `docs/srs.md`, Use Case và bảng truy vết.
- Trạng thái: Chưa cập nhật các tài liệu thiết kế gốc.

### TD-04 — Làm rõ NFR được tham chiếu trong UC3

- Phản hồi: UC3 tham chiếu yêu cầu “không mất phiếu” nhưng SRS chưa mô tả NFR tương ứng.
- Quyết định: SỬA.
- Lý do: mỗi yêu cầu được tham chiếu phải có nội dung rõ ràng và cách kiểm chứng.
- Ảnh hưởng: `docs/srs.md` và đặc tả UC3.
- Trạng thái: Chưa cập nhật SRS.

### TD-05 — Sửa bảng truy vết yêu cầu

- Phản hồi: tiêu đề bảng có lỗi; mã FF1–FF8 cần được sửa thành FR1–FR8.
- Quyết định: SỬA.
- Lý do: thống nhất quy ước mã yêu cầu chức năng và tránh nhầm lẫn khi truy vết.
- Ảnh hưởng: bảng truy vết trong `docs/srs.md`.
- Trạng thái: Chưa cập nhật SRS.

### TD-06 — Chuẩn hóa tên tệp nộp

- Phản hồi: tên tệp nên bỏ dấu tiếng Việt và khoảng trắng.
- Quyết định: SỬA khi đóng gói hồ sơ nộp.
- Lý do: giảm nguy cơ lỗi tên tệp khi tải lên hệ thống.
- Ảnh hưởng: tên tệp của bản báo cáo cuối cùng.
- Trạng thái: Thực hiện khi xuất bản nộp chính thức.

### TD-07 — Bổ sung ngưỡng đo cho NFR

- Phản hồi: NFR cần có ngưỡng định lượng, tránh các mô tả chung chung như “an toàn” hoặc “sẵn sàng”.
- Quyết định: SỬA.
- Lý do: giúp kiểm chứng yêu cầu bằng tiêu chí cụ thể.
- Ảnh hưởng: các NFR trong `docs/srs.md` và kế hoạch kiểm thử.
- Trạng thái: Chưa rà soát và cập nhật toàn bộ NFR.

## B. Quyết định kỹ thuật trong quá trình triển khai module

### TD-08 — Quản lý migration đã áp dụng

- Thay đổi: bổ sung bảng `schema_migrations` để lưu tên migration đã chạy.
- Lý do: tránh áp dụng lại cùng một migration và gây lỗi tạo bảng trùng.
- Ảnh hưởng: `src/backend/migrate.js`, `src/backend/migrations/001_init.sql`.
- Trạng thái: Đã thực hiện; migration đầu tiên đã chạy thành công và cơ chế bỏ qua migration cũ đã được kiểm tra.

### TD-09 — Bổ sung dữ liệu mẫu có thể nạp lại

- Thay đổi: tạo seed cho danh mục, trung tâm bảo hành, khách hàng, thiết bị và phiếu minh họa.
- Lý do: có dữ liệu thống nhất để chạy thử API và trình bày kết quả.
- Ảnh hưởng: `src/backend/seeds/001_demo_data.sql`, `src/backend/seed.js`.
- Trạng thái: Đã chạy thành công; đã kiểm tra số lượng bản ghi và thêm thiết bị riêng cho ca thử tạo phiếu.

### TD-10 — Quy ước mã phiếu và hạn xử lý

- Thay đổi: API tạo mã phiếu theo dạng `BH-xxxxxx/YYYY`; hạn xử lý được tính trong `TicketService` theo mức ưu tiên: `CAO` 1 ngày, `TRUNG_BINH` 3 ngày, `THAP` 5 ngày; khi tính SLA, bỏ qua Chủ nhật.
- Lý do: Thay giả định cộng cố định 3 ngày lịch bằng quy tắc SLA theo mức ưu tiên và không tính Chủ nhật.
- Ảnh hưởng: `src/backend/src/services/ticketService.js`, `src/backend/src/repositories/ticketRepository.js`.
- Trạng thái: Đã kiểm chứng với phiếu `BH-000005/2026` ưu tiên Trung bình: tiếp nhận lúc 11:15 ngày 30/10/2026, hạn cam kết là 11:15 ngày 03/11/2026; tương ứng 3 ngày SLA sau khi bỏ qua Chủ nhật.

### TD-11 — Ghi lịch sử trạng thái khi tiếp nhận phiếu

- Thay đổi: khi tạo phiếu, hệ thống ghi trạng thái ban đầu `MOI` vào `ticket_status_log` trong cùng transaction với thao tác tạo phiếu.
- Lý do: tránh tình trạng phiếu được lưu nhưng thiếu lịch sử trạng thái ban đầu.
- Ảnh hưởng: `src/backend/src/repositories/ticketRepository.js` và bảng `ticket_status_log`.
- Trạng thái: Đã kiểm tra với phiếu `ticket_id = 4`; lịch sử `MOI` đã được ghi nhận.

## C. Lưu ý trạng thái

Nhật ký này ghi nhận cả công việc đã hoàn thành và các điều chỉnh hồ sơ còn chờ thực hiện. Không xem các mục có trạng thái “Chưa cập nhật” là đã hoàn tất.

## D. Xử lý phản hồi Bài tập 2

### TD-12 — Rà soát độ dài báo cáo BT2

- **Phản hồi:** Báo cáo dài so với gợi ý 6–9 trang.
- **Quyết định:** SỬA.
- **Lý do:** Báo cáo cần tập trung vào kết quả triển khai, kiến trúc thực tế, kiểm thử và các minh chứng quan trọng; hạn chế nội dung lặp lại.
- **Cách xử lý:** Rà soát và rút gọn nội dung trùng lặp, tập trung vào kết quả triển khai và minh chứng.
- **Trạng thái:** Chưa xác nhận hoàn thành; cần đối chiếu lại đúng bản báo cáo được giảng viên nhận xét.

### TD-13 — Bổ sung liên kết GitHub có thể nhấn trên trang bìa

- **Phản hồi:** Link repository chỉ xuất hiện trong ảnh trang bìa nên người chấm không thể nhấn để mở.
- **Quyết định:** SỬA.
- **Lý do:** Giảng viên cần truy cập trực tiếp repository để kiểm tra mã nguồn và lịch sử commit.
- **Cách xử lý:** Đặt địa chỉ `https://github.com/NguyenThanh3010/smartcrm-2374802010458-l2` dưới dạng hyperlink thực sự trong tài liệu Word, bên ngoài ảnh trang bìa. Kiểm tra khả năng mở link ở cửa sổ ẩn danh.
- **Trạng thái:** Cần cập nhật và kiểm tra lại liên kết trong bản Word/PDF dùng để nộp.

### TD-14 — Kết quả mục kiểm chứng bảng 4.2

- **Phản hồi:** Mục kiểm chứng bảng 4.2 đạt đủ các mục chung và các mục theo track.
- **Quyết định:** GIỮ NGUYÊN.
- **Lý do:** Giảng viên đã xác nhận các nội dung kiểm chứng này đáp ứng yêu cầu.
- **Ảnh hưởng:** Không cần thay đổi nội dung bảng 4.2.
- **Trạng thái:** Giữ nguyên theo nhận xét của giảng viên.