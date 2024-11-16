import React from 'react';

interface InputFieldProps {
  icon: React.ElementType;
  name: string;
  label: string;
  value: string;
  placeholder: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function InputField({ 
  icon: Icon, 
  name, 
  label, 
  value, 
  placeholder,
  onChange
}: InputFieldProps) {
  return (
    <div className="relative mb-6">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Icon className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          inputMode="decimal"
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="block w-full pl-10 pr-4 py-2.5 text-gray-900 border border-gray-300 rounded-lg 
                   focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 
                   transition-colors duration-200 ease-in-out"
        />
      </div>
    </div>
  );
} 