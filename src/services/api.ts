export const fetchCalls = async (
  dateRange: { from: string; to: string },
  page: number,
  pageSize: number,
  apiKey: string
) => {
  try {
    // Use the provided API key in your API calls
    const response = await fetch('YOUR_API_ENDPOINT', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      // ... rest of your fetch configuration
    });

    if (!response.ok) {
      throw new Error('Failed to fetch calls');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching calls:', error);
    throw error;
  }
}; 