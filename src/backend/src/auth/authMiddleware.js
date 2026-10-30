const authService = require('./authService');

function sendUnauthorized(res, code, message) {
  return res.status(401).json({
    error: {
      code,
      message,
    },
  });
}

function requireAuth(req, res, next) {
  if (!authService.isConfigured()) {
    return res.status(503).json({
      error: {
        code: 'AUTH_NOT_CONFIGURED',
        message: 'Chưa cấu hình xác thực trên máy chủ.',
      },
    });
  }

  const authorization = req.get('Authorization') || '';
  const match = authorization.match(/^Bearer\s+(\S+)$/i);

  if (!match) {
    return sendUnauthorized(
      res,
      'AUTH_REQUIRED',
      'Vui lòng đăng nhập để tiếp tục.'
    );
  }

  const payload = authService.verifyToken(match[1]);

  if (!payload) {
    return sendUnauthorized(
      res,
      'AUTH_TOKEN_INVALID',
      'Phiên đăng nhập không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại.'
    );
  }

  req.auth = {
    username: payload.sub,
  };

  return next();
}

module.exports = requireAuth;
