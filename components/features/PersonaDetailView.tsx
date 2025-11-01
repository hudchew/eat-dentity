import { Badge } from '@/components/ui/badge';
import type { Challenge, Meal, MealTag, Tag } from '@prisma/client';

interface PersonaDetailViewProps {
  persona: {
    id: string;
    title: string;
    subtitle: string;
    emoji: string;
    description: string;
    stats: {
      fried: number;
      vegetables: number;
      meat: number;
      carbs: number;
      dessert: number;
      coffee: number;
    };
    powers: {
      attack: { label: string; value: string; emoji: string };
      defense: { label: string; value: string; emoji: string };
      speed: { label: string; value: string; emoji: string };
    };
    aiInsight: string;
  };
  challenge?: Challenge & {
    meals: (Meal & {
      tags: (MealTag & {
        tag: Tag;
      })[];
    })[];
  };
  variant?: 'page' | 'dialog';
}

export function PersonaDetailView({ persona, challenge, variant = 'page' }: PersonaDetailViewProps) {
  const isDialog = variant === 'dialog';

  return (
    <div className="space-y-6">
      {/* Header - Emoji + Title + Subtitle */}
      <div className={`text-center space-y-3 ${isDialog ? '' : 'mb-6'}`}>
        <div className={isDialog ? 'text-6xl mb-3' : 'text-7xl mb-4'}>{persona.emoji}</div>
        <h2 className={`font-bold text-gray-900 ${isDialog ? 'text-2xl' : 'text-3xl md:text-4xl'}`}>
          {persona.title}
        </h2>
        <p className={`text-gray-600 ${isDialog ? 'text-base' : 'text-lg'}`}>
          {persona.subtitle}
        </p>
      </div>

      {/* Food Stats Grid */}
      <div>
        <h4 className="font-semibold text-lg mb-3 text-gray-900">Food Stats</h4>
        <div className="grid grid-cols-3 gap-3">
          {persona.stats.fried > 0 && (
            <div className="text-center p-3 bg-yellow-50 rounded-2xl border border-yellow-100">
              <div className="text-2xl mb-1">🍳</div>
              <div className="font-bold text-lg text-gray-900">{persona.stats.fried}%</div>
              <div className="text-xs text-gray-600">Fried</div>
            </div>
          )}
          {persona.stats.vegetables > 0 && (
            <div className="text-center p-3 bg-green-50 rounded-2xl border border-green-100">
              <div className="text-2xl mb-1">🥬</div>
              <div className="font-bold text-lg text-gray-900">{persona.stats.vegetables}%</div>
              <div className="text-xs text-gray-600">Vegetables</div>
            </div>
          )}
          {persona.stats.meat > 0 && (
            <div className="text-center p-3 bg-red-50 rounded-2xl border border-red-100">
              <div className="text-2xl mb-1">🥩</div>
              <div className="font-bold text-lg text-gray-900">{persona.stats.meat}%</div>
              <div className="text-xs text-gray-600">Meat</div>
            </div>
          )}
          {persona.stats.carbs > 0 && (
            <div className="text-center p-3 bg-yellow-50 rounded-2xl border border-yellow-100">
              <div className="text-2xl mb-1">🍚</div>
              <div className="font-bold text-lg text-gray-900">{persona.stats.carbs}%</div>
              <div className="text-xs text-gray-600">Carbs</div>
            </div>
          )}
          {persona.stats.dessert > 0 && (
            <div className="text-center p-3 bg-pink-50 rounded-2xl border border-pink-100">
              <div className="text-2xl mb-1">🍰</div>
              <div className="font-bold text-lg text-gray-900">{persona.stats.dessert}%</div>
              <div className="text-xs text-gray-600">Dessert</div>
            </div>
          )}
          {persona.stats.coffee > 0 && (
            <div className="text-center p-3 bg-amber-50 rounded-2xl border border-amber-100">
              <div className="text-2xl mb-1">☕</div>
              <div className="font-bold text-lg text-gray-900">{persona.stats.coffee}%</div>
              <div className="text-xs text-gray-600">Coffee</div>
            </div>
          )}
        </div>
      </div>

      {/* Powers */}
      <div className="pt-4 border-t border-gray-200">
        <h4 className="font-semibold text-lg mb-3 text-gray-900">Powers</h4>
        <div className="space-y-2">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl">
            <span className="flex items-center gap-2 text-gray-700">
              {persona.powers.attack.emoji} {persona.powers.attack.label}
            </span>
            <Badge className="bg-blue-600 text-white rounded-full">{persona.powers.attack.value}</Badge>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl">
            <span className="flex items-center gap-2 text-gray-700">
              {persona.powers.defense.emoji} {persona.powers.defense.label}
            </span>
            <Badge variant="secondary" className="rounded-full">{persona.powers.defense.value}</Badge>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl">
            <span className="flex items-center gap-2 text-gray-700">
              {persona.powers.speed.emoji} {persona.powers.speed.label}
            </span>
            <Badge variant="outline" className="rounded-full">{persona.powers.speed.value}</Badge>
          </div>
        </div>
      </div>

      {/* AI Insight */}
      <div className="pt-4 border-t border-gray-200">
        <h4 className="font-semibold text-lg mb-3 text-gray-900">AI Insight</h4>
        <p className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-2xl">
          {persona.aiInsight}
        </p>
      </div>

      {/* Meal Images Grid */}
      {challenge && challenge.meals.length > 0 && (
        <div className="pt-4 border-t border-gray-200">
          <h4 className="font-semibold text-lg mb-3 text-gray-900">Meals</h4>
          <div className="grid grid-cols-5 gap-2">
            {challenge.meals.map((meal) => {
              const mealTime = new Date(meal.mealTime);
              const timeString = mealTime.toLocaleTimeString('th-TH', {
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={meal.id}
                  className="relative aspect-square rounded-2xl overflow-hidden border border-gray-200 hover:border-blue-400 transition-all group"
                >
                  <img
                    src={meal.imageUrl}
                    alt={`Meal at ${timeString}`}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  {/* Time overlay */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-1.5">
                    <p className="text-white text-[10px] font-semibold text-center">
                      {timeString}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

