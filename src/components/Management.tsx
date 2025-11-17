import { useState, useEffect } from 'react';
import { Settings, Trash2, Plus, X, Search, Clock, LogOut, Menu, ArrowLeft } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import SideMenu from './SideMenu';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/authService';

interface User {
  _id: string;
  username: string;
  name: string;
  email: string;
  userType: 'Admin' | 'User';
  created_at: string;
  updated_at: string;
  is_active: boolean;
  last_login?: string;
  settings: {
    two_fa_enabled: boolean;
    notifications_enabled: boolean;
  };
  apiKeys: {
    vapi_key?: string;
    openai_key?: string;
    elevenlabs_key?: string;
    deepgram_key?: string;
  };
}

interface CreateUserData {
  username: string;
  password: string;
  name: string;
  email: string;
  userType: 'Admin' | 'User';
  features?: {
    smsCampaigns?: boolean;
    chatbotTranscripts?: boolean;
    aiVideoGeneration?: boolean;
  };
}

interface UserModalProps {
  user?: User;
  isOpen: boolean;
  onClose: () => void;
  onSave: (userData: CreateUserData | Partial<User>) => void;
}

const UserModal = ({ user, isOpen, onClose, onSave }: UserModalProps) => {
  const [formData, setFormData] = useState<CreateUserData>({
    username: '',
    password: '',
    name: '',
    email: '',
    userType: 'User',
    features: {
      smsCampaigns: false,
      chatbotTranscripts: false,
      aiVideoGeneration: false,
    },
  });
  const [errors, setErrors] = useState<{
    password?: string;
    email?: string;
    username?: string;
  }>({});
  const { isAdmin } = useAuth();

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username,
        password: '', // Don't populate password for editing
        name: user.name,
        email: user.email,
        userType: user.userType,
        features: user.features || {
          smsCampaigns: false,
          chatbotTranscripts: false,
          aiVideoGeneration: false,
        },
      });
      setErrors({});
    } else {
      setFormData({
        username: '',
        password: '',
        name: '',
        email: '',
        userType: 'User',
        features: {
          smsCampaigns: false,
          chatbotTranscripts: false,
          aiVideoGeneration: false,
        },
      });
    }
  }, [user, isOpen]);

  const validateForm = () => {
    const newErrors: { password?: string; email?: string; username?: string } = {};

    // Password validation (only for new users)
    if (!user && formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Username validation for new users
    if (!user && !formData.username.trim()) {
      newErrors.username = 'Username is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validateForm()) {
      onSave(formData);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {user ? 'Edit User' : 'Create User'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {!user && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-indigo-500 focus:border-indigo-500 
                    ${errors.username ? 'border-red-300' : 'border-gray-300'}`}
                />
                {errors.username && (
                  <p className="mt-1 text-sm text-red-600">{errors.username}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-indigo-500 focus:border-indigo-500 
                    ${errors.password ? 'border-red-300' : 'border-gray-300'}`}
                  placeholder={user ? 'Leave blank to keep current password' : 'Enter password'}
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                )}
              </div>
            </>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-indigo-500 focus:border-indigo-500 
                ${errors.email ? 'border-red-300' : 'border-gray-300'}`}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email}</p>
            )}
          </div>
          {isAdmin() && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                User Type
              </label>
              <select
                value={formData.userType}
                onChange={(e) => setFormData({ ...formData, userType: e.target.value as 'Admin' | 'User' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="User">User</option>
                <option value="Admin">Admin</option>
              </select>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Feature Access
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.features?.smsCampaigns || false}
                  onChange={(e) => setFormData({
                    ...formData,
                    features: {
                      ...formData.features,
                      smsCampaigns: e.target.checked,
                    },
                  })}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">SMS Campaigns</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.features?.chatbotTranscripts || false}
                  onChange={(e) => setFormData({
                    ...formData,
                    features: {
                      ...formData.features,
                      chatbotTranscripts: e.target.checked,
                    },
                  })}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Chatbot Transcripts</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.features?.aiVideoGeneration || false}
                  onChange={(e) => setFormData({
                    ...formData,
                    features: {
                      ...formData.features,
                      aiVideoGeneration: e.target.checked,
                    },
                  })}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">AI Video Generation</span>
              </label>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 bg-gray-50 rounded-b-lg flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-500"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default function Management() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | undefined>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load users from API
  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoading(true);
        const response = await authService.makeAuthenticatedRequest('http://localhost:3001/api/users');
        
        if (!response.ok) {
          throw new Error('Failed to fetch users');
        }
        
        const usersData = await response.json();
        setUsers(usersData);
      } catch (err) {
        console.error('Error loading users:', err);
        setError('Failed to load users');
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, []);

  const handleCreateUser = async (userData: CreateUserData) => {
    try {
      setError(null);
      const response = await authService.makeAuthenticatedRequest('http://localhost:3001/api/admin/users', {
        method: 'POST',
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create user');
      }

      const newUser = await response.json();
      setUsers(prev => [...prev, newUser]);
      setIsModalOpen(false);
    } catch (err) {
      console.error('Error creating user:', err);
      setError(err instanceof Error ? err.message : 'Failed to create user');
    }
  };

  const handleUpdateUser = async (userData: Partial<User>) => {
    if (!selectedUser) return;
    
    try {
      setError(null);
      const response = await authService.makeAuthenticatedRequest(
        `http://localhost:3001/api/users/${selectedUser.username}`,
        {
          method: 'PUT',
          body: JSON.stringify({
            name: userData.name,
            email: userData.email,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update user');
      }

      const updatedUser = await response.json();
      setUsers(prev => prev.map(u => u.username === selectedUser.username ? updatedUser : u));
      setIsModalOpen(false);
    } catch (err) {
      console.error('Error updating user:', err);
      setError(err instanceof Error ? err.message : 'Failed to update user');
    }
  };

  const handleDeleteUser = async (username: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        setError(null);
        const response = await authService.makeAuthenticatedRequest(
          `http://localhost:3001/api/users/${username}`,
          {
            method: 'DELETE',
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to delete user');
        }

        setUsers(prev => prev.filter(u => u.username !== username));
      } catch (err) {
        console.error('Error deleting user:', err);
        setError(err instanceof Error ? err.message : 'Failed to delete user');
      }
    }
  };

  // Sort and filter users
  const filteredAndSortedUsers = users
    .filter(user => 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.username.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });

  const toggleSortOrder = () => {
    setSortOrder(current => current === 'asc' ? 'desc' : 'asc');
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error('Logout error:', err);
      navigate('/login');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-600 text-center">
          <p className="text-xl font-semibold mb-2">Error</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <Link
            to="/"
            className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
          >
            <ArrowLeft className="h-6 w-6" />
          </Link>
          <button
            onClick={() => setIsSideMenuOpen(true)}
            className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
          >
            <Menu className="h-6 w-6" />
          </button>
          <h1 className="text-2xl font-semibold text-gray-900">User Management</h1>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => {
              setSelectedUser(undefined);
              setIsModalOpen(true);
            }}
            className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            <Plus className="h-5 w-5" />
            <span>Create User</span>
          </button>
          <button
            onClick={handleLogout}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
            title="Logout"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Add Search and Sort Controls */}
      <div className="mb-6 flex justify-between items-center">
        <div className="relative w-64">
          <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <button
          onClick={toggleSortOrder}
          className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          <Clock className="h-5 w-5 text-gray-400" />
          <span>Sort by Date {sortOrder === 'asc' ? '↑' : '↓'}</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Username
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Password
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created At
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredAndSortedUsers.map((user) => (
              <tr key={user.username}>
                <td className="px-6 py-4 whitespace-nowrap">{user.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                <td className="px-6 py-4 whitespace-nowrap">{user.username}</td>
                <td className="px-6 py-4 whitespace-nowrap">••••••••</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {new Date(user.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => {
                        setSelectedUser(user);
                        setIsModalOpen(true);
                      }}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      <Settings className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user.username)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredAndSortedUsers.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No users found.
          </div>
        )}
      </div>

      <UserModal
        user={selectedUser}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={(userData) => {
          if (selectedUser) {
            handleUpdateUser(userData as Partial<User>);
          } else {
            handleCreateUser(userData as CreateUserData);
          }
        }}
      />

      <SideMenu 
        isOpen={isSideMenuOpen} 
        onClose={() => setIsSideMenuOpen(false)} 
      />
    </div>
  );
} 