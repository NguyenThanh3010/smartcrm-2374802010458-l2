const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || '/api'
).replace(/\/$/, '');

export class ApiError extends Error {
  constructor(message, status = 0, payload = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.payload = payload;
    this.fields = payload?.error?.fields || {};
    this.code = payload?.error?.code || 'REQUEST_ERROR';
  }
}

async function request(path, options = {}) {
  const headers = new Headers(options.headers || {});
  const token = sessionStorage.getItem('smartcrm_token');

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  if (
    options.body &&
    typeof options.body === 'string' &&
    !headers.has('Content-Type')
  ) {
    headers.set('Content-Type', 'application/json');
  }

  let response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers,
    });
  } catch {
    throw new ApiError(
      'Không thể kết nối tới hệ thống. Hãy kiểm tra máy chủ rồi thử lại.',
      0
    );
  }

  const contentType = response.headers.get('content-type') || '';
  const payload = contentType.includes('application/json')
    ? await response.json().catch(() => null)
    : await response.text().catch(() => '');

  if (response.status === 401 && !path.startsWith('/auth/')) {
    sessionStorage.removeItem('smartcrm_token');
    sessionStorage.removeItem('smartcrm_user');
    window.dispatchEvent(new Event('smartcrm:unauthorized'));
  }

  if (!response.ok) {
    const message =
      payload?.error?.message ||
      payload?.message ||
      (typeof payload?.error === 'string' ? payload.error : null) ||
      `Yêu cầu thất bại (HTTP ${response.status}).`;

    throw new ApiError(message, response.status, payload);
  }

  return payload;
}

const apiClient = {
  get(path) {
    return request(path);
  },

  post(path, data) {
    return request(path, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  put(path, data) {
    return request(path, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete(path) {
    return request(path, {
      method: 'DELETE',
    });
  },
};

export default apiClient;
