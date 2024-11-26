import React, { useState, useEffect } from 'react';
import { Settings, Trash2, Plus, X, Search, Clock, LogOut, Menu, ArrowLeft } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import SideMenu from './SideMenu';

interface User {
  username: string;
  password: string;
  name: string;
  email: string;
  airtableBaseName: string;
  createdAt: string;
}

interface UserModalProps {
  user?: User;
  isOpen: boolean;
  onClose: () => void;
  onSave: (user: User) => void;
}

const UserModal = ({ user, isOpen, onClose, onSave }: UserModalProps) => {
  const [formData, setFormData] = useState<User>({
    username: '',
    password: '',
    name: '',
    email: '',
    airtableBaseName: '',
    createdAt: new Date().toISOString(),
  });
  const [errors, setErrors] = useState<{
    password?: string;
    email?: string;
    username?: string;
  }>({});

  useEffect(() => {
    if (user) {
      setFormData(user);
      setErrors({});
    } else {
      setFormData({
        username: '',
        password: '',
        name: '',
        email: '',
        airtableBaseName: '',
        createdAt: new Date().toISOString(),
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

    // Check for duplicate email and username
    const existingUsers = JSON.parse(localStorage.getItem('users') || '[]');
    
    if (!user) { // Only check for new users
      if (existingUsers.some((u: User) => u.username === formData.username)) {
        newErrors.username = 'Sorry unfortunately this username is already taken.';
      }
    }

    // Check email duplicates (exclude current user when editing)
    const emailExists = existingUsers.some((u: User) => 
      u.email === formData.email && (!user || u.username !== user.username)
    );
    
    if (emailExists) {
      newErrors.email = 'The email address you entered is already associated with an existing account. Please use a different email address or log in to your account.';
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
          {isAdmin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Airtable Base Name
              </label>
              <input
                type="text"
                value={formData.airtableBaseName}
                onChange={(e) => setFormData({ ...formData, airtableBaseName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          )}
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
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | undefined>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);

  useEffect(() => {
    // Load users from localStorage
    let storedUsers = localStorage.getItem('users');
    if (!storedUsers) {
      // Initialize with admin user if no users exist
      const adminUser: User = {
        username: 'admin',
        password: '12345',
        name: 'Administrator',
        email: 'admin@example.com',
        airtableBaseName: 'Sabos Account',
        createdAt: new Date().toISOString()
      };
      storedUsers = JSON.stringify([adminUser]);
      localStorage.setItem('users', storedUsers);
    }
    setUsers(JSON.parse(storedUsers));
  }, []);

  const saveUsers = (newUsers: User[]) => {
    localStorage.setItem('users', JSON.stringify(newUsers));
    setUsers(newUsers);
  };

  const handleCreateUser = (user: User) => {
    saveUsers([...users, user]);
    setIsModalOpen(false);
  };

  const handleUpdateUser = (updatedUser: User) => {
    const newUsers = users.map(u => 
      u.username === updatedUser.username ? updatedUser : u
    );
    saveUsers(newUsers);
    setIsModalOpen(false);
  };

  const handleDeleteUser = (username: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      saveUsers(users.filter(u => u.username !== username));
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
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });

  const toggleSortOrder = () => {
    setSortOrder(current => current === 'asc' ? 'desc' : 'asc');
  };

  const handleLogout = () => {
    localStorage.removeItem('userName');
    localStorage.removeItem('userPassword');
    localStorage.removeItem('currentUser');
    navigate('/');
    window.location.reload(); // Force reload to clear all states
  };

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
                <td className="px-6 py-4 whitespace-nowrap">{user.password}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {new Date(user.createdAt).toLocaleDateString()}
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
        onSave={selectedUser ? handleUpdateUser : handleCreateUser}
      />

      <SideMenu 
        isOpen={isSideMenuOpen} 
        onClose={() => setIsSideMenuOpen(false)} 
      />
    </div>
  );
} 