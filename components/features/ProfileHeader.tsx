import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { getOrCreateUser } from '@/lib/actions/user';

export async function ProfileHeader() {
  const clerkUser = await currentUser();
  
  if (!clerkUser) {
    return null;
  }

  // Get user stats from database
  let stats = { totalChallenges: 0, personas: 0 };
  try {
    const dbUser = await getOrCreateUser();
    if (dbUser) {
      const [totalChallenges, personas] = await Promise.all([
        prisma.challenge.count({ where: { userId: dbUser.id } }),
        prisma.persona.count({
          where: { challenge: { userId: dbUser.id } },
        }),
      ]);
      stats = { totalChallenges, personas };
    }
  } catch (error) {
    console.error('Error fetching user stats:', error);
  }

  const name = clerkUser.firstName || clerkUser.username || 'User';
  const email = clerkUser.emailAddresses[0]?.emailAddress || '';
  const imageUrl = clerkUser.imageUrl;
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();

  return (
    <Card className="border-2">
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <Avatar className="w-24 h-24 border-4 border-orange-400">
            <AvatarImage src={imageUrl} alt={name} />
            <AvatarFallback className="text-2xl bg-orange-400 text-white">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 text-center sm:text-left">
            <h2 className="text-3xl font-bold mb-2">{name}</h2>
            <p className="text-gray-600 mb-4">{email}</p>
            <div className="flex flex-wrap gap-4 justify-center sm:justify-start">
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {stats.totalChallenges}
                </div>
                <div className="text-sm text-gray-600">Challenges</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {stats.personas}
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

