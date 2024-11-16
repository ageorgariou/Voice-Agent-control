import React, { useState } from 'react';
import { Clock, ThumbsUp, ThumbsDown, DollarSign, ChevronLeft, ChevronRight } from 'lucide-react';
import { CallData } from '../types';
import TranscriptDetailsModal from './TranscriptDetailsModal';

interface TranscriptListProps {
  searchQuery: string;
  calls: CallData[];
  isLoading: boolean;
  error: string | null;
}

export default function TranscriptList({ searchQuery, calls, isLoading, error }: TranscriptListProps) {
  const [selectedCall, setSelectedCall] = useState<CallData | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;

  const filteredCalls = calls.filter(
    (call) => 
      call.agentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      call.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      call.transcript.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredCalls.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedCalls = filteredCalls.slice(startIndex, startIndex + itemsPerPage);

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Transcripts</h3>
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="border border-gray-200 rounded-lg p-4">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Transcripts</h3>
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Transcripts</h3>
      <div className="space-y-4">
        {filteredCalls.length === 0 ? (
          <p className="text-gray-500">No transcripts found</p>
        ) : (
          <>
            {paginatedCalls.map((call) => (
              <div key={call.id} className="border-b border-gray-200 last:border-0 p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-medium text-gray-900">{call.agentName}</h4>
                    <p className="text-sm text-gray-500">with {call.customerName}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-500">{call.duration}s</span>
                    <DollarSign className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-500">${call.cost.toFixed(2)}</span>
                    {call.sentiment === 'positive' && <ThumbsUp className="h-4 w-4 text-green-500" />}
                    {call.sentiment === 'negative' && <ThumbsDown className="h-4 w-4 text-red-500" />}
                  </div>
                </div>
                <p className="text-sm text-gray-600 line-clamp-2">{call.transcript}</p>
                <div className="mt-2 flex justify-between items-center">
                  <span className="text-xs text-gray-400">
                    {call.timestamp.toLocaleTimeString()}
                  </span>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      call.status === 'completed' || call.outcome === 'Completed' ? 'bg-green-100 text-green-800' :
                      call.outcome === 'Follow Up Required' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {call.status === 'completed' ? 'Completed' : call.outcome}
                    </span>
                    <button 
                      onClick={() => setSelectedCall(call)}
                      className="text-sm text-indigo-600 hover:text-indigo-700"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* Pagination Controls */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <button
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                className={`flex items-center space-x-1 px-3 py-2 rounded-lg ${
                  currentPage === 1
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Previous</span>
              </button>

              <span className="text-sm text-gray-700">
                Page {currentPage}/{totalPages}
              </span>

              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className={`flex items-center space-x-1 px-3 py-2 rounded-lg ${
                  currentPage === totalPages
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span>Next</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </>
        )}
      </div>

      <TranscriptDetailsModal 
        call={selectedCall}
        onClose={() => setSelectedCall(null)}
      />
    </div>
  );
}