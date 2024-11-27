import { CallData } from '../types';

const BASE_URL = 'https://api.vapi.ai';

const getApiKey = () => {
  // Get current user
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
  const apiKey = localStorage.getItem(`vapiKey_${currentUser.username}`);
  
  if (!apiKey) {
    throw new Error('No API key found. Please set your API key in Settings.');
  }
  return apiKey;
};

export const fetchCalls = async (
  dateRange: { from: string; to: string }, 
  page: number, 
  pageSize: number
) => {
  try {
    const response = await fetch(`${BASE_URL}/call`, {
      headers: {
        'Authorization': `Bearer ${getApiKey()}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch calls: ${response.status}`);
    }

    const data = await response.json();

    return data
      .filter((call: any) => 
        call.type === 'webCall' || 
        call.type === 'inboundPhoneCall' || 
        call.type === 'outboundPhoneCall'
      )
      .map((call: any) => ({
        id: call.id,
        timestamp: new Date(call.createdAt),
        duration: call.startedAt && call.endedAt 
          ? Math.round((new Date(call.endedAt).getTime() - new Date(call.startedAt).getTime()) / 1000)
          : 0,
        agentName: call.assistant?.name || 'AI Assistant',
        customerName: call.customer?.name || 'Unknown Customer',
        status: 'completed',
        sentiment: call.artifact?.sentiment || 'neutral',
        transcript: call.artifact?.transcript || 'No transcript available',
        category: call.type || 'Other',
        cost: call.cost || 0,
        outcome: 'Completed'
      })) as CallData[];
  } catch (error) {
    console.error('Error fetching calls:', error);
    throw error;
  }
};