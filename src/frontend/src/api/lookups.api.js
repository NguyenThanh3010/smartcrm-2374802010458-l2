import apiClient from './client.js';

const lookupsApi = {
  async listIssueCategories() {
    const result = await apiClient.get('/lookups/issue-categories');
    return Array.isArray(result?.data) ? result.data : [];
  },

  async listServiceCenters() {
    const result = await apiClient.get('/lookups/service-centers');
    return Array.isArray(result?.data) ? result.data : [];
  },
};

export default lookupsApi;
