import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { verifyAdminSession } from '@/lib/admin/auth';
import { prisma } from '@/lib/prisma';
import { UserListTable } from '@/components/admin/UserListTable';

export const dynamic = 'force-dynamic';

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: { page?: string; search?: string };
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

  const page = parseInt(searchParams.page || '1');
  const search = searchParams.search || '';
  const pageSize = 20;
  const skip = (page - 1) * pageSize;

  // Build where clause for search
  const where: any = {};
  if (search) {
    where.OR = [
      { email: { contains: search, mode: 'insensitive' } },
      { name: { contains: search, mode: 'insensitive' } },
      { clerkId: { contains: search, mode: 'insensitive' } },
    ];
  }

  // Get users with pagination
  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      include: {
        _count: {
          select: {
            challenges: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: pageSize,
    }),
    prisma.user.count({ where }),
  ]);

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-6 py-6">
      <div>
        <h1 className="text-3xl font-bold">User Management</h1>
        <p className="text-gray-600">Manage all users in the system</p>
      </div>

      <UserListTable
        users={users.map((user) => ({
          id: user.id,
          email: user.email,
          name: user.name || 'No name',
          clerkId: user.clerkId,
          imageUrl: user.imageUrl,
          totalChallenges: user._count.challenges,
          createdAt: user.createdAt,
        }))}
        total={total}
        currentPage={page}
        totalPages={totalPages}
        search={search}
      />
    </div>
  );
}

