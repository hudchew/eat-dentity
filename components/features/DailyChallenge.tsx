import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { mockDailyChallenge } from '@/lib/mock-data';

export function DailyChallenge() {
  return (
    <Card className="border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-pink-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="text-2xl">🎯</span>
          <span>Daily Challenge</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-lg leading-relaxed">{mockDailyChallenge.text}</p>
        <p className="text-sm text-gray-600 mt-2">วันที่ {mockDailyChallenge.day} / 7</p>
      </CardContent>
    </Card>
  );
}

