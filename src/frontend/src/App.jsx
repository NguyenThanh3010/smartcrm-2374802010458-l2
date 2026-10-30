import { useCallback, useEffect, useMemo, useState } from 'react';
import ticketsApi from './api/tickets.api.js';
import DataState from './components/DataState.jsx';
import TicketCreateForm from './components/TicketCreateForm.jsx';
import Login from './components/Login.jsx';
import './App.css';

const STATUS_LABELS = {
  MOI: 'Mới tiếp nhận',
  DANG_KIEM_TRA: 'Đang kiểm tra',
  DANG_SUA: 'Đang sửa chữa',
  CHO_LINH_KIEN: 'Chờ linh kiện',
  HOAN_TAT: 'Hoàn tất',
  TU_CHOI: 'Từ chối',
  DA_HUY: 'Đã hủy',
};

const PRIORITY_LABELS = {
  CAO: 'Cao',
  TRUNG_BINH: 'Trung bình',
  THAP: 'Thấp',
};

function formatDate(value) {
  if (!value) return '—';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';

  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function statusClass(status) {
  if (status === 'HOAN_TAT') return 'status-badge status-badge--success';
  if (status === 'TU_CHOI' || status === 'DA_HUY') {
    return 'status-badge status-badge--muted';
  }
  if (status === 'CHO_LINH_KIEN') return 'status-badge status-badge--warning';
  return 'status-badge status-badge--info';
}

function App() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => Boolean(sessionStorage.getItem('smartcrm_token')),
  );
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem('smartcrm_user') || 'null');
    } catch {
      return null;
    }
  });
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState(null);

  // Tai du lieu sau khi API phan hoi.
  const loadTickets = useCallback(async () => {
    try {
      const data = await ticketsApi.list();
      setTickets(data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Su dung cho thao tac tai lai va thu lai khi gap loi.
  const refreshTickets = useCallback(async () => {
    setLoading(true);
    setError(null);
    await loadTickets();
  }, [loadTickets]);

  useEffect(() => {
    if (!isAuthenticated) return undefined;

    let isActive = true;

    Promise.resolve().then(() => {
      if (isActive) {
        void loadTickets();
      }
    });

    return () => {
      isActive = false;
    };
  }, [loadTickets, isAuthenticated]);

  useEffect(() => {
    function handleUnauthorized() {
      sessionStorage.removeItem('smartcrm_token');
      sessionStorage.removeItem('smartcrm_user');
      setIsAuthenticated(false);
      setCurrentUser(null);
      setTickets([]);
      setError(null);
      setShowCreateForm(false);
      setSelectedTicket(null);
      setSelectedTicketId(null);
      setDetailError(null);
    }

    window.addEventListener('smartcrm:unauthorized', handleUnauthorized);

    return () => {
      window.removeEventListener('smartcrm:unauthorized', handleUnauthorized);
    };
  }, []);
  async function openTicketDetail(ticketId) {
    setSelectedTicketId(ticketId);
    setSelectedTicket(null);
    setDetailError(null);
    setDetailLoading(true);

    try {
      const data = await ticketsApi.getById(ticketId);
      setSelectedTicket(data);
    } catch (err) {
      setDetailError(err);
    } finally {
      setDetailLoading(false);
    }
  }

  function closeTicketDetail() {
    setSelectedTicket(null);
    setSelectedTicketId(null);
    setDetailError(null);
    setDetailLoading(false);
  }

  const visibleTickets = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLocaleLowerCase('vi');

    return tickets.filter((ticket) => {
      const matchesKeyword =
        !normalizedKeyword ||
        [ticket.ticket_code, ticket.issue_desc, String(ticket.ticket_id ?? '')]
          .some((value) => String(value ?? '').toLocaleLowerCase('vi').includes(normalizedKeyword));

      const matchesStatus =
        statusFilter === 'ALL' || ticket.status === statusFilter;

      return matchesKeyword && matchesStatus;
    });
  }, [tickets, keyword, statusFilter]);

  const openCount = tickets.filter(
    (ticket) => !['HOAN_TAT', 'TU_CHOI', 'DA_HUY'].includes(ticket.status),
  ).length;

  const highPriorityCount = tickets.filter(
    (ticket) => ticket.priority === 'CAO',
  ).length;

  const waitingPartsCount = tickets.filter(
    (ticket) => ticket.status === 'CHO_LINH_KIEN',
  ).length;

  const emptyTitle = tickets.length > 0
    ? 'Không tìm thấy phiếu phù hợp'
    : 'Chưa có phiếu bảo hành';

  const emptyMessage = tickets.length > 0
    ? 'Hãy thử thay đổi từ khóa hoặc bộ lọc trạng thái.'
    : 'Dữ liệu phiếu bảo hành sẽ xuất hiện ở đây khi có bản ghi.';

  function handleLogout() {
    sessionStorage.removeItem('smartcrm_token');
    sessionStorage.removeItem('smartcrm_user');
    setIsAuthenticated(false);
    setCurrentUser(null);
    setTickets([]);
    setError(null);
    setShowCreateForm(false);
    setSelectedTicket(null);
    setSelectedTicketId(null);
    setDetailError(null);
  }

  if (!isAuthenticated) {
    return (
      <Login
        onLogin={(user) => {
          setCurrentUser(user);
          setLoading(true);
          setError(null);
          setIsAuthenticated(true);
        }}
      />
    );
  }

  if (showCreateForm) {
    return (
      <div className="app-shell">
        <aside className="sidebar">
          <div className="brand">
            <div className="brand-mark">M</div>
            <div>
              <strong>MEKONG MOBILE</strong>
              <span>SMART CRM</span>
            </div>
          </div>
          <div className="sidebar-section-label">NGHIỆP VỤ</div>
          <div className="nav-item nav-item--active">
            <span className="nav-icon">▦</span>
            <span>Phiếu bảo hành</span>
            <span className="nav-count">{tickets.length}</span>
          </div>
          <div className="sidebar-bottom">
            <div className="sidebar-avatar">L2</div>
            <div>
              <strong>Tiếp nhận bảo hành</strong>
              <span>Luồng nghiệp vụ L02</span>
            </div>
          </div>
        </aside>

        <main className="main-content">
          <header className="topbar">
            <div className="breadcrumb">
              <span>Smart CRM</span>
              <span className="breadcrumb-separator">/</span>
              <button
                type="button"
                className="breadcrumb-button"
                onClick={() => setShowCreateForm(false)}
              >
                Phiếu bảo hành
              </button>
              <span className="breadcrumb-separator">/</span>
              <strong>Tiếp nhận mới</strong>
            </div>
            <div className="connection-label">
              <span className="connection-dot" />
              Khu vực tiếp nhận
            </div>
          <button className="button button--logout" type="button" onClick={handleLogout}>Đăng xuất ({currentUser?.username || 'admin'})</button>
          </header>

          <section className="page-content">
            <div className="page-heading">
              <div>
                <div className="eyebrow">INTAKE / L02</div>
                <h1>Tiếp nhận phiếu mới</h1>
                <p className="page-subtitle">
                  Ghi nhận thông tin khách hàng, thiết bị và sự cố bảo hành.
                </p>
              </div>
            </div>

            <TicketCreateForm
              onCancel={() => setShowCreateForm(false)}
              onCreated={async (createdTicket) => {
                setShowCreateForm(false);
                await refreshTickets();
                const createdId = createdTicket?.ticket_id ?? createdTicket?.id;
                if (createdId != null) {
                  await openTicketDetail(createdId);
                }
              }}
            />

            <footer className="page-footer">
              <span>Smart CRM · Mekong Mobile</span>
              <span>Luồng L02 — Tiếp nhận và phân loại yêu cầu bảo hành</span>
            </footer>
          </section>
        </main>
      </div>
    );
  }
  if (selectedTicket || detailLoading || detailError) {
    const detail = selectedTicket;
    const accessoriesText =
      detail && Array.isArray(detail.accessories) && detail.accessories.length > 0
        ? detail.accessories
            .map((item) => ({ SAC: 'Sạc', HOP: 'Hộp' }[item] || item))
            .join(' · ')
        : 'Không ghi nhận';

    return (
      <div className="app-shell">
        <aside className="sidebar">
          <div className="brand">
            <div className="brand-mark">M</div>
            <div>
              <strong>MEKONG MOBILE</strong>
              <span>SMART CRM</span>
            </div>
          </div>

          <div className="sidebar-section-label">NGHIỆP VỤ</div>
          <div className="nav-item nav-item--active">
            <span className="nav-icon">▦</span>
            <span>Phiếu bảo hành</span>
            <span className="nav-count">{tickets.length}</span>
          </div>

          <div className="sidebar-bottom">
            <div className="sidebar-avatar">L2</div>
            <div>
              <strong>Tiếp nhận bảo hành</strong>
              <span>Luồng nghiệp vụ L02</span>
            </div>
          </div>
        </aside>

        <main className="main-content">
          <header className="topbar">
            <div className="breadcrumb">
              <span>Smart CRM</span>
              <span className="breadcrumb-separator">/</span>
              <button
                className="breadcrumb-button"
                type="button"
                onClick={closeTicketDetail}
              >
                Phiếu bảo hành
              </button>
              <span className="breadcrumb-separator">/</span>
              <strong>Chi tiết phiếu</strong>
            </div>
            <div className="connection-label">
              <span className={`connection-dot ${detailError ? 'connection-dot--error' : ''}`} />
              {detailError ? 'Có lỗi kết nối' : 'Khu vực tiếp nhận'}
            </div>
          <button className="button button--logout" type="button" onClick={handleLogout}>Đăng xuất ({currentUser?.username || 'admin'})</button>
          </header>

          <section className="page-content">
            <button
              className="button button--secondary detail-back-button"
              type="button"
              onClick={closeTicketDetail}
            >
              ← Quay lại danh sách
            </button>

            {detailLoading && <DataState loading />}

            {detailError && (
              <DataState
                error={detailError}
                onRetry={() => void openTicketDetail(selectedTicketId)}
              />
            )}

            {detail && (
              <>
                <div className="page-heading detail-page-heading">
                  <div>
                    <div className="eyebrow">CHI TIẾT / L02</div>
                    <h1>{detail.ticket_code || `Phiếu #${detail.ticket_id}`}</h1>
                    <p className="page-subtitle">
                      Thông tin tiếp nhận và phân loại yêu cầu bảo hành.
                    </p>
                  </div>
                  <span className={statusClass(detail.status)}>
                    {STATUS_LABELS[detail.status] || detail.status || 'Chưa xác định'}
                  </span>
                </div>

                <section className="detail-panel">
                  <div className="panel-heading">
                    <div>
                      <h2>Thông tin phiếu</h2>
                      <p>Thông tin trạng thái và cam kết xử lý.</p>
                    </div>
                    <span className={`priority-badge priority-badge--${String(detail.priority || 'THAP').toLowerCase()}`}>
                      <span className="priority-dot" />
                      {PRIORITY_LABELS[detail.priority] || detail.priority || '—'}
                    </span>
                  </div>

                  <div className="detail-grid">
                    <div className="detail-field">
                      <span>Mã phiếu bảo hành</span>
                      <strong>{detail.ticket_code || '—'}</strong>
                    </div>
                    <div className="detail-field">
                      <span>Trạng thái hiện tại</span>
                      <strong>{STATUS_LABELS[detail.status] || detail.status || '—'}</strong>
                    </div>
                    <div className="detail-field">
                      <span>Mức ưu tiên</span>
                      <strong>{PRIORITY_LABELS[detail.priority] || detail.priority || '—'}</strong>
                    </div>
                    <div className="detail-field">
                      <span>Thời điểm tiếp nhận</span>
                      <strong>{formatDate(detail.received_at)}</strong>
                    </div>
                    <div className="detail-field">
                      <span>Hạn cam kết</span>
                      <strong>{formatDate(detail.due_date)}</strong>
                    </div>
                    <div className="detail-field">
                      <span>Trung tâm bảo hành</span>
                      <strong>{detail.center_name || `Trung tâm #${detail.center_id ?? '—'}`}</strong>
                    </div>
                  </div>
                </section>

                <section className="detail-panel">
                  <div className="panel-heading">
                    <div>
                      <h2>Khách hàng và thiết bị</h2>
                      <p>Thông tin liên kết với phiếu đang xem.</p>
                    </div>
                  </div>

                  <div className="detail-grid">
                    <div className="detail-field">
                      <span>Khách hàng</span>
                      <strong>{detail.customer_name || `Khách hàng #${detail.customer_id ?? '—'}`}</strong>
                    </div>
                    <div className="detail-field">
                      <span>Số điện thoại</span>
                      <strong>{detail.customer_phone || 'Chưa có thông tin'}</strong>
                    </div>
                    <div className="detail-field">
                      <span>Serial thiết bị</span>
                      <strong>{detail.serial_no || 'Chưa có thông tin'}</strong>
                    </div>
                    <div className="detail-field">
                      <span>Ngày mua</span>
                      <strong>{detail.purchase_date ? formatDate(detail.purchase_date) : 'Chưa cập nhật'}</strong>
                    </div>
                    <div className="detail-field">
                      <span>Thời hạn bảo hành</span>
                      <strong>
                        {detail.warranty_months != null
                          ? `${detail.warranty_months} tháng`
                          : 'Chưa xác định'}
                      </strong>
                    </div>
                    <div className="detail-field">
                      <span>Nhóm sự cố</span>
                      <strong>{detail.category_name || detail.category_code || '—'}</strong>
                    </div>
                  </div>
                </section>

                <section className="detail-panel">
                  <div className="panel-heading">
                    <div>
                      <h2>Mô tả sự cố và phụ kiện</h2>
                      <p>Nội dung được ghi nhận khi tiếp nhận bảo hành.</p>
                    </div>
                  </div>

                  <div className="detail-grid">
                    <div className="detail-field detail-field--wide">
                      <span>Mô tả sự cố</span>
                      <p className="detail-description">
                        {detail.issue_desc || 'Chưa có mô tả sự cố.'}
                      </p>
                    </div>
                    <div className="detail-field detail-field--wide">
                      <span>Phụ kiện đi kèm</span>
                      <strong>{accessoriesText}</strong>
                    </div>
                  </div>
                </section>
              </>
            )}

            <footer className="page-footer">
              <span>Smart CRM · Mekong Mobile</span>
              <span>Luồng L02 — Tiếp nhận và phân loại yêu cầu bảo hành</span>
            </footer>
          </section>
        </main>
      </div>
    );
  }
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">M</div>
          <div>
            <strong>MEKONG MOBILE</strong>
            <span>SMART CRM</span>
          </div>
        </div>

        <div className="sidebar-section-label">NGHIỆP VỤ</div>
        <div className="nav-item nav-item--active">
          <span className="nav-icon">▦</span>
          <span>Phiếu bảo hành</span>
          <span className="nav-count">{tickets.length}</span>
        </div>

        <div className="sidebar-bottom">
          <div className="sidebar-avatar">L2</div>
          <div>
            <strong>Tiếp nhận bảo hành</strong>
            <span>Luồng nghiệp vụ L02</span>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="breadcrumb">
            <span>Smart CRM</span>
            <span className="breadcrumb-separator">/</span>
            <strong>Phiếu bảo hành</strong>
          </div>
          <div className="connection-label">
            <span className={`connection-dot ${error ? 'connection-dot--error' : ''}`} />
            {error ? 'Có lỗi kết nối' : 'Khu vực tiếp nhận'}
          </div>
        <button className="button button--logout" type="button" onClick={handleLogout}>Đăng xuất ({currentUser?.username || 'admin'})</button>
        </header>

        <section className="page-content">
          <div className="page-heading">
            <div>
              <div className="eyebrow">WORKSPACE / L02</div>
              <h1>Phiếu bảo hành</h1>
              <p className="page-subtitle">
                Tiếp nhận, tra cứu và theo dõi thông tin yêu cầu bảo hành.
              </p>
            </div>
            <div className="heading-actions">
              <button
                className="button button--primary"
                type="button"
                onClick={() => setShowCreateForm(true)}
              >
                + Tiếp nhận phiếu mới
              </button>
              <button
                className="button button--secondary"
                type="button"
                onClick={() => void refreshTickets()}
                disabled={loading}
              >
                <span className={loading ? 'refresh-icon refresh-icon--spinning' : 'refresh-icon'}>↻</span>
                Tải lại dữ liệu
              </button>
            </div>
          </div>

          <div className="metrics-grid">
            <article className="metric-card">
              <div className="metric-topline">
                <span className="metric-icon metric-icon--blue">▤</span>
                <span className="metric-caption">TỔNG PHIẾU</span>
              </div>
              <strong className="metric-value">{tickets.length}</strong>
              <span className="metric-note">Bản ghi từ hệ thống</span>
            </article>

            <article className="metric-card">
              <div className="metric-topline">
                <span className="metric-icon metric-icon--teal">◷</span>
                <span className="metric-caption">ĐANG XỬ LÝ</span>
              </div>
              <strong className="metric-value">{openCount}</strong>
              <span className="metric-note">Chưa hoàn tất hoặc đóng</span>
            </article>

            <article className="metric-card">
              <div className="metric-topline">
                <span className="metric-icon metric-icon--orange">↑</span>
                <span className="metric-caption">ƯU TIÊN CAO</span>
              </div>
              <strong className="metric-value">{highPriorityCount}</strong>
              <span className="metric-note">Cần chú ý mức ưu tiên</span>
            </article>

            <article className="metric-card">
              <div className="metric-topline">
                <span className="metric-icon metric-icon--purple">◇</span>
                <span className="metric-caption">CHỜ LINH KIỆN</span>
              </div>
              <strong className="metric-value">{waitingPartsCount}</strong>
              <span className="metric-note">Theo trạng thái phiếu</span>
            </article>
          </div>

          <section className="table-panel">
            <div className="panel-heading">
              <div>
                <h2>Danh sách yêu cầu</h2>
                <p>Tra cứu thông tin các phiếu bảo hành đã ghi nhận.</p>
              </div>
              <span className="record-count">{visibleTickets.length} phiếu hiển thị</span>
            </div>

            <div className="table-toolbar">
              <label className="search-box">
                <span className="search-icon" aria-hidden="true">⌕</span>
                <input
                  type="search"
                  value={keyword}
                  onChange={(event) => setKeyword(event.target.value)}
                  placeholder="Tìm mã phiếu, mô tả sự cố..."
                  aria-label="Tìm kiếm phiếu bảo hành"
                />
              </label>

              <label className="filter-box">
                <span>Trạng thái</span>
                <select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                  aria-label="Lọc theo trạng thái"
                >
                  <option value="ALL">Tất cả trạng thái</option>
                  {Object.entries(STATUS_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </label>
            </div>

            <DataState
              loading={loading}
              error={error}
              empty={visibleTickets.length === 0}
              emptyTitle={emptyTitle}
              emptyMessage={emptyMessage}
              onRetry={() => void refreshTickets()}
            >
              <div className="table-scroll">
                <table className="tickets-table">
                  <thead>
                    <tr>
                      <th>MÃ PHIẾU</th>
                      <th>THÔNG TIN SỰ CỐ</th>
                      <th>ƯU TIÊN</th>
                      <th>TRẠNG THÁI</th>
                      <th>THỜI ĐIỂM TIẾP NHẬN</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleTickets.map((ticket) => (
                      <tr key={ticket.ticket_id} className="ticket-row" tabIndex={0} onClick={() => void openTicketDetail(ticket.ticket_id)} onKeyDown={(event) => { if (event.key === "Enter") void openTicketDetail(ticket.ticket_id); }}>
                        <td>
                          <span className="ticket-code">{ticket.ticket_code || `#${ticket.ticket_id}`}</span>
                          <span className="secondary-text">ID: {ticket.ticket_id}</span>
                        </td>
                        <td className="issue-cell">
                          <span>{ticket.issue_desc || 'Chưa có mô tả'}</span>
                          <span className="secondary-text">
                            Thiết bị #{ticket.device_id ?? '—'} · Khách hàng #{ticket.customer_id ?? '—'}
                          </span>
                        </td>
                        <td>
                          <span className={`priority-badge priority-badge--${String(ticket.priority || 'THAP').toLowerCase()}`}>
                            <span className="priority-dot" />
                            {PRIORITY_LABELS[ticket.priority] || ticket.priority || '—'}
                          </span>
                        </td>
                        <td>
                          <span className={statusClass(ticket.status)}>
                            {STATUS_LABELS[ticket.status] || ticket.status || 'Chưa xác định'}
                          </span>
                        </td>
                        <td className="date-cell">{formatDate(ticket.received_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </DataState>

            {!loading && !error && tickets.length > 0 && (
              <div className="table-footer">
                Đang hiển thị {visibleTickets.length} trên tổng số {tickets.length} phiếu.
              </div>
            )}
          </section>

          <footer className="page-footer">
            <span>Smart CRM · Mekong Mobile</span>
            <span>Luồng L02 — Tiếp nhận và phân loại yêu cầu bảo hành</span>
          </footer>
        </section>
      </main>
    </div>
  );
}

export default App;
