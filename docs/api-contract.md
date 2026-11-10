# API Contract - L02: Tiếp nhận và phân loại yêu cầu bảo hành

## 1. Thông tin chung

- **API:** Smart CRM API - Mekong Mobile.
- **Phạm vi:** L02 - Tiếp nhận và phân loại yêu cầu bảo hành.
- **Định dạng dữ liệu:** JSON, mã hóa UTF-8.
- **Kiểu tên trường:** `snake_case`.
- **Thời gian:** Giá trị thời gian do API trả về sử dụng định dạng ISO 8601. Các timestamp từ PostgreSQL được JSON hóa theo UTC (`Z`).
- **Giới hạn JSON body:** 100 KB (`express.json({ limit: '100kb' })`).
- **Base path:** Các đường dẫn dưới đây được tính từ địa chỉ máy chủ backend.

### 1.1. Header

Với request có JSON body, gửi:

```http
Content-Type: application/json
```

Các API được bảo vệ cần gửi thêm:

```http
Authorization: Bearer <token>
```

### 1.2. Xác thực và quyền truy cập

- `GET /` và `POST /api/auth/login` là endpoint công khai.
- Các endpoint thuộc `/api/customers`, `/api/tickets` và `/api/lookups` yêu cầu Bearer token hợp lệ.
- Token được cấp khi đăng nhập và có thời hạn **8 giờ**.
- Backend hiện kiểm tra trạng thái đăng nhập, chưa triển khai phân quyền theo vai trò hoặc quyền chi tiết cho từng nhóm người dùng. Vì vậy, mọi tài khoản có token hợp lệ đều đi qua cùng middleware xác thực.
- Nếu chưa cấu hình `AUTH_USERNAME`, `AUTH_PASSWORD` hoặc `AUTH_TOKEN_SECRET`, API xác thực trả về `503 AUTH_NOT_CONFIGURED`.

### 1.3. Cấu trúc lỗi chung

Các lỗi do ứng dụng xử lý có dạng:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Mô tả lỗi",
    "fields": {
      "field_name": "Thông tin lỗi của trường"
    }
  }
}
```

`fields` chỉ xuất hiện khi lỗi có thông tin lỗi theo từng trường; không phải mọi response lỗi đều có thuộc tính này.

Một số lỗi xác thực và lỗi route không tìm thấy chỉ có `code` và `message`; `fields` không bắt buộc xuất hiện trong mọi response lỗi. Ngoài các mã lỗi cụ thể được liệt kê ở từng endpoint, lỗi nội bộ không dự kiến có thể trả `500 INTERNAL_SERVER_ERROR` và không tiết lộ chi tiết kỹ thuật cho client.

## 2. Danh sách endpoint

| Phương thức | Đường dẫn | Xác thực | Mục đích |
|---|---|---|---|
| GET | `/` | Không | Kiểm tra trạng thái và thông tin API |
| POST | `/api/auth/login` | Không | Đăng nhập và cấp Bearer token |
| GET | `/api/customers` | Có | Lấy danh sách khách hàng hoặc tra cứu theo số điện thoại |
| GET | `/api/customers/:id` | Có | Xem chi tiết khách hàng |
| POST | `/api/customers` | Có | Tạo khách hàng |
| PUT | `/api/customers/:id` | Có | Cập nhật thông tin khách hàng |
| DELETE | `/api/customers/:id` | Có | Xóa khách hàng |
| GET | `/api/lookups/issue-categories` | Có | Lấy danh mục nhóm sự cố đang hoạt động |
| GET | `/api/lookups/service-centers` | Có | Lấy trung tâm bảo hành đang hoạt động |
| GET | `/api/tickets` | Có | Lấy danh sách phiếu bảo hành |
| GET | `/api/tickets/:id` | Có | Xem chi tiết phiếu bảo hành |
| POST | `/api/tickets` | Có | Tiếp nhận và tạo phiếu bảo hành |
| PUT | `/api/tickets/:id` | Có | Cập nhật thông tin phiếu bảo hành |
| DELETE | `/api/tickets/:id` | Có | Hủy phiếu bảo hành |

> Backend hiện không có endpoint `GET /api/customers/:id/devices`. Việc truy vấn thiết bị của khách hàng hiện được thực hiện ở tầng repository/service nội bộ; client không thể gọi trực tiếp endpoint này.

## 3. Chi tiết endpoint

### 3.1. GET `/`

1. **Phương thức và đường dẫn:** `GET /`
2. **Mô tả nghiệp vụ:** Kiểm tra API có phản hồi và lấy tên hệ thống, module đang triển khai.
3. **Xác thực và quyền truy cập:** Công khai, không cần Bearer token.
4. **Tham số / Request Body:** Không có.
5. **Response thành công - `200 OK`:**

```json
{
  "name": "Smart CRM API",
  "module": "L02 - Tiếp nhận và phân loại yêu cầu bảo hành",
  "status": "OK"
}
```

6. **Mã lỗi:** Endpoint không có lỗi nghiệp vụ riêng. Lỗi nội bộ có thể trả `500 INTERNAL_SERVER_ERROR`.
7. **Giới hạn / hành vi đặc biệt:** Chỉ xác nhận API phản hồi; không kiểm tra đầy đủ tình trạng kết nối database.

### 3.2. POST `/api/auth/login`

1. **Phương thức và đường dẫn:** `POST /api/auth/login`
2. **Mô tả nghiệp vụ:** Kiểm tra thông tin đăng nhập đã cấu hình trên máy chủ và cấp token khi xác thực thành công.
3. **Xác thực và quyền truy cập:** Công khai, không cần token.
4. **Request Body:**

```json
{
  "username": "<AUTH_USERNAME đã cấu hình>",
  "password": "<AUTH_PASSWORD đã cấu hình>"
}
```

Cả `username` và `password` phải là chuỗi; username không được để trống sau khi trim, password không được để trống.

5. **Response thành công - `200 OK`:**

```json
{
  "data": {
    "token": "<token do máy chủ sinh>",
    "token_type": "Bearer",
    "expires_at": "<thời điểm hết hạn do máy chủ sinh, ISO 8601>",
    "user": {
      "username": "<username đã xác thực>"
    }
  }
}
```

Các giá trị trong dấu `<...>` là chỗ giữ chỗ mô tả dữ liệu động, không phải giá trị token có thể sử dụng.

6. **Mã lỗi:**

| HTTP | Code | Điều kiện |
|---|---|---|
| 400 | `AUTH_VALIDATION_FAILED` | Thiếu username/password hoặc kiểu dữ liệu không phải chuỗi |
| 401 | `AUTH_INVALID_CREDENTIALS` | Username hoặc password không chính xác |
| 503 | `AUTH_NOT_CONFIGURED` | Máy chủ chưa cấu hình đủ thông tin xác thực |
| 500 | `INTERNAL_SERVER_ERROR` | Lỗi nội bộ không dự kiến |

7. **Giới hạn / hành vi đặc biệt:** Token có thời hạn 8 giờ. Backend ký token bằng HMAC-SHA256. Client phải gửi token ở header `Authorization: Bearer <token>` khi gọi API được bảo vệ.

### 3.3. GET `/api/customers`

1. **Phương thức và đường dẫn:** `GET /api/customers`
2. **Mô tả nghiệp vụ:** Lấy danh sách khách hàng hoặc tra cứu một khách hàng theo số điện thoại.
3. **Xác thực và quyền truy cập:** Bắt buộc Bearer token hợp lệ.
4. **Query Parameters:**

| Tham số | Bắt buộc | Quy tắc / mục đích |
|---|---|---|
| `phone` | Không | Nếu có mặt, tra cứu theo số điện thoại gồm 10 chữ số và bắt đầu bằng `0` |
| `limit` | Không | Số bản ghi; mặc định `50`, từ `1` đến `100` |
| `offset` | Không | Vị trí bắt đầu; mặc định `0`, số nguyên không âm |

Khi có `phone`, API thực hiện tra cứu theo số điện thoại thay vì lấy danh sách; `limit` và `offset` không được dùng trong nhánh tra cứu này.

5. **Response thành công - `200 OK`:**

Tra cứu theo số điện thoại mẫu có trong database: `GET /api/customers?phone=0901234567`

```json
{
  "data": {
    "customer_id": "1",
    "full_name": "Nguyễn Minh Anh",
    "phone": "090****567",
    "address": "Quận 1, TP. Hồ Chí Minh"
  }
}
```

Khi lấy danh sách, `data` là một mảng các đối tượng khách hàng có cùng cấu trúc:

```json
{
  "data": [
    {
      "customer_id": "1",
      "full_name": "Nguyễn Minh Anh",
      "phone": "090****567",
      "address": "Quận 1, TP. Hồ Chí Minh"
    }
  ]
}
```

6. **Mã lỗi:**

| HTTP | Code | Điều kiện |
|---|---|---|
| 400 | `INVALID_PAGINATION` | `limit` không phải số nguyên từ 1 đến 100 hoặc `offset` không phải số nguyên không âm |
| 401 | `AUTH_REQUIRED` | Thiếu Bearer token |
| 401 | `AUTH_TOKEN_INVALID` | Token sai, không hợp lệ hoặc hết hạn |
| 404 | `CUSTOMER_NOT_FOUND` | Không tìm thấy khách hàng theo số điện thoại |
| 422 | `INVALID_PHONE` | Số điện thoại không đúng định dạng |
| 503 | `AUTH_NOT_CONFIGURED` | Máy chủ chưa cấu hình xác thực |

7. **Giới hạn / hành vi đặc biệt:** Số điện thoại được che theo dạng 3 chữ số đầu + `****` + 3 chữ số cuối. Danh sách sắp xếp theo `customer_id` tăng dần. Nếu không truyền `phone`, API dùng phân trang mặc định `limit=50`, `offset=0`.

### 3.4. GET `/api/customers/:id`

1. **Phương thức và đường dẫn:** `GET /api/customers/:id`
2. **Mô tả nghiệp vụ:** Lấy thông tin chi tiết một khách hàng theo mã khách hàng.
3. **Xác thực và quyền truy cập:** Bắt buộc Bearer token hợp lệ.
4. **Path Parameter:** `id` - mã khách hàng, phải là số nguyên dương.
5. **Response thành công - `200 OK`:** Ví dụ với khách hàng mẫu có `customer_id=1`:

```json
{
  "data": {
    "customer_id": "1",
    "full_name": "Nguyễn Minh Anh",
    "phone": "090****567",
    "address": "Quận 1, TP. Hồ Chí Minh"
  }
}
```

6. **Mã lỗi:**

| HTTP | Code | Điều kiện |
|---|---|---|
| 400 | `INVALID_ID` | `id` không phải số nguyên dương |
| 401 | `AUTH_REQUIRED` / `AUTH_TOKEN_INVALID` | Thiếu token hoặc token không hợp lệ/hết hạn |
| 404 | `CUSTOMER_NOT_FOUND` | Không tìm thấy khách hàng |
| 503 | `AUTH_NOT_CONFIGURED` | Máy chủ chưa cấu hình xác thực |

7. **Giới hạn / hành vi đặc biệt:** Số điện thoại trong response được che bớt. ID được kiểm tra là số nguyên dương trước khi truy vấn.

### 3.5. POST `/api/customers`

1. **Phương thức và đường dẫn:** `POST /api/customers`
2. **Mô tả nghiệp vụ:** Tạo hồ sơ khách hàng mới.
3. **Xác thực và quyền truy cập:** Bắt buộc Bearer token hợp lệ.
4. **Request Body:**

```json
{
  "full_name": "<họ tên khách hàng mới>",
  "phone": "<số điện thoại 10 chữ số chưa tồn tại>",
  "address": "<địa chỉ khách hàng>"
}
```

Đây là mẫu cấu trúc request. Thay các giá trị trong dấu `<...>` bằng dữ liệu thật; số điện thoại phải gồm 10 chữ số, bắt đầu bằng `0` và chưa được sử dụng trong database.

| Trường | Bắt buộc | Quy tắc |
|---|---|---|
| `full_name` | Có | Chuỗi sau trim, không rỗng, tối đa 120 ký tự |
| `phone` | Có | Chuỗi gồm đúng 10 chữ số, bắt đầu bằng `0`, chưa được dùng bởi khách hàng khác |
| `address` | Không | Chuỗi tối đa 255 ký tự hoặc `null`; nếu bỏ qua thì lưu `null` |

5. **Response thành công - `201 Created`:**

```json
{
  "data": {
    "customer_id": "<ID do database sinh>",
    "full_name": "<họ tên đã gửi>",
    "phone": "<số điện thoại đã được che>",
    "address": "<địa chỉ đã gửi hoặc null>"
  }
}
```

Đây là mẫu cấu trúc response; các giá trị thực tế phụ thuộc request được gửi. `customer_id` do database sinh và số điện thoại được che trước khi trả về.

6. **Mã lỗi:**

| HTTP | Code | Điều kiện |
|---|---|---|
| 400 | `INVALID_BODY` | Body không phải đối tượng JSON |
| 401 | `AUTH_REQUIRED` / `AUTH_TOKEN_INVALID` | Thiếu token hoặc token không hợp lệ/hết hạn |
| 409 | `PHONE_EXISTS` | Số điện thoại đã tồn tại |
| 409 | `DUPLICATE_VALUE` | Database phát hiện giá trị duy nhất bị trùng |
| 422 | `INVALID_FULL_NAME` | Họ tên rỗng hoặc dài hơn 120 ký tự |
| 422 | `INVALID_PHONE` | Số điện thoại không đúng định dạng |
| 422 | `INVALID_ADDRESS` | Địa chỉ không phải chuỗi hợp lệ hoặc dài hơn 255 ký tự |
| 503 | `AUTH_NOT_CONFIGURED` | Máy chủ chưa cấu hình xác thực |

7. **Giới hạn / hành vi đặc biệt:** Không chấp nhận số điện thoại đã thuộc khách hàng khác. Họ tên và số điện thoại phải được cung cấp trong mỗi request tạo mới.

### 3.6. PUT `/api/customers/:id`

1. **Phương thức và đường dẫn:** `PUT /api/customers/:id`
2. **Mô tả nghiệp vụ:** Cập nhật thông tin khách hàng theo mã khách hàng.
3. **Xác thực và quyền truy cập:** Bắt buộc Bearer token hợp lệ.
4. **Path Parameter và Request Body:** `id` phải là số nguyên dương. Body dùng cùng quy tắc trường như `POST /api/customers`:

```json
{
  "full_name": "Nguyễn Minh Anh",
  "phone": "0901234567",
  "address": "Quận 1, TP. Hồ Chí Minh"
}
```

Đây là cập nhật toàn bộ bộ thông tin được hỗ trợ; `full_name` và `phone` vẫn bắt buộc. `address` có thể là chuỗi, `null` hoặc được bỏ qua (khi bỏ qua sẽ lưu `null`).

5. **Response thành công - `200 OK`:**

```json
{
  "data": {
    "customer_id": "1",
    "full_name": "Nguyễn Minh Anh",
    "phone": "090****567",
    "address": "Quận 1, TP. Hồ Chí Minh"
  }
}
```

6. **Mã lỗi:**

| HTTP | Code | Điều kiện |
|---|---|---|
| 400 | `INVALID_ID` | `id` không phải số nguyên dương |
| 400 | `INVALID_BODY` | Body không phải đối tượng JSON |
| 401 | `AUTH_REQUIRED` / `AUTH_TOKEN_INVALID` | Thiếu token hoặc token không hợp lệ/hết hạn |
| 404 | `CUSTOMER_NOT_FOUND` | Không tìm thấy khách hàng cần cập nhật |
| 409 | `PHONE_EXISTS` | Số điện thoại đã được khách hàng khác sử dụng |
| 409 | `DUPLICATE_VALUE` | Database phát hiện giá trị duy nhất bị trùng |
| 422 | `INVALID_FULL_NAME`, `INVALID_PHONE`, `INVALID_ADDRESS` | Một trong các trường không hợp lệ |
| 503 | `AUTH_NOT_CONFIGURED` | Máy chủ chưa cấu hình xác thực |

7. **Giới hạn / hành vi đặc biệt:** Không cho phép đổi sang số điện thoại đang thuộc một khách hàng khác. Response che bớt số điện thoại.

### 3.7. DELETE `/api/customers/:id`

1. **Phương thức và đường dẫn:** `DELETE /api/customers/:id`
2. **Mô tả nghiệp vụ:** Xóa hồ sơ khách hàng khỏi database.
3. **Xác thực và quyền truy cập:** Bắt buộc Bearer token hợp lệ.
4. **Path Parameter:** `id` - mã khách hàng, phải là số nguyên dương. Không có Request Body.
5. **Response thành công - `200 OK`:** Ví dụ cấu trúc response khi xóa được một khách hàng không còn dữ liệu liên quan:

```json
{
  "message": "Xóa khách hàng thành công.",
  "data": {
    "customer_id": "<ID khách hàng đã xóa>",
    "full_name": "<họ tên khách hàng đã xóa>",
    "phone": "<số điện thoại đã được che>",
    "address": "<địa chỉ khách hàng hoặc null>"
  }
}
```

6. **Mã lỗi:**

| HTTP | Code | Điều kiện |
|---|---|---|
| 400 | `INVALID_ID` | `id` không phải số nguyên dương |
| 401 | `AUTH_REQUIRED` / `AUTH_TOKEN_INVALID` | Thiếu token hoặc token không hợp lệ/hết hạn |
| 404 | `CUSTOMER_NOT_FOUND` | Không tìm thấy khách hàng |
| 409 | `RELATED_RECORD_EXISTS` | Không thể xóa vì còn dữ liệu liên quan |
| 503 | `AUTH_NOT_CONFIGURED` | Máy chủ chưa cấu hình xác thực |

7. **Giới hạn / hành vi đặc biệt:** Đây là thao tác xóa bản ghi thật trong database, không phải xóa mềm. Nếu còn thiết bị hoặc dữ liệu nghiệp vụ tham chiếu tới khách hàng, database có thể từ chối thao tác và API trả `409 RELATED_RECORD_EXISTS`.

### 3.8. GET `/api/lookups/issue-categories`

1. **Phương thức và đường dẫn:** `GET /api/lookups/issue-categories`
2. **Mô tả nghiệp vụ:** Lấy danh sách nhóm sự cố đang hoạt động để chọn khi lập phiếu bảo hành.
3. **Xác thực và quyền truy cập:** Bắt buộc Bearer token hợp lệ.
4. **Tham số / Request Body:** Không có.
5. **Response thành công - `200 OK`:** Dữ liệu mẫu trong database:

```json
{
  "data": [
    {
      "category_id": "1",
      "category_code": "MAN_HINH",
      "category_name": "Màn hình"
    },
    {
      "category_id": "2",
      "category_code": "PIN",
      "category_name": "Pin"
    },
    {
      "category_id": "3",
      "category_code": "SAC",
      "category_name": "Sạc"
    }
  ]
}
```

6. **Mã lỗi:** `401 AUTH_REQUIRED`, `401 AUTH_TOKEN_INVALID`, `503 AUTH_NOT_CONFIGURED` hoặc `500 INTERNAL_SERVER_ERROR`.
7. **Giới hạn / hành vi đặc biệt:** Chỉ trả về nhóm sự cố có `is_active = TRUE`, sắp xếp theo `category_id` tăng dần. Mỗi phần tử gồm `category_id`, `category_code`, `category_name`.

### 3.9. GET `/api/lookups/service-centers`

1. **Phương thức và đường dẫn:** `GET /api/lookups/service-centers`
2. **Mô tả nghiệp vụ:** Lấy danh sách trung tâm bảo hành đang hoạt động để chọn khi lập phiếu.
3. **Xác thực và quyền truy cập:** Bắt buộc Bearer token hợp lệ.
4. **Tham số / Request Body:** Không có.
5. **Response thành công - `200 OK`:** Dữ liệu mẫu trong database:

```json
{
  "data": [
    {
      "center_id": "1",
      "center_name": "Trung tâm Mekong - Quận 1"
    },
    {
      "center_id": "2",
      "center_name": "Trung tâm Mekong - Thủ Đức"
    }
  ]
}
```

6. **Mã lỗi:** `401 AUTH_REQUIRED`, `401 AUTH_TOKEN_INVALID`, `503 AUTH_NOT_CONFIGURED` hoặc `500 INTERNAL_SERVER_ERROR`.
7. **Giới hạn / hành vi đặc biệt:** Chỉ trả về trung tâm có `is_active = TRUE`, sắp xếp theo `center_id` tăng dần. Mỗi phần tử gồm `center_id`, `center_name`.

### 3.10. GET `/api/tickets`

1. **Phương thức và đường dẫn:** `GET /api/tickets`
2. **Mô tả nghiệp vụ:** Lấy danh sách phiếu bảo hành, bao gồm thông tin liên quan đến khách hàng, thiết bị, nhóm sự cố và trung tâm.
3. **Xác thực và quyền truy cập:** Bắt buộc Bearer token hợp lệ.
4. **Query Parameters:**

| Tham số | Bắt buộc | Quy tắc |
|---|---|---|
| `limit` | Không | Mặc định `50`, số nguyên từ `1` đến `100` |
| `offset` | Không | Mặc định `0`, số nguyên không âm |

5. **Response thành công - `200 OK`:** Ví dụ một phiếu mẫu trong database:

```json
{
  "data": [
    {
      "ticket_id": "1",
      "ticket_code": "L02-DEMO-001",
      "customer_id": "1",
      "device_id": "1",
      "center_id": "1",
      "category_id": "1",
      "issue_desc": "Màn hình chớp nháy khi sử dụng",
      "priority": "CAO",
      "status": "MOI",
      "received_at": "2026-10-19T07:27:21.875Z",
      "due_date": "2026-10-22T07:27:21.875Z",
      "accessories": ["Ốp lưng"],
      "customer_name": "Nguyễn Minh Anh",
      "customer_phone": "090****567",
      "serial_no": "SM-MEK-0001",
      "purchase_date": "2026-03-09T17:00:00.000Z",
      "warranty_months": 12,
      "category_code": "MAN_HINH",
      "category_name": "Màn hình",
      "center_name": "Trung tâm Mekong - Quận 1"
    }
  ]
}
```

6. **Mã lỗi:**

| HTTP | Code | Điều kiện |
|---|---|---|
| 400 | `VALIDATION_FAILED` | `limit` hoặc `offset` không hợp lệ; thông tin lỗi nằm trong `fields.pagination` |
| 401 | `AUTH_REQUIRED` / `AUTH_TOKEN_INVALID` | Thiếu token hoặc token không hợp lệ/hết hạn |
| 503 | `AUTH_NOT_CONFIGURED` | Máy chủ chưa cấu hình xác thực |
| 500 | `INTERNAL_SERVER_ERROR` | Lỗi nội bộ không dự kiến |

7. **Giới hạn / hành vi đặc biệt:** Danh sách sắp xếp theo `received_at` giảm dần, sau đó `ticket_id` giảm dần. `customer_phone` được che bớt. `limit` tối đa 100.

### 3.11. GET `/api/tickets/:id`

1. **Phương thức và đường dẫn:** `GET /api/tickets/:id`
2. **Mô tả nghiệp vụ:** Lấy chi tiết một phiếu bảo hành theo mã phiếu.
3. **Xác thực và quyền truy cập:** Bắt buộc Bearer token hợp lệ.
4. **Path Parameter:** `id` - mã phiếu, phải là số nguyên dương.
5. **Response thành công - `200 OK`:** Dữ liệu chi tiết có cùng cấu trúc một phần tử trong `data` của `GET /api/tickets`. Ví dụ với phiếu `L02-DEMO-001`:

```json
{
  "data": {
    "ticket_id": "1",
    "ticket_code": "L02-DEMO-001",
    "customer_id": "1",
    "device_id": "1",
    "center_id": "1",
    "category_id": "1",
    "issue_desc": "Màn hình chớp nháy khi sử dụng",
    "priority": "CAO",
    "status": "MOI",
    "received_at": "2026-10-19T07:27:21.875Z",
    "due_date": "2026-10-22T07:27:21.875Z",
    "accessories": ["Ốp lưng"],
    "customer_name": "Nguyễn Minh Anh",
    "customer_phone": "090****567",
    "serial_no": "SM-MEK-0001",
    "purchase_date": "2026-03-09T17:00:00.000Z",
    "warranty_months": 12,
    "category_code": "MAN_HINH",
    "category_name": "Màn hình",
    "center_name": "Trung tâm Mekong - Quận 1"
  }
}
```

6. **Mã lỗi:**

| HTTP | Code | Điều kiện |
|---|---|---|
| 400 | `VALIDATION_FAILED` | `id` không phải số nguyên dương; lỗi nằm trong `fields.id` |
| 401 | `AUTH_REQUIRED` / `AUTH_TOKEN_INVALID` | Thiếu token hoặc token không hợp lệ/hết hạn |
| 404 | `TICKET_NOT_FOUND` | Không tìm thấy phiếu bảo hành |
| 503 | `AUTH_NOT_CONFIGURED` | Máy chủ chưa cấu hình xác thực |

7. **Giới hạn / hành vi đặc biệt:** `customer_phone` được che bớt. ID phải là số nguyên dương.

### 3.12. POST `/api/tickets`

1. **Phương thức và đường dẫn:** `POST /api/tickets`
2. **Mô tả nghiệp vụ:** Tiếp nhận yêu cầu bảo hành và tạo phiếu mới với trạng thái ban đầu `MOI`.
3. **Xác thực và quyền truy cập:** Bắt buộc Bearer token hợp lệ.
4. **Request Body:**

Ví dụ dùng khách hàng `1`, thiết bị `7` (`SM-MEK-0004` được seed dành cho kiểm thử tạo phiếu thành công), trung tâm `1` và nhóm sự cố `3`:

```json
{
  "customer_id": "1",
  "device_id": "7",
  "center_id": "1",
  "category_id": "3",
  "issue_desc": "API test tạo phiếu bảo hành hợp lệ",
  "priority": "TRUNG_BINH",
  "accessories": ["SAC"]
}
```

| Trường | Bắt buộc | Kiểu / ràng buộc |
|---|---|---|
| `customer_id` | Có | ID số nguyên dương, khách hàng phải tồn tại |
| `device_id` | Có | ID số nguyên dương, thiết bị phải tồn tại và thuộc `customer_id` |
| `center_id` | Có | ID số nguyên dương, trung tâm phải tồn tại và đang hoạt động |
| `category_id` | Có | ID số nguyên dương, nhóm sự cố phải tồn tại và đang hoạt động |
| `issue_desc` | Có | Chuỗi sau trim, từ 10 đến 2000 ký tự |
| `priority` | Có | Một trong `CAO`, `TRUNG_BINH`, `THAP` |
| `accessories` | Không | Mảng hoặc `null`; mỗi phần tử là một trong `SAC`, `TAI_NGHE`, `HOP`, `KHAC` |

5. **Response thành công - `201 Created`:**

```json
{
  "ticket_id": "<ID do database sinh>",
  "ticket_code": "<mã BH-xxxxxx/năm do máy chủ sinh>",
  "status": "MOI",
  "category_id": "3",
  "received_at": "<thời điểm tiếp nhận do máy chủ sinh, ISO 8601>",
  "due_date": "<hạn xử lý do máy chủ tính, ISO 8601>"
}
```

Đây là response trực tiếp, **không bọc trong thuộc tính `data`**. Các giá trị trong dấu `<...>` được sinh khi request thành công.

6. **Mã lỗi:**

| HTTP | Code | Điều kiện |
|---|---|---|
| 400 | `VALIDATION_FAILED` | Body hoặc trường đầu vào không hợp lệ; chi tiết nằm trong `fields` |
| 401 | `AUTH_REQUIRED` / `AUTH_TOKEN_INVALID` | Thiếu token hoặc token không hợp lệ/hết hạn |
| 404 | `RESOURCE_NOT_FOUND` | Không tìm thấy khách hàng hoặc thiết bị được tham chiếu |
| 409 | `ACTIVE_TICKET_EXISTS` | Thiết bị đã có phiếu chưa đóng |
| 409 | `DUPLICATE_VALUE` | Database phát hiện giá trị duy nhất bị trùng |
| 422 | `WARRANTY_APPROVAL_REQUIRED` | Thiết bị đã hết hạn bảo hành theo dữ liệu ngày mua và thời hạn bảo hành |
| 503 | `AUTH_NOT_CONFIGURED` | Máy chủ chưa cấu hình xác thực |

7. **Giới hạn / hành vi đặc biệt:**

- Một thiết bị không được có thêm phiếu khi đang có phiếu ở trạng thái `MOI`, `DANG_XU_LY`, `CHO_LINH_KIEN` hoặc `DA_SUA`.
- Nếu có ngày mua và số tháng bảo hành hợp lệ, hệ thống so sánh ngày hiện tại tại `Asia/Ho_Chi_Minh` với ngày hết hạn bảo hành. Nếu đã quá hạn, API trả `422 WARRANTY_APPROVAL_REQUIRED`.
- Code hiện có thông báo cần quản lý phê duyệt nhưng chưa có trường/bảng lưu việc phê duyệt; quy trình ghi nhận phê duyệt chưa được triển khai trong backend.
- Hạn xử lý được tính theo ưu tiên: `CAO` = 1 ngày, `TRUNG_BINH` = 3 ngày, `THAP` = 5 ngày. Khi tính, code bỏ qua Chủ nhật; không thấy xử lý loại trừ ngày lễ hoặc thứ Bảy.
- Mã phiếu được sinh theo dạng `BH-xxxxxx/năm`. Thời điểm tiếp nhận và hạn xử lý do máy chủ sinh/tính.

### 3.13. PUT `/api/tickets/:id`

1. **Phương thức và đường dẫn:** `PUT /api/tickets/:id`
2. **Mô tả nghiệp vụ:** Cập nhật thông tin xử lý của phiếu bảo hành.
3. **Xác thực và quyền truy cập:** Bắt buộc Bearer token hợp lệ.
4. **Path Parameter và Request Body:** `id` phải là số nguyên dương. Body là đối tượng JSON; các trường có thể gửi để cập nhật gồm:

| Trường | Bắt buộc trong body | Quy tắc khi gửi |
|---|---|---|
| `center_id` | Không | ID số nguyên dương của trung tâm đang hoạt động |
| `category_id` | Không | ID số nguyên dương của nhóm sự cố đang hoạt động |
| `issue_desc` | Không | Chuỗi từ 10 đến 2000 ký tự sau trim |
| `priority` | Không | `CAO`, `TRUNG_BINH` hoặc `THAP` |
| `due_date` | Không | Giá trị ngày giờ JavaScript có thể phân tích; nên gửi ISO 8601 |
| `accessories` | Không | Mảng gồm `SAC`, `TAI_NGHE`, `HOP`, `KHAC`, hoặc `null` |

Ví dụ cập nhật một phần:

```json
{
  "issue_desc": "Màn hình chớp nháy khi sử dụng, đã kiểm tra",
  "priority": "TRUNG_BINH"
}
```

Các trường không gửi sẽ giữ giá trị hiện tại. `customer_id` và `device_id` không nằm trong danh sách trường được cập nhật.

5. **Response thành công - `200 OK`:** Trả về `{ "data": <phiếu bảo hành sau cập nhật> }`; đối tượng phiếu có cấu trúc như response của `GET /api/tickets/:id`. Ví dụ phần đầu của response:

```json
{
  "data": {
    "ticket_id": "1",
    "ticket_code": "L02-DEMO-001",
    "customer_id": "1",
    "device_id": "1",
    "center_id": "1",
    "category_id": "1",
    "issue_desc": "Màn hình chớp nháy khi sử dụng, đã kiểm tra",
    "priority": "TRUNG_BINH",
    "status": "MOI",
    "received_at": "2026-10-19T07:27:21.875Z",
    "due_date": "2026-10-22T07:27:21.875Z",
    "accessories": ["Ốp lưng"],
    "customer_name": "Nguyễn Minh Anh",
    "customer_phone": "090****567",
    "serial_no": "SM-MEK-0001",
    "purchase_date": "2026-03-09T17:00:00.000Z",
    "warranty_months": 12,
    "category_code": "MAN_HINH",
    "category_name": "Màn hình",
    "center_name": "Trung tâm Mekong - Quận 1"
  }
}
```

Ví dụ giữ nguyên các trường khác của phiếu mẫu và minh họa hai trường được cập nhật. Các trường thời gian, phụ kiện và thông tin liên quan cũng có trong response thực tế.

6. **Mã lỗi:**

| HTTP | Code | Điều kiện |
|---|---|---|
| 400 | `VALIDATION_FAILED` | ID, body hoặc một trường cập nhật không hợp lệ |
| 401 | `AUTH_REQUIRED` / `AUTH_TOKEN_INVALID` | Thiếu token hoặc token không hợp lệ/hết hạn |
| 404 | `TICKET_NOT_FOUND` | Không tìm thấy phiếu |
| 409 | `TICKET_CANCELLED` | Phiếu đã ở trạng thái `HUY` |
| 409 | `TICKET_NOT_EDITABLE` | Database không cập nhật được phiếu ở trạng thái hiện tại |
| 409 | `DUPLICATE_VALUE` | Database phát hiện giá trị duy nhất bị trùng |
| 503 | `AUTH_NOT_CONFIGURED` | Máy chủ chưa cấu hình xác thực |

7. **Giới hạn / hành vi đặc biệt:** Không cho cập nhật phiếu đã hủy. Các trường được giữ nguyên nếu không gửi trong body. `due_date` không tự động tính lại chỉ vì `priority` thay đổi; muốn đổi hạn phải gửi `due_date` phù hợp.

### 3.14. DELETE `/api/tickets/:id`

1. **Phương thức và đường dẫn:** `DELETE /api/tickets/:id`
2. **Mô tả nghiệp vụ:** Hủy phiếu bảo hành theo quy tắc nghiệp vụ.
3. **Xác thực và quyền truy cập:** Bắt buộc Bearer token hợp lệ.
4. **Path Parameter:** `id` - mã phiếu, phải là số nguyên dương. Không có Request Body.
5. **Response thành công - `200 OK`:** Khi hủy phiếu mẫu `L02-DEMO-001`, trạng thái trong dữ liệu trả về được chuyển thành `HUY`:

```json
{
  "message": "Hủy phiếu bảo hành thành công.",
  "data": {
    "ticket_id": "1",
    "ticket_code": "L02-DEMO-001",
    "customer_id": "1",
    "device_id": "1",
    "center_id": "1",
    "category_id": "1",
    "issue_desc": "Màn hình chớp nháy khi sử dụng",
    "priority": "CAO",
    "status": "HUY",
    "received_at": "2026-10-19T07:27:21.875Z",
    "due_date": "2026-10-22T07:27:21.875Z",
    "accessories": ["Ốp lưng"],
    "customer_name": "Nguyễn Minh Anh",
    "customer_phone": "090****567",
    "serial_no": "SM-MEK-0001",
    "purchase_date": "2026-03-09T17:00:00.000Z",
    "warranty_months": 12,
    "category_code": "MAN_HINH",
    "category_name": "Màn hình",
    "center_name": "Trung tâm Mekong - Quận 1"
  }
}
```

Đây là response dự kiến sau khi hủy phiếu mẫu `L02-DEMO-001`; trạng thái `MOI` được đổi thành `HUY`. Gửi request với ID `1` trên database hiện tại sẽ thực sự hủy phiếu mẫu này, vì vậy chỉ dùng khi có chủ đích kiểm thử.

6. **Mã lỗi:**

| HTTP | Code | Điều kiện |
|---|---|---|
| 400 | `VALIDATION_FAILED` | `id` không phải số nguyên dương |
| 401 | `AUTH_REQUIRED` / `AUTH_TOKEN_INVALID` | Thiếu token hoặc token không hợp lệ/hết hạn |
| 404 | `TICKET_NOT_FOUND` | Không tìm thấy phiếu |
| 409 | `TICKET_CANNOT_BE_CANCELLED` | Phiếu không ở trạng thái `MOI` hoặc không thể hủy ở trạng thái hiện tại |
| 503 | `AUTH_NOT_CONFIGURED` | Máy chủ chưa cấu hình xác thực |

7. **Giới hạn / hành vi đặc biệt:** Chỉ phiếu có trạng thái `MOI` được hủy. Đây là hủy theo nghiệp vụ: cập nhật trạng thái thành `HUY` và ghi lịch sử trạng thái; không xóa bản ghi phiếu khỏi database.

## 4. Quy tắc validation tổng hợp

### 4.1. Khách hàng

| Trường | Quy tắc |
|---|---|
| `id` | Chuỗi biểu diễn số nguyên dương |
| `full_name` | Bắt buộc, chuỗi sau trim không rỗng, tối đa 120 ký tự |
| `phone` | Bắt buộc, đúng 10 chữ số, bắt đầu bằng `0`, không trùng khách hàng khác |
| `address` | Có thể để trống/`null`; nếu là chuỗi thì tối đa 255 ký tự |
| `limit` | Số nguyên từ 1 đến 100 |
| `offset` | Số nguyên không âm |

### 4.2. Phiếu bảo hành

| Trường | Quy tắc |
|---|---|
| `customer_id` | Số nguyên dương, khách hàng phải tồn tại |
| `device_id` | Số nguyên dương, thiết bị phải tồn tại và thuộc khách hàng đã chọn |
| `center_id` | Số nguyên dương, trung tâm phải tồn tại và đang hoạt động |
| `category_id` | Số nguyên dương, nhóm sự cố phải tồn tại và đang hoạt động |
| `issue_desc` | Bắt buộc khi tạo; chuỗi từ 10 đến 2000 ký tự sau trim |
| `priority` | Một trong `CAO`, `TRUNG_BINH`, `THAP` |
| `accessories` | Không bắt buộc; mảng gồm các giá trị `SAC`, `TAI_NGHE`, `HOP`, `KHAC`, hoặc `null` |
| `limit` | Số nguyên từ 1 đến 100 |
| `offset` | Số nguyên không âm |
| `due_date` khi cập nhật | Phải là ngày giờ hợp lệ theo bộ phân tích `Date` của JavaScript |

## 5. Bảng mã lỗi

| HTTP Status | Error Code | Ý nghĩa |
|---|---|---|
| 400 | `AUTH_VALIDATION_FAILED` | Thông tin đăng nhập thiếu hoặc sai kiểu dữ liệu |
| 400 | `INVALID_JSON` | JSON gửi lên sai cú pháp |
| 400 | `INVALID_ID` | ID khách hàng không phải số nguyên dương |
| 400 | `INVALID_BODY` | Body không đúng dạng đối tượng JSON |
| 400 | `INVALID_PAGINATION` | Tham số phân trang khách hàng không hợp lệ |
| 400 | `VALIDATION_FAILED` | Dữ liệu phiếu hoặc phân trang phiếu không hợp lệ |
| 401 | `AUTH_REQUIRED` | Thiếu Bearer token |
| 401 | `AUTH_TOKEN_INVALID` | Token không hợp lệ hoặc đã hết hạn |
| 401 | `AUTH_INVALID_CREDENTIALS` | Tên đăng nhập hoặc mật khẩu không chính xác |
| 404 | `CUSTOMER_NOT_FOUND` | Không tìm thấy khách hàng |
| 404 | `TICKET_NOT_FOUND` | Không tìm thấy phiếu bảo hành |
| 404 | `RESOURCE_NOT_FOUND` | Không tìm thấy khách hàng, thiết bị hoặc dữ liệu tham chiếu |
| 404 | `ROUTE_NOT_FOUND` | Không tìm thấy endpoint |
| 409 | `PHONE_EXISTS` | Số điện thoại đã tồn tại |
| 409 | `DUPLICATE_VALUE` | Giá trị bị trùng theo ràng buộc database |
| 409 | `RELATED_RECORD_EXISTS` | Không thể xóa khách hàng vì còn dữ liệu liên quan |
| 409 | `ACTIVE_TICKET_EXISTS` | Thiết bị đã có phiếu bảo hành chưa đóng |
| 409 | `TICKET_CANCELLED` | Phiếu đã hủy, không thể cập nhật |
| 409 | `TICKET_NOT_EDITABLE` | Phiếu không thể cập nhật ở trạng thái hiện tại |
| 409 | `TICKET_CANNOT_BE_CANCELLED` | Phiếu không đủ điều kiện hủy |
| 422 | `INVALID_FULL_NAME` | Họ tên không hợp lệ |
| 422 | `INVALID_PHONE` | Số điện thoại không hợp lệ |
| 422 | `INVALID_ADDRESS` | Địa chỉ không hợp lệ |
| 422 | `WARRANTY_APPROVAL_REQUIRED` | Thiết bị đã hết hạn bảo hành và cần phê duyệt |
| 503 | `AUTH_NOT_CONFIGURED` | Máy chủ chưa cấu hình xác thực |
| 500 | `INTERNAL_SERVER_ERROR` | Lỗi nội bộ không dự kiến |

## 6. Dữ liệu mẫu tham chiếu

Các dữ liệu dưới đây được lấy từ `src/backend/seeds/001_demo_data.sql` và kết quả truy vấn database trong môi trường dự án. Bảng thiết bị chỉ liệt kê các thiết bị seed dùng làm ví dụ và thiết bị dành cho kiểm thử tạo phiếu thành công, không phải toàn bộ thiết bị có thể phát sinh trong database. ID do database sinh nên có thể khác ở môi trường được tạo mới.

### 6.1. Khách hàng và thiết bị

| customer_id | Khách hàng | Số điện thoại | device_id | Serial |
|---|---|---|---|---|
| `1` | Nguyễn Minh Anh | `0901234567` | `1` | `SM-MEK-0001` |
| `1` | Nguyễn Minh Anh | `0901234567` | `7` | `SM-MEK-0004` |
| `2` | Trần Quốc Bảo | `0912345678` | `2` | `SM-MEK-0002` |
| `3` | Lê Thu Hà | `0987654321` | `3` | `SM-MEK-0003` |

Thiết bị `SM-MEK-0004` được seed dành cho kiểm thử tạo phiếu thành công.

### 6.2. Nhóm sự cố

| category_id (trong database hiện tại) | category_code | category_name |
|---|---|---|
| `1` | `MAN_HINH` | Màn hình |
| `2` | `PIN` | Pin |
| `3` | `SAC` | Sạc |
| `4` | `PHAN_MEM` | Phần mềm |
| `5` | `NUOC_VAO` | Vào nước |
| `6` | `KHAC` | Khác |

### 6.3. Trung tâm bảo hành

| center_id (trong database hiện tại) | center_name |
|---|---|
| `1` | Trung tâm Mekong - Quận 1 |
| `2` | Trung tâm Mekong - Thủ Đức |

### 6.4. Phiếu bảo hành mẫu

| ticket_id | ticket_code | customer_id | device_id | status | priority |
|---|---|---|---|---|---|
| `1` | `L02-DEMO-001` | `1` | `1` | `MOI` | `CAO` |
| `2` | `L02-DEMO-002` | `2` | `2` | `DANG_XU_LY` | `TRUNG_BINH` |
| `3` | `L02-DEMO-003` | `3` | `3` | `CHO_LINH_KIEN` | `THAP` |