import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { prisma } from '@/lib/prisma';
import { getOrCreateUser } from '@/lib/actions/user';

export async function OverallStats() {
  let stats = {
    totalChallenges: 0,
    completedChallenges: 0,
    totalMeals: 0,
    totalPersonas: 0,
    favoriteCategories: [] as { category: string; percentage: number; emoji: string }[],
  };

  try {
    const user = await getOrCreateUser();
    if (!user) return null;

    // Get challenge stats
    const [totalChallenges, completedChallenges, totalMeals, totalPersonas] = await Promise.all([
      prisma.challenge.count({ where: { userId: user.id } }),
      prisma.challenge.count({ where: { userId: user.id, status: 'COMPLETED' } }),
      prisma.meal.count({
        where: { challenge: { userId: user.id } },
      }),
      prisma.persona.count({
        where: { challenge: { userId: user.id } },
      }),
    ]);

    // Get favorite food categories (aggregate from all meals)
    const meals = await prisma.meal.findMany({
      where: { challenge: { userId: user.id } },
      include: {
        tags: {
          include: { tag: true },
        },
      },
    });

    // Count tags
    const tagCounts: Record<string, number> = {};
    let totalTags = 0;

    meals.forEach((meal) => {
      meal.tags.forEach(({ tag }) => {
        tagCounts[tag.slug] = (tagCounts[tag.slug] || 0) + 1;
        totalTags++;
      });
    });

    // Calculate percentages and get top 5
    const topCategories = Object.entries(tagCounts)
      .map(([slug, count]) => ({
        slug,
        count,
        percentage: Math.round((count / totalTags) * 100),
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Map to display format with emojis
    const categoryEmojis: Record<string, string> = {
      fried: '🍳',
      vegetable: '🥬',
      meat: '🥩',
      carbs: '🍚',
      dessert: '🍰',
      coffee: '☕',
      spicy: '🌶️',
      sweet: '🍬',
      salty: '🧂',
      sour: '🍋',
      boiled: '🥘',
      grilled: '🔥',
      raw: '🥗',
      baked: '🍲',
      steamed: '🥄',
      fruit: '🍎',
      dairy: '🥛',
      spices: '🌶️',
      juice: '🧃',
      soda: '🥤',
      water: '💧',
    };

    const favoriteCategories = topCategories.map((cat) => ({
      category: cat.slug,
      percentage: cat.percentage,
      emoji: categoryEmojis[cat.slug] || '🍽️',
    }));

    stats = {
      totalChallenges,
      completedChallenges,
      totalMeals,
      totalPersonas,
      favoriteCategories,
    };
  } catch (error) {
    console.error('Error fetching overall stats:', error);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>สถิติรวมทั้งหมด</CardTitle>
        <CardDescription>ข้อมูลสรุปจากทุก Challenge ของคุณ</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg">
            <div className="text-3xl font-bold text-orange-600">{stats.totalChallenges}</div>
            <div className="text-sm text-gray-600 mt-1">Challenges</div>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
            <div className="text-3xl font-bold text-green-600">{stats.completedChallenges}</div>
            <div className="text-sm text-gray-600 mt-1">เสร็จสมบูรณ์</div>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
            <div className="text-3xl font-bold text-blue-600">{stats.totalMeals}</div>
            <div className="text-sm text-gray-600 mt-1">มื้ออาหาร</div>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-pink-50 to-pink-100 rounded-lg">
            <div className="text-3xl font-bold text-pink-600">{stats.totalPersonas}</div>
            <div className="text-sm text-gray-600 mt-1">ฉายา</div>
          </div>
        </div>

        {/* Favorite Categories */}
        {stats.favoriteCategories.length > 0 && (
          <div className="pt-4 border-t">
            <h4 className="font-semibold text-lg mb-4">หมวดอาหารโปรด TOP 5</h4>
            <div className="space-y-3">
              {stats.favoriteCategories.map((cat, index) => (
                <div key={cat.category} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{cat.emoji}</span>
                      <span className="font-medium capitalize">{cat.category}</span>
                      <span className="text-xs text-gray-500">#{index + 1}</span>
                    </div>
                    <span className="font-semibold text-orange-600">{cat.percentage}%</span>
                  </div>
                  <Progress value={cat.percentage} className="h-2" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {stats.totalChallenges === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p className="text-lg mb-2">📊</p>
            <p>ยังไม่มีข้อมูลสถิติ</p>
            <p className="text-sm">เริ่มต้น Challenge เพื่อดูสถิติของคุณ!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

