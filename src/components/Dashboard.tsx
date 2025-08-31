import React, { useState, useEffect } from 'react';
import { Search, Filter, LogOut, Menu } from 'lucide-react';
import MetricsGrid from './MetricsGrid';
import CallsChart from './CallsChart';
import TranscriptList from './TranscriptList';
import UserAvatar from './UserAvatar';
import SettingsModal from './SettingsModal';
import { TimeFrame, CallData, FilterOption } from '../types';
import { fetchCalls } from '../services/vapiServices';
import FilterMenu from './FilterMenu';
import SideMenu from './SideMenu';
import ApiKeyPrompt from './ApiKeyPrompt';

interface DashboardProps {
  onLogout: () => void;
}

export default function Dashboard({ onLogout }: DashboardProps) {
  const [timeFrame, setTimeFrame] = useState<TimeFrame>('daily');
  const [searchQuery, setSearchQuery] = useState('');
  const [calls, setCalls] = useState<CallData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<FilterOption[]>([]);
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);
  const [showApiKeyPrompt, setShowApiKeyPrompt] = useState(false);

  useEffect(() => {
    const loadCalls = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        const userApiKey = localStorage.getItem(`vapiKey_${currentUser.username}`);

        if (!userApiKey) {
          setError('API key not found');
          setIsLoading(false);
          return;
        }

        const now = new Date();
        let from = new Date();

        switch (timeFrame) {
          case 'daily':
            from.setHours(0, 0, 0, 0);
            break;
          case 'weekly':
            from.setDate(now.getDate() - 7);
            break;
          case 'monthly':
            from.setMonth(now.getMonth() - 1);
            break;
          case 'yearly':
            from.setFullYear(now.getFullYear() - 1);
            break;
        }

        const fetchedCalls = await fetchCalls(
          { from: from.toISOString(), to: now.toISOString() },
          1,
          300,
          userApiKey
        );
        console.log('Dashboard: Received calls from fetchCalls:', fetchedCalls.length);
        setCalls(fetchedCalls);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch calls');
      } finally {
        setIsLoading(false);
      }
    };

    loadCalls();
  }, [timeFrame]);

  useEffect(() => {
    // Get current user
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');

    // Check for user-specific API key
    const userApiKey = localStorage.getItem(`vapiKey_${currentUser.username}`);
    if (!userApiKey) {
      setShowApiKeyPrompt(true);
    }
  }, []);

  const handleApiKeySubmit = (apiKey: string) => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    localStorage.setItem(`vapiKey_${currentUser.username}`, apiKey);
    setShowApiKeyPrompt(false);
  };

  const getFilteredCalls = () => {
    let filtered = calls;

    if (selectedFilters.length > 0) {
      filtered = filtered.filter(call => selectedFilters.includes(call.outcome));
    }

    if (searchQuery) {
      filtered = filtered.filter(call =>
        call.transcript.toLowerCase().includes(searchQuery.toLowerCase()) ||
        call.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        call.agentName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsSideMenuOpen(true)}
                className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
              >
                <Menu className="h-6 w-6" />
              </button>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={onLogout}
                className="p-2 text-gray-700 hover:text-gray-900 rounded-full hover:bg-gray-100"
              >
                <LogOut className="h-5 w-5" />
              </button>
              <UserAvatar onClick={() => setIsSettingsOpen(true)} />
            </div>
          </div>
        </div>
      </nav>

      <SideMenu
        isOpen={isSideMenuOpen}
        onClose={() => setIsSideMenuOpen(false)}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            Monitor call performance and agent productivity
          </p>
        </div>

        <div className="mb-6 flex justify-between items-center">
          <div className="flex space-x-2">
            {(['daily', 'weekly', 'monthly', 'yearly'] as TimeFrame[]).map((frame) => (
              <button
                key={frame}
                onClick={() => setTimeFrame(frame)}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${timeFrame === frame
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
              >
                {frame.charAt(0).toUpperCase() + frame.slice(1)}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search transcripts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <FilterMenu
              selectedFilters={selectedFilters}
              onFilterChange={setSelectedFilters}
            />
          </div>
        </div>

        <MetricsGrid timeFrame={timeFrame} calls={calls} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          <div className="lg:col-span-2 bg-white rounded-lg shadow h-fit">
            <CallsChart timeFrame={timeFrame} calls={calls} />
          </div>
          <div className="bg-white rounded-lg shadow">
            <TranscriptList
              searchQuery={searchQuery}
              calls={getFilteredCalls()}
              isLoading={isLoading}
              error={error}
            />
          </div>
        </div>
      </main>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      {showApiKeyPrompt && <ApiKeyPrompt onSubmit={handleApiKeySubmit} />}
    </div>
  );
}