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

### 2.1. Công nghệ sử dụng

| Thành phần | Công nghệ |
|---|---|
| Ngôn ngữ | JavaScript |
| Backend runtime | Node.js 24 |
| Backend framework | Express 5 |
| Frontend | React 19 |
| Frontend tooling | Vite 8 |
| Cơ sở dữ liệu | PostgreSQL 18 |
| Kết nối cơ sở dữ liệu | node-postgres (pg) |
| Mã hóa và bảo mật | bcryptjs, AES-256-GCM, HMAC-SHA256, Helmet |
| Quản lý môi trường | dotenv |
| Kiểm thử Backend | Node.js built-in test runner (node:test) |
| Frontend web server | Nginx |
| Đóng gói và triển khai | Docker, Docker Compose |
| Quản lý thư viện | npm |

### 2.2. Môi trường đã kiểm thử

| Công cụ | Phiên bản |
|---|---|
| Node.js | 24.14.0 |
| npm | 11.9.0 |
| PostgreSQL | 18.4 (Docker image `postgres:18.4-alpine`) |
| Express | 5.2.1 |
| React | 19.3.1 |
| Vite | 8.3.4 |

### 2.3. Yêu cầu môi trường

**Khi triển khai bằng Docker Compose:**

- Cần cài Docker Desktop và Docker Compose hoặc Docker Engine kèm Docker Compose Plugin.
- Không cần cài đặt PostgreSQL, Node.js hoặc npm riêng trên máy để chạy hệ thống bằng Docker.

**Khi phát triển trực tiếp không dùng Docker:**

- Cần cài đặt Node.js và npm.
- Cần cài đặt, khởi động PostgreSQL và tạo database theo hướng dẫn tại Mục 6.
- Cần cấu hình các biến môi trường trong file `.env` phù hợp với môi trường máy cá nhân.

## 3. Cấu trúc dự án

```text
smartcrm-2374802010458-l2/
├── docs/
│   ├── diagrams/
│   ├── screenshots/
│   ├── wireframes/
│   ├── ai-disclosure.md
│   ├── api-contract.md
│   ├── api-tests.http
│   ├── architecture.drawio
│   ├── architecture-thuc-te.drawio
│   ├── bug-log.md
│   ├── checklist-bao-mat.md
│   ├── ddl.sql
│   ├── deployment-guide.md
│   ├── erd.drawio
│   ├── security-test.md
│   ├── srs.md
│   ├── test-plan.md
│   ├── test-report.md
│   └── thay-doi-thiet-ke.md
│
├── src/
│   ├── backend/
│   │   ├── migrations/
│   │   │   ├── 001_init.sql
│   │   │   ├── 002_user_accounts_and_ticket_owner.sql
│   │   │   ├── 003_encrypt_customer_data.sql
│   │   │   └── 004_normalize_ticket_accessories.sql
│   │   ├── seeds/
│   │   │   └── 001_demo_data.sql
│   │   ├── src/
│   │   │   ├── auth/
│   │   │   │   ├── adminMiddleware.js
│   │   │   │   ├── authMiddleware.js
│   │   │   │   └── authService.js
│   │   │   ├── errors/
│   │   │   │   └── errorHandler.js
│   │   │   ├── repositories/
│   │   │   │   ├── customerRepository.js
│   │   │   │   ├── lookupRepository.js
│   │   │   │   ├── ticketRepository.js
│   │   │   │   └── userRepository.js
│   │   │   ├── routes/
│   │   │   │   ├── authRoutes.js
│   │   │   │   ├── customerRoutes.js
│   │   │   │   ├── lookupRoutes.js
│   │   │   │   ├── ticketRoutes.js
│   │   │   │   └── userRoutes.js
│   │   │   ├── security/
│   │   │   │   └── customerCrypto.js
│   │   │   ├── services/
│   │   │   │   ├── customerService.js
│   │   │   │   ├── lookupService.js
│   │   │   │   ├── ticketService.js
│   │   │   │   └── userService.js
│   │   │   ├── app.js
│   │   │   └── db.js
│   │   ├── bootstrapAdmin.js
│   │   ├── Dockerfile
│   │   ├── Dockerfile.test
│   │   ├── encryptCustomerData.js
│   │   ├── index.js
│   │   ├── migrate.js
│   │   ├── seed.js
│   │   ├── package.json
│   │   └── package-lock.json
│   │
│   └── frontend/
│       ├── src/
│       │   ├── api/
│       │   │   ├── client.js
│       │   │   ├── customers.api.js
│       │   │   ├── lookups.api.js
│       │   │   └── tickets.api.js
│       │   ├── components/
│       │   │   ├── DataState.jsx
│       │   │   ├── Login.jsx
│       │   │   └── TicketCreateForm.jsx
│       │   ├── App.css
│       │   ├── App.jsx
│       │   ├── index.css
│       │   └── main.jsx
│       ├── Dockerfile
│       ├── eslint.config.js
│       ├── index.html
│       ├── nginx.conf
│       ├── package.json
│       ├── package-lock.json
│       ├── README.md
│       └── vite.config.js
│
├── tests/
│   ├── api-system.test.js
│   ├── customer-crypto.test.js
│   ├── customer-repository.integration.test.js
│   └── ticket-service.test.js
│
├── .dockerignore
├── .env.example
├── .gitignore
├── docker-compose.yml
└── README.md
```

Các thành phần chính:

- `docs/`: Tài liệu yêu cầu, thiết kế, API, kiểm thử, bảo mật và triển khai.
- `src/backend/`: Mã nguồn Backend, migration, seed dữ liệu và các script khởi tạo.
- `src/frontend/`: Giao diện React, API client và các thành phần giao diện.
- `tests/`: Bộ kiểm thử tự động gồm Unit, Integration, API / System và Crypto Test.
- `docker-compose.yml`: Cấu hình các dịch vụ PostgreSQL, Backend, Frontend và môi trường kiểm thử Docker.
- `.env.example`: File mẫu cấu hình biến môi trường.
- `.dockerignore` và `.gitignore`: Quy định các file và thư mục không đưa vào Docker build context hoặc không theo dõi bằng Git.

## 4. Cài đặt và cấu hình

### 4.1. Clone mã nguồn

```powershell
git clone https://github.com/NguyenThanh3010/smartcrm-2374802010458-l2.git
Set-Location ".\smartcrm-2374802010458-l2"
```

### 4.2. Tạo file môi trường

Tại thư mục gốc dự án, tạo file `.env` từ file mẫu:

```powershell
Copy-Item ".env.example" ".env"
notepad ".env"
```

Cập nhật các giá trị cấu hình phù hợp với môi trường triển khai.

| Biến | Mục đích |
|---|---|
| `DB_HOST` | Địa chỉ PostgreSQL khi chạy Backend trực tiếp trên máy |
| `DB_PORT` | Cổng PostgreSQL |
| `DB_NAME` | Tên cơ sở dữ liệu |
| `DB_USER` | Tài khoản PostgreSQL |
| `DB_PASSWORD` | Mật khẩu PostgreSQL |
| `APP_PORT` | Cổng chạy Backend khi phát triển trực tiếp |
| `AUTH_USERNAME` | Tên đăng nhập ADMIN ban đầu |
| `AUTH_PASSWORD` | Mật khẩu ADMIN ban đầu |
| `AUTH_TOKEN_SECRET` | Khóa bí mật ký Bearer token, tối thiểu 32 byte |
| `DATA_ENCRYPTION_KEY` | Khóa mã hóa dữ liệu khách hàng bằng AES-256-GCM |
| `PHONE_LOOKUP_KEY` | Khóa HMAC-SHA256 phục vụ tra cứu số điện thoại |
| `VITE_API_BASE_URL` | Địa chỉ API mà Frontend sử dụng |
| `API_PROXY_TARGET` | Địa chỉ Backend mà Vite proxy chuyển tiếp trong môi trường phát triển |

**Lưu ý bảo mật:**

- Không commit file `.env` lên Git.
- Các khóa trong `.env.example` chỉ phục vụ môi trường demo. Cần thay bằng giá trị riêng trước khi triển khai thực tế.
- `DATA_ENCRYPTION_KEY` và `PHONE_LOOKUP_KEY` phải giải mã Base64 thành khóa 32 byte.
- Giữ nguyên các khóa mã hóa sau khi đã sử dụng để mã hóa dữ liệu. Thay đổi khóa mà không có quy trình chuyển đổi phù hợp có thể khiến dữ liệu cũ không thể giải mã.
- Khi chạy bằng Docker Compose, `DB_HOST`, `DB_PORT` và `APP_PORT` trong cấu hình Backend được Compose thiết lập riêng cho các container.

## 5. Triển khai bằng Docker Compose

### 5.1. Yêu cầu môi trường

- Docker Desktop và Docker Compose, hoặc Docker Engine kèm Docker Compose Plugin.
- Kết nối Internet trong lần đầu tải image và build các dịch vụ.

### 5.2. Kiểm tra cấu hình

Tại thư mục gốc dự án, chạy:

```bash
docker compose config --quiet
```

Nếu lệnh không báo lỗi, cấu hình Docker Compose hợp lệ.

### 5.3. Build và khởi động hệ thống

```bash
docker compose up -d --build
```

Docker Compose tự động:

1. Khởi tạo PostgreSQL và database theo cấu hình trong `.env`.
2. Chờ PostgreSQL đạt trạng thái healthy.
3. Build và khởi động Backend.
4. Backend thực hiện migration, khởi tạo tài khoản ADMIN, mã hóa dữ liệu khách hàng và nạp dữ liệu mẫu.
5. Build và khởi động Frontend sau khi Backend đạt trạng thái healthy.

### 5.4. Kiểm tra trạng thái dịch vụ

```bash
docker compose ps
```

Các dịch vụ chính cần đạt trạng thái `healthy`:

- `postgres`: Cơ sở dữ liệu PostgreSQL.
- `backend`: Backend API.
- `frontend`: Giao diện người dùng.

### 5.5. Truy cập ứng dụng

Mở trình duyệt tại:

```text
http://localhost:8080
```

Đăng nhập bằng tài khoản và mật khẩu ADMIN đã cấu hình trong `.env`.

### 5.6. Dừng hệ thống

```bash
docker compose down
```

Lệnh này dừng và xóa các container nhưng giữ lại dữ liệu trong Docker volumes.

**Không sử dụng `docker compose down -v` nếu muốn giữ dữ liệu cơ sở dữ liệu.**

## 6. Chạy dự án ở chế độ phát triển trực tiếp (không dùng Docker)

Phần này dành cho trường hợp muốn chạy Backend và Frontend trực tiếp trên máy để phát triển mã nguồn.

### 6.1. Chuẩn bị PostgreSQL

Cài đặt và khởi động PostgreSQL trên máy. Tạo database `smartcrm` nếu chưa tồn tại:

```powershell
psql -U postgres -h localhost -p 5432 -c "CREATE DATABASE smartcrm;"
```

Cập nhật `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER` và `DB_PASSWORD` trong file `.env` cho phù hợp với PostgreSQL trên máy.

### 6.2. Cài đặt và khởi động Backend

Mở Terminal 1 tại thư mục gốc dự án:

```powershell
Set-Location ".\src\backend"
npm ci
```

Khởi tạo cấu trúc cơ sở dữ liệu:

```powershell
node .\migrate.js
```

Khởi tạo tài khoản ADMIN:

```powershell
node .\bootstrapAdmin.js
```

Mã hóa dữ liệu khách hàng:

```powershell
node .\encryptCustomerData.js
```

Nạp dữ liệu mẫu:

```powershell
node .\seed.js
```

Khởi động Backend:

```powershell
npm start
```

Backend mặc định chạy tại:

```text
http://localhost:3000
```

Giữ Terminal 1 mở trong suốt quá trình sử dụng ứng dụng.

### 6.3. Cài đặt và khởi động Frontend

Mở Terminal 2 tại thư mục gốc dự án:

```powershell
Set-Location ".\src\frontend"
npm ci
npm run dev
```

Vite mặc định chạy tại:

```text
http://localhost:5173/
```

Mở địa chỉ trên trình duyệt để sử dụng ứng dụng.

Trong chế độ phát triển, Vite proxy chuyển tiếp các yêu cầu `/api` đến Backend theo cấu hình `API_PROXY_TARGET`.

## 7. API đã triển khai

Hệ thống triển khai 16 API route/method, bao gồm các nhóm API thông tin hệ thống, xác thực, quản lý người dùng, khách hàng, phiếu bảo hành và danh mục tra cứu.

### 7.1. Danh sách API

| Phương thức | Endpoint | Quyền truy cập | Chức năng |
|---|---|---|---|
| GET | `/` | Công khai | Lấy thông tin cơ bản của API |
| GET | `/health` | Công khai | Kiểm tra trạng thái Backend và kết nối PostgreSQL |
| POST | `/api/auth/login` | Công khai | Đăng nhập và cấp Bearer token |
| POST | `/api/users` | ADMIN | Tạo tài khoản nhân viên STAFF |
| GET | `/api/customers` | Bearer token | Liệt kê khách hàng; hỗ trợ tìm kiếm bằng query `phone` |
| GET | `/api/customers/:id` | Bearer token | Xem chi tiết khách hàng |
| POST | `/api/customers` | Bearer token | Tạo khách hàng |
| PUT | `/api/customers/:id` | Bearer token | Cập nhật khách hàng |
| DELETE | `/api/customers/:id` | Bearer token | Xử lý xóa khách hàng theo quy tắc nghiệp vụ |
| GET | `/api/tickets` | Bearer token | Liệt kê phiếu bảo hành theo quyền truy cập |
| GET | `/api/tickets/:id` | Bearer token | Xem chi tiết phiếu bảo hành |
| POST | `/api/tickets` | Bearer token | Tạo phiếu bảo hành |
| PUT | `/api/tickets/:id` | Bearer token | Cập nhật phiếu bảo hành |
| DELETE | `/api/tickets/:id` | Bearer token | Hủy phiếu theo điều kiện nghiệp vụ |
| GET | `/api/lookups/issue-categories` | Bearer token | Lấy danh mục nhóm sự cố đang hoạt động |
| GET | `/api/lookups/service-centers` | Bearer token | Lấy danh sách trung tâm bảo hành đang hoạt động |

### 7.2. Xác thực và phân quyền

- Endpoint đăng nhập `POST /api/auth/login` không yêu cầu token.
- Endpoint `GET /` và `GET /health` được phép truy cập công khai.
- Các API nghiệp vụ yêu cầu Bearer token hợp lệ trong header `Authorization`.
- Token được ký bằng HMAC-SHA256 và có thời hạn 8 giờ.
- Hệ thống có hai vai trò ADMIN và STAFF.
- ADMIN có quyền tạo tài khoản STAFF và quản lý phiếu bảo hành trên toàn hệ thống.
- STAFF chỉ được xem, cập nhật và hủy phiếu bảo hành do chính mình tạo.
- Các yêu cầu truy cập phiếu không thuộc quyền sở hữu của STAFF bị từ chối.

Chi tiết phương thức, request/response, mã lỗi và quy tắc truy cập được mô tả tại `docs/api-contract.md`.

## 8. Quy tắc nghiệp vụ chính

- Số điện thoại khách hàng được chuẩn hóa và kiểm tra tính duy nhất.
- Thiết bị phải thuộc về khách hàng được chọn.
- Thiết bị không được tạo phiếu mới khi đã có phiếu chưa đóng ở các trạng thái `MOI`, `DANG_XU_LY`, `CHO_LINH_KIEN` hoặc `DA_SUA`.
- Mô tả sự cố phải có từ 10 đến 2.000 ký tự.
- Mức ưu tiên chỉ nhận `CAO`, `TRUNG_BINH` hoặc `THAP`.
- Nhóm sự cố và trung tâm bảo hành phải tồn tại và đang hoạt động.
- Thiết bị đã hết hạn bảo hành cần có phê duyệt trước khi tiếp tục.
- Hủy phiếu được ghi nhận theo quy tắc trạng thái, không xóa vật lý lịch sử phiếu.
- Hạn cam kết được tính theo mức ưu tiên: Cao 1 ngày làm việc, Trung bình 3 ngày làm việc, Thấp 5 ngày làm việc. Thời gian được tính theo ngày làm việc từ thứ Hai đến thứ Bảy; Chủ nhật được bỏ qua.

## 9. Kiểm thử và Build

### 9.1. Chạy bộ kiểm thử tự động bằng Docker Compose

Dự án sử dụng một database kiểm thử riêng (`test-db`) để chạy Integration Test và API / System Test, tránh ảnh hưởng đến database chính.

Tại thư mục gốc dự án, chạy:

```bash
docker compose --profile test build test
docker compose --profile test run --rm test
```

Lệnh đầu tiên xây dựng image kiểm thử. Lệnh thứ hai khởi chạy môi trường kiểm thử, thực hiện migration, khởi tạo tài khoản ADMIN, chuẩn hóa dữ liệu, nạp dữ liệu mẫu và chạy toàn bộ test.

Kết quả kiểm thử:

| Nhóm kiểm thử | Số lượng | Kết quả |
|---|---:|---|
| Unit Test | 17 | 17 PASS |
| Integration Test | 2 | 2 PASS |
| API / System Test | 5 | 5 PASS |
| Crypto Test | 5 | 5 PASS |
| **Tổng cộng** | **29** | **29 PASS, 0 FAIL** |

### 9.2. Kiểm tra dependency

Backend:

```powershell
cd .\src\backend
npm ci
npm audit
```

Frontend:

```powershell
cd ..\frontend
npm ci
npm audit
```

Kết quả kiểm tra tại thời điểm 13/11/2026:

- Backend: `found 0 vulnerabilities`.
- Frontend: `found 0 vulnerabilities`.

### 9.3. Build và kiểm tra chất lượng Frontend

Tại thư mục `src/frontend`:

```powershell
npm run lint
npm run build
```

- `npm run lint`: Kiểm tra mã nguồn bằng ESLint.
- `npm run build`: Tạo bản build production của ứng dụng React.

Kết quả: Frontend ESLint và production build đã thực hiện thành công.

### 9.4. Kiểm tra bảo mật

Dự án đã thực hiện các kiểm tra bảo mật theo những nội dung liên quan đến OWASP Top 10:

| Nhóm | Nội dung kiểm tra | Kết quả |
|---|---|---|
| A01 – Broken Access Control | Kiểm tra quyền ADMIN, STAFF và quyền sở hữu phiếu bảo hành | Đạt trong phạm vi kiểm thử |
| A02 – Security Misconfiguration | Kiểm tra HTTP Security Headers | Đạt |
| A04 – Cryptographic Failures | Kiểm tra bcrypt, AES-256-GCM và HMAC-SHA256 | Đạt trong phạm vi kiểm thử |
| A05 – Injection | Kiểm tra dữ liệu đầu vào và trường hợp SQL Injection | Đạt trong phạm vi kiểm thử |
| A07 – Authentication Failures | Kiểm tra đăng nhập, token thiếu, token không hợp lệ | Đạt |

Ngoài ra, dự án đã kiểm tra phản hồi khi gửi JSON sai cú pháp. API trả về `400 INVALID_JSON` mà không để lộ stack trace.

Các kết quả và giới hạn kiểm thử được ghi tại:

- `docs/security-test.md`: Báo cáo kiểm tra bảo mật.
- `docs/checklist-bao-mat.md`: Danh sách tự đánh giá bảo mật.
- `docs/screenshots/`: Ảnh minh chứng kiểm thử.

Các kiểm tra trên không thay thế một đợt kiểm thử xâm nhập hoặc đánh giá bảo mật chuyên sâu.

## 10. Trạng thái triển khai BT3

### 10.1. Các chức năng đã triển khai

- Backend Express kết nối PostgreSQL, tổ chức theo các lớp Routes, Services và Repositories.
- Frontend React kết nối Backend API.
- Xác thực đăng nhập bằng Bearer token có thời hạn 8 giờ.
- Hỗ trợ vai trò ADMIN và STAFF; kiểm soát quyền truy cập phiếu bảo hành theo người tạo.
- ADMIN có thể tạo tài khoản STAFF.
- Quản lý thông tin khách hàng, tra cứu khách hàng theo số điện thoại.
- Mã hóa thông tin khách hàng bằng AES-256-GCM và sử dụng HMAC-SHA256 để tra cứu số điện thoại.
- Băm mật khẩu bằng bcrypt.
- Tiếp nhận, phân loại, tạo, xem, cập nhật và hủy phiếu bảo hành theo quy tắc nghiệp vụ.
- Kiểm tra dữ liệu đầu vào, xử lý lỗi và thiết lập HTTP Security Headers.
- Tự động tính hạn cam kết theo mức ưu tiên và quy tắc ngày làm việc.
- Migration và Seed dữ liệu có thể chạy lại mà không áp dụng trùng migration hoặc tạo trùng dữ liệu mẫu.
- Đóng gói Backend, Frontend, PostgreSQL và môi trường kiểm thử bằng Docker Compose.

### 10.2. Kết quả kiểm thử

- Unit Test: 17/17 PASS.
- Integration Test: 2/2 PASS.
- API / System Test: 5/5 PASS.
- Crypto Test: 5/5 PASS.
- Tổng cộng: **29/29 automated tests PASS, 0 FAIL**.
- Migration và Seed đã được chạy lặp lại; các migration đã áp dụng được bỏ qua và dữ liệu mẫu không bị chèn trùng.
- Docker Compose configuration đã được kiểm tra hợp lệ.
- Các container PostgreSQL, Backend và Frontend đạt trạng thái healthy.
- Frontend đã được kiểm tra bằng trình duyệt: đăng nhập, danh sách phiếu và trang chi tiết phiếu hoạt động.
- Backend và Frontend đều có kết quả `npm audit`: 0 vulnerabilities.

### 10.3. Công việc kiểm chứng bổ sung

- Kiểm tra clone repository vào một thư mục mới, cấu hình `.env` và chạy Docker Compose để xác nhận khả năng triển khai từ mã nguồn sạch.

## 11. Tài liệu liên quan

| Tài liệu | Nội dung |
|---|---|
| `docs/srs.md` | Đặc tả yêu cầu phần mềm. |
| `docs/api-contract.md` | Hợp đồng API, mô tả endpoint, quyền truy cập và cấu trúc phản hồi. |
| `docs/api-tests.http` | Các request mẫu phục vụ kiểm tra API. |
| `docs/ddl.sql` | Câu lệnh định nghĩa cấu trúc cơ sở dữ liệu. |
| `docs/erd.drawio` | Sơ đồ ERD thiết kế ban đầu; cấu trúc database hiện tại được mô tả trong `docs/ddl.sql` và các migration. |
| `docs/architecture.drawio` | Sơ đồ kiến trúc hệ thống đã thiết kế. |
| `docs/architecture-thuc-te.drawio` | Sơ đồ kiến trúc thực tế đã triển khai. |
| `docs/thay-doi-thiet-ke.md` | Ghi nhận các thay đổi thiết kế trong quá trình triển khai. |
| `docs/bug-log.md` | Danh sách lỗi, nguyên nhân, cách khắc phục và kết quả xác nhận. |
| `docs/test-plan.md` | Kế hoạch kiểm thử. |
| `docs/test-report.md` | Báo cáo kết quả kiểm thử. |
| `docs/security-test.md` | Báo cáo kiểm tra bảo mật và các minh chứng. |
| `docs/checklist-bao-mat.md` | Danh sách tự đánh giá bảo mật gồm 7 mục. |
| `docs/deployment-guide.md` | Hướng dẫn triển khai hệ thống bằng tiếng Anh. |
| `docs/ai-disclosure.md` | Khai báo việc sử dụng công cụ AI và phạm vi hỗ trợ. |
| `docs/diagrams/` | Các sơ đồ bổ sung của dự án. |
| `docs/wireframes/` | Các bản phác thảo giao diện. |
| `docs/screenshots/` | Ảnh minh chứng quá trình triển khai và kiểm thử. |

Mã nguồn kiểm thử tự động được lưu tại thư mục `tests/`, gồm:

- `ticket-service.test.js`: Kiểm thử logic nghiệp vụ phiếu bảo hành.
- `customer-repository.integration.test.js`: Kiểm thử tương tác giữa Repository và PostgreSQL.
- `api-system.test.js`: Kiểm thử API và các chức năng hệ thống.
- `customer-crypto.test.js`: Kiểm thử mã hóa, giải mã và HMAC dữ liệu khách hàng.

## 12. Khai báo sử dụng công cụ AI

ChatGPT được sử dụng như công cụ hỗ trợ trong quá trình phát triển dự án, bao gồm đọc hiểu tài liệu, phân tích yêu cầu, tham khảo giải pháp kỹ thuật, rà soát và hỗ trợ xử lý lỗi trong mã nguồn, xây dựng kiểm thử và chuẩn bị tài liệu.

Việc sử dụng công cụ AI được khai báo chi tiết tại `docs/ai-disclosure.md`, bao gồm mục đích sử dụng, file hoặc chức năng có liên quan và cách kiểm tra kết quả.

Sinh viên chịu trách nhiệm rà soát mã nguồn, thực hiện kiểm thử, xác nhận kết quả và chịu trách nhiệm về sản phẩm cuối cùng.