const express = require('express');
const authService = require('../auth/authService');

const router = express.Router();

router.post('/login', (req, res) => {
  const { username, password } = req.body || {};

  if (
    typeof username !== 'string' ||
    typeof password !== 'string' ||
    !username.trim() ||
    !password
  ) {
    return res.status(400).json({
      error: {
        code: 'AUTH_VALIDATION_FAILED',
        message: 'Vui lòng nhập tên đăng nhập và mật khẩu.',
      },
    });
  }

  const session = authService.createSession(username, password);

  if (!session.configured) {
    return res.status(503).json({
      error: {
        code: 'AUTH_NOT_CONFIGURED',
        message: 'Chưa cấu hình xác thực trên máy chủ.',
      },
    });
  }

  if (!session.authenticated) {
    return res.status(401).json({
      error: {
        code: 'AUTH_INVALID_CREDENTIALS',
        message: 'Tên đăng nhập hoặc mật khẩu không chính xác.',
      },
    });
  }

  return res.json({ data: session.data });
});

module.exports = router;
