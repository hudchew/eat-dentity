import { PersonaDetailView } from '@/components/features/PersonaDetailView';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { formatPersonaForDisplay } from '@/lib/utils/persona';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { ArrowLeftIcon } from 'lucide-react';

export default async function BadgeDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ completed?: string }>;
}) {
  const { id } = await params;
  const searchParamsResolved = await searchParams;
  const isCompleted = searchParamsResolved.completed === 'true';

  // Get persona with challenge and meals
  const persona = await prisma.persona.findUnique({
    where: { id },
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
  });

  // If no persona found, redirect to badge page
  if (!persona) {
    redirect('/badge');
  }

  const displayPersona = formatPersonaForDisplay(persona);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-500 text-white relative">
        <div className="flex items-center justify-center relative h-16">
          {/* Back Button - Left */}
          <div className="absolute left-4 top-1/2 -translate-y-1/2">
            <Link href="/badge">
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 h-10 w-10">
                <ArrowLeftIcon className="w-6 h-6" />
              </Button>
            </Link>
          </div>
          {/* Title - Center */}
          <h1 className="text-xl font-bold">
            {isCompleted ? 'Challenge Complete!' : 'My Badge'}
          </h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-6">
          {/* Success Message (only if completed) */}
          {isCompleted && (
            <div className="text-center">
              <p className="text-base text-gray-600">นี่คือตัวตนของคุณผ่านอาหารที่คุณกิน</p>
            </div>
          )}

          {/* Persona Detail */}
          <PersonaDetailView 
            persona={displayPersona} 
            challenge={persona.challenge} 
            variant="page" 
          />

          {/* Action Buttons (only if completed) */}
          {isCompleted && (
            <div className="flex flex-col gap-3 pt-4">
              <Button 
                size="lg" 
                className="w-full text-lg px-8 py-6 h-auto bg-blue-600 hover:bg-blue-700 font-semibold" 
                variant="default"
              >
                Share Result
              </Button>
              <Link href="/dashboard" className="w-full">
                <Button size="lg" className="w-full text-lg px-8 py-6 h-auto font-semibold" variant="outline">
                  Dashboard
                </Button>
              </Link>
              <Link href="/" className="w-full">
                <Button size="lg" className="w-full text-lg px-8 py-6 h-auto font-semibold" variant="secondary">
                  New Challenge
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

