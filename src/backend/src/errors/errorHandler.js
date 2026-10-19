function errorHandler(error, req, res, next) {
  if (res.headersSent) {
    return next(error);
  }

  // JSON sai cú pháp gửi tới express.json()
  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({
      error: {
        code: 'INVALID_JSON',
        message: 'Nội dung JSON không hợp lệ.',
      },
    });
  }

  const statusCode =
    Number.isInteger(error.statusCode) &&
    error.statusCode >= 400 &&
    error.statusCode <= 599
      ? error.statusCode
      : 500;

  if (statusCode >= 500) {
    console.error('[API ERROR]', error);
  }

  const body = {
    code:
      statusCode === 500
        ? 'INTERNAL_SERVER_ERROR'
        : error.code || 'REQUEST_ERROR',
    message:
      statusCode === 500
        ? 'Đã xảy ra lỗi nội bộ.'
        : error.message,
  };

  if (
    statusCode !== 500 &&
    error.fields &&
    typeof error.fields === 'object'
  ) {
    body.fields = error.fields;
  }

  return res.status(statusCode).json({ error: body });
}

module.exports = errorHandler;
