import { redirect, notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import { verifyAdminSession } from '@/lib/admin/auth';
import { prisma } from '@/lib/prisma';
import { PersonaDetails } from '@/components/admin/PersonaDetails';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminPersonaDetailsPage({
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

  // Get persona with all related data
  const persona = await prisma.persona.findUnique({
    where: { id },
    include: {
      challenge: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
    },
  });

  if (!persona) {
    notFound();
  }

  return (
    <div className="space-y-6 py-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/personas">
            <Button variant="outline" size="icon" title="Back to Personas">
              <ArrowLeft className="size-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Persona Details</h1>
            <p className="text-gray-600">View and manage persona information</p>
          </div>
        </div>
      </div>

      <PersonaDetails
        persona={{
          id: persona.id,
          title: persona.title,
          description: persona.description,
          statsJson: persona.statsJson,
          aiInsight: persona.aiInsight,
          createdAt: persona.createdAt,
          challenge: {
            id: persona.challenge.id,
            userId: persona.challenge.userId,
            user: persona.challenge.user,
          },
        }}
        canEdit={true}
      />
    </div>
  );
}

