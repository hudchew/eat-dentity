import { Card, CardContent } from '@/components/ui/card';
import { getActiveChallenge } from '@/lib/actions/challenge';
import { getMealPrompt } from '@/lib/utils/meal-period';

export async function MealPrompt() {
  const prompt = getMealPrompt();

  // Try to fetch today's meals count (optional UI hint)
  const challenge = await getActiveChallenge();
  let todayCount = 0;
  if (challenge) {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const end = new Date(start);
    end.setDate(start.getDate() + 1);
    todayCount = challenge.meals.filter(
      (m) => new Date(m.mealTime) >= start && new Date(m.mealTime) < end
    ).length;
  }

  return (
    <Card className="border-2 border-orange-200 bg-gradient-to-r from-orange-50 to-yellow-50">
      <CardContent className="p-4 md:p-5 flex items-center gap-3">
        <div className="text-2xl md:text-3xl" aria-hidden>
          {prompt.emoji}
        </div>
        <div className="leading-tight">
          <p className="text-base md:text-lg font-semibold">{prompt.title}</p>
          <p className="text-sm text-gray-600">
            {prompt.subtitle}
            {todayCount > 0 ? ` • วันนี้บันทึกแล้ว ${todayCount} มื้อ` : ''}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
