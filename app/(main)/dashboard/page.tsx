import { DailyChallenge } from '@/components/features/DailyChallenge';
import { MealPrompt } from '@/components/features/MealPrompt';
import { ChallengeProgress } from '@/components/features/ChallengeProgress';
import { ElementBars } from '@/components/features/ElementBars';
import { MealHistoryDialog } from '@/components/features/MealHistoryDialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Suspense } from 'react';
import { getActiveChallenge } from '@/lib/actions/challenge';
import { StartChallengeButton } from '@/components/features/StartChallengeButton';
import { AnalyzePersonaButton } from '@/components/features/AnalyzePersonaButton';
import { evaluateEligibility } from '@/lib/utils/eligibility';

export default async function DashboardPage() {
  const challenge = await getActiveChallenge();

  // Evaluate eligibility for analyze button
  const eligibility = challenge ? evaluateEligibility(challenge as any) : null;

  return (
    <div className="min-h-screen bg-white">
      <div className="space-y-4">
        {/* No Active Challenge */}
        {!challenge && (
          <div className="p-4">
            <Card className="border-2 border-dashed border-gray-200 rounded-3xl shadow-none">
              <CardContent className="p-12 text-center">
                <h2 className="text-3xl font-bold mb-2 text-gray-900">ยังไม่มี Challenge</h2>
                <p className="text-gray-500 mb-6 text-lg">
                  เริ่มต้น 7-Day Challenge เพื่อค้นพบตัวตนของคุณผ่านอาหารที่คุณกิน
                </p>
                <StartChallengeButton />
              </CardContent>
            </Card>
          </div>
        )}

        {/* Active Challenge */}
        {challenge && eligibility && (
          <>
            {/* Hero Image - Latest Meal or Placeholder */}
            <div className="relative w-full aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
              <img 
                src={
                  challenge.meals.length > 0 
                    ? challenge.meals[0].imageUrl 
                    : 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2070&auto=format&fit=crop'
                }
                alt={challenge.meals.length > 0 ? "Latest meal" : "Food placeholder"}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              {challenge.meals.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-white/90 backdrop-blur-sm rounded-3xl px-6 py-3">
                    <p className="text-gray-700 font-medium">Start capturing your meals!</p>
                  </div>
                </div>
              )}
            </div>

            {/* Primary CTA - Floating Button */}
            <div className="relative -mt-10 px-4 z-10">
              {eligibility.eligible ? (
                <AnalyzePersonaButton eligible={true} reasons={[]} />
              ) : (
                <Link href="/capture" className="block">
                  <Button 
                    size="lg" 
                    className="w-full text-lg px-8 py-6 h-auto bg-blue-600 hover:bg-blue-700 font-semibold shadow-2xl"
                  >
                    Capture Meal
                  </Button>
                </Link>
              )}
            </div>

            <div className="p-4 space-y-4 pt-6">
              {/* Progress Info */}
              <div className="text-center text-sm text-gray-500">
                <p>Day {eligibility.dayNumber} of 7 • {challenge.meals.length} meals logged</p>
              </div>

              {/* Time-based meal prompt */}
              <Suspense fallback={<div className="h-24 bg-gray-100 rounded-3xl animate-pulse" />}>
                <MealPrompt challenge={challenge} />
              </Suspense>

              {/* Daily Challenge */}
              <Suspense fallback={<div className="h-32 bg-gray-100 rounded-3xl animate-pulse" />}>
                <DailyChallenge challenge={challenge} />
              </Suspense>

              {/* Progress & Stats */}
              <ChallengeProgress challenge={challenge} />
              <ElementBars challenge={challenge} />

              {/* Meal History */}
              {challenge.meals.length > 0 && (
                <MealHistoryDialog challenge={challenge} />
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

