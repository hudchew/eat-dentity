'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { mockChallenge } from '@/lib/mock-data';

export function ElementBars() {
  const stats = mockChallenge.stats;
  const total = Object.values(stats).reduce((sum, val) => sum + val, 0);

  const elements = [
    { label: 'ทอด', emoji: '🍳', value: stats.fried, color: 'bg-yellow-500' },
    { label: 'ผัก', emoji: '🥬', value: stats.vegetables, color: 'bg-green-500' },
    { label: 'เนื้อ', emoji: '🥩', value: stats.meat, color: 'bg-red-600' },
    { label: 'คาร์โบ', emoji: '🍚', value: stats.carbs, color: 'bg-yellow-400' },
    { label: 'ของหวาน', emoji: '🍰', value: stats.dessert, color: 'bg-pink-400' },
    { label: 'กาแฟ', emoji: '☕', value: stats.coffee, color: 'bg-amber-800' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="text-2xl">⚡</span>
          <span>แถบพลังงาน Real-time</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {elements.map((element) => {
          const percentage = total > 0 ? (element.value / total) * 100 : 0;
          return (
            <div key={element.label} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{element.emoji}</span>
                  <span className="font-medium">{element.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{element.value}%</Badge>
                </div>
              </div>
              <Progress value={percentage} className={`h-2 ${element.color}`} />
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

