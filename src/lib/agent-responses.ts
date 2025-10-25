import { ScenarioType, Agent, DifficultyLevel } from '@/types';

const responseTemplates: Record<ScenarioType, string[]> = {
  party: [
    "Hey! Great to meet you! What brings you here tonight?",
    "I love this music! Have you tried the appetizers yet?",
    "So, what do you do for fun?",
    "This is such a nice venue, right?",
    "Do you know many people here?"
  ],
  classroom: [
    "Can you elaborate on that point?",
    "What's your reasoning behind that answer?",
    "Interesting perspective. Can you explain further?",
    "I'm not sure I follow. Could you clarify?",
    "That's a good start. What else can you add?"
  ],
  'job-interview': [
    "Tell me about yourself and your background.",
    "What interests you about this position?",
    "Can you describe a challenging situation you've faced?",
    "Where do you see yourself in five years?",
    "What are your greatest strengths?",
    "Why should we hire you?"
  ],
  'de-escalation': [
    "I'm really frustrated with this situation!",
    "This isn't what I expected at all.",
    "Can you help me understand what's going on?",
    "I need this resolved immediately.",
    "I appreciate you taking the time to talk."
  ],
  presentation: [
    "Could you explain that slide in more detail?",
    "What data supports that conclusion?",
    "How does this compare to other approaches?",
    "Can you give us a real-world example?",
    "What are the potential limitations?"
  ]
};

const followUpQuestions: Record<ScenarioType, string[]> = {
  party: [
    "That's interesting! How did you get into that?",
    "Oh really? Tell me more!",
    "I've always wanted to try that. Any tips?"
  ],
  classroom: [
    "Can you provide an example?",
    "What evidence supports that?",
    "How does that relate to what we discussed earlier?"
  ],
  'job-interview': [
    "Can you give me a specific example?",
    "How did you handle that situation?",
    "What did you learn from that experience?"
  ],
  'de-escalation': [
    "I understand, but can we find a solution?",
    "What would make this better for you?",
    "Let's work through this together."
  ],
  presentation: [
    "Could you clarify that point?",
    "What's your source for that information?",
    "How confident are you in these results?"
  ]
};

export const generateAgentResponse = (
  scenarioType: ScenarioType,
  agent: Agent,
  difficulty: DifficultyLevel,
  conversationHistory: string[]
): string => {
  const templates = responseTemplates[scenarioType];
  const followUps = followUpQuestions[scenarioType];
  
  // Use follow-up questions if conversation has progressed
  const pool = conversationHistory.length > 2 ? [...templates, ...followUps] : templates;
  
  const randomIndex = Math.floor(Math.random() * pool.length);
  return pool[randomIndex];
};

export const getResponseDelay = (difficulty: DifficultyLevel): number => {
  const delays = {
    easy: 8000,    // 8 seconds
    medium: 5000,  // 5 seconds
    hard: 3000     // 3 seconds
  };
  
  return delays[difficulty] + Math.random() * 2000; // Add some randomness
};

export const calculateScore = (
  messageCount: number,
  duration: number,
  difficulty: DifficultyLevel
): number => {
  const baseScore = messageCount * 10;
  const timeBonus = Math.max(0, 100 - duration / 10);
  const difficultyMultiplier = difficulty === 'hard' ? 1.5 : difficulty === 'medium' ? 1.2 : 1;
  
  return Math.round((baseScore + timeBonus) * difficultyMultiplier);
};