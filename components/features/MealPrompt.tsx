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
    <Card className="border border-gray-200 bg-gradient-to-r from-gray-50 to-white rounded-3xl shadow-none">
      <CardContent className="p-5 md:p-6">
        <div className="leading-tight">
          <p className="text-lg md:text-xl font-semibold text-gray-900">{prompt.title}</p>
          <p className="text-sm md:text-base text-gray-500 mt-1">
            {prompt.subtitle}
            {todayCount > 0 ? ` • Logged ${todayCount} meal${todayCount > 1 ? 's' : ''} today` : ''}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
