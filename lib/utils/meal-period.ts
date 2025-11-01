export type MealPeriod = 'late-night' | 'breakfast' | 'late-morning' | 'lunch' | 'afternoon' | 'dinner' | 'late-evening';

export interface MealPrompt {
  period: MealPeriod;
  title: string; // short, catchy
  subtitle: string; // supportive line
  emoji: string;
}

/**
 * Return time-of-day meal prompt (Thai) based on local time
 * Hours are in 24h format of the server/browser environment
 */
export function getMealPrompt(date: Date = new Date()): MealPrompt {
  const h = date.getHours();

  if (h >= 22 || h < 5) {
    return {
      period: 'late-night',
      title: 'ดึกแล้ว เลือกเบาๆ เพื่อหลับสบาย',
      subtitle: 'ถ้าทำ IF อยู่ ข้ามมื้อนี้ได้เลย ✨',
      emoji: '🌙🥛',
    };
  }

  if (h >= 5 && h < 10) {
    return {
      period: 'breakfast',
      title: 'เช้านี้เติมพลังด้วยอะไรดี?',
      subtitle: 'เริ่มวันใหม่ด้วยมื้อที่ใช่สำหรับคุณ',
      emoji: '🌞🍳',
    };
  }

  if (h >= 10 && h < 12) {
    return {
      period: 'late-morning',
      title: 'ใกล้เที่ยงแล้ว เตรียมสั่งอะไรดี?',
      subtitle: 'เลือกสิ่งที่อร่อยและสมดุล',
      emoji: '⏰🥗',
    };
  }

  if (h >= 12 && h < 15) {
    return {
      period: 'lunch',
      title: 'เที่ยงแล้ว กินไร??',
      subtitle: 'อิ่มกำลังดี ไม่ง่วงบ่าย',
      emoji: '🍚🕛',
    };
  }

  if (h >= 15 && h < 17) {
    return {
      period: 'afternoon',
      title: 'บ่ายนี้ ขนมเบาๆ ไหม?',
      subtitle: 'จิบกาแฟคู่ของหวานชิ้นเล็กก็พอ',
      emoji: '🧁☕',
    };
  }

  if (h >= 17 && h < 21) {
    return {
      period: 'dinner',
      title: 'เย็นนี้ จัดหนัก!!',
      subtitle: 'มื้อโปรดของใครหลายคน เลือกให้คุ้ม',
      emoji: '🍲🔥',
    };
  }

  return {
    period: 'late-evening',
    title: 'ค่ำนี้เอาอะไรดี?',
    subtitle: 'ถ้าทำ IF อยู่ กดบันทึกเฉพาะมื้อที่กินจริงได้เลย',
    emoji: '🌆🍜',
  };
}
