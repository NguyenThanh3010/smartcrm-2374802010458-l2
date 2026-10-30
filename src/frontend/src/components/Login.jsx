import { useState } from 'react';
import apiClient from '../api/client.js';

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');

    if (!username.trim() || !password) {
      setError('Vui lòng nhập tên đăng nhập và mật khẩu.');
      return;
    }

    setLoading(true);

    try {
      const result = await apiClient.post('/auth/login', {
        username: username.trim(),
        password,
      });

      const session = result?.data;

      if (!session?.token) {
        throw new Error('Máy chủ chưa trả về thông tin phiên đăng nhập hợp lệ.');
      }

      sessionStorage.setItem('smartcrm_token', session.token);
      sessionStorage.setItem(
        'smartcrm_user',
        JSON.stringify(session.user || { username: username.trim() }),
      );

      onLogin(session.user || { username: username.trim() });
    } catch (err) {
      setError(err.message || 'Đăng nhập không thành công. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-screen">
      <section className="login-card">
        <div className="login-brand">
          <div className="login-brand-mark">M</div>
          <div>
            <strong>MEKONG MOBILE</strong>
            <span>SMART CRM</span>
          </div>
        </div>

        <div className="login-heading">
          <div className="eyebrow">WORKSPACE / L02</div>
          <h1>Đăng nhập</h1>
          <p>Đăng nhập để tiếp tục quản lý phiếu bảo hành.</p>
        </div>

        {error && (
          <div className="login-error" role="alert">
            <strong>Không thể đăng nhập</strong>
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-field">
            <label htmlFor="login-username">Tên đăng nhập</label>
            <input
              id="login-username"
              name="username"
              type="text"
              autoComplete="username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="Nhập tên đăng nhập"
              required
              autoFocus
            />
          </div>

          <div className="form-field">
            <label htmlFor="login-password">Mật khẩu</label>
            <input
              id="login-password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Nhập mật khẩu"
              required
            />
          </div>

          <button
            className="button button--primary login-submit"
            type="submit"
            disabled={loading}
          >
            {loading ? 'Đang xác thực...' : 'Đăng nhập'}
          </button>
        </form>

        <div className="login-footer">
          Smart CRM · Mekong Mobile
          <span>Luồng L02 — Tiếp nhận và phân loại yêu cầu bảo hành</span>
        </div>
      </section>
    </main>
  );
}
