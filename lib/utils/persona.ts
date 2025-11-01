import type { Persona } from '@prisma/client';

/**
 * Format Persona from database to display format
 */
export function formatPersonaForDisplay(persona: Persona) {
  const stats = persona.statsJson as Record<string, number>;

  // Extract emoji from title (extract first emoji sequence)
  const emojiMatch = persona.title.match(/[\p{Emoji_Presentation}\p{Emoji}\u{1F1E6}-\u{1F1FF}]+/gu);
  const emoji = emojiMatch?.[0] || '🎭';

  // Calculate powers based on stats (fun calculations)
  const powers = {
    attack: {
      label: 'พลังโจมตี (ไขมัน)',
      value: stats.fried > 50 ? 'สูงมาก' : stats.fried > 30 ? 'สูง' : stats.fried > 10 ? 'ปานกลาง' : 'ต่ำ',
      emoji: '💪',
    },
    defense: {
      label: 'พลังป้องกัน (ผัก)',
      value: stats.vegetable > 50 ? 'สูงมาก' : stats.vegetable > 30 ? 'สูง' : stats.vegetable > 10 ? 'ปานกลาง' : 'ต่ำมาก',
      emoji: stats.vegetable > 10 ? '🛡️' : '😅',
    },
    speed: {
      label: 'ความว่องไว',
      value: stats.coffee > 40 ? 'เร็วมาก' : stats.coffee > 20 ? 'เร็ว' : stats.fried > 50 ? 'ช้าหน่วง' : 'ปกติ',
      emoji: stats.coffee > 40 ? '⚡' : stats.fried > 50 ? '🐌' : '🏃',
    },
  };

  return {
    id: persona.id,
    title: persona.title,
    subtitle: persona.description,
    emoji,
    description: persona.description,
    stats: {
      fried: stats.fried || 0,
      vegetables: stats.vegetable || 0,
      meat: stats.meat || 0,
      carbs: stats.carbs || 0,
      dessert: stats.dessert || 0,
      coffee: stats.coffee || 0,
    },
    powers,
    aiInsight: persona.aiInsight || 'กำลังวิเคราะห์ข้อมูล... 🤖',
  };
}

