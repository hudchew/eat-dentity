import { DailyChallenge } from '@/components/features/DailyChallenge';
import { MealPrompt } from '@/components/features/MealPrompt';
import { ChallengeProgress } from '@/components/features/ChallengeProgress';
import { ElementBars } from '@/components/features/ElementBars';
import { MealHistoryDialog } from '@/components/features/MealHistoryDialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { getActiveChallenge } from '@/lib/actions/challenge';
import { StartChallengeButton } from '@/components/features/StartChallengeButton';
import { AnalyzePersonaButton } from '@/components/features/AnalyzePersonaButton';
import { evaluateEligibility } from '@/lib/utils/eligibility';

export default async function DashboardPage() {
  const challenge = await getActiveChallenge();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-orange-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
            <p className="text-gray-600">ติดตามความคืบหน้า Challenge ของคุณ</p>
          </div>
          {challenge ? (
            <Link href="/capture">
              <Button size="lg" className="text-lg px-6">
                📸 ถ่ายรูปมื้ออาหาร
              </Button>
            </Link>
          ) : null}
        </div>

        {/* No Active Challenge */}
        {!challenge && (
          <Card className="border-2 border-dashed">
            <CardContent className="p-12 text-center">
              <div className="text-6xl mb-4">🎯</div>
              <h2 className="text-2xl font-bold mb-2">ยังไม่มี Challenge</h2>
              <p className="text-gray-600 mb-6">
                เริ่มต้น 7-Day Challenge เพื่อค้นพบตัวตนของคุณผ่านอาหารที่คุณกิน!
              </p>
              <StartChallengeButton />
            </CardContent>
          </Card>
        )}

        {/* Active Challenge */}
        {challenge && (
          <>
            {/* Time-based meal prompt */}
            <MealPrompt />

            {/* Daily Challenge */}
            <DailyChallenge />

            {/* Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ChallengeProgress challenge={challenge} />
              <ElementBars challenge={challenge} />
            </div>

            {/* Meal History */}
            {challenge.meals.length > 0 && (
              <MealHistoryDialog challenge={challenge} />
            )}

            {/* Analyze Persona CTA */}
            {(() => {
              const e = evaluateEligibility(challenge as any);
              return (
                <div className="mt-4">
                  <AnalyzePersonaButton eligible={e.eligible} reasons={e.reasons} />
                </div>
              );
            })()}
          </>
        )}
      </div>
    </div>
  );
}

