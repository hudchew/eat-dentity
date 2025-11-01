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
    <Card className="border border-gray-200 bg-white rounded-3xl shadow-none">
      <CardHeader>
        <CardTitle className="text-gray-900">Challenge Progress</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-medium text-gray-700">Day {currentDay} / {totalDays}</span>
            <span className="text-sm text-gray-500">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-3 rounded-full" />
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
                  aspect-square rounded-2xl flex items-center justify-center text-sm font-semibold transition-all
                  ${hasMeals && isCompleted ? 'bg-blue-600 text-white' : isCompleted ? 'bg-gray-200 text-gray-600' : 'bg-gray-100 text-gray-400'}
                  ${isCurrent ? 'ring-2 ring-blue-400 ring-offset-2' : ''}
                `}
                title={hasMeals ? `Day ${day}: Logged` : `Day ${day}`}
              >
                {hasMeals && isCompleted ? '✓' : day}
              </div>
            );
          })}
        </div>
        <p className="text-xs text-gray-500 mt-2">
          {challenge.meals.length} meals logged
        </p>
      </CardContent>
    </Card>
  );
}

