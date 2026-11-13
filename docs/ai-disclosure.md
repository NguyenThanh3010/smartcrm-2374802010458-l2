# KHAI BÁO SỬ DỤNG CÔNG CỤ AI

- **Dự án:** Smart CRM – Mekong Mobile
- **Luồng nghiệp vụ:** L02 – Tiếp nhận và phân loại yêu cầu bảo hành
- **Sinh viên:** Nguyễn Quốc Thành
- **MSSV:** 2374802010458
- **Track:** SE

## 1. Công cụ AI được sử dụng

| Công cụ | Mục đích sử dụng | File / chức năng có AI hỗ trợ | Cách kiểm chứng |
|---|---|---|---|
| ChatGPT (OpenAI) | Hỗ trợ phân tích yêu cầu, nghiệp vụ và cấu trúc hệ thống. | `docs/srs.md`, `docs/api-contract.md`, cấu trúc Routes, Services và Repositories. | Đối chiếu với yêu cầu học phần, mã nguồn và các API thực tế. |
| ChatGPT (OpenAI) | Hỗ trợ phân tích, đề xuất và rà soát chức năng Backend, xác thực và phân quyền. | `src/backend/src/app.js`, `src/backend/src/auth/`, `src/backend/src/routes/`, `src/backend/src/services/`, `src/backend/src/repositories/`, chức năng quản lý tài khoản và quyền sở hữu phiếu. | Kiểm tra đăng nhập, Bearer token, quyền ADMIN/STAFF và quyền sở hữu phiếu; chạy Unit Test và API Test. |
| ChatGPT (OpenAI) | Hỗ trợ phân tích lỗi và đề xuất cách khắc phục các vấn đề trong quá trình phát triển. | `TicketCreateForm.jsx`, `ticketService.js`, `ticketRepository.js`, các lỗi BUG-01 đến BUG-04. | Thực hiện lại các tình huống tái lập lỗi; kiểm tra giao diện, API và kết quả kiểm thử sau khi sửa. |
| ChatGPT (OpenAI) | Hỗ trợ giải thích và rà soát cơ chế bảo mật, mã hóa và bảo vệ dữ liệu. | `customerCrypto.js`, `bootstrapAdmin.js`, `encryptCustomerData.js`, các migration liên quan và chức năng xử lý dữ liệu khách hàng. | Kiểm tra dữ liệu trong PostgreSQL, xác nhận bcrypt, AES-256-GCM, HMAC-SHA256 và chạy Crypto Test. |
| ChatGPT (OpenAI) | Hỗ trợ xây dựng, rà soát test case, kết quả kiểm thử và tài liệu bảo mật. | `tests/ticket-service.test.js`, `tests/api-system.test.js`, `tests/customer-crypto.test.js`, `tests/customer-repository.integration.test.js`, `docs/test-plan.md`, `docs/test-report.md`, `docs/security-test.md`. | Chạy bộ kiểm thử tự động, kiểm tra kết quả PASS/FAIL và thực hiện các tình huống bảo mật thủ công. |
| ChatGPT (OpenAI) | Hỗ trợ phân tích Migration, Seed và chuẩn hóa cấu trúc, dữ liệu database. | `docs/ddl.sql`, `src/backend/migrate.js`, `src/backend/migrations/001_init.sql` đến `004_normalize_ticket_accessories.sql`, `src/backend/seeds/001_demo_data.sql`, `src/backend/seed.js`. | Kiểm tra cấu trúc PostgreSQL, dữ liệu trước và sau migration; chạy lại Migration và Seed trên database chính và database kiểm thử. |
| ChatGPT (OpenAI) | Hỗ trợ rà soát cấu hình Docker và quy trình triển khai. | `docker-compose.yml`, các Dockerfile, `.dockerignore`, `.env.example`, `docs/deployment-guide.md`. | Kiểm tra cấu hình Docker Compose, build image, kiểm tra healthcheck, đăng nhập và chạy ứng dụng thực tế. |
| ChatGPT (OpenAI) | Hỗ trợ biên soạn và rà soát tài liệu kỹ thuật, báo cáo và khai báo AI. | `docs/api-contract.md`, `docs/bug-log.md`, `docs/test-report.md`, `docs/deployment-guide.md`, `docs/ai-disclosure.md`, `README.md`, `docs/ddl.sql`, `docs/thay-doi-thiet-ke.md`, `docs/checklist-bao-mat.md` | Đối chiếu tài liệu với mã nguồn, log chạy thực tế, kết quả kiểm thử và các bằng chứng đã lưu. |

## 2. Các nội dung có AI hỗ trợ trong Giai đoạn 3

- Hỗ trợ đọc hiểu yêu cầu kiểm thử và rà soát Test Plan, Test Report.
- Hỗ trợ phân tích lỗi, xác định nguyên nhân và đề xuất cách sửa lỗi.
- Hỗ trợ rà soát chức năng xác thực, phân quyền ADMIN/STAFF và quyền sở hữu phiếu bảo hành.
- Hỗ trợ giải thích các cơ chế bcrypt, AES-256-GCM và HMAC-SHA256.
- Hỗ trợ xây dựng và rà soát tài liệu API Contract, Security Test và Bug Log.
- Hỗ trợ bổ sung Migration chuẩn hóa dữ liệu phụ kiện và điều chỉnh file Seed tương ứng.
- Hỗ trợ kiểm tra cấu hình Docker, Docker Compose và hướng dẫn triển khai.
- Hỗ trợ đối chiếu kết quả kiểm thử, ảnh minh chứng và nội dung báo cáo.

## 3. Cách tự kiểm chứng kết quả

Các nội dung do AI hỗ trợ được sinh viên xem xét, thực hiện và kiểm chứng trực tiếp trong môi trường dự án thông qua:

- Chạy ứng dụng Backend và Frontend bằng Docker Compose.
- Kiểm tra cấu hình bằng `docker compose config --quiet`.
- Build các image Backend, Frontend và Test.
- Kiểm tra trạng thái các dịch vụ PostgreSQL, Backend và Frontend.
- Kiểm tra endpoint `/health`, xác nhận HTTP 200 và database kết nối thành công.
- Kiểm thử trực tiếp chức năng đăng nhập, danh sách phiếu và chi tiết phiếu trên giao diện.
- Chạy bộ kiểm thử tự động bằng `docker compose --profile test run --rm test`, kết quả 29/29 PASS, gồm 17 Unit Test, 2 Integration Test, 5 API / System Test và 5 Crypto Test.
- Kiểm tra thủ công quyền sở hữu phiếu, HTTP Security Headers, SQL Injection, xác thực và xử lý JSON không hợp lệ.
- Kiểm thử API PUT sau khi sửa BUG-04, xác nhận HTTP 200.
- Chạy Migration và Seed nhiều lần trên database kiểm thử, xác nhận migration được nhận diện đã áp dụng và không tạo dữ liệu mẫu trùng lặp.
- Đối chiếu các tài liệu và ảnh minh chứng với kết quả thực tế.

## 4. Cam kết của sinh viên

AI được sử dụng như một công cụ hỗ trợ trong quá trình học tập, phân tích, phát triển và kiểm thử phần mềm, không thay thế trách nhiệm của sinh viên.

Các đề xuất, đoạn mã và nội dung tài liệu do AI hỗ trợ đều được sinh viên xem xét, chỉnh sửa, thực hiện và kiểm chứng trước khi sử dụng.

Sinh viên chịu trách nhiệm về tính chính xác của mã nguồn, sự phù hợp của nghiệp vụ, kết quả kiểm thử, tài liệu kỹ thuật và toàn bộ sản phẩm nộp cho học phần.