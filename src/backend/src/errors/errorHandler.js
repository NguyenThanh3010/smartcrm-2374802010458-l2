const HTTP_STATUS_BY_ERROR_CODE = Object.freeze({
  INVALID_ID: 400,
  INVALID_BODY: 400,
  INVALID_PAGINATION: 400,
  VALIDATION_FAILED: 400,
  INVALID_USERNAME: 400,
  INVALID_PASSWORD: 400,

  INVALID_FULL_NAME: 422,
  INVALID_PHONE: 422,
  INVALID_ADDRESS: 422,
  WARRANTY_APPROVAL_REQUIRED: 422,

  CUSTOMER_NOT_FOUND: 404,
  TICKET_NOT_FOUND: 404,
  RESOURCE_NOT_FOUND: 404,

  PHONE_EXISTS: 409,
  DUPLICATE_VALUE: 409,
  USERNAME_EXISTS: 409,
  RELATED_RECORD_EXISTS: 409,
  ACTIVE_TICKET_EXISTS: 409,
  TICKET_CANCELLED: 409,
  TICKET_NOT_EDITABLE: 409,
  TICKET_CANNOT_BE_CANCELLED: 409,
});

function getHttpStatus(error) {
  if (error?.code && Object.prototype.hasOwnProperty.call(HTTP_STATUS_BY_ERROR_CODE, error.code)) {
    return HTTP_STATUS_BY_ERROR_CODE[error.code];
  }

  // Tuong thich voi loi tu Express hoac middleware.
  if (
    Number.isInteger(error?.statusCode) &&
    error.statusCode >= 400 &&
    error.statusCode <= 599
  ) {
    return error.statusCode;
  }

  return 500;
}

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

  const statusCode = getHttpStatus(error);
  const isServerError = statusCode >= 500;
  if (isServerError) {
    console.error('[API ERROR]', {
      name: error.name,
      code: error.code || 'UNKNOWN',
      statusCode,
    });
  }

  const body = {
    code:
      isServerError
        ? 'INTERNAL_SERVER_ERROR'
        : error.code || 'REQUEST_ERROR',
    message:
      isServerError
        ? 'Đã xảy ra lỗi nội bộ.'
        : error.message,
  };

  if (
    !isServerError &&
    error.fields &&
    typeof error.fields === 'object'
  ) {
    body.fields = error.fields;
  }

  return res.status(statusCode).json({ error: body });
}

module.exports = errorHandler;
module.exports.getHttpStatus = getHttpStatus;
