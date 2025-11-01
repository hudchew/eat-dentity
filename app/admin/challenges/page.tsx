import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { verifyAdminSession } from '@/lib/admin/auth';
import { prisma } from '@/lib/prisma';
import { ChallengeListTable } from '@/components/admin/ChallengeListTable';
import type { Status } from '@prisma/client';

export const dynamic = 'force-dynamic';

export default async function AdminChallengesPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    search?: string;
    status?: string;
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
  const statusFilter = params.status || 'ALL';
  const dateFrom = params.from || '';
  const dateTo = params.to || '';
  const pageSize = 20;
  const skip = (page - 1) * pageSize;

  // Build where clause
  const where: any = {};

  // Search by user email or name
  if (search) {
    where.user = {
      OR: [
        { email: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
      ],
    };
  }

  // Status filter
  if (statusFilter !== 'ALL') {
    where.status = statusFilter as Status;
  }

  // Date range filter
  if (dateFrom || dateTo) {
    where.startDate = {};
    if (dateFrom) {
      where.startDate.gte = new Date(dateFrom);
    }
    if (dateTo) {
      // Include the entire day
      const toDate = new Date(dateTo);
      toDate.setHours(23, 59, 59, 999);
      where.startDate.lte = toDate;
    }
  }

  // Get challenges with pagination
  const [challenges, total] = await Promise.all([
    prisma.challenge.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            meals: true,
          },
        },
        persona: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: pageSize,
    }),
    prisma.challenge.count({ where }),
  ]);

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-6 py-6">
      <div>
        <h1 className="text-3xl font-bold">Challenge Management</h1>
        <p className="text-gray-600">Manage all challenges in the system</p>
      </div>

      <ChallengeListTable
        challenges={challenges}
        total={total}
        currentPage={page}
        totalPages={totalPages}
        search={search}
        statusFilter={statusFilter}
        dateFrom={dateFrom}
        dateTo={dateTo}
      />
    </div>
  );
}

