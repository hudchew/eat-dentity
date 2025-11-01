import { PersonaCard } from '@/components/features/PersonaCard';
import { MealHistoryDialog } from '@/components/features/MealHistoryDialog';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { getLatestPersona } from '@/lib/actions/challenge';
import { formatPersonaForDisplay } from '@/lib/utils/persona';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';

export default async function ResultPage() {
  const persona = await getLatestPersona();

  // If no persona, redirect to dashboard
  if (!persona) {
    redirect('/dashboard');
  }

  const displayPersona = formatPersonaForDisplay(persona);

  // Get challenge with meals for MealHistoryDialog
  const challenge = await prisma.challenge.findUnique({
    where: { id: persona.challengeId },
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
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-yellow-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center space-y-2 mb-8">
          <h1 className="text-4xl font-bold">🎉 ครบ 7 วันแล้ว!</h1>
          <p className="text-lg text-gray-600">นี่คือตัวตนของคุณผ่านอาหารที่คุณกิน</p>
        </div>

        <PersonaCard persona={displayPersona} />

        {/* Meal History */}
        {challenge && challenge.meals.length > 0 && (
          <MealHistoryDialog challenge={challenge} />
        )}

        <div className="flex flex-col sm:flex-row gap-4">
          <Button size="lg" className="flex-1 text-lg" variant="default">
            📤 แชร์การ์ดนี้
          </Button>
          <Link href="/dashboard" className="flex-1">
            <Button size="lg" className="w-full text-lg" variant="outline">
              🏠 กลับหน้า Dashboard
            </Button>
          </Link>
          <Link href="/" className="flex-1">
            <Button size="lg" className="w-full text-lg" variant="secondary">
              🆕 เริ่ม Challenge ใหม่
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

