'use client';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Challenge, Meal, MealTag, Tag } from '@prisma/client';

interface MealHistoryDialogProps {
  challenge: Challenge & {
    meals: (Meal & {
      tags: (MealTag & {
        tag: Tag;
      })[];
    })[];
  };
  triggerButton?: React.ReactNode;
}

export function MealHistoryDialog({ challenge, triggerButton }: MealHistoryDialogProps) {
  // Group meals by day
  const mealsByDay = challenge.meals.reduce((acc, meal) => {
    const day = meal.dayNumber;
    if (!acc[day]) acc[day] = [];
    acc[day].push(meal);
    return acc;
  }, {} as Record<number, typeof challenge.meals>);

  const totalMeals = challenge.meals.length;
  const daysWithMeals = Object.keys(mealsByDay).length;

  return (
    <Dialog>
      <DialogTrigger asChild>
        {triggerButton || (
          <Button variant="outline" size="lg" className="w-full">
            📸 ดูมื้ออาหารทั้งหมด ({totalMeals} มื้อ)
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-5xl max-h-[85vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">📸 มื้ออาหารทั้งหมด</DialogTitle>
          <DialogDescription>
            บันทึกไป {totalMeals} มื้อ ใน {daysWithMeals} วัน
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {totalMeals === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p className="text-4xl mb-2">🍽️</p>
              <p>ยังไม่มีมื้ออาหาร</p>
              <p className="text-sm">เริ่มบันทึกมื้อแรกของคุณ!</p>
            </div>
          ) : (
            // Display days in reverse order (newest first)
            Object.keys(mealsByDay)
              .map(Number)
              .sort((a, b) => b - a)
              .map((day) => {
                const meals = mealsByDay[day];
                const dayDate = new Date(challenge.startDate);
                dayDate.setDate(dayDate.getDate() + day - 1);

                return (
                  <div key={day} className="border-b pb-6 last:border-b-0">
                    {/* Day Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold">
                          📅 วันที่ {day}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {dayDate.toLocaleDateString('th-TH', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </p>
                      </div>
                      <Badge variant="secondary">{meals.length} มื้อ</Badge>
                    </div>

                    {/* Meals Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {meals
                        .sort((a, b) => new Date(a.mealTime).getTime() - new Date(b.mealTime).getTime())
                        .map((meal) => {
                          const mealTime = new Date(meal.mealTime);
                          const timeString = mealTime.toLocaleTimeString('th-TH', {
                            hour: '2-digit',
                            minute: '2-digit',
                          });

                          return (
                            <div
                              key={meal.id}
                              className="group relative aspect-square rounded-lg overflow-hidden border-2 border-gray-200 hover:border-orange-400 transition-all cursor-pointer hover:shadow-lg"
                            >
                              {/* Image */}
                              <img
                                src={meal.imageUrl}
                                alt={`Meal at ${timeString}`}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                              />

                              {/* Overlay with time */}
                              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                                <p className="text-white text-xs font-semibold">
                                  🕐 {timeString}
                                </p>
                              </div>

                              {/* Tag count badge */}
                              {meal.tags.length > 0 && (
                                <div className="absolute top-2 right-2">
                                  <Badge className="bg-orange-500 text-white text-xs">
                                    {meal.tags.length} tags
                                  </Badge>
                                </div>
                              )}
                            </div>
                          );
                        })}
                    </div>
                  </div>
                );
              })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

