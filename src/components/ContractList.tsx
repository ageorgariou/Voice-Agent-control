import React from 'react';
import { FileText, SortAlphaAsc, Clock, Search, X } from 'lucide-react';

interface Contract {
  id: string;
  title: string;
  date: string;
  fileName: string;
}

interface ContractListProps {
  contracts: Contract[];
  onSort: (key: 'title' | 'date') => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export default function ContractList({
  contracts,
  onSort,
  searchQuery,
  onSearchChange,
}: ContractListProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Contract List</h2>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search contracts..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <button
            onClick={() => onSort('title')}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <SortAlphaAsc className="h-5 w-5 text-gray-400" />
            <span>Sort</span>
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {contracts.map((contract) => (
          <div
            key={contract.id}
            className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            <div className="flex items-center space-x-4">
              <FileText className="h-6 w-6 text-gray-400" />
              <div>
                <h3 className="text-sm font-medium text-gray-900">
                  {contract.title}
                </h3>
                <p className="text-sm text-gray-500">
                  {new Date(contract.date).toLocaleDateString()}
                </p>
              </div>
            </div>
            <span className="text-sm text-gray-500">{contract.fileName}</span>
          </div>
        ))}
        {contracts.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No contracts found
          </div>
        )}
      </div>
    </div>
  );
} 