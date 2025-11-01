import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getActiveChallenge } from '@/lib/actions/challenge';
import { getDailyChallenge } from '@/lib/constants/daily-challenges';

export async function DailyChallenge() {
  // Get challenge to calculate current day
  const challenge = await getActiveChallenge();
  
  // Calculate current day
  let currentDay = 1;
  if (challenge) {
    const now = new Date();
    const diffTime = now.getTime() - challenge.startDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
    currentDay = Math.min(Math.max(diffDays, 1), 7);
  }

  // Get daily challenge from pre-defined list (date-based random)
  const challengeText = getDailyChallenge();

  return (
    <Card className="border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-pink-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="text-2xl">🎯</span>
          <span>Daily Challenge</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-lg leading-relaxed">{challengeText}</p>
        {challenge && (
          <p className="text-sm text-gray-600 mt-2">วันที่ {currentDay} / 7</p>
        )}
      </CardContent>
    </Card>
  );
}

