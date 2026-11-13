const crypto = require('node:crypto');

function loadKey(name) {
  const encoded = process.env[name];

  if (!encoded) {
    throw new Error(`${name} chưa được cấu hình.`);
  }

  const key = Buffer.from(encoded, 'base64');

  if (
    key.length !== 32 ||
    key.toString('base64') !== encoded
  ) {
    throw new Error(`${name} phải là khóa Base64 dài 32 byte.`);
  }

  return key;
}

function encryptValue(value) {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value !== 'string') {
    throw new TypeError('Dữ liệu cần mã hóa phải là chuỗi.');
  }

  const key = loadKey('DATA_ENCRYPTION_KEY');
  const iv = crypto.randomBytes(12);

  const cipher = crypto.createCipheriv(
    'aes-256-gcm',
    key,
    iv
  );

  const encrypted = Buffer.concat([
    cipher.update(value, 'utf8'),
    cipher.final(),
  ]);

  const authTag = cipher.getAuthTag();

  return [
    'enc',
    'v1',
    iv.toString('base64'),
    authTag.toString('base64'),
    encrypted.toString('base64'),
  ].join(':');
}

function decryptValue(value) {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value !== 'string') {
    throw new TypeError('Dữ liệu cần giải mã không hợp lệ.');
  }

  const parts = value.split(':');

  if (parts.length !== 5 || parts[0] !== 'enc' || parts[1] !== 'v1') {
    throw new Error('Dữ liệu không đúng định dạng mã hóa.');
  }

  const iv = Buffer.from(parts[2], 'base64');
  const authTag = Buffer.from(parts[3], 'base64');
  const encrypted = Buffer.from(parts[4], 'base64');

  if (iv.length !== 12 || authTag.length !== 16) {
    throw new Error('Thông tin mã hóa không hợp lệ.');
  }

  const key = loadKey('DATA_ENCRYPTION_KEY');

  const decipher = crypto.createDecipheriv(
    'aes-256-gcm',
    key,
    iv
  );

  decipher.setAuthTag(authTag);

  const decrypted = Buffer.concat([
    decipher.update(encrypted),
    decipher.final(),
  ]);

  return decrypted.toString('utf8');
}

function phoneLookupHash(phone) {
  if (typeof phone !== 'string') {
    throw new TypeError('Số điện thoại không hợp lệ.');
  }

  const key = loadKey('PHONE_LOOKUP_KEY');

  return crypto
    .createHmac('sha256', key)
    .update(phone.trim(), 'utf8')
    .digest('hex');
}

module.exports = {
  encryptValue,
  decryptValue,
  phoneLookupHash,
};