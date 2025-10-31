import { DailyChallenge } from '@/components/features/DailyChallenge';
import { ChallengeProgress } from '@/components/features/ChallengeProgress';
import { ElementBars } from '@/components/features/ElementBars';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-orange-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
            <p className="text-gray-600">ติดตามความคืบหน้า Challenge ของคุณ</p>
          </div>
          <Link href="/capture">
            <Button size="lg" className="text-lg px-6">
              📸 ถ่ายรูปมื้ออาหาร
            </Button>
          </Link>
        </div>

        {/* Daily Challenge */}
        <DailyChallenge />

        {/* Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChallengeProgress />
          <ElementBars />
        </div>
      </div>
    </div>
  );
}

