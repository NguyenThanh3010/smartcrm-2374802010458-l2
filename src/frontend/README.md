# Smart CRM - Frontend

Frontend của hệ thống Smart CRM – Mekong Mobile, sử dụng React và Vite.

## Công nghệ
- React 19
- Vite 8
- ESLint

## Cài đặt và chạy
Mở Terminal tại thư mục `src/frontend` và chạy:
- `npm ci`
- `npm run dev`

## Kiểm tra mã nguồn
- `npm run lint`
- `npm run build`

## Cấu hình API
Frontend sử dụng API client tại `src/api/client.js`.

- `VITE_API_BASE_URL`: địa chỉ cơ sở của API.
- `API_PROXY_TARGET`: địa chỉ Backend mà Vite proxy chuyển tiếp yêu cầu `/api`.

Các biến môi trường được khai báo tại file `.env` ở thư mục gốc repository. Xem README chính ở thư mục gốc để biết hướng dẫn cấu hình và khởi chạy toàn bộ hệ thống.