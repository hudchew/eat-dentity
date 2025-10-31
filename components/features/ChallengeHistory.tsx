import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { mockChallengeHistory } from '@/lib/mock-data';

export function ChallengeHistory() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>ประวัติ Challenge</CardTitle>
        <CardDescription>การ์ดฉายาทั้งหมดที่คุณเคยได้รับ</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {mockChallengeHistory.map((challenge) => (
          <div
            key={challenge.id}
            className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <span className="text-2xl font-bold text-gray-400">
                  #{challenge.number}
                </span>
                <div>
                  <h4 className="font-semibold text-lg">{challenge.persona}</h4>
                  <p className="text-sm text-gray-600">{challenge.dateRange}</p>
                </div>
              </div>
            </div>
            <Badge variant="default" className="ml-4">
              {challenge.status}
            </Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

