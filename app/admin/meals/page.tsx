import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { verifyAdminSession } from '@/lib/admin/auth';
import { prisma } from '@/lib/prisma';
import { MealGrid } from '@/components/admin/MealGrid';

export const dynamic = 'force-dynamic';

export default async function AdminMealsPage({
  searchParams,
}: {
  searchParams: {
    page?: string;
    search?: string;
    challenge?: string;
    user?: string;
    from?: string;
    to?: string;
    view?: 'grid' | 'table';
  };
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
  const challengeFilter = searchParams.challenge || 'ALL';
  const userFilter = searchParams.user || 'ALL';
  const dateFrom = searchParams.from || '';
  const dateTo = searchParams.to || '';
  const pageSize = 20;
  const skip = (page - 1) * pageSize;

  // Build where clause
  const where: any = {};

  // Search by user email or name
  if (search) {
    where.challenge = {
      user: {
        OR: [
          { email: { contains: search, mode: 'insensitive' } },
          { name: { contains: search, mode: 'insensitive' } },
        ],
      },
    };
  }

  // Challenge filter
  if (challengeFilter !== 'ALL') {
    where.challengeId = challengeFilter;
  }

  // User filter
  if (userFilter !== 'ALL') {
    where.challenge = {
      ...where.challenge,
      userId: userFilter,
    };
  }

  // Date range filter
  if (dateFrom || dateTo) {
    where.mealTime = {};
    if (dateFrom) {
      where.mealTime.gte = new Date(dateFrom);
    }
    if (dateTo) {
      // Include the entire day
      const toDate = new Date(dateTo);
      toDate.setHours(23, 59, 59, 999);
      where.mealTime.lte = toDate;
    }
  }

  // Get meals with pagination
  const [meals, total] = await Promise.all([
    prisma.meal.findMany({
      where,
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
      orderBy: { mealTime: 'desc' },
      skip,
      take: pageSize,
    }),
    prisma.meal.count({ where }),
  ]);

  const totalPages = Math.ceil(total / pageSize);

  // Get challenges and users for filter dropdowns
  const [challenges, users] = await Promise.all([
    prisma.challenge.findMany({
      select: {
        id: true,
        userId: true,
        startDate: true,
        endDate: true,
        status: true,
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 100, // Limit for dropdown
    }),
    prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 100, // Limit for dropdown
    }),
  ]);

  return (
    <div className="space-y-6 py-6">
      <div>
        <h1 className="text-3xl font-bold">Meal Management</h1>
        <p className="text-gray-600">Manage all meals in the system</p>
      </div>

      <MealGrid
        meals={meals}
        total={total}
        currentPage={page}
        totalPages={totalPages}
        search={search}
        challengeFilter={challengeFilter}
        userFilter={userFilter}
        dateFrom={dateFrom}
        dateTo={dateTo}
        challenges={challenges.map((c) => ({
          id: c.id,
          label: `${c.user.name || c.user.email} - ${new Date(c.startDate).toLocaleDateString()}`,
        }))}
        users={users.map((u) => ({
          id: u.id,
          label: u.name || u.email,
        }))}
      />
    </div>
  );
}

