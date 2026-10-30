# KHAI BÁO SỬ DỤNG CÔNG CỤ AI

- **Dự án:** Smart CRM – Mekong Mobile
- **Luồng nghiệp vụ:** L02 – Tiếp nhận và phân loại yêu cầu bảo hành
- **Sinh viên:** Nguyễn Quốc Thành
- **MSSV:** 2374802010458
**Track:** SE

## 1. Công cụ AI được sử dụng

| Công cụ | Mục đích sử dụng |
|---|---|
| ChatGPT (OpenAI) | Hỗ trợ đọc hiểu yêu cầu BT2, phân tích nghiệp vụ và xác định các tiêu chí cần triển khai. |
| ChatGPT (OpenAI) | Hỗ trợ đề xuất cấu trúc Backend theo các lớp Routes, Services và Repositories; hỗ trợ xây dựng và rà soát API. |
| ChatGPT (OpenAI) | Hỗ trợ triển khai giao diện React, API Client, xác thực Bearer token và xử lý các trạng thái giao diện. |
| ChatGPT (OpenAI) | Hỗ trợ phân tích lỗi, đề xuất cách khắc phục và xây dựng các trường hợp kiểm thử. |
| ChatGPT (OpenAI) | Hỗ trợ rà soát README, Bug Log và tài liệu khai báo sử dụng AI. |

## 2. Các nội dung có AI hỗ trợ

- Phân tích tài liệu yêu cầu và đối chiếu phạm vi triển khai với tiêu chí BT2.
- Đề xuất và rà soát cấu trúc mã nguồn Backend, Frontend.
- Hỗ trợ viết và điều chỉnh các đoạn mã JavaScript, SQL và PowerShell.
- Hỗ trợ xử lý lỗi validation trên biểu mẫu và quy tắc tính hạn cam kết theo mức ưu tiên.
- Hỗ trợ bổ sung unit test cho nghiệp vụ tạo phiếu và tính SLA.
- Hỗ trợ rà soát cấu hình môi trường, hướng dẫn chạy dự án và nội dung tài liệu.

## 3. Cách tự kiểm chứng kết quả

Các nội dung do AI hỗ trợ được sinh viên xem xét, thực hiện và kiểm chứng trong môi trường dự án bằng các hoạt động sau:

- Chạy ứng dụng Backend và Frontend trên máy cá nhân.
- Thực hiện kiểm tra API với dữ liệu trong PostgreSQL.
- Chạy bộ kiểm thử Backend bằng lệnh `npm test`.
- Xác nhận kết quả 10 unit test PASS, 0 FAIL.
- Chạy `npm run build` để kiểm tra khả năng build Frontend.
- Kiểm thử trực tiếp các luồng đăng nhập, tra cứu khách hàng, xem chi tiết, tạo phiếu, kiểm tra dữ liệu không hợp lệ và xử lý lỗi kết nối.
- Đối chiếu hạn cam kết được lưu trong PostgreSQL với quy tắc nghiệp vụ trong SRS.

## 4. Cam kết của sinh viên

AI được sử dụng như một công cụ hỗ trợ trong quá trình học tập và phát triển phần mềm, không thay thế trách nhiệm của sinh viên.

Sinh viên có trách nhiệm đọc hiểu, xem xét, thực hiện và kiểm chứng mã nguồn trước khi sử dụng trong sản phẩm. Sinh viên chịu trách nhiệm về tính chính xác, tính phù hợp của nghiệp vụ, kết quả kiểm thử và toàn bộ nội dung nộp cho học phần.
