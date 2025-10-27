export interface UserData {
  name: string;
  email: string;
  age: string;
  gender: string;
  goals: string;
  fears: string;
  personality: 'motivational' | 'calm' | 'funny' | 'friendly' | 'realistic';
  philosophy: string;
  hobbies: string;
  roleModels: string;
  pastExperiences: string;
  upcomingEvents: string;
}

export interface GroundingSource {
  uri: string;
  title: string;
}

export interface ChatMessage {
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  sources?: GroundingSource[];
  feedback?: 'up' | 'down' | null;
}

export type ChatMode = 'balanced' | 'creative' | 'fast';
export type Theme = 'theme-neon-blue' | 'theme-violet-flux' | 'theme-cyber-crimson';

export interface ChatHistoryItem {
  id: string;
  title: string;
  messages: ChatMessage[];
  date: string;
}