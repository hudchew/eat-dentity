import { prisma } from './prisma';
import { Status } from '@prisma/client';
import { generatePersonaInsight } from './gemini';

interface PersonaResult {
  title: string;
  description: string;
  emoji: string;
  stats: Record<string, number>;
}

/**
 * Calculate persona from challenge data
 * @param challengeId The challenge ID
 * @returns The created persona
 */
export async function calculatePersona(challengeId: string) {
  // 1. Get meals + tags
  const challenge = await prisma.challenge.findUnique({
    where: { id: challengeId },
    include: {
      meals: {
        include: {
          tags: {
            include: {
              tag: true,
            },
          },
        },
      },
    },
  });

  if (!challenge) {
    throw new Error('Challenge not found');
  }

  if (challenge.meals.length === 0) {
    throw new Error('No meals found in challenge');
  }

  // 2. Count tags
  const tagCounts: Record<string, number> = {};
  let totalTags = 0;

  challenge.meals.forEach((meal) => {
    meal.tags.forEach(({ tag }) => {
      tagCounts[tag.slug] = (tagCounts[tag.slug] || 0) + 1;
      totalTags++;
    });
  });

  // 3. Calculate percentages
  const stats: Record<string, number> = {};
  Object.entries(tagCounts).forEach(([slug, count]) => {
    stats[slug] = Math.round((count / totalTags) * 100);
  });

  // 4. Determine Persona (ตาม Persona Rules ใน app_idea.md)
  const persona = determinePersona(stats);

  // 5. Generate AI Insight (async, but don't fail if it errors)
  let aiInsight: string | null = null;
  try {
    aiInsight = await generatePersonaInsight(persona.title, stats);
    console.log('✅ AI Insight generated successfully');
  } catch (error) {
    console.error('⚠️ Failed to generate AI Insight, continuing without it:', error);
    // Continue without AI insight if it fails
  }

  // 6. Save to database
  const savedPersona = await prisma.persona.create({
    data: {
      challengeId,
      title: persona.title,
      description: persona.description,
      statsJson: stats,
      aiInsight: aiInsight,
    },
  });

  return savedPersona;
}

/**
 * Determine persona based on stats according to rules in app_idea.md
 * Rules are checked in order of priority: Tier 1 > Tier 2 > Tier 3 > Tier 4
 */
function determinePersona(stats: Record<string, number>): PersonaResult {
  // Helper to get stat value safely
  const get = (slug: string) => stats[slug] || 0;

  // Tier 1: Dominant Single Tag (> 50%)
  if (get('fried') > 50) {
    return {
      title: 'นักรบไก่ทอด ผู้แบกโลกด้วยไขมัน',
      description: 'คุณคือนักรบตัวจริง ที่ใช้พลังงานจากไขมันเป็นวิถีชีวิต ทุกคำที่กรอบ ทุกคำที่อร่อย ล้วนเสริมสร้างพลังให้คุณ!',
      emoji: '🍗⚔️',
      stats,
    };
  }

  if (get('vegetable') > 50) {
    return {
      title: 'กระต่ายน้อยรักษ์โลก',
      description: 'คุณคือนักรบสายกรีน ผู้บริสุทธิ์และรักษ์โลก ทุกคำที่กินล้วนเป็นพลังธรรมชาติที่แท้จริง!',
      emoji: '🐰🥬',
      stats,
    };
  }

  if (get('dessert') > 50) {
    return {
      title: 'ราชาน้ำตาล ผู้พิทักษ์ความหวาน',
      description: 'คุณคือราชาแห่งความหวาน ผู้ที่ความสุขมาพร้อมกับน้ำตาลทุกคำ ทุกมื้อล้วนเต็มไปด้วยความหวานชื่นใจ!',
      emoji: '🍰👑',
      stats,
    };
  }

  if (get('coffee') > 40) {
    return {
      title: 'มนุษย์คาเฟอีน ผู้ขับเคลื่อนด้วยกาแฟดำ',
      description: 'คุณคือมนุษย์พลังงานสูง ผู้ขับเคลื่อนชีวิตด้วยคาเฟอีน ทุกแก้วคือพลังที่เติมเต็มให้คุณ!',
      emoji: '☕💪',
      stats,
    };
  }

  if (get('meat') > 50) {
    return {
      title: 'นักล่าเนื้อสัตว์ระดับตำนาน',
      description: 'คุณคือนักล่าผู้แข็งแกร่ง ผู้ที่พลังมาพร้อมกับโปรตีน ทุกคำคือชัยชนะ!',
      emoji: '🥩🏹',
      stats,
    };
  }

  // Tier 3: Combination Personas (check before Tier 2 for specificity)
  const friedSpicy = get('fried') + get('spicy');
  if (friedSpicy > 60) {
    return {
      title: 'นักรบไก่ทอดสายเผ็ด',
      description: 'คุณคือนักรบผู้กล้าหาญ ที่รวมความกรอบและความเผ็ดไว้ด้วยกัน ทุกคำคือการผจญภัย!',
      emoji: '🍗🌶️',
      stats,
    };
  }

  const carbsDessert = get('carbs') + get('dessert');
  if (carbsDessert > 60) {
    return {
      title: 'พลเมืองคาร์โบ ผู้รักความนุ่มฟู',
      description: 'คุณคือผู้รักความสบาย ผู้ที่ความสุขมาพร้อมกับแป้งและความหวาน ทุกคำคือความอบอุ่น!',
      emoji: '🍞🥐',
      stats,
    };
  }

  const meatGrilled = get('meat') + get('grilled');
  if (meatGrilled > 60) {
    return {
      title: 'เชฟบาร์บีคิว ระดับปรมาจารย์',
      description: 'คุณคือเชฟผู้เชี่ยวชาญ ผู้ที่รสชาติมาจากการย่าง ทุกคำคือศิลปะแห่งไฟ!',
      emoji: '🔥🥩',
      stats,
    };
  }

  // Tier 4: Funny Edge Cases
  const waterVegetable = get('water') + get('vegetable');
  if (waterVegetable > 70) {
    return {
      title: 'ฤาษีเขาลึก ผู้บริสุทธิ์',
      description: 'คุณคือฤาษีผู้บริสุทธิ์ ผู้ที่ใช้ชีวิตอย่างเรียบง่ายและสะอาด ทุกคำคือการฝึกฝนจิตใจ!',
      emoji: '💧🌿',
      stats,
    };
  }

  const coffeeDessert = get('coffee') + get('dessert');
  if (coffeeDessert > 60) {
    return {
      title: 'มนุษย์ออฟฟิศ เวอร์ชันคลาสสิก',
      description: 'คุณคือมนุษย์ทำงานทั่วไป ผู้ที่ใช้ชีวิตด้วยกาแฟและของหวาน ทุกคำคือพลังในการทำงาน!',
      emoji: '☕🍪',
      stats,
    };
  }

  // Check if only one food type dominates (all other types < 10%)
  const dominantTypes = Object.entries(stats).filter(([slug, value]) => value > 40);
  if (dominantTypes.length === 1) {
    return {
      title: 'มนุษย์หลงทาง',
      description: 'คุณคือผู้ที่ชื่นชอบอาหารประเภทเดียวอย่างมาก ลองกินหลากหลายดูนะ!',
      emoji: '🤔',
      stats,
    };
  }

  // Tier 2: Balanced Diet (ไม่มี Tag ไหนเกิน 30%)
  const maxPercentage = Math.max(...Object.values(stats));
  if (maxPercentage <= 30) {
    return {
      title: 'พลเมืองอาหาร 5 หมู่ ระดับเซน',
      description: 'คุณคือผู้ที่กินอาหารอย่างสมดุล มีความหลากหลายในทุกมื้อ คุณคือผู้ทรงภูมิปัญญาแห่งโภชนาการ!',
      emoji: '🧘‍♂️',
      stats,
    };
  }

  // Default: Balanced with slight preference
  return {
    title: 'มนุษย์สมดุล ผู้ทรงภูมิปัญญา',
    description: 'คุณคือผู้ที่กินอาหารอย่างมีความสมดุล มีความหลากหลายและพอประมาณ ทุกคำคือการเรียนรู้!',
    emoji: '⚖️',
    stats,
  };
}

/**
 * Get persona stats as a formatted object for display
 */
export function getPersonaStats(stats: Record<string, number>) {
  const get = (slug: string) => stats[slug] || 0;

  return {
    fried: get('fried'),
    vegetable: get('vegetable'),
    meat: get('meat'),
    carbs: get('carbs'),
    dessert: get('dessert'),
    coffee: get('coffee'),
    spicy: get('spicy'),
    sweet: get('sweet'),
    salty: get('salty'),
    sour: get('sour'),
  };
}

