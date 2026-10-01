export type MessageRole = 'user' | 'assistant' | 'system';

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: number;
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: Message[];
  summary?: string;
  selectedMentalModel?: string;
}

export interface MentalModel {
  id: string;
  name: string;
  description: string;
  category: string;
  iconName: string;
  promptSuggestion: string;
}

export interface UserProfile {
  name: string;
  lastActive: number;
}
