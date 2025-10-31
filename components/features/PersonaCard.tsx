import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Persona } from '@/lib/mock-data';

interface PersonaCardProps {
  persona: Persona;
}

export function PersonaCard({ persona }: PersonaCardProps) {
  return (
    <Card className="border-2 border-orange-400 bg-gradient-to-br from-orange-50 via-pink-50 to-yellow-50 shadow-xl">
      <CardHeader className="text-center pb-4">
        <div className="text-7xl mb-4 animate-bounce">{persona.emoji}</div>
        <CardTitle className="text-3xl md:text-4xl mb-2">{persona.title}</CardTitle>
        <p className="text-lg text-gray-700">{persona.subtitle}</p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-white/50 rounded-lg">
            <div className="text-2xl mb-1">🍳</div>
            <div className="font-bold text-xl">{persona.stats.fried}%</div>
            <div className="text-sm text-gray-600">ทอด</div>
          </div>
          <div className="text-center p-3 bg-white/50 rounded-lg">
            <div className="text-2xl mb-1">🥬</div>
            <div className="font-bold text-xl">{persona.stats.vegetables}%</div>
            <div className="text-sm text-gray-600">ผัก</div>
          </div>
          <div className="text-center p-3 bg-white/50 rounded-lg">
            <div className="text-2xl mb-1">🥩</div>
            <div className="font-bold text-xl">{persona.stats.meat}%</div>
            <div className="text-sm text-gray-600">เนื้อ</div>
          </div>
          <div className="text-center p-3 bg-white/50 rounded-lg">
            <div className="text-2xl mb-1">🍚</div>
            <div className="font-bold text-xl">{persona.stats.carbs}%</div>
            <div className="text-sm text-gray-600">คาร์โบ</div>
          </div>
        </div>

        {/* Powers */}
        <div className="space-y-3 pt-4 border-t">
          <h4 className="font-semibold text-lg mb-3">ค่าพลัง</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-2 bg-white/50 rounded">
              <span className="flex items-center gap-2">
                {persona.powers.attack.emoji} {persona.powers.attack.label}
              </span>
              <Badge variant="default">{persona.powers.attack.value}</Badge>
            </div>
            <div className="flex items-center justify-between p-2 bg-white/50 rounded">
              <span className="flex items-center gap-2">
                {persona.powers.defense.emoji} {persona.powers.defense.label}
              </span>
              <Badge variant="secondary">{persona.powers.defense.value}</Badge>
            </div>
            <div className="flex items-center justify-between p-2 bg-white/50 rounded">
              <span className="flex items-center gap-2">
                {persona.powers.speed.emoji} {persona.powers.speed.label}
              </span>
              <Badge variant="outline">{persona.powers.speed.value}</Badge>
            </div>
          </div>
        </div>

        {/* AI Insight */}
        <div className="pt-4 border-t">
          <h4 className="font-semibold text-lg mb-3">🤖 AI Insight</h4>
          <p className="text-gray-700 leading-relaxed bg-white/50 p-4 rounded-lg">
            {persona.aiInsight}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

