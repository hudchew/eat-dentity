import { Card, CardContent } from '@/components/ui/card';
import { getMealPrompt } from '@/lib/utils/meal-period';
import type { Challenge, Meal } from '@prisma/client';

interface MealPromptProps {
  challenge?: Challenge & { meals: Meal[] };
}

export function MealPrompt({ challenge }: MealPromptProps) {
  const prompt = getMealPrompt();

  // Try to fetch today's meals count (optional UI hint)
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
