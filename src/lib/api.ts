const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';


function getAuthToken(): string | null {
  return localStorage.getItem('vpreme_token');
}

function setAuthToken(token: string): void {
  localStorage.setItem('vpreme_token', token);
}

function removeAuthToken(): void {
  localStorage.removeItem('vpreme_token');
}

async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: { ...headers, ...options.headers },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'An error occurred');
  }

  return data;
}

export const authAPI = {
  async register(email: string, password: string) {
    const data = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (data.success && data.data.token) {
      setAuthToken(data.data.token);
    }

    return data;
  },

  async login(email: string, password: string) {
    const data = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (data.success && data.data.token) {
      setAuthToken(data.data.token);
    }

    return data;
  },

  async getMe() {
    try {
      return await apiRequest('/auth/me');
    } catch (error) {
      removeAuthToken();
      throw error;
    }
  },

  logout() {
    removeAuthToken();
  },

  isAuthenticated(): boolean {
    return !!getAuthToken();
  },
};

export const productsAPI = {
  async getFeatured() {
    return await apiRequest('/products/featured');
  },

  async getAll(page = 1, limit = 20) {
    return await apiRequest(`/products?page=${page}&limit=${limit}`);
  },

  async getById(id: string) {
    return await apiRequest(`/products/${id}`);
  },

  async trackFromUrl(url: string) {
    return await apiRequest('/products/track', {
      method: 'POST',
      body: JSON.stringify({ url }),
    });
  },

  // Add this simulation method to your productsAPI object
  async simulateTrackFromUrl(url: string) {
    return await apiRequest('/products/simulate-track', {
      method: 'POST',
      body: JSON.stringify({
        url
      }),
    });
  },

  async getAlerts() {
    return await apiRequest('/products/alerts');
  },



  async getTracked() {
    return await apiRequest('/products/tracked');
  },

  async untrack(productId: string) {
    return await apiRequest(`/products/${productId}/untrack`, {
      method: 'DELETE',
      body: JSON.stringify({}),
    });
  },

  async getPriceHistory(productId: string) {
    return await apiRequest(`/products/${productId}/price-history`);
  },
};

export { getAuthToken, setAuthToken, removeAuthToken };
