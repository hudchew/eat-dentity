import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { prisma } from '@/lib/prisma';
import { getOrCreateUser } from '@/lib/actions/user';
import { cn } from '@/lib/cn';

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
        <CardTitle>Challenge History</CardTitle>
        <CardDescription>All challenges you have ever done</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {challenges.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p className="text-lg mb-2">📜</p>
            <p>No history yet</p>
            <p className="text-sm">Start your first challenge today!</p>
          </div>
        ) : (
          challenges.map((challenge, index) => (
            <div
              key={challenge.id}
              className={cn(
                "flex items-center justify-between p-4 border rounded-3xl transition-colors",
                challenge.status === 'ACTIVE'
                  ? "bg-blue-50 border-blue-200 hover:bg-blue-100"
                  : "hover:bg-gray-50 border-gray-200"
              )}
            >
              <div className="flex-1">
                <div className="flex items-center gap-4 ">
                  <span className="text-2xl font-bold text-gray-400">
                    #{challenges.length - index}
                  </span>
                  <div className="flex-1 flex flex-col gap-2">
                    <h4 className="font-semibold text-base">
                      {challenge.persona?.title || 'ยังไม่มีฉายา'}
                    </h4>
                    <div className="flex flex-row items-center justify-between">
                      <div className="flex-1">
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
                      <Badge 
                        variant={challenge.status === 'ACTIVE' ? 'default' : 'secondary'}
                        className={cn(
                          "text-xs",
                          challenge.status === 'ACTIVE' && "bg-blue-600 text-white"
                        )}
                      >
                        {challenge.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

