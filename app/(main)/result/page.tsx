import { PersonaCard } from '@/components/features/PersonaCard';
import { Button } from '@/components/ui/button';
import { mockPersona } from '@/lib/mock-data';
import Link from 'next/link';

export default function ResultPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-yellow-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center space-y-2 mb-8">
          <h1 className="text-4xl font-bold">🎉 ครบ 7 วันแล้ว!</h1>
          <p className="text-lg text-gray-600">นี่คือตัวตนของคุณผ่านอาหารที่คุณกิน</p>
        </div>

        <PersonaCard persona={mockPersona} />

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

