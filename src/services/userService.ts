import { User } from '../types';

const API_BASE_URL = 'http://localhost:3001/api';

export const userService = {
  async createUser(userData: Omit<User, '_id' | 'id' | 'created_at' | 'updated_at'>): Promise<User | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        throw new Error('Failed to create user');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating user:', error);
      return null;
    }
  },

  async getUserByUsername(username: string): Promise<User | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${username}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error('Failed to fetch user');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching user:', error);
      return null;
    }
  },

  async getUserById(id: string): Promise<User | null> {
    // For now, we'll use username-based lookup since most operations use username
    console.warn('getUserById not implemented for API service');
    return null;
  },

  async updateUser(username: string, updates: Partial<User>): Promise<User | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${username}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error('Failed to update user');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating user:', error);
      return null;
    }
  },

  async setUserApiKey(username: string, keyType: string, apiKey: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${username}/api-key`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ keyType, apiKey }),
      });

      if (!response.ok) {
        throw new Error('Failed to set API key');
      }
    } catch (error) {
      console.error('Error setting API key:', error);
      throw error;
    }
  },

  async getUserApiKey(username: string, keyType: string = 'vapi_key'): Promise<string | undefined> {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${username}/api-key/${keyType}`);
      
      if (!response.ok) {
        throw new Error('Failed to get API key');
      }

      const data = await response.json();
      return data.apiKey;
    } catch (error) {
      console.error('Error getting API key:', error);
      return undefined;
    }
  },

  async set2FAStatus(username: string, enabled: boolean): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${username}/2fa`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ enabled }),
      });

      if (!response.ok) {
        throw new Error('Failed to set 2FA status');
      }
    } catch (error) {
      console.error('Error setting 2FA status:', error);
      throw error;
    }
  },

  async get2FAStatus(username: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${username}/2fa`);
      
      if (!response.ok) {
        throw new Error('Failed to get 2FA status');
      }

      const data = await response.json();
      return data.enabled;
    } catch (error) {
      console.error('Error getting 2FA status:', error);
      return false;
    }
  },

  async getAllUsers(): Promise<User[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/users`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching users:', error);
      return [];
    }
  },

  async deleteUser(username: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${username}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  },

  async updateLastLogin(username: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${username}/last-login`, {
        method: 'PUT',
      });

      if (!response.ok) {
        throw new Error('Failed to update last login');
      }
    } catch (error) {
      console.error('Error updating last login:', error);
      throw error;
    }
  }
}; 