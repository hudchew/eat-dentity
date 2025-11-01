import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import type { Challenge, Meal } from '@prisma/client';

interface ChallengeProgressProps {
  challenge: Challenge & {
    meals: Meal[];
  };
}

export function ChallengeProgress({ challenge }: ChallengeProgressProps) {
  // Calculate current day (1-7)
  const now = new Date();
  const diffTime = now.getTime() - challenge.startDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
  const currentDay = Math.min(Math.max(diffDays, 1), 7);
  const totalDays = 7;
  const progress = (currentDay / totalDays) * 100;

  // Get unique meal days (which days have meals)
  const mealDays = new Set(challenge.meals.map((meal) => meal.dayNumber));

  return (
    <Card>
      <CardHeader>
        <CardTitle>ความคืบหน้า Challenge</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">วันที่ {currentDay} / {totalDays}</span>
            <span className="text-sm text-gray-600">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-3" />
        </div>

        {/* Day Indicators */}
        <div className="grid grid-cols-7 gap-2 mt-6">
          {Array.from({ length: 7 }, (_, i) => {
            const day = i + 1;
            const hasMeals = mealDays.has(day);
            const isCompleted = day <= currentDay;
            const isCurrent = day === currentDay;

            return (
              <div
                key={day}
                className={`
                  aspect-square rounded-lg flex items-center justify-center text-sm font-semibold
                  ${hasMeals && isCompleted ? 'bg-green-500 text-white' : isCompleted ? 'bg-gray-300 text-gray-600' : 'bg-gray-200 text-gray-500'}
                  ${isCurrent ? 'ring-2 ring-orange-500 ring-offset-2' : ''}
                `}
                title={hasMeals ? `วันที่ ${day}: มีการบันทึกมื้ออาหาร` : `วันที่ ${day}`}
              >
                {hasMeals && isCompleted ? '✓' : day}
              </div>
            );
          })}
        </div>
        <p className="text-xs text-gray-500 mt-2">
          มีการบันทึก {challenge.meals.length} มื้ออาหาร
        </p>
      </CardContent>
    </Card>
  );
}

