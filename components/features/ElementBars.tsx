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
      <Card className="border border-gray-200 bg-white rounded-3xl shadow-none">
        <CardHeader>
          <CardTitle className="text-gray-900">Food Stats</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-center py-6">
            No meals logged yet
            <br />
            <span className="text-sm">Start logging to see your stats</span>
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-gray-200 bg-white rounded-3xl shadow-none">
      <CardHeader>
        <CardTitle className="text-gray-900">Food Stats</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {elementsWithData.map((element) => {
          return (
            <div key={element.label} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-700">{element.label}</span>
                <Badge variant="secondary" className="rounded-full">{element.value}%</Badge>
              </div>
              <Progress value={element.value} className={`h-3 rounded-full ${element.color}`} />
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

