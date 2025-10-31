import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { mockPersonaCards } from '@/lib/mock-data';

export function PersonaShowcase() {
  return (
    <section className="py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl font-semibold text-center mb-4">
          ตัวอย่างฉายาที่คุณอาจได้รับ
        </h2>
        <p className="text-center text-gray-600 mb-12 text-lg">
          ทุกคนจะได้ฉายาที่แตกต่างกันตามอาหารที่กิน!
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {mockPersonaCards.map((card) => (
            <Card
              key={card.id}
              className="border-2 hover:shadow-lg transition-shadow bg-gradient-to-br from-white to-gray-50"
            >
              <CardHeader className="text-center pb-4">
                <div className="text-5xl mb-4">{card.persona.emoji}</div>
                <CardTitle className="text-2xl">{card.persona.title}</CardTitle>
                <CardDescription className="text-sm mt-2">
                  {card.challengeDate}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">🍳 ทอด</span>
                    <span className="font-semibold">{card.persona.stats.fried}%</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">🥬 ผัก</span>
                    <span className="font-semibold">{card.persona.stats.vegetables}%</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">🥩 เนื้อ</span>
                    <span className="font-semibold">{card.persona.stats.meat}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

