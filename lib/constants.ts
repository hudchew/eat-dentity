// Quick Tags from app_idea.md
export interface QuickTag {
  id: number;
  name: string;
  slug: string;
  emoji: string;
  color: string;
  category: 'COOKING_METHOD' | 'FOOD_GROUP' | 'TASTE' | 'BEVERAGE';
}

export const QUICK_TAGS: QuickTag[] = [
  // วิธีการทำอาหาร (Cooking Method)
  { id: 1, name: 'ทอด', slug: 'fried', emoji: '🍳', color: 'bg-yellow-500', category: 'COOKING_METHOD' },
  { id: 2, name: 'ต้ม', slug: 'boiled', emoji: '🥘', color: 'bg-blue-300', category: 'COOKING_METHOD' },
  { id: 3, name: 'ย่าง', slug: 'grilled', emoji: '🔥', color: 'bg-red-500', category: 'COOKING_METHOD' },
  { id: 4, name: 'สด/ดิบ', slug: 'raw', emoji: '🥗', color: 'bg-green-400', category: 'COOKING_METHOD' },
  { id: 5, name: 'อบ', slug: 'baked', emoji: '🍲', color: 'bg-orange-500', category: 'COOKING_METHOD' },
  { id: 6, name: 'นึ่ง', slug: 'steamed', emoji: '🥄', color: 'bg-gray-400', category: 'COOKING_METHOD' },

  // กลุ่มอาหาร (Food Group)
  { id: 7, name: 'ผัก', slug: 'vegetable', emoji: '🥬', color: 'bg-green-500', category: 'FOOD_GROUP' },
  { id: 8, name: 'เนื้อสัตว์', slug: 'meat', emoji: '🥩', color: 'bg-red-600', category: 'FOOD_GROUP' },
  { id: 9, name: 'แป้ง/คาร์โบ', slug: 'carbs', emoji: '🍚', color: 'bg-yellow-400', category: 'FOOD_GROUP' },
  { id: 10, name: 'ของหวาน', slug: 'dessert', emoji: '🍰', color: 'bg-pink-400', category: 'FOOD_GROUP' },
  { id: 11, name: 'ผลไม้', slug: 'fruit', emoji: '🍎', color: 'bg-orange-400', category: 'FOOD_GROUP' },
  { id: 12, name: 'นม/โปรตีน', slug: 'dairy', emoji: '🥛', color: 'bg-slate-300', category: 'FOOD_GROUP' },
  { id: 13, name: 'เครื่องเทศ', slug: 'spices', emoji: '🌶️', color: 'bg-red-700', category: 'FOOD_GROUP' },

  // รสชาติ (Taste)
  { id: 14, name: 'เค็ม', slug: 'salty', emoji: '🧂', color: 'bg-gray-500', category: 'TASTE' },
  { id: 15, name: 'หวาน', slug: 'sweet', emoji: '🍬', color: 'bg-pink-300', category: 'TASTE' },
  { id: 16, name: 'เผ็ด', slug: 'spicy', emoji: '🌶️', color: 'bg-red-600', category: 'TASTE' },
  { id: 17, name: 'เปรี้ยว', slug: 'sour', emoji: '🍋', color: 'bg-lime-400', category: 'TASTE' },

  // เครื่องดื่ม (Beverages)
  { id: 18, name: 'กาแฟ', slug: 'coffee', emoji: '☕', color: 'bg-amber-800', category: 'BEVERAGE' },
  { id: 19, name: 'น้ำผลไม้', slug: 'juice', emoji: '🧃', color: 'bg-orange-300', category: 'BEVERAGE' },
  { id: 20, name: 'น้ำอัดลม', slug: 'soda', emoji: '🥤', color: 'bg-slate-600', category: 'BEVERAGE' },
  { id: 21, name: 'น้ำเปล่า', slug: 'water', emoji: '💧', color: 'bg-blue-200', category: 'BEVERAGE' },
];

export const TAG_CATEGORIES = {
  COOKING_METHOD: 'วิธีการทำอาหาร',
  FOOD_GROUP: 'กลุ่มอาหาร',
  TASTE: 'รสชาติ',
  BEVERAGE: 'เครื่องดื่ม',
} as const;
