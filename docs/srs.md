# SRS RÚT GỌN - L02: TIẾP NHẬN VÀ PHÂN LOẠI YÊU CẦU BẢO HÀNH

## 1. Giới thiệu và phạm vi

### 1.1. Mục đích

Tài liệu này đặc tả các yêu cầu của luồng L02 - Tiếp nhận và phân loại yêu cầu bảo hành trong hệ thống Smart CRM của Mekong Mobile.

Phạm vi tập trung vào quá trình nhân viên tiếp nhận tra cứu thông tin khách hàng, ghi nhận thiết bị và mô tả lỗi, phân loại nhóm sự cố, xác định mức độ ưu tiên và hạn cam kết của phiếu bảo hành.

### 1.2. Phạm vi hệ thống

**Trong phạm vi:**

* Tra cứu khách hàng theo số điện thoại.
* Tạo khách hàng mới khi số điện thoại chưa tồn tại.
* Tạo phiếu bảo hành mới.
* Ghi nhận thông tin thiết bị.
* Ghi nhận mô tả lỗi.
* Phân loại nhóm sự cố.
* Xác định mức độ ưu tiên.
* Tự động xác định và lưu hạn cam kết.

**Ngoài phạm vi:**

* Phân công kỹ thuật viên.
* Theo dõi chi tiết quá trình sửa chữa.
* Quản lý tồn kho linh kiện.
* Báo cáo tổng hợp ngoài luồng L02.

### 1.3. Thuật ngữ

| Thuật ngữ        | Định nghĩa                                                                              |
| ---------------- | --------------------------------------------------------------------------------------- |
| Khách hàng       | Cá nhân đã mua sản phẩm hoặc sử dụng dịch vụ của Mekong Mobile                          |
| Thiết bị         | Một máy cụ thể mà khách hàng sở hữu, được xác định bằng số serial hoặc IMEI             |
| Phiếu bảo hành   | Một yêu cầu bảo hành hoặc sửa chữa được ghi nhận, có mã duy nhất và vòng đời trạng thái |
| Trạng thái phiếu | Vị trí hiện tại của phiếu trong vòng đời xử lý                                          |
| Hạn cam kết      | Thời điểm chậm nhất phải hoàn tất phiếu, tính từ lúc tiếp nhận theo mức ưu tiên         |
| Nhóm sự cố       | Phân loại nguyên nhân bảo hành gồm màn hình, pin, sạc, phần mềm, nước vào và khác       |
| Mức ưu tiên      | Mức khẩn của phiếu gồm Cao, Trung bình và Thấp                                          |

## 2. Các bên liên quan và vai trò

| Vai trò                    | Trách nhiệm chính trong phạm vi L02                                                                                  | Mối quan tâm                                                                                   |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| Nhân viên tiếp nhận        | Tra cứu khách hàng, ghi nhận thiết bị và mô tả lỗi, phân loại nhóm sự cố, xác định mức ưu tiên và tạo phiếu bảo hành | Không phải hỏi lại khách thông tin đã có trong hệ thống                                        |
| Quản lý trung tâm bảo hành | Phê duyệt trường hợp chưa xác minh bảo hành khi thiếu ngày mua và theo dõi hạn cam kết trong đơn vị phụ trách        | Bảo đảm các trường hợp ngoại lệ được xử lý đúng quy tắc và hạn cam kết được xác định chính xác |

## 3. Yêu cầu chức năng

| Mã FR | Yêu cầu chức năng                                                                                                                                                                          | User Story | MoSCoW |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------- | ------ |
| FR1   | Hệ thống phải cho phép nhân viên tiếp nhận tạo phiếu bảo hành mới, sinh mã phiếu duy nhất và lưu phiếu ở trạng thái MỚI                                                                    | US1        | MUST   |
| FR2   | Hệ thống phải cho phép nhân viên tiếp nhận tra cứu khách hàng theo số điện thoại và hiển thị hồ sơ khách hàng đã tồn tại                                                                   | US2        | MUST   |
| FR3   | Hệ thống phải cho phép nhân viên tiếp nhận tạo hồ sơ khách hàng mới khi số điện thoại chưa tồn tại                                                                                         | US3        | SHOULD |
| FR4   | Hệ thống phải cho phép nhân viên tiếp nhận chọn và ghi nhận thiết bị thuộc khách hàng vào phiếu bảo hành, xác định thiết bị bằng số serial hoặc IMEI                                       | US4        | SHOULD |
| FR5   | Hệ thống phải cho phép nhân viên tiếp nhận ghi nhận mô tả lỗi của thiết bị. Mô tả lỗi không được để trống và phải đáp ứng ràng buộc độ dài từ 10 đến 2000 ký tự đã chọn trong API Contract | US5        | SHOULD |
| FR6   | Hệ thống phải cho phép nhân viên tiếp nhận chọn nhóm sự cố từ danh mục gồm MAN_HINH, PIN, SAC, PHAN_MEM, NUOC_VAO và KHAC                                                                  | US6        | MUST   |
| FR7   | Hệ thống phải cho phép nhân viên tiếp nhận xác định mức ưu tiên của phiếu thuộc một trong ba mức CAO, TRUNG_BINH và THAP                                                                   | US7        | SHOULD |
| FR8   | Hệ thống phải tự động tính và lưu hạn cam kết của phiếu theo mức ưu tiên và quy tắc QT-04                                                                                                  | US8        | SHOULD |

## 4. Yêu cầu phi chức năng

| Mã NFR | Loại            | Yêu cầu phi chức năng                                                                                                                                    |
| ------ | --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| NFR1   | Hiệu năng       | Hệ thống phải hiển thị danh sách phiếu bảo hành trong dưới 2 giây khi có 10.000 bản ghi, trên máy có 8 GB RAM                                            |
| NFR2   | Tính dễ sử dụng | Nhân viên tiếp nhận mới phải có thể tạo một phiếu bảo hành đúng trong dưới 3 phút mà không cần hỏi đồng nghiệp                                           |
| NFR3   | Bảo mật thông tin         | 100% số điện thoại hiển thị cho nhân viên tiếp nhận phải được che theo định dạng 090****567. Chỉ tài khoản quản lý và giám đốc mới được xem đầy đủ số điện thoại |

## 5. Ràng buộc và quy tắc nghiệp vụ

| Mã    | Quy tắc nghiệp vụ                                                                                                                                                                                                               |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| QT-01 | Số điện thoại khách hàng là duy nhất. Nếu số điện thoại đã tồn tại thì hệ thống phải hiển thị hồ sơ có sẵn thay vì tạo hồ sơ mới                                                                                                |
| QT-02 | Số điện thoại phải được chuẩn hóa về dạng 10 chữ số bắt đầu bằng 0 trước khi lưu. Các dạng có mã quốc gia, dấu cách hoặc dấu chấm phải được chuẩn hóa về dạng chuẩn                                                             |
| QT-03 | Thiết bị được xác định duy nhất bằng số serial hoặc IMEI. Một thiết bị chỉ thuộc về một khách hàng tại một thời điểm                                                                                                            |
| QT-04 | Hạn cam kết được sinh tự động theo mức ưu tiên: CAO = 24 giờ, TRUNG_BINH = 72 giờ, THAP = 120 giờ. Chỉ tính ngày làm việc từ thứ Hai đến thứ Bảy                                                                                |
| QT-05 | Thiết bị được coi là còn bảo hành nếu thời gian từ ngày mua đến ngày tiếp nhận không vượt quá số tháng bảo hành của sản phẩm. Nếu không có ngày mua, phiếu phải được đánh dấu "chưa xác minh bảo hành" và cần quản lý phê duyệt |
| QT-06 | Phiếu chỉ được chuyển trạng thái theo đúng vòng đời đã quy định. Không được quay lại trạng thái trước. Mọi lần chuyển trạng thái phải được ghi lại trong lịch sử chuyển trạng thái                                              |
| QT-13 | Không được xóa vật lý phiếu bảo hành và hồ sơ khách hàng. Chỉ đánh dấu ngừng sử dụng và giữ nguyên lịch sử                                                                                                                      |
| QT-14 | Nhân viên chỉ được xem dữ liệu của trung tâm hoặc cửa hàng mình làm việc. Quản lý được xem dữ liệu của đơn vị mình phụ trách. Ban giám đốc được xem dữ liệu toàn công ty                                                        |
| QT-15 | Số điện thoại khách hàng phải được hiển thị dạng che đối với các vai trò không được phép xem đầy đủ. Quản lý và Ban giám đốc được xem số điện thoại đầy đủ                                                                      |

## 6. Bảng truy vết yêu cầu

| Mã FR | Yêu cầu chức năng                                                    | User Story | Use Case                                    | MoSCoW |
| ----- | -------------------------------------------------------------------- | ---------- | ------------------------------------------- | ------ |
| FR1   | Tạo phiếu bảo hành mới, sinh mã phiếu duy nhất và lưu trạng thái MỚI | US1        | UC3 - Tạo phiếu bảo hành mới                | MUST   |
| FR2   | Tra cứu khách hàng theo số điện thoại và hiển thị hồ sơ đã tồn tại   | US2        | UC1 - Tra cứu khách hàng theo số điện thoại | MUST   |
| FR3   | Tạo khách hàng mới khi số điện thoại chưa tồn tại                    | US3        | UC2 - Tạo khách hàng mới khi chưa tồn tại   | SHOULD |
| FR4   | Ghi nhận thiết bị thuộc khách hàng vào phiếu bảo hành                | US4        | UC3 - Tạo phiếu bảo hành mới                | SHOULD |
| FR5   | Ghi nhận mô tả lỗi của thiết bị                                      | US5        | UC3 - Tạo phiếu bảo hành mới                | SHOULD |
| FR6   | Phân loại nhóm sự cố từ danh mục quy định                            | US6        | UC4 - Phân loại nhóm sự cố                  | MUST   |
| FR7   | Xác định mức ưu tiên của phiếu bảo hành                              | US7        | UC5 - Xác định mức độ ưu tiên               | SHOULD |
| FR8   | Tự động xác định và lưu hạn cam kết theo mức ưu tiên                 | US8        | UC6 - Xác định hạn cam kết                  | SHOULD |

## 7. Đối chiếu yêu cầu với hiện trạng triển khai

Mục này ghi nhận mức độ đáp ứng của phiên bản Smart CRM hiện tại so với các yêu cầu trong SRS. Các nội dung chưa triển khai đầy đủ được ghi nhận để tránh nhầm lẫn giữa yêu cầu ban đầu và chức năng thực tế của hệ thống.

### 7.1. Đối chiếu quy tắc nghiệp vụ

| Mã yêu cầu | Hiện trạng triển khai | Mức độ đáp ứng |
|---|---|---|
| QT-02 | Backend kiểm tra số điện thoại có đúng 10 chữ số và bắt đầu bằng 0. Hệ thống chỉ loại bỏ khoảng trắng ở đầu và cuối, chưa tự chuẩn hóa mã quốc gia, dấu chấm hoặc khoảng trắng bên trong. | Đáp ứng một phần |
| QT-04 | Backend tự động tính hạn cam kết theo mức CAO, TRUNG_BINH và THAP, tương ứng 1, 3 và 5 ngày; bỏ qua Chủ nhật và sử dụng múi giờ Việt Nam. Chưa xử lý lịch nghỉ lễ hoặc khung giờ làm việc cụ thể. | Đáp ứng một phần |
| QT-05 | Hệ thống kiểm tra thời hạn bảo hành khi có ngày mua và số tháng bảo hành hợp lệ. Thiết bị đã hết hạn sẽ bị từ chối tạo phiếu nếu chưa được phê duyệt. Tuy nhiên, chưa có chức năng lưu và quản lý quy trình phê duyệt của quản lý; trường hợp thiếu ngày mua chưa được xử lý theo yêu cầu phê duyệt. | Đáp ứng một phần |
| QT-06 | Khi tạo phiếu, hệ thống ghi nhận trạng thái ban đầu MOI. Khi hủy phiếu, hệ thống chuyển từ MOI sang HUY và ghi lịch sử vào bảng ticket_status_log. Chưa triển khai API chuyển đổi đầy đủ giữa các trạng thái xử lý khác. | Đáp ứng một phần |
| QT-13 | Phiếu bảo hành được hủy bằng cách cập nhật trạng thái và giữ lịch sử. Tuy nhiên, chức năng xóa khách hàng hiện vẫn thực hiện xóa vật lý bằng câu lệnh DELETE. | Đáp ứng một phần |
| QT-14 | ADMIN có thể xem phiếu trên toàn hệ thống; STAFF chỉ được xem và thao tác với phiếu do mình tạo. Chưa triển khai phân quyền dữ liệu theo cửa hàng hoặc trung tâm bảo hành. | Đáp ứng một phần |
| QT-15 | Số điện thoại được che theo định dạng 090****567 khi trả về từ API khách hàng và API phiếu bảo hành. Chưa có cơ chế cho phép quản lý hoặc Ban giám đốc xem số điện thoại đầy đủ theo vai trò. | Đáp ứng một phần |

### 7.2. Đối chiếu yêu cầu phi chức năng

| Mã yêu cầu | Hiện trạng kiểm chứng | Mức độ đáp ứng |
|---|---|---|
| NFR1 | Chưa thực hiện kiểm thử hiệu năng với dữ liệu 10.000 phiếu bảo hành để xác nhận thời gian phản hồi dưới 2 giây. | Chưa kiểm chứng |
| NFR2 | Chưa thực hiện kiểm thử người dùng để đo thời gian hoàn thành thao tác tạo phiếu dưới 3 phút. | Chưa kiểm chứng |
| NFR3 | Đã triển khai che số điện thoại trong phản hồi API cho cả ADMIN và STAFF. Tuy nhiên, chưa có cơ chế phân quyền để vai trò quản lý và Ban giám đốc xem số điện thoại đầy đủ. | Đáp ứng một phần |

### 7.3. Ghi nhận phạm vi hoàn thiện

Phiên bản hiện tại tập trung hoàn thiện luồng tiếp nhận và phân loại yêu cầu bảo hành, bao gồm quản lý khách hàng, thiết bị, phiếu bảo hành, xác thực người dùng, kiểm soát quyền sở hữu phiếu, mã hóa dữ liệu nhạy cảm và tính hạn cam kết.

Các nội dung chưa được triển khai đầy đủ gồm chuẩn hóa số điện thoại theo nhiều định dạng, quy trình phê duyệt ngoại lệ bảo hành, quản lý vòng đời trạng thái đầy đủ, xóa mềm khách hàng và phân quyền dữ liệu theo đơn vị.

Các nội dung này được ghi nhận là giới hạn của phiên bản hiện tại, không được xem là chức năng đã hoàn thành.