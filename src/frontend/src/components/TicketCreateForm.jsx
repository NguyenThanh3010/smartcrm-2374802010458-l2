import { useEffect, useMemo, useState } from 'react';
import customersApi from '../api/customers.api.js';
import ticketsApi from '../api/tickets.api.js';
import lookupsApi from '../api/lookups.api.js';

const ACCESSORIES = [
  { value: 'SAC', label: 'Bộ sạc' },
  { value: 'HOP', label: 'Hộp sản phẩm' },
];

function customerId(customer) {
  return customer.customer_id ?? customer.id;
}

function customerName(customer) {
  return customer.customer_name
    ?? customer.full_name
    ?? customer.name
    ?? `Khách hàng #${customerId(customer)}`;
}

export default function TicketCreateForm({ onCancel, onCreated }) {
  const [customers, setCustomers] = useState([]);
  const [customersLoading, setCustomersLoading] = useState(true);
  const [customersError, setCustomersError] = useState(null);
  const [issueCategories, setIssueCategories] = useState([]);
  const [serviceCenters, setServiceCenters] = useState([]);
  const [lookupsLoading, setLookupsLoading] = useState(true);
  const [lookupsError, setLookupsError] = useState(null);

  const [form, setForm] = useState({
    customer_id: '',
    device_id: '',
    center_id: '',
    category_id: '',
    issue_desc: '',
    priority: 'TRUNG_BINH',
    accessories: ['SAC', 'HOP'],
  });

  const [customerKeyword, setCustomerKeyword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    let active = true;

    async function loadCustomers() {
      setCustomersLoading(true);
      setCustomersError(null);

      try {
        const data = await customersApi.list();
        if (active) {
          const list = Array.isArray(data) ? data : [];
          setCustomers(list);
          if (list.length === 1) {
            setForm((previous) => ({
              ...previous,
              customer_id: String(customerId(list[0]) ?? ''),
            }));
          }
        }
      } catch (error) {
        if (active) setCustomersError(error);
      } finally {
        if (active) setCustomersLoading(false);
      }
    }

    void loadCustomers();
    return () => {
      active = false;
    };
  }, []);


  useEffect(() => {
    let active = true;

    async function loadLookups() {
      setLookupsLoading(true);
      setLookupsError(null);

      try {
        const [categories, centers] = await Promise.all([
          lookupsApi.listIssueCategories(),
          lookupsApi.listServiceCenters(),
        ]);

        if (active) {
          setIssueCategories(categories);
          setServiceCenters(centers);
        }
      } catch (error) {
        if (active) setLookupsError(error);
      } finally {
        if (active) setLookupsLoading(false);
      }
    }

    void loadLookups();

    return () => {
      active = false;
    };
  }, []);

  const filteredCustomers = useMemo(() => {
    const keyword = customerKeyword.trim().toLocaleLowerCase('vi');

    return customers.filter((customer) => {
      const searchable = [
        customerName(customer),
        customer.phone,
        customer.phone_masked,
        customer.customer_phone,
        String(customerId(customer) ?? ''),
      ].join(' ').toLocaleLowerCase('vi');

      return searchable.includes(keyword);
    });
  }, [customers, customerKeyword]);

  function changeField(event) {
    const { name, value } = event.target;

    setForm((previous) => ({ ...previous, [name]: value }));
    setFieldErrors((previous) => ({ ...previous, [name]: undefined }));
    setSubmitError(null);
  }

  function toggleAccessory(value) {
    setForm((previous) => ({
      ...previous,
      accessories: previous.accessories.includes(value)
        ? previous.accessories.filter((item) => item !== value)
        : [...previous.accessories, value],
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitError(null);
    setFieldErrors({});

    if (!form.customer_id || !form.device_id || !form.center_id || !form.category_id) {
      setSubmitError(new Error('Vui lòng nhập đầy đủ khách hàng, thiết bị, trung tâm và nhóm sự cố.'));
      return;
    }

    if (form.issue_desc.trim().length < 10) {
      setFieldErrors({
        issue_desc: 'Mô tả sự cố cần có ít nhất 10 ký tự.',
      });
      return;
    }

    const payload = {
      customer_id: Number(form.customer_id),
      device_id: Number(form.device_id),
      center_id: Number(form.center_id),
      category_id: Number(form.category_id),
      issue_desc: form.issue_desc.trim(),
      priority: form.priority,
      accessories: form.accessories,
    };

    setSubmitting(true);

    try {
      const result = await ticketsApi.create(payload);
      const createdTicket = result?.data ?? result?.ticket ?? result;

      if (typeof onCreated === 'function') {
        await onCreated(createdTicket);
      }
    } catch (error) {
      setSubmitError(error);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="create-ticket-panel">
      <div className="create-ticket-heading">
        <div>
          <div className="eyebrow">NEW REQUEST / L02</div>
          <h2>Thông tin tiếp nhận</h2>
          <p>Ghi nhận khách hàng, thiết bị và nội dung yêu cầu bảo hành.</p>
        </div>
        <span className="form-required-note">* Thông tin bắt buộc</span>
      </div>

      {submitError && (
        <div className="form-error" role="alert">
          <strong>Chưa tạo được phiếu bảo hành</strong>
          <p>{submitError.message || 'Đã xảy ra lỗi khi gửi dữ liệu.'}</p>
          <span>Kiểm tra thông tin thiết bị, quyền liên kết và trạng thái bảo hành trước khi thử lại.</span>
        </div>
      )}

      {customersError && (
        <div className="form-error" role="alert">
          <strong>Không tải được danh sách khách hàng</strong>
          <p>{customersError.message || 'Vui lòng kiểm tra kết nối backend.'}</p>
          <button
            type="button"
            className="button button--secondary"
            onClick={() => window.location.reload()}
          >
            Tải lại trang
          </button>
        </div>
      )}


      {lookupsError && (
        <div className="form-error" role="alert">
          <strong>Không tải được danh mục tiếp nhận</strong>
          <p>{lookupsError.message || 'Vui lòng kiểm tra kết nối Backend.'}</p>
          <button
            type="button"
            className="button button--secondary"
            onClick={() => window.location.reload()}
          >
            Tải lại trang
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div className="form-section">
          <div className="form-section-heading">
            <span className="form-section-number">01</span>
            <div>
              <h3>Thông tin khách hàng và thiết bị</h3>
              <p>Chọn khách hàng và nhập mã thiết bị cần tiếp nhận.</p>
            </div>
          </div>

          <div className="form-grid">
            <div className="form-field form-field--wide">
              <label htmlFor="customer-search">Tìm khách hàng</label>
              <input
                id="customer-search"
                type="search"
                value={customerKeyword}
                onChange={(event) => setCustomerKeyword(event.target.value)}
                placeholder="Lọc theo tên, số điện thoại hoặc mã khách hàng..."
              />
            </div>

            <div className="form-field">
              <label htmlFor="customer_id">Khách hàng <span>*</span></label>
              <select
                id="customer_id"
                name="customer_id"
                value={form.customer_id}
                onChange={changeField}
                required
                disabled={customersLoading || Boolean(customersError)}
              >
                <option value="">
                  {customersLoading ? 'Đang tải khách hàng...' : 'Chọn khách hàng'}
                </option>
                {filteredCustomers.map((customer) => (
                  <option
                    key={customerId(customer)}
                    value={customerId(customer)}
                  >
                    {customerName(customer)} — #{customerId(customer)}
                  </option>
                ))}
              </select>
              {!customersLoading && !customersError && filteredCustomers.length === 0 && (
                <small>Không tìm thấy khách hàng phù hợp.</small>
              )}
            </div>

            <div className="form-field">
              <label htmlFor="device_id">Mã thiết bị <span>*</span></label>
              <input
                id="device_id"
                name="device_id"
                type="number"
                min="1"
                step="1"
                value={form.device_id}
                onChange={changeField}
                placeholder="Ví dụ: 7 hoặc 8"
                required
              />
              <small>Nhập ID thiết bị đã có trong hệ thống.</small>
            </div>
          </div>
        </div>

        <div className="form-section">
          <div className="form-section-heading">
            <span className="form-section-number">02</span>
            <div>
              <h3>Nội dung yêu cầu</h3>
              <p>Mô tả sự cố thực tế khách hàng phản ánh.</p>
            </div>
          </div>

          <div className="form-grid">

            <div className="form-field">
              <label htmlFor="category_id">Nhóm sự cố <span>*</span></label>
              <select
                id="category_id"
                name="category_id"
                value={form.category_id}
                onChange={changeField}
                required
                disabled={lookupsLoading || Boolean(lookupsError) || issueCategories.length === 0}
              >
                <option value="">
                  {lookupsLoading
                    ? 'Đang tải nhóm sự cố...'
                    : issueCategories.length === 0
                      ? 'Không có nhóm sự cố'
                      : 'Chọn nhóm sự cố'}
                </option>
                {issueCategories.map((category) => (
                  <option
                    key={category.category_id}
                    value={String(category.category_id)}
                  >
                    {category.category_name}
                  </option>
                ))}
              </select>
              <small>Danh mục được tải từ hệ thống.</small>
            </div>

            <div className="form-field">
              <label htmlFor="priority">Mức ưu tiên <span>*</span></label>
              <select
                id="priority"
                name="priority"
                value={form.priority}
                onChange={changeField}
                required
              >
                <option value="CAO">Cao</option>
                <option value="TRUNG_BINH">Trung bình</option>
                <option value="THAP">Thấp</option>
              </select>
            </div>

            <div className="form-field form-field--wide">
              <label htmlFor="issue_desc">Mô tả sự cố <span>*</span></label>
              <textarea
                id="issue_desc"
                name="issue_desc"
                value={form.issue_desc}
                onChange={changeField}
                minLength={10}
                maxLength={2000}
                rows={4}
                placeholder="Ví dụ: Màn hình xuất hiện hiện tượng nhấp nháy khi sử dụng..."
                required
                aria-invalid={Boolean(fieldErrors.issue_desc)}
              />
              <div className="field-helper-row">
                <small className={fieldErrors.issue_desc ? 'field-error-text' : ''}>
                  {fieldErrors.issue_desc || 'Nhập ít nhất 10 ký tự.'}
                </small>
                <small>{form.issue_desc.length}/2000</small>
              </div>
            </div>
          </div>
        </div>

        <div className="form-section">
          <div className="form-section-heading">
            <span className="form-section-number">03</span>
            <div>
              <h3>Thông tin bàn giao</h3>
              <p>Ghi nhận trung tâm tiếp nhận và phụ kiện khách hàng gửi kèm.</p>
            </div>
          </div>

          <div className="form-grid">

            <div className="form-field">
              <label htmlFor="center_id">Mã trung tâm bảo hành <span>*</span></label>
              <select
                id="center_id"
                name="center_id"
                value={form.center_id}
                onChange={changeField}
                required
                disabled={lookupsLoading || Boolean(lookupsError) || serviceCenters.length === 0}
              >
                <option value="">
                  {lookupsLoading
                    ? 'Đang tải trung tâm...'
                    : serviceCenters.length === 0
                      ? 'Không có trung tâm hoạt động'
                      : 'Chọn trung tâm bảo hành'}
                </option>
                {serviceCenters.map((center) => (
                  <option
                    key={center.center_id}
                    value={String(center.center_id)}
                  >
                    {center.center_name}
                  </option>
                ))}
              </select>
              <small>Danh sách trung tâm được tải từ hệ thống.</small>
            </div>

            <div className="form-field">
              <label>Phụ kiện đi kèm</label>
              <div className="accessory-options">
                {ACCESSORIES.map((accessory) => (
                  <label className="accessory-option" key={accessory.value}>
                    <input
                      type="checkbox"
                      checked={form.accessories.includes(accessory.value)}
                      onChange={() => toggleAccessory(accessory.value)}
                    />
                    <span>{accessory.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="form-notice">
          <span className="form-notice-icon">i</span>
          <p>
            Mã phiếu, thời điểm tiếp nhận, trạng thái ban đầu và hạn cam kết
            được hệ thống xử lý theo quy tắc nghiệp vụ khi tạo phiếu.
          </p>
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="button button--secondary"
            onClick={onCancel}
            disabled={submitting}
          >
            Hủy
          </button>
          <button
            type="submit"
            className="button button--primary"
            disabled={submitting || customersLoading || Boolean(customersError) || lookupsLoading || Boolean(lookupsError) || issueCategories.length === 0 || serviceCenters.length === 0}
          >
            {submitting ? 'Đang tạo phiếu...' : 'Tạo phiếu bảo hành'}
          </button>
        </div>
      </form>
    </section>
  );
}
