import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MealHistoryDialog } from '@/components/features/MealHistoryDialog';
import { Button } from '@/components/ui/button';
import { prisma } from '@/lib/prisma';
import { getOrCreateUser } from '@/lib/actions/user';

export async function PersonaCollection() {
  let personas: any[] = [];
  
  try {
    const user = await getOrCreateUser();
    if (user) {
      personas = await prisma.persona.findMany({
        where: { challenge: { userId: user.id } },
        include: {
          challenge: {
            include: {
              meals: {
                include: {
                  tags: {
                    include: { tag: true },
                  },
                },
                orderBy: { mealTime: 'desc' },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    }
  } catch (error) {
    console.error('Error fetching personas:', error);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>คอลเลกชันการ์ดฉายา</CardTitle>
        <CardDescription>การ์ดทั้งหมดที่คุณสะสมได้</CardDescription>
      </CardHeader>
      <CardContent>
        {personas.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p className="text-lg mb-2">🎯</p>
            <p>ยังไม่มีการ์ดฉายา</p>
            <p className="text-sm">ทำ Challenge ให้ครบเพื่อรับการ์ดฉายาของคุณ!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {personas.map((persona) => {
              // Extract emoji from title
              const emojiMatch = persona.title.match(/[\p{Emoji_Presentation}\p{Emoji}\u{1F1E6}-\u{1F1FF}]+/gu);
              const emoji = emojiMatch?.[0] || '🎭';
              
              return (
                <Card
                  key={persona.id}
                  className="border-2 hover:shadow-lg transition-all"
                >
                  <CardHeader className="text-center pb-2">
                    <div className="text-5xl mb-2">{emoji}</div>
                    <CardTitle className="text-lg">{persona.title}</CardTitle>
                    <CardDescription className="text-xs">
                      {new Date(persona.createdAt).toLocaleDateString('th-TH', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-2">
                    {persona.challenge && persona.challenge.meals.length > 0 && (
                      <MealHistoryDialog
                        challenge={persona.challenge}
                        triggerButton={
                          <Button variant="outline" size="sm" className="w-full">
                            📸 ดูมื้ออาหาร ({persona.challenge.meals.length})
                          </Button>
                        }
                      />
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

