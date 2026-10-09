# Smart CRM – Tiếp nhận và phân loại yêu cầu bảo hành

**Sinh viên:** Nguyễn Quốc Thành – MSSV: 2374802010458  
**Track:** SE  
**Học phần:** Chuyên đề Tốt nghiệp 1 – Trường ĐH Văn Lang

## 1. Mô tả bài toán

Luồng nghiệp vụ L2 – Tiếp nhận và phân loại yêu cầu bảo hành.

Nhân viên tiếp nhận ghi nhận yêu cầu bảo hành của khách hàng, tra cứu thông tin khách hàng theo số điện thoại, ghi nhận thiết bị và mô tả lỗi, phân loại nhóm sự cố và mức độ ưu tiên, sau đó tạo yêu cầu bảo hành kèm hạn xử lý để chuyển sang trạng thái chờ xử lý.

## 2. Phạm vi

### Làm

- Tạo yêu cầu bảo hành.
- Tra cứu khách hàng theo số điện thoại.
- Ghi nhận thông tin thiết bị và mô tả lỗi.
- Phân loại nhóm sự cố.
- Xác định mức độ ưu tiên.
- Thiết lập hạn xử lý.

### Không làm

- Phân công kỹ thuật viên.
- Quản lý lịch hẹn với kỹ thuật viên.
- Quản lý kho và xuất linh kiện.
- Theo dõi chi tiết quá trình sửa chữa.
- Thanh toán và các nghiệp vụ tài chính.

## 3. Công nghệ sử dụng

| Thành phần | Công nghệ |
|---|---|
| Ngôn ngữ | JavaScript |
| Runtime | Node.js |
| Backend | Express |
| Truy cập dữ liệu | PostgreSQL + pg |
| Frontend | React |
| ORM | Prisma |
| Kiểm thử | Vitest |
| Tài liệu API | Swagger UI |
| Đóng gói | Dockerfile + docker-compose |

## 4. Cấu trúc thư mục

```text
smartcrm-2374802010458-l2/
├── docs/
│   └── diagrams/
├── src/
│   ├── backend/
│   └── frontend/
├── tests/
├── .env.example
├── .gitignore
└── README.md
```
## 5. Hướng dẫn cài đặt và chạy

## 6. Khai báo sử dụng công cụ AI
| Công cụ | Dùng vào việc gì  | Cách tự kiểm chứng  |
| ------- | ------- | ------- |
| ChatGPT | Hỗ trợ giải thích tài liệu, rà soát nội dung và hướng dẫn setup môi trường | Tự chạy lệnh, kiểm tra kết quả thực tế và đối chiếu với yêu cầu bài tập |
