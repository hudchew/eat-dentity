/**
 * Pre-defined Daily Challenges
 * Randomly selected each day to reduce API costs
 */
export const DAILY_CHALLENGES = [
  "ภารกิจวันนี้: ตามหา 'ผักวิเศษ' ที่ซ่อนอยู่ในอาหารของคุณ! 🥬✨",
  "วันนี้ลองกินอาหารที่มีสีเดียวกันดูสิ! 🌈",
  "ภารกิจ: กินอาหารที่ทำให้คุณยิ้มได้! 😊",
  "จงแปลงร่างอาหารมื้อไหนก็ได้ให้กลายเป็นสัตว์ประหลาดกินได้ที่น่ารักที่สุด! 👾🍽️💖",
  "กินอาหารคำแรกด้วยตาปิด แล้วลองทายดูสิว่ามันคืออะไร! 🙈😋",
  "จับ 'อาหารดื้อ' ที่พยายามหนีจากช้อนของคุณให้ได้! 🥄💨",
  "กินอาหารที่กระซิบเรื่องตลกให้คุณฟังก่อนจะหายเข้าปากไป! 🤫🤣",
  "กินอาหารที่คุณคิดว่ามันกำลังนินทาคุณอยู่! 🤫🍔",
  "จัดเรียงอาหารบนจานให้เป็นรูป 'หน้าสัตว์ประหลาดจอมหิว' ก่อนจะกินมันเข้าไป! 👽🍽️😈",
  "ภารกิจ: กินอาหารที่คุณคิดว่ามันจะให้พลังพิเศษกับคุณ! ⚡🍕",
  "ลองกินอาหารที่คุณไม่เคยกินมาก่อนดูสิ! 🎲🍜",
  "กินอาหารที่ทำให้คุณรู้สึกเหมือนเป็นฮีโร่! 🦸‍♂️🍖",
  "ภารกิจ: กินอาหารที่คุณคิดว่ามันจะสอนอะไรคุณได้! 📚🥗",
  "ลองกินอาหารแบบที่ไม่มีใครคิดว่า 'ปกติ' ดูสิ! 🤪🍕",
  "กินอาหารที่คุณคิดว่ามันจะพาคุณไปผจญภัย! 🗺️🍛",
] as const;

/**
 * Get a random daily challenge
 * Uses date-based seed to ensure same challenge for the entire day
 */
export function getDailyChallenge(): string {
  const today = new Date();
  const dateSeed = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
  
  // Simple hash function to convert date string to number
  let hash = 0;
  for (let i = 0; i < dateSeed.length; i++) {
    const char = dateSeed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  // Use absolute value and modulo to get index
  const index = Math.abs(hash) % DAILY_CHALLENGES.length;
  
  return DAILY_CHALLENGES[index];
}

