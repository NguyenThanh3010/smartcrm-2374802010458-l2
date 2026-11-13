const bcrypt = require('bcryptjs');
const repository = require('../repositories/userRepository');

function appError(code, message) {
  const error = new Error(message);
  error.code = code;
  return error;
}

async function createStaff(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw appError('INVALID_BODY', 'Dữ liệu tài khoản không hợp lệ.');
  }

  const username =
    typeof input.username === 'string'
      ? input.username.trim()
      : '';

  const password =
    typeof input.password === 'string'
      ? input.password
      : '';

  if (
    !/^[a-zA-Z0-9._-]{3,50}$/.test(username)
  ) {
    throw appError(
      'INVALID_USERNAME',
      'Tên đăng nhập phải từ 3 đến 50 ký tự, chỉ gồm chữ, số, dấu chấm, gạch dưới hoặc gạch ngang.'
    );
  }

  if (
    password.length < 8 ||
    Buffer.byteLength(password, 'utf8') > 72
  ) {
    throw appError(
      'INVALID_PASSWORD',
      'Mật khẩu phải có ít nhất 8 ký tự và tối đa 72 byte.'
    );
  }

  const passwordHash = await bcrypt.hash(password, 12);

  try {
    return await repository.create({
      username,
      passwordHash,
      role: 'STAFF',
    });
  } catch (error) {
    if (error.code === '23505') {
      throw appError(
        'USERNAME_EXISTS',
        'Tên đăng nhập đã được sử dụng.'
      );
    }

    throw error;
  }
}

module.exports = {
  createStaff,
};