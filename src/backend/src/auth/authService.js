
const crypto = require('node:crypto');
const bcrypt = require('bcryptjs');
const userRepository = require('../repositories/userRepository');

const TOKEN_LIFETIME_SECONDS = 8 * 60 * 60;

function getConfig() {
  const secret = process.env.AUTH_TOKEN_SECRET;

  if (
    !secret ||
    Buffer.byteLength(secret, 'utf8') < 32
  ) {
    return null;
  }

  return { secret };
}

function safeEqual(left, right) {
  const a = Buffer.from(String(left));
  const b = Buffer.from(String(right));

  if (a.length !== b.length) return false;

  return crypto.timingSafeEqual(a, b);
}

function sign(payloadPart, secret) {
  return crypto
    .createHmac('sha256', secret)
    .update(payloadPart)
    .digest('base64url');
}

function isConfigured() {
  return getConfig() !== null;
}

async function createSession(username, password) {
  const config = getConfig();

  if (!config) {
    return { configured: false };
  }

  const account = await userRepository.findByUsername(username);

  if (!account || !account.is_active) {
    return {
      configured: true,
      authenticated: false,
    };
  }

  const passwordMatches = await bcrypt.compare(
    password,
    account.password_hash,
  );

  if (!passwordMatches) {
    return {
      configured: true,
      authenticated: false,
    };
  }

  const issuedAt = Math.floor(Date.now() / 1000);
  const expiresAt = issuedAt + TOKEN_LIFETIME_SECONDS;

  const userId = String(account.user_id);

  const payload = {
    id: userId,
    username: account.username,
    role: account.role,
    iat: issuedAt,
    exp: expiresAt,
  };

  const payloadPart = Buffer
    .from(JSON.stringify(payload))
    .toString('base64url');

  const signature = sign(payloadPart, config.secret);

  return {
    configured: true,
    authenticated: true,
    data: {
      token: `${payloadPart}.${signature}`,
      token_type: 'Bearer',
      expires_at: new Date(expiresAt * 1000).toISOString(),
      user: {
        id: userId,
        username: account.username,
        role: account.role,
      },
    },
  };
}

function verifyToken(token) {
  const config = getConfig();

  if (!config || typeof token !== 'string') return null;

  const parts = token.split('.');

  if (parts.length !== 2 || !parts[0] || !parts[1]) {
    return null;
  }

  const [payloadPart, suppliedSignature] = parts;
  const expectedSignature = sign(payloadPart, config.secret);

  if (!safeEqual(suppliedSignature, expectedSignature)) {
    return null;
  }

  try {
    const payload = JSON.parse(
      Buffer.from(payloadPart, 'base64url').toString('utf8'),
    );

    const now = Math.floor(Date.now() / 1000);

    if (
      typeof payload.id !== 'string' ||
      !/^[1-9]\d*$/.test(payload.id) ||
      typeof payload.username !== 'string' ||
      !payload.username ||
      !['ADMIN', 'STAFF'].includes(payload.role) ||
      !Number.isInteger(payload.iat) ||
      !Number.isInteger(payload.exp) ||
      payload.iat > now + 60 ||
      payload.exp <= now ||
      payload.exp <= payload.iat
    ) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

module.exports = {
  isConfigured,
  createSession,
  verifyToken,
};