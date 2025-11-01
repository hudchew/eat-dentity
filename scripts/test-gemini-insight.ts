import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables FIRST before importing any modules
config({ path: resolve(__dirname, '../.env.local') });

// Verify API key is loaded
if (!process.env.GEMINI_API_KEY) {
  console.error('❌ GEMINI_API_KEY not found in .env.local');
  process.exit(1);
}

console.log('✅ GEMINI_API_KEY loaded:', process.env.GEMINI_API_KEY.substring(0, 10) + '...');

// Import after env vars are loaded
import { generatePersonaInsight } from '../lib/gemini';

async function testPersonaInsight() {
  console.log('🧪 Testing Gemini AI Insight Generation...\n');

  const testCases = [
    {
      title: 'นักรบไก่ทอด ผู้แบกโลกด้วยไขมัน',
      stats: { fried: 55, vegetable: 5, meat: 30, coffee: 10 },
    },
    {
      title: 'กระต่ายน้อยรักษ์โลก',
      stats: { vegetable: 70, fruit: 20, water: 10 },
    },
    {
      title: 'ราชาน้ำตาล ผู้พิทักษ์ความหวาน',
      stats: { dessert: 60, sweet: 30, carbs: 10 },
    },
  ];

  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];
    console.log(`\n📝 Test Case ${i + 1}: ${testCase.title}`);
    console.log(`📊 Stats: ${JSON.stringify(testCase.stats)}`);
    console.log('⏳ Generating AI Insight...\n');

    try {
      const insight = await generatePersonaInsight(testCase.title, testCase.stats);
      console.log('✅ AI Insight Generated:');
      console.log('─'.repeat(80));
      console.log(insight);
      console.log('─'.repeat(80));
    } catch (error) {
      console.error('❌ Error:', error);
    }

    // Wait a bit between requests to avoid rate limiting
    if (i < testCases.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }

  console.log('\n✅ All tests completed!');
}

testPersonaInsight().catch(console.error);

