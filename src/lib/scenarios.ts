import { Scenario, Agent } from '@/types';

export const scenarios: Scenario[] = [
  {
    id: 'party',
    title: 'At a Party',
    description: 'Practice mingling and making small talk at a social gathering',
    type: 'party',
    participantCount: 4,
    duration: 300,
    icon: '🎉',
    difficulty: 'easy'
  },
  {
    id: 'classroom',
    title: 'Called Out in Class',
    description: 'Handle being called on unexpectedly during a lecture',
    type: 'classroom',
    participantCount: 2,
    duration: 180,
    icon: '📚',
    difficulty: 'medium'
  },
  {
    id: 'job-interview',
    title: 'Job Interview',
    description: 'Navigate a one-on-one job interview scenario',
    type: 'job-interview',
    participantCount: 2,
    duration: 600,
    icon: '💼',
    difficulty: 'hard'
  },
  {
    id: 'de-escalation',
    title: 'De-escalation',
    description: 'Practice calming down a tense situation',
    type: 'de-escalation',
    participantCount: 3,
    duration: 240,
    icon: '🤝',
    difficulty: 'hard'
  },
  {
    id: 'presentation',
    title: 'Class Presentation',
    description: 'Deliver a presentation to your classmates',
    type: 'presentation',
    participantCount: 5,
    duration: 420,
    icon: '🎤',
    difficulty: 'medium'
  }
];

export const getScenarioById = (id: string): Scenario | undefined => {
  return scenarios.find(s => s.id === id);
};

export const generateAgents = (scenario: Scenario): Agent[] => {
  const agentPool = [
    { name: 'Alex', personality: 'friendly and outgoing', avatar: '👨' },
    { name: 'Sarah', personality: 'professional and direct', avatar: '👩' },
    { name: 'Mike', personality: 'curious and inquisitive', avatar: '👨‍💼' },
    { name: 'Emma', personality: 'supportive and encouraging', avatar: '👩‍💼' },
    { name: 'David', personality: 'analytical and thoughtful', avatar: '👨‍🏫' },
    { name: 'Lisa', personality: 'energetic and enthusiastic', avatar: '👩‍🎓' },
    { name: 'James', personality: 'calm and collected', avatar: '👨‍🎓' },
    { name: 'Rachel', personality: 'challenging and critical', avatar: '👩‍🏫' }
  ];

  return agentPool
    .sort(() => Math.random() - 0.5)
    .slice(0, scenario.participantCount)
    .map((agent, index) => ({
      id: `agent-${index}`,
      ...agent
    }));
};