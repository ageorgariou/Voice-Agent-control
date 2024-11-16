import { CallData } from '../types';

export const mockCallData: CallData[] = [
  {
    id: '1',
    timestamp: new Date(),
    duration: 325,
    agentName: 'Sarah Miller',
    customerName: 'John Doe',
    status: 'completed',
    sentiment: 'positive',
    transcript: 'Thank you for your patience. I've resolved the billing issue...',
    category: 'Billing',
  },
  // Add more mock data as needed
];