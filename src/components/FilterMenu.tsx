import { useState } from 'react';
import { Filter, Check } from 'lucide-react';
import { FilterOption } from '../types';

interface FilterMenuProps {
  selectedFilters: FilterOption[];
  onFilterChange: (filters: FilterOption[]) => void;
}

export default function FilterMenu({ selectedFilters, onFilterChange }: FilterMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  const filterOptions: FilterOption[] = [
    'Completed',
    'Follow Up Required',
    'Not interested'
  ];

  const toggleFilter = (filter: FilterOption) => {
    if (selectedFilters.includes(filter)) {
      onFilterChange(selectedFilters.filter(f => f !== filter));
    } else {
      onFilterChange([...selectedFilters, filter]);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center space-x-2 px-4 py-2 border ${
          selectedFilters.length > 0 ? 'border-indigo-500 text-indigo-700' : 'border-gray-300 text-gray-700'
        } rounded-lg hover:bg-gray-50`}
      >
        <Filter className="h-4 w-4" />
        <span>Filters {selectedFilters.length > 0 && `(${selectedFilters.length})`}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
          <div className="p-2">
            {filterOptions.map((filter) => (
              <button
                key={filter}
                onClick={() => toggleFilter(filter)}
                className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md"
              >
                <div className={`w-4 h-4 border rounded mr-3 flex items-center justify-center ${
                  selectedFilters.includes(filter) ? 'border-indigo-500 bg-indigo-500' : 'border-gray-300'
                }`}>
                  {selectedFilters.includes(filter) && (
                    <Check className="h-3 w-3 text-white" />
                  )}
                </div>
                {filter}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 