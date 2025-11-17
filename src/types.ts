export interface CallData {
  id: string;
  timestamp: Date;
  duration: number;
  agentName: string;
  customerName: string;
  status: 'completed' | 'missed' | 'transferred';
  sentiment: 'positive' | 'neutral' | 'negative';
  transcript: string;
  category: string;
  cost: number;
  outcome: 'Completed' | 'Follow Up Required' | 'Not interested';
}

export type TimeFrame = 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface MetricCard {
  title: string;
  value: number;
  change: number;
  icon: React.ReactNode;
}

export type FilterOption = 'Completed' | 'Follow Up Required' | 'Not interested';

export interface SavedContract {
  id: string;
  title: string;
  date: string;
  document: string;
  fileName: string;
  fileType: string;
  uploadedAt: Date;
  uploadedBy: string;
}

export interface User {
  _id?: string;
  id?: string;
  username: string;
  password: string;
  name: string;
  email: string;
  userType: 'Admin' | 'User';
  airtable_base_name?: string;
  features?: {
    smsCampaigns?: boolean;
    chatbotTranscripts?: boolean;
    aiVideoGeneration?: boolean;
  };
  apiKeys?: {
    vapi_key?: string;
    openai_key?: string;
    elevenlabs_key?: string;
    [key: string]: string | undefined;
  };
  settings?: {
    two_fa_enabled: boolean;
    notifications_enabled: boolean;
    [key: string]: any;
  };
  created_at: Date;
  updated_at: Date;
  last_login?: Date;
  is_active: boolean;
}