# API Contract - L02: Tiếp nhận và phân loại yêu cầu bảo hành
## 1. Danh sách endpoint
| Phương thức | Đường dẫn | Mục đích | User Story liên quan |
|---|---|---|---|
| GET | `/api/customers?phone={phone}` | Tra cứu thông tin khách hàng theo số điện thoại | US2 |
| POST | `/api/customers` | Tạo khách hàng mới khi số điện thoại chưa tồn tại | US3 |
| GET | `/api/customers/{id}/devices` | Lấy danh sách thiết bị của khách hàng để xác định thiết bị cần bảo hành | US4 |
| POST | `/api/tickets` | Tạo phiếu bảo hành mới và ghi nhận các thông tin của phiếu | US1, US4, US5, US6, US7, US8 |

## 2. Quy ước chung
- Định dạng trao đổi dữ liệu: JSON, mã hóa UTF-8.
- Header bắt buộc: `Content-Type: application/json`.
- Tên trường dữ liệu sử dụng `snake_case`.
- Thời gian sử dụng chuẩn ISO 8601 kèm múi giờ.
- Các lỗi của API sử dụng cùng một cấu trúc:
  ```json
  {
    "error": {
      "code": "...",
      "message": "...",
      "fields": {}
    }
  }
  ```
## 3. Chi tiết endpoint
### 3.1 POST /api/tickets
**Mục đích:** Tạo một phiếu bảo hành mới.
**User Story liên quan:** US1, US4, US5, US6, US7, US8
**REQUEST BODY**
```json
{
  "customer_id": 1024,
  "device_id": 3311,
  "center_id": 2,
  "issue_desc": "Máy sạc không vào, cắm sạc báo lỗi phụ kiện",
  "category_id": 3,
  "priority": "TRUNG_BINH",
  "accessories": ["SAC", "HOP"]
}
```
**RESPONSE 201 Created**
```json
{
  "ticket_id": 88231,
  "ticket_code": "BH-000231/2026",
  "status": "MOI",
  "category_id": 3,
  "received_at": "2026-09-08T14:30:00+07:00",
  "due_date": "2026-09-11T14:30:00+07:00"
}
```
**RESPONSE 400 Bad Request - Dữ liệu không hợp lệ**
```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "Dữ liệu không hợp lệ",
    "fields": {
      "issue_desc": "Mô tả lỗi bắt buộc, phải có từ 10 đến 2000 ký tự"
    }
  }
}
```
**RESPONSE 404 Not Found - Không tìm thấy dữ liệu**
Khách hàng hoặc thiết bị được tham chiếu trong yêu cầu không tồn tại trong hệ thống.
```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "Không tìm thấy khách hàng hoặc thiết bị được tham chiếu",
    "fields": {}
  }
}
```
**RESPONSE 409 Conflict - Dữ liệu đang có xung đột**
Thiết bị đang có một yêu cầu bảo hành chưa được đóng nên không thể tạo yêu cầu mới cho thiết bị này.
```json
{
  "error": {
    "code": "ACTIVE_TICKET_EXISTS",
    "message": "Thiết bị đang có phiếu bảo hành chưa đóng",
    "fields": {
      "device_id": "Thiết bị đã có phiếu bảo hành đang xử lý"
    }
  }
}
```
**RESPONSE 422 Unprocessable Entity - Không đáp ứng quy tắc bảo hành**
Thiết bị đã hết thời hạn bảo hành và chưa có phê duyệt theo quy tắc nghiệp vụ.
```json
{
  "error": {
    "code": "WARRANTY_APPROVAL_REQUIRED",
    "message": "Thiết bị đã hết thời hạn bảo hành và chưa có phê duyệt",
    "fields": {
      "device_id": "Cần quản lý phê duyệt trước khi tiếp tục xử lý"
    }
  }
}
```

### 3.2 GET /api/customers?phone={phone}
**Mục đích:** Tra cứu thông tin khách hàng theo số điện thoại.
**User Story liên quan:** US2
**QUERY PARAMETER**
| Tham số | Bắt buộc | Mục đích |
|---|---|---|
| `phone` | Có | Số điện thoại dùng để tra cứu thông tin khách hàng |
**RESPONSE 200 OK**
```json
{
  "customer_id": 1024,
  "phone": "090****567",
  "full_name": "Nguyễn Văn A",
  "address": "TP. Hồ Chí Minh",
  "purchase_history": []
}
```
**RESPONSE 404 Not Found - Không tìm thấy khách hàng**
```json
{
  "error": {
    "code": "CUSTOMER_NOT_FOUND",
    "message": "Không tìm thấy khách hàng với số điện thoại đã cung cấp",
    "fields": {
      "phone": "Không tìm thấy khách hàng"
    }
  }
}
```
**RESPONSE 400 Bad Request - Số điện thoại không hợp lệ**
```json
{
  "error": {
    "code": "INVALID_PHONE",
    "message": "Số điện thoại không hợp lệ",
    "fields": {
      "phone": "Không thể chuẩn hóa số điện thoại về định dạng hợp lệ"
    }
  }
}
```
### 3.3 POST /api/customers
**Mục đích:** Tạo khách hàng mới khi số điện thoại chưa tồn tại trong hệ thống.
**User Story liên quan:** US3
**REQUEST BODY**
```json
{
  "full_name": "Nguyễn Văn B",
  "phone": "0907654321",
  "address": "TP. Hồ Chí Minh"
}
RESPONSE 201 Created
{
  "customer_id": 1025,
  "full_name": "Nguyễn Văn B",
  "phone": "0907654321",
  "address": "TP. Hồ Chí Minh"
}
RESPONSE 400 Bad Request - Dữ liệu không hợp lệ
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "Dữ liệu không hợp lệ",
    "fields": {
      "full_name": "Họ tên khách hàng là bắt buộc"
    }
  }
}
RESPONSE 409 Conflict - Số điện thoại đã tồn tại
{
  "error": {
    "code": "PHONE_ALREADY_EXISTS",
    "message": "Số điện thoại đã tồn tại trong hệ thống",
    "fields": {
      "phone": "Vui lòng sử dụng hồ sơ khách hàng đã có"
    }
  }
}
```
### 3.4 GET /api/customers/{id}/devices
**Mục đích:** Lấy danh sách thiết bị thuộc khách hàng để nhân viên tiếp nhận xác định thiết bị cần bảo hành.
**User Story liên quan:** US4
**PATH PARAMETER**
| Tham số | Bắt buộc | Mục đích                                 |
| ------- | -------- | ---------------------------------------- |
| `id`    | Có       | Mã khách hàng cần lấy danh sách thiết bị |

**RESPONSE 200 OK**
```json
{
  "devices": [
    {
      "device_id": 3311,
      "customer_id": 1024,
      "product_id": 210,
      "serial_no": "IMEI356789012345678",
      "purchase_date": "2025-03-15",
      "warranty_months": 12
    }
  ]
}
```
**RESPONSE 400 Bad Request - Mã khách hàng không hợp lệ**
```json
{
  "error": {
    "code": "INVALID_CUSTOMER_ID",
    "message": "Mã khách hàng không hợp lệ",
    "fields": {
      "id": "Mã khách hàng phải là số nguyên dương"
    }
  }
}
```
**RESPONSE 404 Not Found - Không tìm thấy khách hàng**
```json
{
  "error": {
    "code": "CUSTOMER_NOT_FOUND",
    "message": "Không tìm thấy khách hàng trong hệ thống",
    "fields": {
      "id": "Không tìm thấy khách hàng"
    }
  }
}
```

## 4. Bảng validation cho POST /api/tickets

| Trường        | Bắt buộc | Kiểu / ràng buộc                                                  | Thông báo lỗi khi vi phạm                        |
| ------------- | -------- | ----------------------------------------------------------------- | ------------------------------------------------ |
| `customer_id` | Có       | Số nguyên dương, phải tồn tại trong hệ thống                      | Không tìm thấy khách hàng                        |
| `device_id`   | Có       | Số nguyên dương, phải tồn tại và thuộc về `customer_id` được chọn | Thiết bị không thuộc về khách hàng đã chọn       |
| `issue_desc`  | Có       | Chuỗi, độ dài 10-2000 ký tự                                       | Mô tả lỗi bắt buộc, phải có từ 10 đến 2000 ký tự |
| `category_id` | Có       | Số nguyên dương, phải thuộc danh mục nhóm sự cố                   | Nhóm sự cố không hợp lệ                          |
| `priority`    | Có       | Một trong CAO / TRUNG_BINH / THAP                                 | Mức ưu tiên không hợp lệ                         |
| `accessories` | Không    | Mảng, mỗi phần tử thuộc SAC / TAI_NGHE / HOP / KHAC               | Phụ kiện không hợp lệ                            |
| `center_id`   | Có       | Số nguyên dương, phải tồn tại trong hệ thống                      | Trung tâm không hợp lệ                           |
