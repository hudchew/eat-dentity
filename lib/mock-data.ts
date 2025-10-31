// Mock data for Phase 2: UI Development

export interface ChallengeStats {
  fried: number;
  vegetables: number;
  meat: number;
  carbs: number;
  dessert: number;
  coffee: number;
}

export interface Challenge {
  id: string;
  currentDay: number;
  totalDays: number;
  startDate: Date;
  endDate: Date;
  status: 'ACTIVE' | 'COMPLETED' | 'ABANDONED';
  stats: ChallengeStats;
}

export interface Persona {
  id: string;
  title: string;
  subtitle: string;
  emoji: string;
  description: string;
  stats: ChallengeStats;
  powers: {
    attack: { label: string; value: string; emoji: string };
    defense: { label: string; value: string; emoji: string };
    speed: { label: string; value: string; emoji: string };
  };
  aiInsight: string;
}

export interface PersonaCard {
  id: string;
  persona: Persona;
  challengeDate: string;
}

export const mockChallenge: Challenge = {
  id: 'challenge-1',
  currentDay: 3,
  totalDays: 7,
  startDate: new Date('2025-10-31'),
  endDate: new Date('2025-11-06'),
  status: 'ACTIVE',
  stats: {
    fried: 40,
    vegetables: 20,
    meat: 30,
    carbs: 10,
    dessert: 15,
    coffee: 25,
  },
};

export const mockPersona: Persona = {
  id: 'persona-1',
  title: 'นักรบไก่ทอด ผู้แบกโลกด้วยไขมัน',
  subtitle: 'คุณคือนักรบตัวจริง ที่ใช้พลังงานจากไขมันเป็นวิถีชีวิต',
  emoji: '🍗⚔️',
  description: 'คุณคือนักรบที่แท้จริง ผู้แบกรับโลกด้วยพลังจากไขมัน! 🍗',
  stats: {
    fried: 55,
    vegetables: 5,
    meat: 30,
    carbs: 10,
    dessert: 8,
    coffee: 12,
  },
  powers: {
    attack: { label: 'พลังโจมตี (ไขมัน)', value: 'สูงมาก', emoji: '💪' },
    defense: { label: 'พลังป้องกัน (ผัก)', value: 'ต่ำมาก', emoji: '😅' },
    speed: { label: 'ความว่องไว', value: 'ช้าหน่วง', emoji: '🐌' },
  },
  aiInsight:
    'จงภูมิใจในความกรอบนี้! 🍗🔥 คุณคือนักรบที่แท้จริง ผู้ใช้พลังงานจากไขมันเป็นวิถีชีวิต แต่... อาจจะต้องหาเวลาพักผ่อนให้ร่างกายบ้างนะ เพื่อความสมดุลที่ดีกว่า!',
};

export const mockDailyChallenge = {
  text: 'ภารกิจวันนี้: ตามหา "ผักวิเศษ" ที่ซ่อนอยู่ในอาหารของคุณ! 🥬✨',
  day: 3,
};

export const mockPersonaCards: PersonaCard[] = [
  {
    id: 'card-1',
    persona: mockPersona,
    challengeDate: '1-7 ต.ค. 2025',
  },
  {
    id: 'card-2',
    persona: {
      ...mockPersona,
      id: 'persona-2',
      title: 'กระต่ายน้อยรักษ์โลก (เลเวล 5)',
      emoji: '🐰🥬',
      stats: { ...mockPersona.stats, vegetables: 70, fried: 5 },
    },
    challengeDate: '10-16 ต.ค. 2025',
  },
  {
    id: 'card-3',
    persona: {
      ...mockPersona,
      id: 'persona-3',
      title: 'มนุษย์คาเฟอีน ผู้ขับเคลื่อนด้วยกาแฟดำ',
      emoji: '☕💪',
      stats: { ...mockPersona.stats, coffee: 60, vegetables: 10 },
    },
    challengeDate: '20-26 ต.ค. 2025',
  },
];

export const mockChallengeHistory = [
  {
    id: 'challenge-1',
    number: 1,
    dateRange: '1-7 ต.ค. 2025',
    persona: 'นักรบไก่ทอด ผู้แบกโลกด้วยไขมัน',
    status: 'COMPLETED',
  },
  {
    id: 'challenge-2',
    number: 2,
    dateRange: '10-16 ต.ค. 2025',
    persona: 'กระต่ายน้อยรักษ์โลก (เลเวล 5)',
    status: 'COMPLETED',
  },
  {
    id: 'challenge-3',
    number: 3,
    dateRange: '20-26 ต.ค. 2025',
    persona: 'มนุษย์คาเฟอีน ผู้ขับเคลื่อนด้วยกาแฟดำ',
    status: 'COMPLETED',
  },
];

export const mockOverallStats = {
  totalChallenges: 3,
  personas: 3,
  averageStats: {
    fried: 35,
    vegetables: 30,
    meat: 25,
    carbs: 10,
  },
};

export const mockUser = {
  name: 'พี่สุ',
  email: 'su@example.com',
  imageUrl: '/api/placeholder/150/150',
};

