# SECURITY CHECKLIST – SMART CRM

**Dự án:** Smart CRM – L02
**Thời điểm kiểm tra:** 13/11/2026

| STT | Nội dung kiểm tra | Trạng thái | Minh chứng |
|---:|---|---|---|
| 1 | Kiểm tra secret, mật khẩu và token trong repository và lịch sử Git. | DONE | .gitignore, .dockerignore; xác nhận `.env` không được Git theo dõi và không xuất hiện trong lịch sử Git. Đã quét một số định dạng token và khóa bí mật phổ biến, không phát hiện giá trị phù hợp. `.env.example` có chứa thông tin đăng nhập và khóa mẫu phục vụ demo, cần thay thế trước khi triển khai thực tế. |
| 2 | Kiểm tra và xác thực dữ liệu đầu vào tại Backend, hạn chế SQL Injection. | DONE | `customerService.js` kiểm tra họ tên, số điện thoại, địa chỉ và phân trang. Các repository sử dụng truy vấn tham số hóa. Kiểm thử A05 trả HTTP 422 với dữ liệu SQL Injection. |
| 3 | Kiểm soát quyền truy cập API tạo tài khoản và quyền sở hữu phiếu bảo hành theo vai trò ADMIN/STAFF. | DONE | `ticketRepository.js`, `adminMiddleware.js`, `tests/api-system.test.js`. Kiểm thử xác nhận STAFF chỉ thao tác trên phiếu do mình tạo, ADMIN xem được phiếu của nhân viên khác và STAFF không được tạo tài khoản nhân viên. |
| 4 | Bảo vệ mật khẩu và dữ liệu nhạy cảm bằng cơ chế băm hoặc mã hóa. | DONE | `authService.js`, `userService.js`, `customerCrypto.js`. Sử dụng bcrypt, AES-256-GCM và HMAC-SHA256. Kiểm thử A04 và 5/5 bài kiểm thử crypto đạt. |
| 5 | Xử lý lỗi an toàn, không để lộ stack trace, câu truy vấn SQL hoặc thông tin kết nối. | DONE | `src/backend/src/errors/errorHandler.js`: kiểm tra mã nguồn xử lý lỗi 500 bằng thông báo chung, không trả stack trace hoặc nội dung lỗi nội bộ. Kiểm thử JSON sai cú pháp trả HTTP 400, mã lỗi INVALID_JSON. Phạm vi kiểm tra chưa thay thế kiểm thử bảo mật chuyên sâu. |
| 6 | Kiểm tra nhật ký hệ thống, không ghi mật khẩu, token, khóa mã hóa hoặc dữ liệu cá nhân không cần thiết. | DONE | Đã kiểm tra các vị trí ghi log trong `bootstrapAdmin.js`, `encryptCustomerData.js`, `index.js`, `migrate.js`, `seed.js` và `errorHandler.js`. Không phát hiện dữ liệu nhạy cảm trong nội dung log đã kiểm tra. |
| 7 | Kiểm tra dependency và các cảnh báo lỗ hổng bảo mật cơ bản. | DONE | Backend và Frontend đều có `package-lock.json` được Git theo dõi. Chạy `npm audit` ở cả hai thư mục đều trả về `found 0 vulnerabilities`. |

## Kết luận

Đã hoàn thành 7/7 mục kiểm tra bảo mật trong phạm vi kiểm thử của dự án Smart CRM.

**Lưu ý:** Kết quả này không thay thế kiểm thử xâm nhập (Penetration Testing) hoặc đánh giá bảo mật chuyên sâu. Các khóa mẫu trong `.env.example` chỉ phục vụ môi trường demo và cần được thay thế trước khi triển khai thực tế.