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
    cost: 0,
    outcome: 'Completed'
  },
  // Add more mock data as needed
];

export const initializeAdminUser = () => {
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  
  // Check if admin user already exists
  if (!users.some((user: any) => user.username === 'admin')) {
    const adminUser = {
      username: 'admin',
      password: '12345',
      name: 'Administrator',
      email: 'admin@example.com',
      airtableBaseName: 'Sabos Account',
      createdAt: new Date().toISOString()
    };
    
    localStorage.setItem('users', JSON.stringify([...users, adminUser]));
    
    // Initialize admin's API key as empty
    if (!localStorage.getItem('vapiKey_admin')) {
      localStorage.setItem('vapiKey_admin', '');
    }
  }
};