import { ProfileHeader } from '@/components/features/ProfileHeader';
import { ChallengeHistory } from '@/components/features/ChallengeHistory';
import { PersonaCollection } from '@/components/features/PersonaCollection';
import { OverallStats } from '@/components/features/OverallStats';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-orange-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-4xl font-bold mb-2">โปรไฟล์</h1>
          <p className="text-gray-600">ข้อมูลและประวัติของคุณ</p>
        </div>

        <ProfileHeader />

        {/* Tabs for organized content */}
        <Tabs defaultValue="stats" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="stats">📊 สถิติ</TabsTrigger>
            <TabsTrigger value="history">📜 ประวัติ</TabsTrigger>
            <TabsTrigger value="collection">🎴 คอลเลกชัน</TabsTrigger>
          </TabsList>

          <TabsContent value="stats" className="space-y-6">
            <OverallStats />
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <ChallengeHistory />
          </TabsContent>

          <TabsContent value="collection" className="space-y-6">
            <PersonaCollection />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

