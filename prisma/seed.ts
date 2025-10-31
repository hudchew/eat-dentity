import { PrismaClient, Category } from '@prisma/client';

const prisma = new PrismaClient();

const tags = [
  // วิธีการทำอาหาร (Cooking Method)
  { name: 'ทอด', slug: 'fried', category: 'COOKING_METHOD' as Category, emoji: '🍳', color: 'bg-yellow-500' },
  { name: 'ต้ม', slug: 'boiled', category: 'COOKING_METHOD' as Category, emoji: '🥘', color: 'bg-blue-300' },
  { name: 'ย่าง', slug: 'grilled', category: 'COOKING_METHOD' as Category, emoji: '🔥', color: 'bg-red-500' },
  { name: 'สด/ดิบ', slug: 'raw', category: 'COOKING_METHOD' as Category, emoji: '🥗', color: 'bg-green-400' },
  { name: 'อบ', slug: 'baked', category: 'COOKING_METHOD' as Category, emoji: '🍲', color: 'bg-orange-500' },
  { name: 'นึ่ง', slug: 'steamed', category: 'COOKING_METHOD' as Category, emoji: '🥄', color: 'bg-gray-400' },

  // กลุ่มอาหาร (Food Group)
  { name: 'ผัก', slug: 'vegetable', category: 'FOOD_GROUP' as Category, emoji: '🥬', color: 'bg-green-500' },
  { name: 'เนื้อสัตว์', slug: 'meat', category: 'FOOD_GROUP' as Category, emoji: '🥩', color: 'bg-red-600' },
  { name: 'แป้ง/คาร์โบ', slug: 'carbs', category: 'FOOD_GROUP' as Category, emoji: '🍚', color: 'bg-yellow-400' },
  { name: 'ของหวาน', slug: 'dessert', category: 'FOOD_GROUP' as Category, emoji: '🍰', color: 'bg-pink-400' },
  { name: 'ผลไม้', slug: 'fruit', category: 'FOOD_GROUP' as Category, emoji: '🍎', color: 'bg-orange-400' },
  { name: 'นม/โปรตีน', slug: 'dairy', category: 'FOOD_GROUP' as Category, emoji: '🥛', color: 'bg-slate-300' },
  { name: 'เครื่องเทศ', slug: 'spices', category: 'FOOD_GROUP' as Category, emoji: '🌶️', color: 'bg-red-700' },

  // รสชาติ (Taste)
  { name: 'เค็ม', slug: 'salty', category: 'TASTE' as Category, emoji: '🧂', color: 'bg-gray-500' },
  { name: 'หวาน', slug: 'sweet', category: 'TASTE' as Category, emoji: '🍬', color: 'bg-pink-300' },
  { name: 'เผ็ด', slug: 'spicy', category: 'TASTE' as Category, emoji: '🌶️', color: 'bg-red-600' },
  { name: 'เปรี้ยว', slug: 'sour', category: 'TASTE' as Category, emoji: '🍋', color: 'bg-lime-400' },

  // เครื่องดื่ม (Beverages)
  { name: 'กาแฟ', slug: 'coffee', category: 'BEVERAGE' as Category, emoji: '☕', color: 'bg-amber-800' },
  { name: 'น้ำผลไม้', slug: 'juice', category: 'BEVERAGE' as Category, emoji: '🧃', color: 'bg-orange-300' },
  { name: 'น้ำอัดลม', slug: 'soda', category: 'BEVERAGE' as Category, emoji: '🥤', color: 'bg-slate-600' },
  { name: 'น้ำเปล่า', slug: 'water', category: 'BEVERAGE' as Category, emoji: '💧', color: 'bg-blue-200' },
];

async function main() {
  console.log('🌱 Starting seed...');

  // Seed Tags
  for (const tag of tags) {
    await prisma.tag.upsert({
      where: { slug: tag.slug },
      update: tag,
      create: tag,
    });
    console.log(`✅ Seeded tag: ${tag.name} (${tag.slug})`);
  }

  console.log('✅ Seed completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

