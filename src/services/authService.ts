interface User {
  _id: string;
  username: string;
  email: string;
  name: string;
  userType: 'Admin' | 'User';
  settings: {
    two_fa_enabled: boolean;
    notifications_enabled: boolean;
  };
  created_at: string;
  last_login: string;
}

interface LoginResponse {
  message: string;
  user: User;
  accessToken: string;
  refreshToken: string;
}

interface RefreshResponse {
  message: string;
  accessToken: string;
  user: User;
}

class AuthService {
  private baseUrl = 'http://localhost:3001/api';
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private user: User | null = null;
  private refreshPromise: Promise<string> | null = null;

  constructor() {
    // Load tokens from localStorage on initialization
    this.loadTokensFromStorage();
  }

  private loadTokensFromStorage(): void {
    this.accessToken = localStorage.getItem('accessToken');
    this.refreshToken = localStorage.getItem('refreshToken');
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        this.user = JSON.parse(userData);
      } catch (error) {
        console.error('Error parsing user data from localStorage:', error);
        this.clearTokens();
      }
    }
  }

  private saveTokensToStorage(): void {
    if (this.accessToken) {
      localStorage.setItem('accessToken', this.accessToken);
    }
    if (this.refreshToken) {
      localStorage.setItem('refreshToken', this.refreshToken);
    }
    if (this.user) {
      localStorage.setItem('user', JSON.stringify(this.user));
    }
  }

  private clearTokens(): void {
    this.accessToken = null;
    this.refreshToken = null;
    this.user = null;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  }

  async login(username: string, password: string): Promise<User> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Login failed');
      }

      const data: LoginResponse = await response.json();
      
      this.accessToken = data.accessToken;
      this.refreshToken = data.refreshToken;
      this.user = data.user;
      
      this.saveTokensToStorage();
      
      return data.user;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      if (this.accessToken && this.refreshToken) {
        await fetch(`${this.baseUrl}/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.accessToken}`,
          },
          body: JSON.stringify({ refreshToken: this.refreshToken }),
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.clearTokens();
    }
  }

  async logoutFromAllDevices(): Promise<void> {
    try {
      if (this.accessToken) {
        await fetch(`${this.baseUrl}/auth/logout-all`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.accessToken}`,
          },
        });
      }
    } catch (error) {
      console.error('Logout from all devices error:', error);
    } finally {
      this.clearTokens();
    }
  }

  private async refreshAccessToken(): Promise<string> {
    if (!this.refreshToken) {
      throw new Error('No refresh token available');
    }

    // Prevent multiple simultaneous refresh requests
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = this.performTokenRefresh();
    
    try {
      const newAccessToken = await this.refreshPromise;
      return newAccessToken;
    } finally {
      this.refreshPromise = null;
    }
  }

  private async performTokenRefresh(): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken: this.refreshToken }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.code === 'REFRESH_TOKEN_INVALID') {
          this.clearTokens();
          throw new Error('Session expired. Please login again.');
        }
        throw new Error(errorData.error || 'Token refresh failed');
      }

      const data: RefreshResponse = await response.json();
      
      this.accessToken = data.accessToken;
      this.user = data.user;
      
      this.saveTokensToStorage();
      
      return data.accessToken;
    } catch (error) {
      this.clearTokens();
      throw error;
    }
  }

  async makeAuthenticatedRequest(url: string, options: RequestInit = {}): Promise<Response> {
    if (!this.accessToken) {
      throw new Error('No access token available. Please login.');
    }

    // Add authorization header
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
      'Authorization': `Bearer ${this.accessToken}`,
    };

    let response = await fetch(url, {
      ...options,
      headers,
    });

    // If token is expired, try to refresh and retry
    if (response.status === 403 || response.status === 401) {
      try {
        const newAccessToken = await this.refreshAccessToken();
        
        // Retry the request with new token
        response = await fetch(url, {
          ...options,
          headers: {
            ...headers,
            'Authorization': `Bearer ${newAccessToken}`,
          },
        });
      } catch (refreshError) {
        // Refresh failed, redirect to login
        this.clearTokens();
        throw new Error('Session expired. Please login again.');
      }
    }

    return response;
  }

  async getCurrentUser(): Promise<User | null> {
    if (!this.accessToken) {
      return null;
    }

    try {
      const response = await this.makeAuthenticatedRequest(`${this.baseUrl}/auth/me`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch current user');
      }

      const userData: User = await response.json();
      this.user = userData;
      this.saveTokensToStorage();
      
      return userData;
    } catch (error) {
      console.error('Error fetching current user:', error);
      return null;
    }
  }

  isAuthenticated(): boolean {
    return !!this.accessToken && !!this.user;
  }

  getUser(): User | null {
    return this.user;
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  isAdmin(): boolean {
    return this.user?.userType === 'Admin';
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    if (!this.user) {
      throw new Error('No user logged in');
    }

    const response = await this.makeAuthenticatedRequest(`${this.baseUrl}/auth/change-password`, {
      method: 'PUT',
      body: JSON.stringify({
        username: this.user.username,
        currentPassword,
        newPassword,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Password change failed');
    }
  }
}

// Create singleton instance
export const authService = new AuthService();
export type { User, LoginResponse, RefreshResponse };
