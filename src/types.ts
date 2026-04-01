export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export type Emotion = 'happy' | 'sad' | 'angry' | 'anxious' | 'neutral' | 'excited' | 'calm' | 'frustrated';

export interface VocalMetrics {
  pitch: number;
  tempo: number;
  volume: number;
  stability: number;
}

export interface AnalysisResult {
  id: string;
  text: string;
  primary_emotion: Emotion;
  emotion_scores: Record<string, number>;
  confidence: number;
  created_at: string;
  is_favorite: boolean;
  intensity: number;
  tags: string[];
  advice?: string;
  sentiment?: 'positive' | 'negative' | 'neutral';
  color: string;
  vocal_metrics?: VocalMetrics;
}

export interface AppSettings {
  reminderTime: string | null;
  pinCode: string | null;
  useBiometrics: boolean;
  appIconId: string;
  persona: string;
  theme?: 'light' | 'dark';
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  type: 'analysis' | 'other';
}

export type Language = 'en' | 'ru' | 'kk';
