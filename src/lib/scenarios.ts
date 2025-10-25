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
    { name: 'Alex', personality: 'friendly and outgoing', avatar: '👨', voiceId: 'b5f4515fd395410b9ed3aef6fa51d9a0'},
    { name: 'Sarah', personality: 'professional and direct', avatar: '👩', voiceId: '933563129e564b19a115bedd57b7406a' },
    { name: 'Mike', personality: 'curious and inquisitive', avatar: '👨‍💼', voiceId: 'f3e8c5bbead746e29d47d38a146247ff' },
    { name: 'Emma', personality: 'supportive and encouraging', avatar: '👩‍💼', voiceId: 'fbae2ecb433e41a29495707efbc594b5' },
    { name: 'David', personality: 'analytical and thoughtful', avatar: '👨‍🏫', voiceId: 'c39a76f685cf4f8fb41cd5d3d66b497d' },
    { name: 'Lisa', personality: 'energetic and enthusiastic', avatar: '👩‍🎓', voiceId: 'd85e5484b8794626975d69b6ab27ac0c' },
    { name: 'James', personality: 'calm and collected', avatar: '👨‍🎓', voiceId: '0b74ead073f2474a904f69033535b98e' },
    { name: 'Rachel', personality: 'challenging and critical', avatar: '👩‍🏫', voiceId: '8cccba59fb744f6d941dad96b3cc6cad' }
  ];

  return agentPool
    .sort(() => Math.random() - 0.5)
    .slice(0, scenario.participantCount)
    .map((agent, index) => ({
      id: `agent-${index}`,
      ...agent
    }));
};