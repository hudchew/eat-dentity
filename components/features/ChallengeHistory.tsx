import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { prisma } from '@/lib/prisma';
import { getOrCreateUser } from '@/lib/actions/user';

export async function ChallengeHistory() {
  let challenges: any[] = [];
  
  try {
    const user = await getOrCreateUser();
    if (user) {
      challenges = await prisma.challenge.findMany({
        where: { userId: user.id },
        include: { persona: true },
        orderBy: { createdAt: 'desc' },
      });
    }
  } catch (error) {
    console.error('Error fetching challenge history:', error);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>ประวัติ Challenge</CardTitle>
        <CardDescription>การ์ดฉายาทั้งหมดที่คุณเคยได้รับ</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {challenges.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p className="text-lg mb-2">📜</p>
            <p>ยังไม่มีประวัติ Challenge</p>
            <p className="text-sm">เริ่มต้น Challenge แรกของคุณวันนี้!</p>
          </div>
        ) : (
          challenges.map((challenge, index) => (
            <div
              key={challenge.id}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold text-gray-400">
                    #{challenges.length - index}
                  </span>
                  <div>
                    <h4 className="font-semibold text-lg">
                      {challenge.persona?.title || 'ยังไม่มีฉายา'}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {new Date(challenge.startDate).toLocaleDateString('th-TH', {
                        day: 'numeric',
                        month: 'short',
                      })}{' '}
                      -{' '}
                      {new Date(challenge.endDate).toLocaleDateString('th-TH', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
              </div>
              <Badge variant="default" className="ml-4">
                {challenge.status}
              </Badge>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

