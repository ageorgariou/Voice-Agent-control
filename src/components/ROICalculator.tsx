import React, { useState } from 'react';
import { Calculator, DollarSign, PhoneCall, PercentIcon, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import InputField from './InputField';
import ResultCard from './ResultCard';

export default function ROICalculator() {
  const [values, setValues] = useState({
    averageClientValue: '',
    missedCallsPerMonth: '',
    averageCloseRate: ''
  });

  const [results, setResults] = useState({
    monthlyLeftOnTable: 0,
    agencyFee: 99,
    roi: 0
  });

  const [isCalculated, setIsCalculated] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Allow only numbers and decimal points
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setValues(prev => ({
        ...prev,
        [name]: value
      }));
      setIsCalculated(false);
    }
  };

  const calculateROI = () => {
    const clientValue = parseFloat(values.averageClientValue) || 0;
    const missedCalls = parseFloat(values.missedCallsPerMonth) || 0;
    const closeRate = parseFloat(values.averageCloseRate) || 0;

    const monthlyRevenue = missedCalls * clientValue * (closeRate / 100);
    const monthlyLeftOnTable = monthlyRevenue - results.agencyFee;
    const roi = ((monthlyLeftOnTable / results.agencyFee) * 100);

    setResults({
      ...results,
      monthlyLeftOnTable,
      roi
    });
    
    setIsCalculated(true);
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
                <Calculator className="h-8 w-8 text-indigo-600" />
                <span className="ml-2 text-xl font-semibold text-gray-900">ROI Calculator</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center justify-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900">
              Missed Call ROI Calculator
            </h1>
          </div>

          <div className="space-y-6">
            <InputField
              icon={DollarSign}
              name="averageClientValue"
              label="Average Client Value"
              value={values.averageClientValue}
              placeholder="Enter value"
              onChange={handleInputChange}
            />

            <InputField
              icon={PhoneCall}
              name="missedCallsPerMonth"
              label="Missed Calls Per Month"
              value={values.missedCallsPerMonth}
              placeholder="Enter number"
              onChange={handleInputChange}
            />

            <InputField
              icon={PercentIcon}
              name="averageCloseRate"
              label="Average Close Rate (%)"
              value={values.averageCloseRate}
              placeholder="Enter percentage"
              onChange={handleInputChange}
            />

            <button
              onClick={calculateROI}
              className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-medium
                       hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 
                       focus:ring-offset-2 transform transition-transform duration-200 
                       hover:scale-[1.02] active:scale-[0.98]"
            >
              Calculate ROI
            </button>
          </div>

          <div className="mt-8 space-y-4">
            <ResultCard
              label="Monthly Revenue Left on Table"
              value={results.monthlyLeftOnTable}
              isCalculated={isCalculated}
            />
            
            <ResultCard
              label="Monthly Service Fee"
              value={results.agencyFee}
              isCalculated={isCalculated}
            />
            
            <ResultCard
              label="Return on Investment"
              value={results.roi}
              prefix=""
              suffix="%"
              isCalculated={isCalculated}
            />
          </div>
        </div>
      </div>
    </div>
  );
} 