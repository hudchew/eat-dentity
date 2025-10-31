import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { mockPersonaCards } from '@/lib/mock-data';

export function PersonaCollection() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>คอลเลกชันการ์ดฉายา</CardTitle>
        <CardDescription>การ์ดทั้งหมดที่คุณสะสมได้</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mockPersonaCards.map((card) => (
            <Card
              key={card.id}
              className="border-2 hover:shadow-lg transition-shadow cursor-pointer"
            >
              <CardHeader className="text-center pb-2">
                <div className="text-5xl mb-2">{card.persona.emoji}</div>
                <CardTitle className="text-lg">{card.persona.title}</CardTitle>
                <CardDescription className="text-xs">
                  {card.challengeDate}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

