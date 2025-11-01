import { GoogleGenAI } from '@google/genai';

// Initialize client with API key from environment variable
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.warn('⚠️ GEMINI_API_KEY not found in environment variables');
}
const ai = new GoogleGenAI({ apiKey });

/**
 * Generate AI Insight for Persona Card
 * Called when user completes 7-day challenge
 * @param title Persona title (e.g., "นักรบไก่ทอด ผู้แบกโลกด้วยไขมัน")
 * @param stats Stats object with percentages (e.g., { fried: 55, vegetable: 5, meat: 30 })
 * @returns AI-generated insight text (100-150 words)
 */
export async function generatePersonaInsight(
  title: string,
  stats: Record<string, number>
): Promise<string> {
  try {
    // Format stats for better context
    const statsDescription = Object.entries(stats)
      .filter(([_, value]) => value > 0)
      .map(([key, value]) => `${key}: ${value}%`)
      .join(', ');

    const prompt = `คุณเป็น AI นักวิเคราะห์อาหารที่มีอารมณ์ขันและสร้างสรรค์

User ได้รับฉายา: "${title}"
สถิติอาหาร 7 วัน: ${statsDescription}

เขียนบทวิเคราะห์ส่วนตัวที่:
1. ตลกและสนุกสนาน แต่ไม่ทำร้ายจิตใจ
2. อิงจากฉายาและสถิติที่ให้มา
3. กำลังใจและสร้างสรรค์
4. ความยาวประมาณ 100-150 คำ
5. ใช้ emoji เพิ่มความสนุก

ตอบเป็นภาษาไทยเท่านั้น`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || '';
  } catch (error) {
    console.error('Error generating persona insight:', error);
    // Fallback message if API fails
    return `คุณคือ ${title}! 🎉 
ตัวตนของคุณสะท้อนผ่านอาหารที่คุณกินมา 7 วัน 
ทุกคำที่กินล้วนบอกเล่าเรื่องราวของตัวคุณเอง!`;
  }
}
