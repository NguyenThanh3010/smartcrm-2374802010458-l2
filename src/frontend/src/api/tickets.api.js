import apiClient from './client.js';

const ticketsApi = {
  async list(params = {}) {
    const query = new URLSearchParams(params).toString();
    const path = `/tickets${query ? `?${query}` : ''}`;
    const result = await apiClient.get(path);

    if (Array.isArray(result?.data)) return result.data;
    if (Array.isArray(result?.tickets)) return result.tickets;
    if (Array.isArray(result)) return result;
    return [];
  },

  async getById(id) {
    const result = await apiClient.get(`/tickets/${id}`);
    return result?.data ?? result;
  },

  async create(payload) {
    return apiClient.post('/tickets', payload);
  },

  async update(id, payload) {
    return apiClient.put(`/tickets/${id}`, payload);
  },

  async cancel(id, payload = {}) {
    return apiClient.post(`/tickets/${id}/cancel`, payload);
  },
};

export default ticketsApi;
