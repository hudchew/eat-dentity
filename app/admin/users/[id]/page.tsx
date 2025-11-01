import { redirect, notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import { verifyAdminSession } from '@/lib/admin/auth';
import { prisma } from '@/lib/prisma';
import { UserDetails } from '@/components/admin/UserDetails';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminUserDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('admin_session')?.value;

  if (!sessionToken) {
    redirect('/admin/login');
  }

  const session = await verifyAdminSession(sessionToken);
  if (!session.valid || !session.admin) {
    redirect('/admin/login');
  }

  const { id } = await params;

  // Get user with related data
  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      challenges: {
        include: {
          _count: {
            select: {
              meals: true,
            },
          },
          persona: {
            select: {
              id: true,
              title: true,
              createdAt: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      },
      _count: {
        select: {
          challenges: true,
        },
      },
    },
  });

  if (!user) {
    notFound();
  }

  // Calculate stats
  const totalMeals = user.challenges.reduce(
    (sum, challenge) => sum + challenge._count.meals,
    0
  );
  const totalPersonas = user.challenges.filter(
    (challenge) => challenge.persona !== null
  ).length;

  return (
    <div className="space-y-6 py-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/users">
            <Button variant="outline" size="icon" title="Back to Users">
              <ArrowLeft className="size-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">User Details</h1>
            <p className="text-gray-600">View and manage user information</p>
          </div>
        </div>
      </div>

      <UserDetails
        user={{
          id: user.id,
          email: user.email,
          name: user.name || 'No name',
          clerkId: user.clerkId,
          imageUrl: user.imageUrl,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        }}
        stats={{
          totalChallenges: user._count.challenges,
          totalMeals,
          totalPersonas,
        }}
        challenges={user.challenges.map((challenge) => ({
          id: challenge.id,
          startDate: challenge.startDate,
          endDate: challenge.endDate,
          status: challenge.status,
          mealsCount: challenge._count.meals,
          hasPersona: challenge.persona !== null,
          persona: challenge.persona
            ? {
                id: challenge.persona.id,
                title: challenge.persona.title,
                createdAt: challenge.persona.createdAt,
              }
            : null,
          createdAt: challenge.createdAt,
        }))}
      />
    </div>
  );
}

