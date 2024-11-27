import { useState } from 'react';
import { Menu, X, Calculator, MessageSquare, FileText, Users, Settings, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

interface SideMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SideMenu({ isOpen, onClose }: SideMenuProps) {
  const isAdmin = localStorage.getItem('userName') === 'admin' && 
                 localStorage.getItem('userPassword') === '12345';

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
            <span className="text-lg font-semibold text-indigo-600">mrceeschatbot</span>
          </div>

          <Link
            to="/"
            className="flex items-center space-x-3 px-4 py-2 text-gray-700 rounded-lg hover:bg-gray-100"
            onClick={onClose}
          >
            <Home className="h-5 w-5" />
            <span>Home</span>
          </Link>
          <Link
            to="/roi-calculator"
            className="flex items-center space-x-3 px-4 py-2 text-gray-700 rounded-lg hover:bg-gray-100"
            onClick={onClose}
          >
            <Calculator className="h-5 w-5" />
            <span>ROI Calculator</span>
          </Link>
          <Link
            to="/automated-sms"
            className="flex items-center space-x-3 px-4 py-2 text-gray-700 rounded-lg hover:bg-gray-100"
            onClick={onClose}
          >
            <MessageSquare className="h-5 w-5" />
            <span>Automated SMS</span>
          </Link>
          <Link
            to="/contract-forms"
            className="flex items-center space-x-3 px-4 py-2 text-gray-700 rounded-lg hover:bg-gray-100"
            onClick={onClose}
          >
            <FileText className="h-5 w-5" />
            <span>Contract Forms</span>
          </Link>
          <Link
            to="/contact-manager"
            className="flex items-center space-x-3 px-4 py-2 text-gray-700 rounded-lg hover:bg-gray-100"
            onClick={onClose}
          >
            <Users className="h-5 w-5" />
            <span>Contact Manager</span>
          </Link>
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
        </nav>
      </div>
    </div>
  );
} 