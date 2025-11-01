import { redirect, notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import { verifyAdminSession } from '@/lib/admin/auth';
import { prisma } from '@/lib/prisma';
import { ChallengeDetails } from '@/components/admin/ChallengeDetails';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminChallengeDetailsPage({
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

  // Get challenge with all related data
  const challenge = await prisma.challenge.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      meals: {
        include: {
          tags: {
            include: {
              tag: {
                select: {
                  id: true,
                  name: true,
                  emoji: true,
                  color: true,
                },
              },
            },
          },
        },
        orderBy: {
          mealTime: 'desc',
        },
      },
      persona: {
        select: {
          id: true,
          title: true,
          description: true,
          statsJson: true,
          aiInsight: true,
          createdAt: true,
        },
      },
    },
  });

  if (!challenge) {
    notFound();
  }

  return (
    <div className="space-y-6 py-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/challenges">
            <Button variant="outline" size="icon" title="Back to Challenges">
              <ArrowLeft className="size-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Challenge Details</h1>
            <p className="text-gray-600">View and manage challenge information</p>
          </div>
        </div>
      </div>

      <ChallengeDetails
        challenge={{
          id: challenge.id,
          userId: challenge.userId,
          user: challenge.user,
          startDate: challenge.startDate,
          endDate: challenge.endDate,
          status: challenge.status,
          createdAt: challenge.createdAt,
          updatedAt: challenge.updatedAt,
        }}
        meals={challenge.meals}
        persona={challenge.persona}
        canEdit={true}
      />
    </div>
  );
}

