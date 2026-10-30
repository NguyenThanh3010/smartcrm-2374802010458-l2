# Smart CRM – Tiếp nhận và phân loại yêu cầu bảo hành

**Sinh viên:** Nguyễn Quốc Thành – MSSV: 2374802010458
**Track:** SE
**Học phần:** Chuyên đề Tốt nghiệp 1 – Trường Đại học Văn Lang
**Luồng nghiệp vụ:** L02 – Tiếp nhận và phân loại yêu cầu bảo hành
**GitHub:** https://github.com/NguyenThanh3010/smartcrm-2374802010458-l2

## 1. Giới thiệu

Smart CRM – Mekong Mobile hỗ trợ nhân viên tiếp nhận yêu cầu bảo hành, tra cứu khách hàng, ghi nhận thiết bị, mô tả sự cố, phân loại nhóm sự cố và mức ưu tiên, sau đó tạo phiếu bảo hành có hạn cam kết xử lý.

### Phạm vi triển khai

- Đăng nhập và xác thực người dùng bằng Bearer token.
- Tra cứu khách hàng theo số điện thoại.
- Tạo, xem, cập nhật và xử lý hủy khách hàng theo quy tắc nghiệp vụ.
- Ghi nhận thiết bị, mô tả sự cố và phụ kiện.
- Lấy danh mục sự cố và trung tâm bảo hành từ PostgreSQL.
- Tạo, tra cứu, cập nhật và hủy phiếu bảo hành.
- Tự động xác định hạn cam kết theo mức ưu tiên.
- Ghi nhận lịch sử trạng thái phiếu.
- Hiển thị trạng thái tải dữ liệu, dữ liệu rỗng và lỗi kết nối; hỗ trợ thử tải lại.

### Ngoài phạm vi

- Phân công kỹ thuật viên.
- Quản lý tồn kho và xuất linh kiện.
- Theo dõi chi tiết từng công đoạn sửa chữa.
- Thanh toán và nghiệp vụ tài chính.

## 2. Công nghệ và môi trường

### Công nghệ

| Thành phần | Công nghệ |
|---|---|
| Ngôn ngữ | JavaScript |
| Backend runtime | Node.js |
| Backend framework | Express 5 |
| Frontend | React 19 |
| Frontend tooling | Vite 8 |
| Cơ sở dữ liệu | PostgreSQL |
| Kết nối cơ sở dữ liệu | node-postgres (pg) |
| Quản lý môi trường | dotenv |
| Kiểm thử Backend | Node.js built-in test runner (node:test) |
| Quản lý thư viện | npm |

### Môi trường đã kiểm thử

| Công cụ | Phiên bản |
|---|---|
| Node.js | 24.14.0 |
| npm | 11.9.0 |
| PostgreSQL | 18 |

Cần cài đặt Node.js, npm và PostgreSQL trước khi chạy dự án. PostgreSQL phải đang hoạt động và tài khoản kết nối phải có quyền truy cập cơ sở dữ liệu.

## 3. Cấu trúc dự án

```text
smartcrm-2374802010458-l2/
├── docs/
│   ├── diagrams/
│   ├── screenshots/
│   ├── wireframes/
│   ├── api-contract.md
│   ├── architecture.drawio
│   ├── architecture-thuc-te.drawio
│   ├── ddl.sql
│   ├── erd.drawio
│   ├── srs.md
│   ├── thay-doi-thiet-ke.md
│   ├── bug-log.md
│   └── ai-disclosure.md
├── src/
│   ├── backend/
│   │   ├── migrations/
│   │   ├── seeds/
│   │   ├── src/
│   │   │   ├── auth/
│   │   │   ├── errors/
│   │   │   ├── repositories/
│   │   │   ├── routes/
│   │   │   ├── services/
│   │   │   ├── app.js
│   │   │   └── db.js
│   │   ├── index.js
│   │   ├── migrate.js
│   │   ├── seed.js
│   │   ├── package.json
│   │   └── package-lock.json
│   └── frontend/
│       ├── public/
│       ├── src/
│       │   ├── api/
│       │   ├── components/
│       │   ├── App.jsx
│       │   └── App.css
│       ├── index.html
│       ├── vite.config.js
│       ├── package.json
│       └── package-lock.json
├── tests/
│   └── ticket-service.test.js
├── .env.example
├── .gitignore
└── README.md
```

## 4. Cài đặt và cấu hình

Các lệnh dưới đây sử dụng Windows PowerShell.

### Bước 1. Clone mã nguồn

```powershell
git clone https://github.com/NguyenThanh3010/smartcrm-2374802010458-l2.git
Set-Location ".\smartcrm-2374802010458-l2"
```

### Bước 2. Tạo cơ sở dữ liệu

Khởi động PostgreSQL.

Tạo database có tên `smartcrm` bằng pgAdmin hoặc chạy lệnh sau trong terminal có PostgreSQL command-line tools:

```powershell
psql -U postgres -h localhost -p 5432 -c "CREATE DATABASE smartcrm;"
```

Nếu database đã tồn tại thì bỏ qua bước tạo database. Nếu tài khoản quản trị PostgreSQL của bạn không phải `postgres`, thay bằng tài khoản phù hợp.

### Bước 3. Tạo file môi trường

Từ thư mục gốc dự án:

```powershell
Copy-Item ".env.example" ".env"
notepad ".env"
```

Cập nhật các giá trị kết nối PostgreSQL và thông tin xác thực trong file `.env` theo môi trường máy cá nhân.

Các biến môi trường:

| Biến | Mục đích |
|---|---|
| `DB_HOST` | Địa chỉ PostgreSQL |
| `DB_PORT` | Cổng PostgreSQL |
| `DB_NAME` | Tên database |
| `DB_USER` | Tài khoản database |
| `DB_PASSWORD` | Mật khẩu database |
| `APP_PORT` | Cổng Backend |
| `SECRET_KEY` | Khóa cấu hình ứng dụng |
| `AUTH_USERNAME` | Tên đăng nhập ứng dụng |
| `AUTH_PASSWORD` | Mật khẩu đăng nhập ứng dụng |
| `AUTH_TOKEN_SECRET` | Khóa bí mật ký Bearer token |
| `VITE_API_BASE_URL` | Địa chỉ API mà Frontend gọi, mặc định `/api` |
| `API_PROXY_TARGET` | Địa chỉ Backend mà Vite proxy chuyển tiếp, mặc định `http://localhost:3000` |

Không commit file `.env`, mật khẩu, token hoặc thông tin kết nối thật lên Git.

## 5. Cài đặt và chạy Backend

Mở Terminal 1 tại thư mục gốc dự án:

```powershell
Set-Location ".\src\backend"
npm ci
```

### Chạy migration

```powershell
node .\migrate.js
```

Migration đọc các file SQL trong thư mục `migrations/` và lưu lịch sử trong bảng `schema_migrations`. Migration đã áp dụng sẽ được bỏ qua khi chạy lại.

### Nạp dữ liệu mẫu

```powershell
node .\seed.js
```

Seed sử dụng dữ liệu mẫu được định nghĩa trong `seeds/001_demo_data.sql`. Các khóa nghiệp vụ được kiểm tra để hạn chế chèn trùng khi chạy lại.

### Khởi động Backend

```powershell
npm start
```

Backend mặc định chạy tại:

```text
http://localhost:3000
```

Nếu thay đổi `APP_PORT`, sử dụng cổng đã cấu hình trong `.env`.

Giữ Terminal 1 mở trong suốt quá trình sử dụng ứng dụng.

## 6. Cài đặt và chạy Frontend

Mở Terminal 2 tại thư mục gốc dự án. Backend cần được khởi động trước Frontend.

```powershell
Set-Location ".\src\frontend"
npm ci
npm run dev
```

Vite mặc định chạy tại:

```text
http://localhost:5173/
```

Mở địa chỉ này trên trình duyệt và đăng nhập bằng tài khoản được cấu hình trong `.env`.

Frontend sử dụng API client tập trung tại `src/frontend/src/api/client.js`. Trong môi trường phát triển, Vite proxy chuyển tiếp `/api` đến địa chỉ được cấu hình bằng `API_PROXY_TARGET`.

## 7. API đã triển khai

Các endpoint nghiệp vụ yêu cầu Bearer token hợp lệ. Endpoint đăng nhập là endpoint công khai.

| Phương thức | Endpoint | Chức năng |
|---|---|---|
| POST | `/api/auth/login` | Đăng nhập |
| GET | `/api/customers` | Liệt kê khách hàng |
| GET | `/api/customers?phone={phone}` | Tra cứu khách hàng theo số điện thoại |
| GET | `/api/customers/:id` | Xem chi tiết khách hàng |
| POST | `/api/customers` | Tạo khách hàng |
| PUT | `/api/customers/:id` | Cập nhật khách hàng |
| DELETE | `/api/customers/:id` | Xử lý xóa khách hàng theo quy tắc nghiệp vụ |
| GET | `/api/tickets` | Liệt kê phiếu bảo hành |
| GET | `/api/tickets/:id` | Xem chi tiết phiếu bảo hành |
| POST | `/api/tickets` | Tạo phiếu bảo hành |
| PUT | `/api/tickets/:id` | Cập nhật phiếu bảo hành |
| DELETE | `/api/tickets/:id` | Hủy phiếu theo điều kiện nghiệp vụ |
| GET | `/api/lookups/issue-categories` | Lấy danh mục nhóm sự cố đang hoạt động |
| GET | `/api/lookups/service-centers` | Lấy danh sách trung tâm đang hoạt động |

Các endpoint khách hàng, phiếu bảo hành và lookup đều được bảo vệ bởi middleware xác thực.

## 8. Quy tắc nghiệp vụ chính

- Số điện thoại khách hàng được chuẩn hóa và kiểm tra tính duy nhất.
- Thiết bị phải thuộc về khách hàng được chọn.
- Thiết bị không được tạo phiếu mới khi đã có phiếu chưa đóng ở các trạng thái `MOI`, `DANG_XU_LY`, `CHO_LINH_KIEN` hoặc `DA_SUA`.
- Mô tả sự cố phải có từ 10 đến 2.000 ký tự.
- Mức ưu tiên chỉ nhận `CAO`, `TRUNG_BINH` hoặc `THAP`.
- Nhóm sự cố và trung tâm bảo hành phải tồn tại và đang hoạt động.
- Thiết bị đã hết hạn bảo hành cần có phê duyệt trước khi tiếp tục.
- Hủy phiếu được ghi nhận theo quy tắc trạng thái, không xóa vật lý lịch sử phiếu.
- Hạn cam kết được tính theo mức ưu tiên: Cao 24 giờ làm việc, Trung bình 72 giờ làm việc, Thấp 120 giờ làm việc. Thời gian được tính theo từng ngày làm việc, từ thứ Hai đến thứ Bảy; Chủ nhật được bỏ qua.

## 9. Kiểm thử và Build

### Chạy Backend unit tests

Mở terminal tại thư mục `src/backend`:

```powershell
npm test
```

Bộ kiểm thử sử dụng `node:test`, không yêu cầu kết nối cơ sở dữ liệu để chạy các unit test nghiệp vụ.

Các nhóm kiểm thử hiện có:

- Happy path: tạo phiếu với dữ liệu hợp lệ.
- Boundary: mô tả đúng giới hạn 10 ký tự.
- Invalid data: mô tả ngắn hơn giới hạn.
- Not found: thiết bị không tồn tại.
- Validation: thiết bị không thuộc khách hàng.
- Conflict: thiết bị đã có phiếu đang xử lý.
- Warranty: thiết bị hết hạn bảo hành.
- Due date: ba mức ưu tiên và quy tắc bỏ qua Chủ nhật.
- Due date: tiếp nhận vào Chủ nhật.
- Due date: mức ưu tiên không hợp lệ.

Kết quả kiểm thử đã xác nhận trong quá trình triển khai: **10 tests, 10 PASS, 0 FAIL**.

### Build Frontend

Mở terminal tại thư mục `src/frontend`:

```powershell
npm run build
```

### Kiểm tra ESLint

```powershell
npm run lint
```

## 10. Trạng thái triển khai BT2

### Đã triển khai và kiểm tra

- Backend phân lớp Routes, Services và Repositories.
- Database migration và seed dữ liệu mẫu.
- Nghiệp vụ tạo phiếu, kiểm tra dữ liệu đầu vào và chống tạo phiếu trùng trên thiết bị.
- Xác thực đăng nhập và Bearer token.
- Frontend React kết nối API thực tế.
- API tra cứu nhóm sự cố và trung tâm bảo hành.
- Ba trạng thái giao diện loading, empty và error; có chức năng retry.
- Xử lý HTTP 401: xóa thông tin phiên và quay lại màn hình đăng nhập.
- Tính hạn cam kết theo mức ưu tiên, bỏ qua Chủ nhật.
- 10 unit tests PASS.
- Frontend production build thành công.

### Các hạng mục cần tiếp tục hoàn thiện trước khi nộp

- Rà soát README trên môi trường clone mới.
- Hoàn thiện sơ đồ kiến trúc thực tế.
- Bổ sung Bug Log và khai báo sử dụng AI.
- Rà soát responsive, lint, bảo mật và các trường hợp nghiệp vụ còn lại.
- Hoàn thiện ảnh minh chứng, tài liệu PDF và quy trình Git/tag `v0.2`.

## 11. Tài liệu liên quan

- `docs/srs.md`: đặc tả yêu cầu phần mềm.
- `docs/api-contract.md`: hợp đồng API.
- `docs/ddl.sql`: cấu trúc cơ sở dữ liệu.
- `docs/erd.drawio`: sơ đồ thực thể và quan hệ.
- `docs/architecture.drawio`: sơ đồ kiến trúc đã thiết kế.
- `docs/architecture-thuc-te.drawio`: Actual implemented architecture diagram for BT2.
- `docs/thay-doi-thiet-ke.md`: ghi nhận các thay đổi thiết kế.
- `docs/bug-log.md`: Actual bugs encountered and their fixes.
- `docs/ai-disclosure.md`: AI tool usage disclosure.
- `docs/wireframes/`: thiết kế giao diện.
- `docs/screenshots/`: ảnh minh chứng quá trình triển khai và kiểm thử.

## 12. Khai báo sử dụng công cụ AI

ChatGPT được sử dụng để hỗ trợ đọc hiểu tài liệu, phân tích yêu cầu, đề xuất và rà soát mã nguồn, hỗ trợ xử lý lỗi và chuẩn bị tài liệu.
