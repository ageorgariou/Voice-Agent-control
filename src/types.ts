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