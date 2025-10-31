import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { mockChallenge } from '@/lib/mock-data';

export function ChallengeProgress() {
  const progress = (mockChallenge.currentDay / mockChallenge.totalDays) * 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle>ความคืบหน้า Challenge</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">วันที่ {mockChallenge.currentDay} / {mockChallenge.totalDays}</span>
            <span className="text-sm text-gray-600">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-3" />
        </div>

        {/* Day Indicators */}
        <div className="grid grid-cols-7 gap-2 mt-6">
          {Array.from({ length: 7 }, (_, i) => {
            const day = i + 1;
            const isCompleted = day <= mockChallenge.currentDay;
            const isCurrent = day === mockChallenge.currentDay;

            return (
              <div
                key={day}
                className={`
                  aspect-square rounded-lg flex items-center justify-center text-sm font-semibold
                  ${isCompleted ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'}
                  ${isCurrent ? 'ring-2 ring-orange-500 ring-offset-2' : ''}
                `}
              >
                {day}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

