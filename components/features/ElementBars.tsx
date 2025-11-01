'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import type { Challenge, Meal, MealTag, Tag } from '@prisma/client';

interface ElementBarsProps {
  challenge: Challenge & {
    meals: (Meal & {
      tags: (MealTag & {
        tag: Tag;
      })[];
    })[];
  };
}

export function ElementBars({ challenge }: ElementBarsProps) {
  // Calculate stats from meals
  const tagCounts: Record<string, number> = {};
  let totalTags = 0;

  challenge.meals.forEach((meal) => {
    meal.tags.forEach(({ tag }) => {
      tagCounts[tag.slug] = (tagCounts[tag.slug] || 0) + 1;
      totalTags++;
    });
  });

  // Calculate percentages
  const stats: Record<string, number> = {};
  Object.entries(tagCounts).forEach(([slug, count]) => {
    stats[slug] = Math.round((count / totalTags) * 100);
  });

  // Define elements with their mappings
  const elements = [
    { label: 'ทอด', emoji: '🍳', slug: 'fried', color: 'bg-yellow-500' },
    { label: 'ผัก', emoji: '🥬', slug: 'vegetable', color: 'bg-green-500' },
    { label: 'เนื้อ', emoji: '🥩', slug: 'meat', color: 'bg-red-600' },
    { label: 'คาร์โบ', emoji: '🍚', slug: 'carbs', color: 'bg-yellow-400' },
    { label: 'ของหวาน', emoji: '🍰', slug: 'dessert', color: 'bg-pink-400' },
    { label: 'กาแฟ', emoji: '☕', slug: 'coffee', color: 'bg-amber-800' },
  ];

  // Filter to only show elements with data
  const elementsWithData = elements
    .map((element) => ({
      ...element,
      value: stats[element.slug] || 0,
    }))
    .filter((element) => element.value > 0)
    .sort((a, b) => b.value - a.value); // Sort by value descending

  if (elementsWithData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-2xl">⚡</span>
            <span>แถบพลังงาน Real-time</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-center py-4">
            ยังไม่มีข้อมูลมื้ออาหาร
            <br />
            เริ่มบันทึกมื้ออาหารเพื่อดูสถิติ!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="text-2xl">⚡</span>
          <span>แถบพลังงาน Real-time</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {elementsWithData.map((element) => {
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
              <Progress value={element.value} className={`h-2 ${element.color}`} />
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

