import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function ChatbotTranscripts() {
  const navigate = useNavigate();

  return (
    <div className="p-6">
      <button
        onClick={() => navigate('/')}
        className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-4"
      >
        <ArrowLeft className="h-5 w-5" />
        <span>Back</span>
      </button>
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Chatbot Transcripts</h1>
      <p className="text-gray-600">Chatbot transcript management coming soon...</p>
    </div>
  );
}

