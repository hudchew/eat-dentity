import { ProfileHeader } from '@/components/features/ProfileHeader';
import { ChallengeHistory } from '@/components/features/ChallengeHistory';
import { PersonaCollection } from '@/components/features/PersonaCollection';
import { OverallStats } from '@/components/features/OverallStats';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Suspense } from 'react';

export const dynamic = 'force-dynamic';

function StatsSkeleton() {
  return <div className="h-96 bg-gray-100 rounded-lg animate-pulse" />;
}

function HistorySkeleton() {
  return <div className="h-96 bg-gray-100 rounded-lg animate-pulse" />;
}

function CollectionSkeleton() {
  return <div className="h-96 bg-gray-100 rounded-lg animate-pulse" />;
}

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-orange-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-4xl font-bold mb-2">โปรไฟล์</h1>
          <p className="text-gray-600">ข้อมูลและประวัติของคุณ</p>
        </div>

        <Suspense fallback={<div className="h-32 bg-gray-100 rounded-lg animate-pulse" />}>
          <ProfileHeader />
        </Suspense>

        {/* Tabs for organized content */}
        <Tabs defaultValue="stats" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="stats">📊 สถิติ</TabsTrigger>
            <TabsTrigger value="history">📜 ประวัติ</TabsTrigger>
            <TabsTrigger value="collection">🎴 คอลเลกชัน</TabsTrigger>
          </TabsList>

          <TabsContent value="stats" className="space-y-6">
            <Suspense fallback={<StatsSkeleton />}>
              <OverallStats />
            </Suspense>
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <Suspense fallback={<HistorySkeleton />}>
              <ChallengeHistory />
            </Suspense>
          </TabsContent>

          <TabsContent value="collection" className="space-y-6">
            <Suspense fallback={<CollectionSkeleton />}>
              <PersonaCollection />
            </Suspense>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

