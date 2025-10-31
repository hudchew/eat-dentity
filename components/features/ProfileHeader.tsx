import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { mockUser, mockOverallStats } from '@/lib/mock-data';

export function ProfileHeader() {
  const initials = mockUser.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();

  return (
    <Card className="border-2">
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <Avatar className="w-24 h-24 border-4 border-orange-400">
            <AvatarImage src={mockUser.imageUrl} alt={mockUser.name} />
            <AvatarFallback className="text-2xl bg-orange-400 text-white">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 text-center sm:text-left">
            <h2 className="text-3xl font-bold mb-2">{mockUser.name}</h2>
            <p className="text-gray-600 mb-4">{mockUser.email}</p>
            <div className="flex flex-wrap gap-4 justify-center sm:justify-start">
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {mockOverallStats.totalChallenges}
                </div>
                <div className="text-sm text-gray-600">Challenges</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {mockOverallStats.personas}
                </div>
                <div className="text-sm text-gray-600">Personas</div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

