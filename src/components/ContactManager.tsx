import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Upload, Download, Search, Users, RefreshCw } from 'lucide-react';
import Papa from 'papaparse';
import Airtable from 'airtable';

interface Contact {
  id: string;
  name: string;
  email: string;
  ssn: string;
  bookingTime?: string;
}

export default function ContactManager() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isImporting, setIsImporting] = useState(false);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      setError('Please upload a CSV file');
      return;
    }

    Papa.parse(file, {
      header: true,
      complete: (results) => {
        const parsedContacts = results.data
          .filter((row: any) => row.name || row.Name || row.email || row.Email)
          .map((row: any) => ({
            id: Math.random().toString(36).substr(2, 9),
            name: row.name || row.Name || '',
            email: row.email || row.Email || '',
            ssn: row.ssn || row.SSN || row['Social Security'] || '',
          }));

        setContacts(parsedContacts);
        setSuccess(`Successfully imported ${parsedContacts.length} contacts`);
        setTimeout(() => setSuccess(''), 3000);
      },
      error: (error) => {
        setError('Error parsing file: ' + error.message);
      },
    });
  };

  const handleExportContacts = () => {
    const csv = Papa.unparse(contacts);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'contacts.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const updateContactsFromAirtable = async () => {
    setIsImporting(true);
    setError('');
    
    try {
      const base = new Airtable({
        apiKey: import.meta.env.VITE_AIRTABLE_API_KEY
      }).base(import.meta.env.VITE_AIRTABLE_BASE_ID);

      const baseName = localStorage.getItem('airtableBaseName') || 'Sabos Account';

      const records = await new Promise<Airtable.Records<any>>((resolve, reject) => {
        const records: Airtable.Record<any>[] = [];
        base(baseName)
          .select({
            view: 'Grid view'
          })
          .eachPage(
            function page(pageRecords, fetchNextPage) {
              records.push(...pageRecords);
              fetchNextPage();
            },
            function done(err) {
              if (err) reject(err);
              else resolve(records);
            }
          );
      });

      const airtableContacts = records.map(record => ({
        id: record.id,
        name: record.get('Name') || '',
        email: record.get('Email') || '',
        ssn: record.get('Social Security') || '',
        bookingTime: record.get('Booking Time')
      }));

      setContacts(airtableContacts);
      setSuccess(`Successfully imported ${airtableContacts.length} contacts from Airtable`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Error importing from Airtable: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setIsImporting(false);
    }
  };

  const filteredContacts = contacts.filter(
    contact =>
      contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.ssn.includes(searchQuery)
  );

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
                <Users className="h-8 w-8 text-indigo-600" />
                <span className="ml-2 text-xl font-semibold text-gray-900">Contact Manager</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          {/* Status Messages */}
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg">
              {success}
            </div>
          )}

          {/* Actions Bar */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-4">
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <div className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  <Upload className="h-5 w-5 text-gray-400" />
                  <span>Import CSV</span>
                </div>
              </label>
              <button
                onClick={handleExportContacts}
                disabled={contacts.length === 0}
                className={`flex items-center space-x-2 px-4 py-2 border rounded-lg 
                  ${contacts.length === 0
                    ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                    : 'border-gray-300 hover:bg-gray-50'
                  }`}
              >
                <Download className="h-5 w-5" />
                <span>Export CSV</span>
              </button>
              <button
                onClick={updateContactsFromAirtable}
                disabled={isImporting}
                className={`flex items-center space-x-2 px-4 py-2 border rounded-lg 
                  ${isImporting
                    ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                    : 'border-gray-300 hover:bg-gray-50'
                  }`}
              >
                <RefreshCw className={`h-5 w-5 ${isImporting ? 'animate-spin' : ''}`} />
                <span>{isImporting ? 'Importing...' : 'Import from Airtable'}</span>
              </button>
            </div>

            <div className="relative">
              <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search contacts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Contacts Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Social Security
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredContacts.map((contact) => (
                  <tr key={contact.id}>
                    <td className="px-6 py-4 whitespace-nowrap">{contact.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{contact.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {contact.ssn ? `***-**-${contact.ssn.slice(-4)}` : ''}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredContacts.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No contacts found. Import a CSV file to get started.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 