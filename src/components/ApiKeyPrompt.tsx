import React, { useState } from 'react';
import { Key } from 'lucide-react';

interface ApiKeyPromptProps {
  onSubmit: (apiKey: string) => void;
}

export default function ApiKeyPrompt({ onSubmit }: ApiKeyPromptProps) {
  const [apiKey, setApiKey] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim()) {
      setError('API Key is required');
      return;
    }
    onSubmit(apiKey);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md p-6">
        <div className="text-center mb-6">
          <div className="bg-indigo-100 rounded-full p-3 inline-block mb-4">
            <Key className="h-6 w-6 text-indigo-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">Enter Your VAPI API Key</h2>
          <p className="mt-2 text-sm text-gray-500">
            Please enter your VAPI API key to continue. You can find this in your VAPI dashboard.
          </p>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 mb-4"
            placeholder="Enter your API key"
            autoFocus
          />
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
} 