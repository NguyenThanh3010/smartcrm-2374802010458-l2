const repository = require('../repositories/ticketRepository');

const ALLOWED_PRIORITIES = ['CAO', 'TRUNG_BINH', 'THAP'];
const ALLOWED_ACCESSORIES = ['SAC', 'TAI_NGHE', 'HOP', 'KHAC'];

const BUSINESS_DAYS_BY_PRIORITY = Object.freeze({
  CAO: 1,
  TRUNG_BINH: 3,
  THAP: 5,
});

const vietnamWeekdayFormatter = new Intl.DateTimeFormat('en-US', {
  timeZone: 'Asia/Ho_Chi_Minh',
  weekday: 'short',
});

function calculateDueDate(receivedAt, priority) {
  const businessDays = BUSINESS_DAYS_BY_PRIORITY[priority];

  if (!businessDays) {
    throw new Error('Mức ưu tiên không hợp lệ khi tính hạn cam kết.');
  }

  const dueDate = new Date(receivedAt);

  if (Number.isNaN(dueDate.getTime())) {
    throw new TypeError('Thời điểm tiếp nhận không hợp lệ.');
  }

  let remainingDays = businessDays;

  while (remainingDays > 0) {
    dueDate.setTime(dueDate.getTime() + 24 * 60 * 60 * 1000);

    const weekday = vietnamWeekdayFormatter.format(dueDate);

    if (weekday !== 'Sun') {
      remainingDays -= 1;
    }
  }

  return dueDate;
}
function appError(statusCode, code, message, fields = {}) {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.code = code;
  error.fields = fields;
  return error;
}

function validationError(fields) {
  return appError(
    400,
    'VALIDATION_FAILED',
    'Dữ liệu không hợp lệ',
    fields
  );
}

function validateId(value, fieldName) {
  const text = String(value ?? '');

  if (!/^[1-9]\d*$/.test(text)) {
    throw validationError({
      [fieldName]: 'Phải là số nguyên dương',
    });
  }

  return text;
}

function validateTicketInput(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw validationError({
      body: 'Dữ liệu yêu cầu phải là một đối tượng JSON',
    });
  }

  const fields = {};

  let customer_id;
  let device_id;
  let center_id;
  let category_id;

  try {
    customer_id = validateId(input.customer_id, 'customer_id');
  } catch {
    fields.customer_id = 'Mã khách hàng phải là số nguyên dương';
  }

  try {
    device_id = validateId(input.device_id, 'device_id');
  } catch {
    fields.device_id = 'Mã thiết bị phải là số nguyên dương';
  }

  try {
    center_id = validateId(input.center_id, 'center_id');
  } catch {
    fields.center_id = 'Mã trung tâm phải là số nguyên dương';
  }

  try {
    category_id = validateId(input.category_id, 'category_id');
  } catch {
    fields.category_id = 'Mã nhóm sự cố phải là số nguyên dương';
  }

  const issue_desc =
    typeof input.issue_desc === 'string' ? input.issue_desc.trim() : '';

  if (issue_desc.length < 10 || issue_desc.length > 2000) {
    fields.issue_desc =
      'Mô tả lỗi bắt buộc, phải có từ 10 đến 2000 ký tự';
  }

  const priority = input.priority;

  if (!ALLOWED_PRIORITIES.includes(priority)) {
    fields.priority = 'Mức ưu tiên phải là CAO, TRUNG_BINH hoặc THAP';
  }

  let accessories = null;

  if (input.accessories !== undefined && input.accessories !== null) {
    if (!Array.isArray(input.accessories)) {
      fields.accessories = 'Phụ kiện phải là một mảng';
    } else if (
      input.accessories.some(
        item => typeof item !== 'string' ||
          !ALLOWED_ACCESSORIES.includes(item)
      )
    ) {
      fields.accessories =
        'Phụ kiện chỉ gồm SAC, TAI_NGHE, HOP hoặc KHAC';
    } else {
      accessories = input.accessories;
    }
  }

  if (Object.keys(fields).length > 0) {
    throw validationError(fields);
  }

  return {
    customer_id,
    device_id,
    center_id,
    category_id,
    issue_desc,
    priority,
    accessories,
  };
}

function getDateText(value) {
  if (!value) return null;
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value).slice(0, 10);
}

function addMonthsToDate(dateText, months) {
  const [year, month, day] = dateText.split('-').map(Number);

  const targetMonth = new Date(Date.UTC(year, month - 1 + months, 1));
  const lastDay = new Date(Date.UTC(
    targetMonth.getUTCFullYear(),
    targetMonth.getUTCMonth() + 1,
    0
  )).getUTCDate();

  const result = new Date(Date.UTC(
    targetMonth.getUTCFullYear(),
    targetMonth.getUTCMonth(),
    Math.min(day, lastDay)
  ));

  return result.toISOString().slice(0, 10);
}

function getTodayInVietnam() {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date());

  const values = Object.fromEntries(parts.map(part => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

function mapDatabaseError(error) {
  if (error.code === '23505') {
    return appError(
      409,
      'DUPLICATE_VALUE',
      'Dữ liệu bị trùng với bản ghi đã tồn tại'
    );
  }

  if (error.code === '23503') {
    return appError(
      404,
      'RESOURCE_NOT_FOUND',
      'Không tìm thấy dữ liệu được tham chiếu'
    );
  }

  return error;
}

async function list({ limit = 50, offset = 0 } = {}) {
  const parsedLimit = Number(limit);
  const parsedOffset = Number(offset);

  if (
    !Number.isInteger(parsedLimit) ||
    parsedLimit < 1 ||
    parsedLimit > 100 ||
    !Number.isInteger(parsedOffset) ||
    parsedOffset < 0
  ) {
    throw validationError({
      pagination: 'limit từ 1 đến 100; offset là số nguyên không âm',
    });
  }

  return repository.list({ limit: parsedLimit, offset: parsedOffset });
}

async function getById(id) {
  const ticketId = validateId(id, 'id');
  const ticket = await repository.findById(ticketId);

  if (!ticket) {
    throw appError(
      404,
      'TICKET_NOT_FOUND',
      'Không tìm thấy phiếu bảo hành',
      { id: 'Không tìm thấy phiếu bảo hành' }
    );
  }

  return ticket;
}

async function create(input) {
  const data = validateTicketInput(input);

  const customer = await repository.findCustomer(data.customer_id);

  if (!customer) {
    throw appError(
      404,
      'RESOURCE_NOT_FOUND',
      'Không tìm thấy khách hàng hoặc thiết bị được tham chiếu',
      { customer_id: 'Không tìm thấy khách hàng' }
    );
  }

  const device = await repository.findDevice(data.device_id);

  if (!device) {
    throw appError(
      404,
      'RESOURCE_NOT_FOUND',
      'Không tìm thấy khách hàng hoặc thiết bị được tham chiếu',
      { device_id: 'Không tìm thấy thiết bị' }
    );
  }

  if (String(device.customer_id) !== String(data.customer_id)) {
    throw validationError({
      device_id: 'Thiết bị không thuộc về khách hàng đã chọn',
    });
  }

  const category = await repository.findCategory(data.category_id);

  if (!category || !category.is_active) {
    throw validationError({
      category_id: 'Nhóm sự cố không hợp lệ hoặc đã ngừng hoạt động',
    });
  }

  const center = await repository.findServiceCenter(data.center_id);

  if (!center || !center.is_active) {
    throw validationError({
      center_id: 'Trung tâm bảo hành không hợp lệ hoặc đã ngừng hoạt động',
    });
  }

  const activeTicket = await repository.findOpenByDevice(data.device_id);

  if (activeTicket) {
    throw appError(
      409,
      'ACTIVE_TICKET_EXISTS',
      'Thiết bị đang có phiếu bảo hành chưa đóng',
      { device_id: 'Thiết bị đã có phiếu bảo hành đang xử lý' }
    );
  }

  // Chỉ xác định hết hạn khi thiết bị có ngày mua.
  // Hệ thống hiện chưa có trường/bảng ghi nhận phê duyệt bảo hành.
  const purchaseDate = getDateText(device.purchase_date);

  if (purchaseDate && Number.isInteger(Number(device.warranty_months))) {
    const expiresOn = addMonthsToDate(
      purchaseDate,
      Number(device.warranty_months)
    );

    if (getTodayInVietnam() > expiresOn) {
      throw appError(
        422,
        'WARRANTY_APPROVAL_REQUIRED',
        'Thiết bị đã hết thời hạn bảo hành và chưa có phê duyệt',
        {
          device_id: 'Cần quản lý phê duyệt trước khi tiếp tục xử lý',
        }
      );
    }
  }

  try {
    const receivedAt = new Date();
    const dueDate = calculateDueDate(receivedAt, data.priority);

    return await repository.create({
      ...data,
      received_at: receivedAt,
      due_date: dueDate,
    });
  } catch (error) {
    throw mapDatabaseError(error);
  }
}

async function update(id, input) {
  const ticketId = validateId(id, 'id');
  const current = await repository.findById(ticketId);

  if (!current) {
    throw appError(
      404,
      'TICKET_NOT_FOUND',
      'Không tìm thấy phiếu bảo hành',
      { id: 'Không tìm thấy phiếu bảo hành' }
    );
  }

  if (current.status === 'HUY') {
    throw appError(
      409,
      'TICKET_CANCELLED',
      'Không thể cập nhật phiếu đã hủy'
    );
  }

  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw validationError({ body: 'Dữ liệu cập nhật không hợp lệ' });
  }

  const merged = {
    center_id: Object.hasOwn(input, 'center_id')
      ? input.center_id : current.center_id,
    category_id: Object.hasOwn(input, 'category_id')
      ? input.category_id : current.category_id,
    issue_desc: Object.hasOwn(input, 'issue_desc')
      ? input.issue_desc : current.issue_desc,
    priority: Object.hasOwn(input, 'priority')
      ? input.priority : current.priority,
    due_date: Object.hasOwn(input, 'due_date')
      ? input.due_date : current.due_date,
    accessories: Object.hasOwn(input, 'accessories')
      ? input.accessories : current.accessories,
  };

  const fields = {};
  let center_id;
  let category_id;

  try {
    center_id = validateId(merged.center_id, 'center_id');
  } catch {
    fields.center_id = 'Mã trung tâm phải là số nguyên dương';
  }

  try {
    category_id = validateId(merged.category_id, 'category_id');
  } catch {
    fields.category_id = 'Mã nhóm sự cố phải là số nguyên dương';
  }

  const issue_desc =
    typeof merged.issue_desc === 'string' ? merged.issue_desc.trim() : '';

  if (issue_desc.length < 10 || issue_desc.length > 2000) {
    fields.issue_desc =
      'Mô tả lỗi bắt buộc, phải có từ 10 đến 2000 ký tự';
  }

  if (!ALLOWED_PRIORITIES.includes(merged.priority)) {
    fields.priority = 'Mức ưu tiên không hợp lệ';
  }

  const dueDate = new Date(merged.due_date);

  if (!merged.due_date || Number.isNaN(dueDate.getTime())) {
    fields.due_date = 'Hạn xử lý phải là ngày giờ hợp lệ';
  }

  if (
    merged.accessories !== null &&
    merged.accessories !== undefined &&
    (
      !Array.isArray(merged.accessories) ||
      merged.accessories.some(
        item => typeof item !== 'string' ||
          !ALLOWED_ACCESSORIES.includes(item)
      )
    )
  ) {
    fields.accessories = 'Danh sách phụ kiện không hợp lệ';
  }

  if (Object.keys(fields).length > 0) {
    throw validationError(fields);
  }

  const [category, center] = await Promise.all([
    repository.findCategory(category_id),
    repository.findServiceCenter(center_id),
  ]);

  if (!category || !category.is_active) {
    throw validationError({ category_id: 'Nhóm sự cố không hợp lệ' });
  }

  if (!center || !center.is_active) {
    throw validationError({ center_id: 'Trung tâm không hợp lệ' });
  }

  try {
    const updated = await repository.update(ticketId, {
      center_id,
      category_id,
      issue_desc,
      priority: merged.priority,
      due_date: dueDate.toISOString(),
      accessories: merged.accessories ?? null,
    });

    if (!updated) {
      throw appError(409, 'TICKET_NOT_EDITABLE', 'Phiếu không thể cập nhật');
    }

    return updated;
  } catch (error) {
    throw mapDatabaseError(error);
  }
}

async function cancel(id) {
  const ticketId = validateId(id, 'id');
  const current = await repository.findById(ticketId);

  if (!current) {
    throw appError(
      404,
      'TICKET_NOT_FOUND',
      'Không tìm thấy phiếu bảo hành',
      { id: 'Không tìm thấy phiếu bảo hành' }
    );
  }

  if (current.status !== 'MOI') {
    throw appError(
      409,
      'TICKET_CANNOT_BE_CANCELLED',
      'Chỉ có thể hủy phiếu đang ở trạng thái MOI'
    );
  }

  const cancelled = await repository.cancel(ticketId);

  if (!cancelled) {
    throw appError(
      409,
      'TICKET_CANNOT_BE_CANCELLED',
      'Phiếu không thể hủy ở trạng thái hiện tại'
    );
  }

  return cancelled;
}

module.exports = {
  calculateDueDate,
  list,
  getById,
  create,
  update,
  cancel,
};
