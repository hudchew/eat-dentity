import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import type { Persona, Challenge, Meal, MealTag, Tag } from '@prisma/client';

interface PersonaCollectionProps {
  personas: (Persona & {
    challenge: Challenge & {
      meals: (Meal & {
        tags: (MealTag & {
          tag: Tag;
        })[];
      })[];
    };
  })[];
}

export function PersonaCollection({ personas: initialPersonas }: PersonaCollectionProps) {
  return (
    <Card className="shadow-none border border-gray-200 rounded-3xl">
      <CardHeader>
        <CardTitle className="text-gray-900">Persona Collection</CardTitle>
        <CardDescription>All persona cards you've collected</CardDescription>
      </CardHeader>
      <CardContent>
        {initialPersonas.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p className="text-lg mb-2">🎯</p>
            <p>No personas yet</p>
            <p className="text-sm">Complete a challenge to get your first persona!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {initialPersonas.map((persona) => {
              const emojiMatch = persona.title.match(/[\p{Emoji_Presentation}\p{Emoji}\u{1F1E6}-\u{1F1FF}]+/gu);
              const emoji = emojiMatch?.[0] || '🎭';
              
              return (
                <Link key={persona.id} href={`/badge/${persona.id}`}>
                  <Card className="border border-gray-200 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer rounded-3xl">
                    <CardHeader className="text-center pb-2">
                      <div className="text-5xl mb-2">{emoji}</div>
                      <CardTitle className="text-lg text-gray-900">{persona.title}</CardTitle>
                      <CardDescription className="text-xs">
                        {new Date(persona.createdAt).toLocaleDateString('th-TH', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

