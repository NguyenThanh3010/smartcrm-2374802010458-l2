# Smart CRM – Tiếp nhận và phân loại yêu cầu bảo hành

**Sinh viên:** Nguyễn Quốc Thành – MSSV: 2374802010458  
**Track:** SE  
**Học phần:** Chuyên đề Tốt nghiệp 1 – Trường Đại học Văn Lang

## 1. Mô tả bài toán

Luồng nghiệp vụ L02 – Tiếp nhận và phân loại yêu cầu bảo hành.

Hệ thống hỗ trợ nhân viên tra cứu khách hàng theo số điện thoại, ghi nhận thiết bị và mô tả lỗi, phân loại nhóm sự cố và mức độ ưu tiên, sau đó tạo phiếu bảo hành kèm hạn xử lý.

## 2. Yêu cầu môi trường và phạm vi

### Yêu cầu môi trường

- Node.js và npm.
- PostgreSQL đang chạy.
- Các thư viện backend được khai báo trong `src/backend/package.json`.
- File `.env` đặt tại thư mục gốc dự án, cấu hình theo `.env.example`.
- Không đưa mật khẩu hoặc file `.env` vào Git.

### Trong phạm vi

- Tra cứu khách hàng.
- Ghi nhận thông tin thiết bị và mô tả lỗi.
- Phân loại nhóm sự cố và mức độ ưu tiên.
- Tiếp nhận phiếu bảo hành, thiết lập hạn xử lý và ghi lịch sử trạng thái.

### Ngoài phạm vi

- Phân công kỹ thuật viên.
- Quản lý kho và xuất linh kiện.
- Theo dõi chi tiết quá trình sửa chữa.
- Thanh toán và nghiệp vụ tài chính.

## 3. Công nghệ sử dụng

| Thành phần | Công nghệ |
|---|---|
| Ngôn ngữ | JavaScript |
| Runtime | Node.js |
| Backend | Express |
| Cơ sở dữ liệu | PostgreSQL |
| Kết nối dữ liệu | pg |
| Quản lý biến môi trường | dotenv |
| Frontend dự kiến | React |
| Kiểm thử dự kiến | Vitest |

## 4. Cấu trúc thư mục

```text
smartcrm-2374802010458-l2/
├── docs/
│   ├── api-contract.md
│   ├── architecture.drawio
│   ├── ddl.sql
│   ├── erd.drawio
│   ├── srs.md
│   ├── thay-doi-thiet-ke.md
│   ├── diagrams/
│   └── wireframes/
├── src/
│   ├── backend/
│   │   ├── migrations/
│   │   ├── seeds/
│   │   ├── src/
│   │   │   ├── errors/
│   │   │   ├── repositories/
│   │   │   ├── routes/
│   │   │   ├── services/
│   │   │   ├── validators/
│   │   │   ├── app.js
│   │   │   └── db.js
│   │   ├── index.js
│   │   ├── migrate.js
│   │   ├── seed.js
│   │   ├── package.json
│   │   └── package-lock.json
│   └── frontend/
├── tests/
├── .env.example
├── .gitignore
└── README.md
```

## 5. Hướng dẫn cài đặt và chạy

Mở terminal tại thư mục `src/backend`, sau đó chạy lần lượt:

```powershell
npm ci
node .\migrate.js
node .\seed.js
node .\index.js
```

Server mặc định chạy tại `http://localhost:3000`, hoặc sử dụng cổng được cấu hình bằng `APP_PORT`.

### Các API đã triển khai

| Phương thức | Endpoint | Chức năng |
|---|---|---|
| GET | `/api/customers` | Liệt kê hoặc tra cứu khách hàng theo số điện thoại |
| GET | `/api/customers/:id` | Xem chi tiết khách hàng |
| POST | `/api/customers` | Tạo khách hàng |
| PUT | `/api/customers/:id` | Cập nhật khách hàng |
| DELETE | `/api/customers/:id` | Xóa khách hàng nếu không có dữ liệu liên quan |
| GET | `/api/tickets` | Liệt kê phiếu bảo hành |
| GET | `/api/tickets/:id` | Xem chi tiết phiếu bảo hành |
| POST | `/api/tickets` | Tiếp nhận phiếu bảo hành |
| PUT | `/api/tickets/:id` | Cập nhật thông tin phiếu |
| DELETE | `/api/tickets/:id` | Hủy phiếu đủ điều kiện |

## 6. Trạng thái hiện tại (Buổi 8)

### Đã thực hiện và kiểm tra

- [x] Cài đặt thư viện backend bằng `npm ci`.
- [x] Kết nối thành công tới PostgreSQL.
- [x] Tạo sáu bảng nghiệp vụ và bảng quản lý migration.
- [x] Chạy migration thành công và kiểm tra chạy lại.
- [x] Nạp dữ liệu mẫu cho khách hàng, thiết bị, danh mục, trung tâm và phiếu bảo hành.
- [x] Tạo cấu trúc các lớp routes, services, repositories, errors và validators.
- [x] Triển khai API khách hàng và phiếu bảo hành.
- [x] Kiểm tra API danh sách khách hàng và danh sách phiếu.
- [x] Kiểm tra số điện thoại không hợp lệ bị từ chối bằng HTTP 422.
- [x] Kiểm tra mô tả lỗi quá ngắn bị từ chối bằng HTTP 400.
- [x] Kiểm tra tạo phiếu trùng thiết bị bị từ chối bằng HTTP 409.
- [x] Tạo phiếu bảo hành thành công và xác nhận lịch sử trạng thái ban đầu `MOI`.
- [x] Tạo file `docs/thay-doi-thiet-ke.md`.

### Còn cần hoàn thiện hoặc xác minh

- [ ] Chụp ảnh kết quả chạy và lưu vào thư mục `docs/`.
- [x] Viết và chạy 3 unit test cho happy path, boundary và invalid data (3 pass, 0 fail).
- [ ] Kiểm tra đầy đủ thao tác cập nhật và hủy phiếu.
- [ ] Kiểm tra khả năng dựng lại dự án theo README.
- [ ] Xác minh có ít nhất hai commit đúng quy ước và push thay đổi lên GitHub.
- [ ] Tiếp tục xử lý các góp ý thiết kế BT1 chưa cập nhật.

**Ghi chú:** Quy tắc hạn xử lý ba ngày hiện là giả định triển khai theo ví dụ trong API contract, cần xác nhận trước khi xem là SLA chính thức.

## 7. Khai báo sử dụng công cụ AI

| Công cụ | Dùng vào việc gì | Cách tự kiểm chứng |
|---|---|---|
| ChatGPT | Hỗ trợ giải thích tài liệu, viết và rà soát mã nguồn, xử lý lỗi trong quá trình triển khai | Tự chạy lệnh, kiểm thử API, kiểm tra dữ liệu PostgreSQL và đối chiếu kết quả thực tế |

Người thực hiện có trách nhiệm đọc, hiểu và kiểm chứng mã nguồn trước khi nộp.

