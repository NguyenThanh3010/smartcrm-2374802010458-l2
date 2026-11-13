function requireAdmin(req, res, next) {
  if (req.auth?.role !== 'ADMIN') {
    return res.status(403).json({
      error: {
        code: 'ADMIN_REQUIRED',
        message: 'Bạn không có quyền thực hiện thao tác này.',
      },
    });
  }

  return next();
}

module.exports = requireAdmin;