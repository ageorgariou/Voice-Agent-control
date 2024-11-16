import React from 'react';

interface ResultCardProps {
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  isCalculated: boolean;
}

export default function ResultCard({ 
  label, 
  value, 
  prefix = '$', 
  suffix = '',
  isCalculated 
}: ResultCardProps) {
  return (
    <div className={`bg-white p-4 rounded-lg shadow-sm border border-gray-200 
                    transform transition-all duration-300 ease-in-out
                    ${isCalculated ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
      <p className="text-sm font-medium text-gray-600">{label}</p>
      <p className="text-2xl font-bold text-indigo-600 mt-1">
        {prefix}{value.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        })}{suffix}
      </p>
    </div>
  );
} 