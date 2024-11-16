import React, { useState, useEffect } from 'react';
import { FileText, ArrowLeft, Upload, X, Check, Search, SortAsc, SortDesc, Eye, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ContractFormData {
  title: string;
  date: string;
  document: File | null;
}

interface SavedContract {
  id: string;
  title: string;
  date: string;
  document: File;
  uploadedAt: Date;
}

interface FormErrors {
  title?: string;
  date?: string;
  document?: string;
}

export default function ContractForms() {
  const [formData, setFormData] = useState<ContractFormData>({
    title: '',
    date: '',
    document: null
  });

  const [savedContracts, setSavedContracts] = useState<SavedContract[]>(() => {
    const saved = localStorage.getItem('contracts');
    return saved ? JSON.parse(saved) : [];
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [successMessage, setSuccessMessage] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    localStorage.setItem('contracts', JSON.stringify(savedContracts));
  }, [savedContracts]);

  const allowedFileTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    if (!formData.title.trim()) {
      newErrors.title = 'Contract title is required';
      isValid = false;
    }

    if (!formData.date) {
      newErrors.date = 'Contract date is required';
      isValid = false;
    }

    if (!formData.document) {
      newErrors.document = 'Contract document is required';
      isValid = false;
    } else if (!allowedFileTypes.includes(formData.document.type)) {
      newErrors.document = 'Invalid file type. Please upload PDF or Word documents';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage('');

    if (validateForm()) {
      try {
        const newContract: SavedContract = {
          id: Date.now().toString(),
          title: formData.title,
          date: formData.date,
          document: formData.document!,
          uploadedAt: new Date()
        };

        setSavedContracts(prev => [newContract, ...prev]);
        setSuccessMessage('Contract uploaded successfully!');
        
        setFormData({
          title: '',
          date: '',
          document: null
        });

        setTimeout(() => {
          setSuccessMessage('');
        }, 3000);
      } catch (error) {
        setErrors(prev => ({ ...prev, submit: 'Failed to upload contract' }));
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file && allowedFileTypes.includes(file.type)) {
      setFormData(prev => ({ ...prev, document: file }));
      setErrors(prev => ({ ...prev, document: undefined }));
    } else {
      setErrors(prev => ({ 
        ...prev, 
        document: 'Invalid file type. Please upload PDF or Word documents' 
      }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && allowedFileTypes.includes(file.type)) {
      setFormData(prev => ({ ...prev, document: file }));
      setErrors(prev => ({ ...prev, document: undefined }));
    } else {
      setErrors(prev => ({ 
        ...prev, 
        document: 'Invalid file type. Please upload PDF or Word documents' 
      }));
    }
  };

  const removeFile = () => {
    setFormData(prev => ({ ...prev, document: null }));
  };

  const handlePreview = (contract: SavedContract) => {
    const url = URL.createObjectURL(contract.document);
    window.open(url, '_blank');
    URL.revokeObjectURL(url);
  };

  const handleDeleteContract = (contractId: string) => {
    setSavedContracts(prev => prev.filter(contract => contract.id !== contractId));
    setSuccessMessage('Contract deleted successfully!');
    setTimeout(() => {
      setSuccessMessage('');
    }, 3000);
  };

  const filteredContracts = savedContracts
    .filter(contract => 
      contract.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });

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
                <FileText className="h-8 w-8 text-indigo-600" />
                <span className="ml-2 text-xl font-semibold text-gray-900">Contract Forms</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Upload New Contract</h2>

          {successMessage && (
            <div className="mb-6 bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg flex items-center">
              <Check className="h-5 w-5 mr-2" />
              {successMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contract Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter contract title"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contract Date
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
              {errors.date && (
                <p className="mt-1 text-sm text-red-600">{errors.date}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contract Document
              </label>
              <div
                className={`border-2 border-dashed rounded-lg p-6 transition-colors
                  ${isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300'}
                  ${errors.document ? 'border-red-300' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                {formData.document ? (
                  <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-600">{formData.document.name}</span>
                    </div>
                    <button
                      type="button"
                      onClick={removeFile}
                      className="text-gray-400 hover:text-gray-500"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                ) : (
                  <div className="text-center">
                    <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">
                      Drag and drop your file here, or{' '}
                      <label className="text-indigo-600 hover:text-indigo-500 cursor-pointer">
                        browse
                        <input
                          type="file"
                          className="hidden"
                          accept=".pdf,.doc,.docx"
                          onChange={handleFileChange}
                        />
                      </label>
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Supported formats: PDF, DOC, DOCX
                    </p>
                  </div>
                )}
              </div>
              {errors.document && (
                <p className="mt-1 text-sm text-red-600">{errors.document}</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-medium
                       hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 
                       focus:ring-offset-2 transition-colors"
            >
              Upload Contract
            </button>
          </form>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Saved Contracts</h2>
            
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search contracts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              
              <button
                onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                {sortOrder === 'asc' ? (
                  <SortAsc className="h-5 w-5 text-gray-400" />
                ) : (
                  <SortDesc className="h-5 w-5 text-gray-400" />
                )}
                <span>Date</span>
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {filteredContracts.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No contracts found</p>
            ) : (
              filteredContracts.map(contract => (
                <div
                  key={contract.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                >
                  <div>
                    <h3 className="font-medium text-gray-900">{contract.title}</h3>
                    <p className="text-sm text-gray-500">
                      {new Date(contract.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handlePreview(contract)}
                      className="flex items-center space-x-2 px-4 py-2 text-indigo-600 hover:text-indigo-700"
                    >
                      <Eye className="h-5 w-5" />
                      <span>Preview</span>
                    </button>
                    <button
                      onClick={() => handleDeleteContract(contract.id)}
                      className="flex items-center space-x-2 px-4 py-2 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-5 w-5" />
                      <span className="sr-only">Delete</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 