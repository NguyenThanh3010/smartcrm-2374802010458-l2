const repository = require('../repositories/customerRepository');

function appError(statusCode, code, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.code = code;
  return error;
}

function validateId(id) {
  const value = String(id ?? '');

  if (!/^[1-9]\d*$/.test(value)) {
    throw appError(400, 'INVALID_ID', 'ID phải là số nguyên dương.');
  }

  return value;
}

function validateCustomer(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw appError(400, 'INVALID_BODY', 'Dữ liệu khách hàng không hợp lệ.');
  }

  const full_name =
    typeof input.full_name === 'string' ? input.full_name.trim() : '';
  const phone =
    typeof input.phone === 'string' ? input.phone.trim() : '';
  const address =
    input.address == null ? null :
    typeof input.address === 'string' ? input.address.trim() : undefined;

  if (!full_name || full_name.length > 120) {
    throw appError(
      422,
      'INVALID_FULL_NAME',
      'Họ tên không được để trống và tối đa 120 ký tự.'
    );
  }

  if (!/^0\d{9}$/.test(phone)) {
    throw appError(
      422,
      'INVALID_PHONE',
      'Số điện thoại phải gồm 10 chữ số và bắt đầu bằng 0.'
    );
  }

  if (address === undefined || (address !== null && address.length > 255)) {
    throw appError(
      422,
      'INVALID_ADDRESS',
      'Địa chỉ phải là chuỗi tối đa 255 ký tự hoặc để trống.'
    );
  }

  return { full_name, phone, address };
}

function mapDatabaseError(error) {
  if (error.code === '23505') {
    return appError(409, 'DUPLICATE_VALUE', 'Số điện thoại đã tồn tại.');
  }

  if (error.code === '23503') {
    return appError(
      409,
      'RELATED_RECORD_EXISTS',
      'Không thể xóa khách hàng vì vẫn còn dữ liệu liên quan.'
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
    throw appError(
      400,
      'INVALID_PAGINATION',
      'limit phải từ 1 đến 100 và offset phải là số nguyên không âm.'
    );
  }

  return repository.list({ limit: parsedLimit, offset: parsedOffset });
}

async function getById(id) {
  const customer = await repository.findById(validateId(id));

  if (!customer) {
    throw appError(404, 'CUSTOMER_NOT_FOUND', 'Không tìm thấy khách hàng.');
  }

  return customer;
}

async function getByPhone(phone) {
  if (typeof phone !== 'string' || !/^0\d{9}$/.test(phone.trim())) {
    throw appError(
      422,
      'INVALID_PHONE',
      'Số điện thoại phải gồm 10 chữ số và bắt đầu bằng 0.'
    );
  }

  const customer = await repository.findByPhone(phone.trim());

  if (!customer) {
    throw appError(404, 'CUSTOMER_NOT_FOUND', 'Không tìm thấy khách hàng.');
  }

  return customer;
}

async function create(input) {
  const data = validateCustomer(input);

  try {
    const existing = await repository.findByPhone(data.phone);

    if (existing) {
      throw appError(409, 'PHONE_EXISTS', 'Số điện thoại đã tồn tại.');
    }

    return await repository.create(data);
  } catch (error) {
    throw mapDatabaseError(error);
  }
}

async function update(id, input) {
  const customerId = validateId(id);
  const data = validateCustomer(input);

  const existingCustomer = await repository.findById(customerId);

  if (!existingCustomer) {
    throw appError(404, 'CUSTOMER_NOT_FOUND', 'Không tìm thấy khách hàng.');
  }

  try {
    const phoneOwner = await repository.findByPhone(data.phone);

    if (
      phoneOwner &&
      String(phoneOwner.customer_id) !== String(customerId)
    ) {
      throw appError(409, 'PHONE_EXISTS', 'Số điện thoại đã tồn tại.');
    }

    return await repository.update(customerId, data);
  } catch (error) {
    throw mapDatabaseError(error);
  }
}

async function remove(id) {
  const customerId = validateId(id);
  const existingCustomer = await repository.findById(customerId);

  if (!existingCustomer) {
    throw appError(404, 'CUSTOMER_NOT_FOUND', 'Không tìm thấy khách hàng.');
  }

  try {
    return await repository.remove(customerId);
  } catch (error) {
    throw mapDatabaseError(error);
  }
}

module.exports = {
  list,
  getById,
  getByPhone,
  create,
  update,
  remove,
};
