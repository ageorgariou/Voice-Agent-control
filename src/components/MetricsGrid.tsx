import React from 'react';
import { Phone, Clock, TrendingUp } from 'lucide-react'; // Removed MessageSquare icon
import { TimeFrame, CallData } from '../types';

interface MetricsGridProps {
  timeFrame: TimeFrame;
  calls: CallData[];
}

export default function MetricsGrid({ timeFrame, calls }: MetricsGridProps) {
  // Calculate metrics from real data
  const calculateMetrics = () => {
    const totalCalls = calls.length;
    
    // Calculate average handle time (in seconds)
    const avgHandleTime = calls.length > 0
      ? Math.round(calls.reduce((acc, call) => acc + call.duration, 0) / calls.length)
      : 0;
    
    // Calculate resolution rate (completed calls percentage)
    const completedCalls = calls.filter(call => call.status === 'completed').length;
    const resolutionRate = totalCalls > 0
      ? Math.round((completedCalls / totalCalls) * 100)
      : 0;

    return [
      {
        title: 'Total Calls',
        value: totalCalls,
        change: 0, // We'll calculate this when we have historical data
        icon: <Phone className="h-6 w-6 text-indigo-600" />,
      },
      {
        title: 'Avg. Handle Time',
        value: avgHandleTime,
        change: 0,
        icon: <Clock className="h-6 w-6 text-green-600" />,
      },
      {
        title: 'Resolution Rate',
        value: resolutionRate,
        change: 0,
        icon: <TrendingUp className="h-6 w-6 text-blue-600" />,
      },
    ];
  };

  const metrics = calculateMetrics();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {metrics.map((metric) => (
        <div key={metric.title} className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div className="bg-gray-50 rounded-lg p-3">{metric.icon}</div>
            <span className={`text-sm font-medium ${
              metric.change >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {metric.change !== 0 && (
                <>
                  {metric.change >= 0 ? '↑' : '↓'} {Math.abs(metric.change)}%
                </>
              )}
            </span>
          </div>
          <h3 className="mt-4 text-lg font-medium text-gray-900">{metric.title}</h3>
          <p className="mt-1 text-2xl font-semibold text-gray-900">
            {metric.value}
            {metric.title === 'Avg. Handle Time' ? 's' : 
              metric.title === 'Resolution Rate' ? '%' : ''}
          </p>
          <p className="mt-1 text-sm text-gray-500">
            {timeFrame} overview
          </p>
        </div>
      ))}
    </div>
  );
}
