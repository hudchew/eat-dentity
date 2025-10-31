import { ProfileHeader } from '@/components/features/ProfileHeader';
import { ChallengeHistory } from '@/components/features/ChallengeHistory';
import { PersonaCollection } from '@/components/features/PersonaCollection';

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-orange-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-4xl font-bold mb-2">โปรไฟล์</h1>
          <p className="text-gray-600">ข้อมูลและประวัติของคุณ</p>
        </div>

        <ProfileHeader />
        <ChallengeHistory />
        <PersonaCollection />
      </div>
    </div>
  );
}

