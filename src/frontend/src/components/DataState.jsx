export default function DataState({
  loading = false,
  error = null,
  empty = false,
  emptyTitle = 'Chưa có dữ liệu',
  emptyMessage = 'Hiện chưa có dữ liệu để hiển thị.',
  onRetry,
  children,
}) {
  if (loading) {
    return (
      <section className="data-state" role="status" aria-live="polite">
        <span className="loading-spinner" aria-hidden="true" />
        <h3>Đang tải dữ liệu...</h3>
        <p>Vui lòng chờ trong giây lát.</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="data-state data-state--error" role="alert">
        <h3>Không thể tải dữ liệu</h3>
        <p>{error.message || 'Đã xảy ra lỗi khi kết nối với máy chủ.'}</p>
        {onRetry && (
          <button className="button button--primary" type="button" onClick={onRetry}>
            Thử lại
          </button>
        )}
      </section>
    );
  }

  if (empty) {
    return (
      <section className="data-state" role="status">
        <h3>{emptyTitle}</h3>
        <p>{emptyMessage}</p>
      </section>
    );
  }

  return children;
}
