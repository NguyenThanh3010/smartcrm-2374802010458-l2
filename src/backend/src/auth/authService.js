const crypto = require('node:crypto');

const TOKEN_LIFETIME_SECONDS = 8 * 60 * 60;

function getConfig() {
  const { AUTH_USERNAME, AUTH_PASSWORD, AUTH_TOKEN_SECRET } = process.env;

  if (!AUTH_USERNAME || !AUTH_PASSWORD || !AUTH_TOKEN_SECRET) {
    return null;
  }

  return {
    username: AUTH_USERNAME,
    password: AUTH_PASSWORD,
    secret: AUTH_TOKEN_SECRET,
  };
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

function createSession(username, password) {
  const config = getConfig();

  if (!config) {
    return { configured: false };
  }

  if (
    !safeEqual(username, config.username) ||
    !safeEqual(password, config.password)
  ) {
    return { configured: true, authenticated: false };
  }

  const issuedAt = Math.floor(Date.now() / 1000);
  const expiresAt = issuedAt + TOKEN_LIFETIME_SECONDS;

  const payload = {
    sub: config.username,
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
        username: config.username,
      },
    },
  };
}

function verifyToken(token) {
  const config = getConfig();
  if (!config || typeof token !== 'string') return null;

  const parts = token.split('.');
  if (parts.length !== 2 || !parts[0] || !parts[1]) return null;

  const [payloadPart, suppliedSignature] = parts;
  const expectedSignature = sign(payloadPart, config.secret);

  if (!safeEqual(suppliedSignature, expectedSignature)) return null;

  try {
    const payload = JSON.parse(
      Buffer.from(payloadPart, 'base64url').toString('utf8')
    );

    const now = Math.floor(Date.now() / 1000);

    if (
      payload.sub !== config.username ||
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
