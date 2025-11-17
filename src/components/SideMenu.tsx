import { X, Users, Settings, Home, MessageSquare, MessageCircle, Video } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface SideMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SideMenu({ isOpen, onClose }: SideMenuProps) {
  const { user } = useAuth();
  const isAdmin = user?.userType === 'Admin';
  
  // Admins have access to all features by default
  // Regular users need explicit feature access
  const hasSMSCampaigns = isAdmin || user?.features?.smsCampaigns || false;
  const hasChatbotTranscripts = isAdmin || user?.features?.chatbotTranscripts || false;
  const hasAIVideoGeneration = isAdmin || user?.features?.aiVideoGeneration || false;

  return (
    <div
      className={`fixed inset-y-0 left-0 transform ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } w-64 bg-white shadow-lg transition-transform duration-200 ease-in-out z-30`}
    >
      <div className="p-6">
        <button onClick={onClose} className="absolute top-4 right-4">
          <X className="h-6 w-6 text-gray-500" />
        </button>

        <nav className="mt-8 space-y-2">
          <div className="px-4 py-3 mb-4 bg-indigo-50 rounded-lg">
            <span className="text-lg font-semibold text-indigo-600">Agenty</span>
          </div>

          <Link
            to="/"
            className="flex items-center space-x-3 px-4 py-2 text-gray-700 rounded-lg hover:bg-gray-100"
            onClick={onClose}
          >
            <Home className="h-5 w-5" />
            <span>Home</span>
          </Link>
          {hasSMSCampaigns && (
            <Link
              to="/sms-campaigns"
              className="flex items-center space-x-3 px-4 py-2 text-gray-700 rounded-lg hover:bg-gray-100"
              onClick={onClose}
            >
              <MessageSquare className="h-5 w-5" />
              <span>SMS Campaigns</span>
            </Link>
          )}
          {hasChatbotTranscripts && (
            <Link
              to="/chatbot-transcripts"
              className="flex items-center space-x-3 px-4 py-2 text-gray-700 rounded-lg hover:bg-gray-100"
              onClick={onClose}
            >
              <MessageCircle className="h-5 w-5" />
              <span>Chatbot Transcripts</span>
            </Link>
          )}
          {hasAIVideoGeneration && (
            <Link
              to="/ai-video-generation"
              className="flex items-center space-x-3 px-4 py-2 text-gray-700 rounded-lg hover:bg-gray-100"
              onClick={onClose}
            >
              <Video className="h-5 w-5" />
              <span>AI Video Generation</span>
            </Link>
          )}
          {isAdmin && (
            <Link
              to="/management"
              className="flex items-center space-x-3 px-4 py-2 text-gray-700 rounded-lg hover:bg-gray-100"
              onClick={onClose}
            >
              <Settings className="h-5 w-5" />
              <span>Management</span>
            </Link>
          )}
          <Link
            to="/contact-manager"
            className="flex items-center space-x-3 px-4 py-2 text-gray-700 rounded-lg hover:bg-gray-100"
            onClick={onClose}
          >
            <Users className="h-5 w-5" />
            <span>Contact Manager</span>
          </Link>
        </nav>
      </div>
    </div>
  );
} 