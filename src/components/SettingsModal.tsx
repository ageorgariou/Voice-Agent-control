import { useState, useEffect, useRef } from 'react';
import { X, Upload, Shield } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [avatar, setAvatar] = useState('');
  const [airtableBaseName, setAirtableBaseName] = useState('');
  const [activeTab, setActiveTab] = useState<'profile' | 'api'>('profile');
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isAdmin = localStorage.getItem('userName') === 'admin';

  useEffect(() => {
    setName(localStorage.getItem('userName') || '');
    setEmail(localStorage.getItem('userEmail') || '');
    setApiKey(localStorage.getItem('vapiKey') || '');
    setAvatar(localStorage.getItem('userAvatar') || '');
    setAirtableBaseName(localStorage.getItem('airtableBaseName') || 'Sabos Account');
    setIs2FAEnabled(localStorage.getItem('2FAEnabled') === 'true');
  }, [isOpen]);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setAvatar(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    // Get current user data
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    // Update current user data
    if (currentUser.username) {
      // Update the user in the users array
      const updatedUsers = users.map((user: any) => {
        if (user.username === currentUser.username) {
          return {
            ...user,
            name,
            email,
            airtableBaseName: isAdmin ? airtableBaseName : user.airtableBaseName
          };
        }
        return user;
      });
      
      // Update the current user
      const updatedCurrentUser = {
        ...currentUser,
        name,
        email,
        airtableBaseName: isAdmin ? airtableBaseName : currentUser.airtableBaseName
      };

      // Save everything to localStorage
      localStorage.setItem('users', JSON.stringify(updatedUsers));
      localStorage.setItem('currentUser', JSON.stringify(updatedCurrentUser));
    }

    // Update other settings
    localStorage.setItem('userName', name);
    localStorage.setItem('userEmail', email);
    localStorage.setItem('vapiKey', apiKey);
    localStorage.setItem('userAvatar', avatar);
    localStorage.setItem('2FAEnabled', is2FAEnabled.toString());
    
    if (isAdmin) {
      localStorage.setItem('airtableBaseName', airtableBaseName);
    }

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Settings</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="border-b border-gray-200">
          <nav className="flex -mb-px" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('profile')}
              className={`w-1/2 py-4 px-1 text-center border-b-2 font-medium text-sm
                ${activeTab === 'profile'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              Profile
            </button>
            <button
              onClick={() => setActiveTab('api')}
              className={`w-1/2 py-4 px-1 text-center border-b-2 font-medium text-sm
                ${activeTab === 'api'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              API Settings
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'profile' && (
            <>
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    onClick={handleAvatarClick}
                    className="relative group"
                  >
                    <div className="h-24 w-24 rounded-full overflow-hidden">
                      {avatar ? (
                        <img
                          src={avatar}
                          alt={name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full bg-indigo-100 flex items-center justify-center">
                          <span className="text-2xl font-medium text-indigo-600">
                            {name
                              .split(' ')
                              .map(n => n[0])
                              .join('')
                              .toUpperCase()
                              .slice(0, 2)}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Upload className="h-6 w-6 text-white" />
                    </div>
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>

              {!isAdmin && (
                <div className="mt-6 border-t pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">Two-Factor Authentication</h3>
                      <p className="text-sm text-gray-500">
                        Enable 2FA for additional security when logging in
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={is2FAEnabled}
                        onChange={(e) => setIs2FAEnabled(e.target.checked)}
                      />
                      <div className={`w-11 h-6 bg-gray-200 rounded-full peer 
                        peer-checked:after:translate-x-full peer-checked:after:border-white 
                        after:content-[''] after:absolute after:top-0.5 after:left-[2px] 
                        after:bg-white after:border-gray-300 after:border after:rounded-full 
                        after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600`}>
                      </div>
                    </label>
                  </div>
                  <div className="mt-2 flex items-center space-x-2 text-sm text-gray-500">
                    <Shield className="h-4 w-4" />
                    <span>
                      {is2FAEnabled 
                        ? 'You will receive a verification code via email when logging in' 
                        : 'Enable 2FA to receive verification codes via email when logging in'}
                    </span>
                  </div>
                </div>
              )}
            </>
          )}

          {activeTab === 'api' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  API Key
                </label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              {isAdmin && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Airtable Base Name
                  </label>
                  <input
                    type="text"
                    value={airtableBaseName}
                    onChange={(e) => setAirtableBaseName(e.target.value)}
                    placeholder="Enter Airtable base name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              )}
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
}