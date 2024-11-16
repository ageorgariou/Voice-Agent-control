import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, ArrowLeft, Upload, X, Check, Settings, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import Papa from 'papaparse';

interface TwilioSettings {
  accountSid: string;
  authToken: string;
  phoneNumbers: string[];
}

interface PhoneNumber {
  number: string;
  isValid: boolean;
}

export default function AutomatedSMS() {
  const [message, setMessage] = useState('');
  const [phoneNumbers, setPhoneNumbers] = useState<PhoneNumber[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [twilioSettings, setTwilioSettings] = useState<TwilioSettings>(() => {
    const saved = localStorage.getItem('twilioSettings');
    return saved ? JSON.parse(saved) : {
      accountSid: '',
      authToken: '',
      phoneNumbers: ['']
    };
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const MAX_MESSAGE_LENGTH = 160;

  useEffect(() => {
    localStorage.setItem('twilioSettings', JSON.stringify(twilioSettings));
  }, [twilioSettings]);

  const validatePhoneNumber = (number: string) => {
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    return phoneRegex.test(number.replace(/[\s-]/g, ''));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'text/csv') {
      setError('Please upload a CSV file');
      return;
    }

    Papa.parse(file, {
      complete: (results) => {
        const numbers = results.data
          .flat()
          .filter(Boolean)
          .map(number => ({
            number: String(number).trim(),
            isValid: validatePhoneNumber(String(number).trim())
          }));

        setPhoneNumbers(numbers);
        setError('');
      },
      error: () => {
        setError('Failed to parse CSV file');
      }
    });
  };

  const handleSendSMS = async () => {
    if (!message.trim()) {
      setError('Please enter a message');
      return;
    }

    if (phoneNumbers.length === 0) {
      setError('Please upload phone numbers');
      return;
    }

    if (!twilioSettings.accountSid || !twilioSettings.authToken || twilioSettings.phoneNumbers.length === 0) {
      setError('Please configure Twilio settings');
      return;
    }

    const validNumbers = phoneNumbers.filter(p => p.isValid);
    if (validNumbers.length === 0) {
      setError('No valid phone numbers found');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      // Here you would integrate with your backend to send SMS
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulated API call
      setSuccess(`Successfully sent SMS to ${validNumbers.length} recipients`);
      setPhoneNumbers([]);
      setMessage('');
    } catch (err) {
      setError('Failed to send SMS messages');
    } finally {
      setIsLoading(false);
    }
  };

  const addPhoneNumber = () => {
    setTwilioSettings(prev => ({
      ...prev,
      phoneNumbers: [...prev.phoneNumbers, '']
    }));
  };

  const removePhoneNumber = (index: number) => {
    setTwilioSettings(prev => ({
      ...prev,
      phoneNumbers: prev.phoneNumbers.filter((_, i) => i !== index)
    }));
  };

  const updatePhoneNumber = (index: number, value: string) => {
    setTwilioSettings(prev => ({
      ...prev,
      phoneNumbers: prev.phoneNumbers.map((phone, i) => 
        i === index ? value : phone
      )
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-4">
              <Link
                to="/"
                className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
              >
                <ArrowLeft className="h-6 w-6" />
              </Link>
              <div className="flex items-center">
                <MessageSquare className="h-8 w-8 text-indigo-600" />
                <span className="ml-2 text-xl font-semibold text-gray-900">Automated SMS</span>
              </div>
            </div>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
            >
              <Settings className="h-6 w-6" />
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {showSettings ? (
          <div className="bg-white rounded-xl shadow-sm p-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Twilio Settings</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Account SID
                </label>
                <input
                  type="text"
                  value={twilioSettings.accountSid}
                  onChange={(e) => setTwilioSettings(prev => ({ ...prev, accountSid: e.target.value }))}
                  className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter your Twilio Account SID"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Auth Token
                </label>
                <input
                  type="password"
                  value={twilioSettings.authToken}
                  onChange={(e) => setTwilioSettings(prev => ({ ...prev, authToken: e.target.value }))}
                  className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter your Twilio Auth Token"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sender Phone Numbers
                </label>
                <div className="space-y-3">
                  {twilioSettings.phoneNumbers.map((phone, index) => (
                    <div key={index} className="flex space-x-2">
                      <input
                        type="text"
                        value={phone}
                        onChange={(e) => updatePhoneNumber(index, e.target.value)}
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="+1234567890"
                      />
                      {twilioSettings.phoneNumbers.length > 1 && (
                        <button
                          onClick={() => removePhoneNumber(index)}
                          className="p-3 text-gray-400 hover:text-gray-500"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={addPhoneNumber}
                    className="text-sm text-indigo-600 hover:text-indigo-700"
                  >
                    + Add another phone number
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Upload Phone Numbers</h2>
              
              <div
                className="border-2 border-dashed rounded-lg p-6 text-center"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const file = e.dataTransfer.files[0];
                  if (file) {
                    const input = fileInputRef.current;
                    if (input) {
                      const dataTransfer = new DataTransfer();
                      dataTransfer.items.add(file);
                      input.files = dataTransfer.files;
                      input.dispatchEvent(new Event('change', { bubbles: true }));
                    }
                  }
                }}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept=".csv"
                  className="hidden"
                />
                <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">
                  Drag and drop your CSV file here, or{' '}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="text-indigo-600 hover:text-indigo-500"
                  >
                    browse
                  </button>
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Only CSV files are supported
                </p>
              </div>

              {phoneNumbers.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">
                    Uploaded Phone Numbers ({phoneNumbers.filter(p => p.isValid).length} valid)
                  </h3>
                  <div className="max-h-40 overflow-y-auto border rounded-lg">
                    {phoneNumbers.map((phone, index) => (
                      <div
                        key={index}
                        className={`flex items-center justify-between px-4 py-2 border-b last:border-b-0 ${
                          phone.isValid ? 'text-gray-700' : 'text-red-500'
                        }`}
                      >
                        <span>{phone.number}</span>
                        {!phone.isValid && (
                          <AlertCircle className="h-4 w-4" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl shadow-sm p-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Compose Message</h2>
              
              <div className="space-y-4">
                <div>
                  <textarea
                    value={message}
                    onChange={(e) => {
                      if (e.target.value.length <= MAX_MESSAGE_LENGTH) {
                        setMessage(e.target.value);
                      }
                    }}
                    className="w-full h-32 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Type your message here..."
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    {message.length}/{MAX_MESSAGE_LENGTH} characters
                  </p>
                </div>

                {(error || success) && (
                  <div className={`p-4 rounded-lg ${
                    error ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
                  }`}>
                    {error || success}
                  </div>
                )}

                <button
                  onClick={handleSendSMS}
                  disabled={isLoading}
                  className={`w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-medium
                    hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 
                    focus:ring-offset-2 transition-colors ${
                      isLoading ? 'opacity-75 cursor-not-allowed' : ''
                    }`}
                >
                  {isLoading ? 'Sending...' : 'Send SMS'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 