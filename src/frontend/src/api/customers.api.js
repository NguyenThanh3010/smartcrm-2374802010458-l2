import apiClient from './client';

const customersApi = {
  async list(params = {}) {
    const query = new URLSearchParams();

    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && value !== '') {
        query.set(key, String(value));
      }
    }

    const suffix = query.size ? `?${query.toString()}` : '';
    const result = await apiClient.get(`/customers${suffix}`);

    if (Array.isArray(result?.data)) {
      return result.data;
    }

    return result?.data ? [result.data] : [];
  },

  async getById(id) {
    const result = await apiClient.get(
      `/customers/${encodeURIComponent(id)}`
    );
    return result?.data ?? result;
  },

  async create(data) {
    const result = await apiClient.post('/customers', data);
    return result?.data ?? result;
  },
};

export default customersApi;
