import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { verifyAdminSession } from '@/lib/admin/auth';
import { prisma } from '@/lib/prisma';
import { ActivityLogTable } from '@/components/admin/ActivityLogTable';
import type { EntityType } from '@/lib/admin/activity';

export const dynamic = 'force-dynamic';

export default async function AdminActivitiesPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    search?: string;
    admin?: string;
    entityType?: string;
    action?: string;
    from?: string;
    to?: string;
  }>;
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

  const params = await searchParams;
  const page = parseInt(params.page || '1');
  const search = params.search || '';
  const adminFilter = params.admin || 'ALL';
  const entityTypeFilter = params.entityType || 'ALL';
  const actionFilter = params.action || 'ALL';
  const dateFrom = params.from || '';
  const dateTo = params.to || '';
  const pageSize = 50; // More activities per page
  const skip = (page - 1) * pageSize;

  // Build where clause
  const where: any = {};

  // Search by admin name or email
  if (search) {
    where.admin = {
      OR: [
        { email: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
      ],
    };
  }

  // Admin filter
  if (adminFilter !== 'ALL') {
    where.adminId = adminFilter;
  }

  // Entity type filter
  if (entityTypeFilter !== 'ALL') {
    where.entityType = entityTypeFilter as EntityType;
  }

  // Action filter
  if (actionFilter !== 'ALL') {
    where.action = actionFilter;
  }

  // Date range filter
  if (dateFrom || dateTo) {
    where.createdAt = {};
    if (dateFrom) {
      where.createdAt.gte = new Date(dateFrom);
    }
    if (dateTo) {
      // Include the entire day
      const toDate = new Date(dateTo);
      toDate.setHours(23, 59, 59, 999);
      where.createdAt.lte = toDate;
    }
  }

  // Get activities with pagination
  const [activities, total] = await Promise.all([
    prisma.adminActivity.findMany({
      where,
      include: {
        admin: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: pageSize,
    }),
    prisma.adminActivity.count({ where }),
  ]);

  const totalPages = Math.ceil(total / pageSize);

  // Get admins for filter dropdown
  const admins = await prisma.admin.findMany({
    select: {
      id: true,
      name: true,
      email: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="space-y-6 py-6">
      <div>
        <h1 className="text-3xl font-bold">Activity Log</h1>
        <p className="text-gray-600">View all admin actions and activities</p>
      </div>

      <ActivityLogTable
        activities={activities}
        total={total}
        currentPage={page}
        totalPages={totalPages}
        search={search}
        adminFilter={adminFilter}
        entityTypeFilter={entityTypeFilter}
        actionFilter={actionFilter}
        dateFrom={dateFrom}
        dateTo={dateTo}
        admins={admins.map((a) => ({
          id: a.id,
          label: a.name || a.email,
        }))}
      />
    </div>
  );
}

