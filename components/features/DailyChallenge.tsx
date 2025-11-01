import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getDailyChallenge } from '@/lib/constants/daily-challenges';
import type { Challenge } from '@prisma/client';

interface DailyChallengeProps {
  challenge?: Challenge;
}

export function DailyChallenge({ challenge }: DailyChallengeProps) {
  // Calculate current day
  let currentDay = 1;
  if (challenge) {
    const now = new Date();
    const diffTime = now.getTime() - new Date(challenge.startDate).getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
    currentDay = Math.min(Math.max(diffDays, 1), 7);
  }

  // Get daily challenge from pre-defined list (date-based random)
  const challengeText = getDailyChallenge();

  return (
    <Card className="border border-gray-200 bg-gradient-to-br from-blue-50 to-white rounded-3xl shadow-none">
      <CardHeader>
        <CardTitle className="text-gray-900">Daily Challenge</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-lg leading-relaxed text-gray-700">{challengeText}</p>
        {challenge && (
          <p className="text-sm text-gray-500 mt-3">Day {currentDay} of 7</p>
        )}
      </CardContent>
    </Card>
  );
}

