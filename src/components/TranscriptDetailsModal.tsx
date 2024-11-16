import React from 'react';
import { X, Clock, DollarSign } from 'lucide-react';
import { CallData } from '../types';

interface TranscriptDetailsModalProps {
  call: CallData | null;
  onClose: () => void;
}

export default function TranscriptDetailsModal({ call, onClose }: TranscriptDetailsModalProps) {
  if (!call) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Call Details</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto">
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div className="flex items-center space-x-2 bg-gray-50 p-4 rounded-lg">
              <Clock className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-500">Duration</p>
                <p className="text-lg font-semibold text-gray-900">{call.duration}s</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 bg-gray-50 p-4 rounded-lg">
              <DollarSign className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-500">Cost</p>
                <p className="text-lg font-semibold text-gray-900">${call.cost.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Transcript</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-700 whitespace-pre-wrap">{call.transcript}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 