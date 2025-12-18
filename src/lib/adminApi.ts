const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('vpreme_token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
};

export const adminApi = {
  getStats: async () => {
    const response = await fetch(`${API_URL}/admin/stats`, {
      headers: getAuthHeaders(),
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  getUsers: async (params: { search?: string; filter?: string; page?: number; limit?: number } = {}) => {
    const queryParams = new URLSearchParams();
    if (params.search) queryParams.append('search', params.search);
    if (params.filter) queryParams.append('filter', params.filter);
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());

    const response = await fetch(`${API_URL}/admin/users?${queryParams}`, {
      headers: getAuthHeaders(),
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  getUser: async (userId: string) => {
    const response = await fetch(`${API_URL}/admin/users/${userId}`, {
      headers: getAuthHeaders(),
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  banUser: async (userId: string) => {
    const response = await fetch(`${API_URL}/admin/users/${userId}/ban`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data;
  },

  toggleAdmin: async (userId: string) => {
    const response = await fetch(`${API_URL}/admin/users/${userId}/admin`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data;
  },

  bulkEmail: async (userIds: string[], subject: string, message: string) => {
    const response = await fetch(`${API_URL}/admin/users/bulk-email`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ userIds, subject, message }),
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data;
  },

  bulkBan: async (userIds: string[]) => {
    const response = await fetch(`${API_URL}/admin/users/bulk-ban`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ userIds }),
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data;
  },

  getTransactions: async (params: { page?: number; limit?: number } = {}) => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());

    const response = await fetch(`${API_URL}/admin/transactions?${queryParams}`, {
      headers: getAuthHeaders(),
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  getProducts: async (params: { page?: number; limit?: number } = {}) => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());

    const response = await fetch(`${API_URL}/admin/products?${queryParams}`, {
      headers: getAuthHeaders(),
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  getAlerts: async (params: { page?: number; limit?: number } = {}) => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());

    const response = await fetch(`${API_URL}/admin/alerts?${queryParams}`, {
      headers: getAuthHeaders(),
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  getActivities: async (params: { page?: number; limit?: number } = {}) => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());

    const response = await fetch(`${API_URL}/admin/activities?${queryParams}`, {
      headers: getAuthHeaders(),
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  getLogs: async (params: { level?: string; page?: number; limit?: number } = {}) => {
    const queryParams = new URLSearchParams();
    if (params.level) queryParams.append('level', params.level);
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());

    const response = await fetch(`${API_URL}/admin/logs?${queryParams}`, {
      headers: getAuthHeaders(),
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  clearLogs: async () => {
    const response = await fetch(`${API_URL}/admin/logs`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data;
  },

  getReferrals: async (params: { page?: number; limit?: number } = {}) => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());

    const response = await fetch(`${API_URL}/admin/referrals?${queryParams}`, {
      headers: getAuthHeaders(),
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  exportSystemState: async () => {
    const response = await fetch(`${API_URL}/admin/export-system-state`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },
};
