import { redirect, notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import { verifyAdminSession } from '@/lib/admin/auth';
import { prisma } from '@/lib/prisma';
import { TagForm } from '@/components/admin/TagForm';

export const dynamic = 'force-dynamic';

export default async function AdminEditTagPage({
  params,
}: {
  params: { id: string };
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

  // Get tag with usage count
  const tag = await prisma.tag.findUnique({
    where: { id: params.id },
    include: {
      _count: {
        select: {
          meals: true,
        },
      },
    },
  });

  if (!tag) {
    notFound();
  }

  return (
    <div className="space-y-6 py-6">
      <TagForm tag={tag} mode="edit" />
    </div>
  );
}

