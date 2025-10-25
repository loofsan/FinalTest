export type DifficultyLevel = 'easy' | 'medium' | 'hard';

export type Vibe = 'casual' | 'academic' | 'professional' | 'tense' | 'formal';

export type ScenarioType = 
  | 'party'
  | 'classroom'
  | 'job-interview'
  | 'de-escalation'
  | 'presentation';

export interface Scenario {
  id: string;
  title: string;
  description: string;
  type: ScenarioType;
  participantCount: number;
  duration: number; // in seconds
  icon: string;
  difficulty: DifficultyLevel;
  basePrompt: string;
  vibe: Vibe;
  presentational: boolean;
}

export interface Agent {
  id: string;
  name: string;
  personality: string;
  avatar: string;
  role?: string;
  voiceId?: string;
  emotionPrefix?: string;
}

export interface Message {
  id: string;
  agentId: string;
  agentName: string;
  content: string;
  timestamp: Date;
  isUser?: boolean;
}

export interface PracticeSession {
  scenarioId: string;
  startTime: Date;
  messages: Message[];
  score: number;
  difficulty: DifficultyLevel;
}

// Presentational flow types for structured presentation plans
export interface FlowSection {
  id: string;
  title: string;
  goals: string[];
}

export interface PresentationalFlow {
  intro: FlowSection;
  sections: FlowSection[];
  conclusion: FlowSection;
  qa: FlowSection;
}

// Talking points for scenario guidance
export interface TalkingPoint {
  id: string;
  text: string;
  importance: number; // 1 (low) to 5 (high)
}

// Persisted setup context handed off to practice page
export interface SetupContext {
  scenarioId: string;
  extraDetails: string;
  timeLimitMinutes: number; // 0 disables timer
  extractedHash: string | null; // hash of extracted.text, not the text itself
  talkingPoints: TalkingPoint[] | null;
  flow: PresentationalFlow | null;
  updatedAt: number; // epoch ms
}