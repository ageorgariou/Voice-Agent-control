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
  pageSize: number,
  apiKey?: string
) => {
  try {
    const authKey = apiKey || getApiKey();

    // Build query parameters for VAPI API
    const params = new URLSearchParams({
      limit: pageSize.toString(),
      createdAtGe: dateRange.from,
      createdAtLe: dateRange.to
    });

    console.log('VAPI API Request:', `${BASE_URL}/call?${params}`);
    console.log('Date Range:', dateRange);
    console.log('Page Size:', pageSize);

    const response = await fetch(`${BASE_URL}/call?${params}`, {
      headers: {
        'Authorization': `Bearer ${authKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch calls: ${response.status}`);
    }

    const data = await response.json();
    console.log('Raw VAPI Response:', data);
    console.log('Total calls received from API:', data.length);

    // Filter calls by type (date filtering now handled by API query params)
    const processedCalls = data
      .filter((call: any) => {
        // Filter by call type
        const validTypes = ['webCall', 'inboundPhoneCall', 'outboundPhoneCall', 'vapi.websocketCall'];
        return validTypes.includes(call.type);
      })
      .map((call: any) => {
        // Calculate duration properly
        let duration = 0;
        if (call.startedAt && call.endedAt) {
          duration = Math.round((new Date(call.endedAt).getTime() - new Date(call.startedAt).getTime()) / 1000);
        }

        // Extract transcript from messages array - VAPI stores transcripts in artifact.transcript array
        let transcript = 'No transcript available';

        // First try artifact.transcript (this is the main transcript location per VAPI docs)
        if (call.artifact?.transcript && Array.isArray(call.artifact.transcript)) {
          console.log('Processing artifact transcript for call:', call.id, call.artifact.transcript);
          transcript = call.artifact.transcript
            .filter((msg: any) => msg.role === 'user' || msg.role === 'assistant' || msg.role === 'bot')
            .map((msg: any) => {
              const content = msg.message || msg.content || msg.text || '';
              const role = msg.role === 'bot' ? 'assistant' : msg.role;
              console.log('Transcript message:', role, content);
              return content ? `${role}: ${content}` : '';
            })
            .filter((line: string) => line.trim() !== '')
            .join('\n');
        }
        // Fallback to messages array if artifact.transcript not available
        else if (call.messages && call.messages.length > 0) {
          console.log('Processing messages for call:', call.id, call.messages);
          transcript = call.messages
            .filter((msg: any) => msg.role === 'user' || msg.role === 'assistant' || msg.role === 'bot')
            .map((msg: any) => {
              const content = msg.content || msg.message || msg.text || '';
              const role = msg.role === 'bot' ? 'assistant' : (msg.role || 'unknown');
              console.log('Message:', role, content);
              return content ? `${role}: ${content}` : '';
            })
            .filter((line: string) => line.trim() !== '')
            .join('\n');
        }

        // Additional fallbacks
        if (!transcript || transcript === 'No transcript available' || transcript.trim() === '') {
          if (typeof call.artifact?.transcript === 'string') {
            transcript = call.artifact.transcript;
            console.log('Using artifact transcript string:', transcript);
          } else if (call.analysis?.transcript) {
            transcript = call.analysis.transcript;
            console.log('Using analysis transcript:', transcript);
          } else if (call.transcript) {
            transcript = call.transcript;
            console.log('Using direct transcript:', transcript);
          }
        }

        console.log('Final transcript for call', call.id, ':', transcript);
        console.log('Full call object for debugging:', JSON.stringify(call, null, 2));

        // Map status correctly
        let status = 'unknown';
        let outcome = 'Unknown';

        if (call.status === 'ended') {
          status = 'completed';
          outcome = call.endedReason || 'Completed';
        } else if (call.status === 'in-progress') {
          status = 'in-progress';
          outcome = 'In Progress';
        } else if (call.status === 'queued') {
          status = 'queued';
          outcome = 'Queued';
        }

        // Extract sentiment from analysis
        let sentiment = 'neutral';
        if (call.analysis?.sentiment) {
          sentiment = call.analysis.sentiment;
        }

        return {
          id: call.id,
          timestamp: new Date(call.createdAt),
          duration,
          agentName: call.assistant?.name || call.squad?.name || 'AI Assistant',
          customerName: call.customer?.name || call.customer?.number || 'Unknown Customer',
          status,
          sentiment,
          transcript,
          category: call.type || 'Other',
          cost: call.cost || 0,
          outcome
        };
      }) as CallData[];

    console.log('Processed calls count:', processedCalls.length);
    console.log('Final calls being returned:', processedCalls);

    return processedCalls;
  } catch (error) {
    console.error('Error fetching calls:', error);
    throw error;
  }
};