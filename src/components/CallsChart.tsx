import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { CallData, TimeFrame } from '../types';

interface CallsChartProps {
  timeFrame: TimeFrame;
  calls: CallData[];
}

export default function CallsChart({ timeFrame, calls }: CallsChartProps) {
  const chartData = useMemo(() => {
    const data: { name: string; calls: number }[] = [];
    const now = new Date();

    switch (timeFrame) {
      case 'daily': {
        // Group by hour
        for (let i = 0; i < 24; i++) {
          const hour = i < 10 ? `0${i}` : `${i}`;
          const count = calls.filter(call => {
            const callHour = call.timestamp.getHours();
            return callHour === i;
          }).length;
          data.push({ name: `${hour}:00`, calls: count });
        }
        break;
      }
      case 'weekly': {
        // Group by day of week
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        for (let i = 6; i >= 0; i--) {
          const date = new Date(now);
          date.setDate(date.getDate() - i);
          const count = calls.filter(call => {
            return call.timestamp.toDateString() === date.toDateString();
          }).length;
          data.push({ name: days[date.getDay()], calls: count });
        }
        break;
      }
      case 'monthly': {
        // Group by last 30 days
        for (let i = 29; i >= 0; i--) {
          const date = new Date(now);
          date.setDate(date.getDate() - i);
          const count = calls.filter(call => {
            return call.timestamp.toDateString() === date.toDateString();
          }).length;
          data.push({ 
            name: `${date.getMonth() + 1}/${date.getDate()}`,
            calls: count 
          });
        }
        break;
      }
      case 'yearly': {
        // Group by month
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        for (let i = 11; i >= 0; i--) {
          const date = new Date(now);
          date.setMonth(date.getMonth() - i);
          const month = date.getMonth();
          const year = date.getFullYear();
          const count = calls.filter(call => {
            return call.timestamp.getMonth() === month && 
                   call.timestamp.getFullYear() === year;
          }).length;
          data.push({ name: months[month], calls: count });
        }
        break;
      }
    }

    return data;
  }, [timeFrame, calls]);

  return (
    <div className="p-6 flex flex-col" style={{ height: '500px' }}>
      <h3 className="text-lg font-medium text-gray-900 mb-4">Call Volume Trends</h3>
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
            <XAxis 
              dataKey="name" 
              tick={{ fill: '#6B7280', fontSize: 12 }}
              axisLine={{ stroke: '#E5E7EB' }}
              tickLine={{ stroke: '#E5E7EB' }}
            />
            <YAxis 
              tick={{ fill: '#6B7280', fontSize: 12 }}
              axisLine={{ stroke: '#E5E7EB' }}
              tickLine={{ stroke: '#E5E7EB' }}
              width={40}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#FFF',
                border: '1px solid #E5E7EB',
                borderRadius: '0.5rem',
                padding: '0.5rem',
              }}
              cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
            />
            <Bar 
              dataKey="calls" 
              fill="#4F46E5"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}