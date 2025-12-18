const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export interface User {
  _id: string;
  email: string;
  name: string;
  isPremium: boolean;
  isAdmin: boolean;
  createdAt: string;
}

export const authAPI = {
  async register(email: string, password: string, name: string, referralCode: string): Promise<{ user: User; token: string }> {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name, referralCode }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Registration failed');
    }

    return data.data;
  },

  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Login failed');
    }

    return data.data;
  },

  async getCurrentUser(): Promise<User | null> {
    const token = localStorage.getItem('vpreme_token');
    if (!token) return null;

    try {
      const response = await fetch(`${API_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        localStorage.removeItem('vpreme_token');
        localStorage.removeItem('vpreme_user');
        return null;
      }

      const data = await response.json();
      return data.data.user;
    } catch (error) {
      localStorage.removeItem('vpreme_token');
      localStorage.removeItem('vpreme_user');
      return null;
    }
  },

  logout() {
    localStorage.removeItem('vpreme_token');
    localStorage.removeItem('vpreme_user');
  },
};
