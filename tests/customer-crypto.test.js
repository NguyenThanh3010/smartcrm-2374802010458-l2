const { test } = require('node:test');
const assert = require('node:assert/strict');

process.env.DATA_ENCRYPTION_KEY =
  Buffer.alloc(32, 1).toString('base64');

process.env.PHONE_LOOKUP_KEY =
  Buffer.alloc(32, 2).toString('base64');

const {
  encryptValue,
  decryptValue,
  phoneLookupHash,
} = require('../src/backend/src/security/customerCrypto');

test('Mã hóa và giải mã dữ liệu tiếng Việt', () => {
  const original = 'Nguyễn Minh Anh';
  const encrypted = encryptValue(original);

  assert.notEqual(encrypted, original);
  assert.equal(decryptValue(encrypted), original);
});

test('Mỗi lần mã hóa tạo ra ciphertext khác nhau', () => {
  const first = encryptValue('0901234567');
  const second = encryptValue('0901234567');

  assert.notEqual(first, second);
  assert.equal(decryptValue(first), '0901234567');
  assert.equal(decryptValue(second), '0901234567');
});

test('Hỗ trợ giá trị null', () => {
  assert.equal(encryptValue(null), null);
  assert.equal(decryptValue(null), null);
});

test('Từ chối dữ liệu bị chỉnh sửa', () => {
  const encrypted = encryptValue('Dia chi kiem thu');
  const parts = encrypted.split(':');

  parts[4] = Buffer.from('Du lieu bi sua').toString('base64');

  assert.throws(() => decryptValue(parts.join(':')));
});

test('Mã HMAC của cùng số điện thoại luôn giống nhau', () => {
  const first = phoneLookupHash('0901234567');
  const second = phoneLookupHash('0901234567');

  assert.equal(first, second);
  assert.match(first, /^[a-f0-9]{64}$/);
  assert.notEqual(first, '0901234567');
});