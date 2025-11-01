import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { verifyAdminSession } from '@/lib/admin/auth';
import { prisma } from '@/lib/prisma';
import { PersonaListTable } from '@/components/admin/PersonaListTable';

export const dynamic = 'force-dynamic';

export default async function AdminPersonasPage({
  searchParams,
}: {
  searchParams: {
    page?: string;
    search?: string;
    user?: string;
    from?: string;
    to?: string;
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
  const userFilter = searchParams.user || 'ALL';
  const dateFrom = searchParams.from || '';
  const dateTo = searchParams.to || '';
  const pageSize = 20;
  const skip = (page - 1) * pageSize;

  // Build where clause
  const where: any = {};

  // Search by user email, name, or persona title
  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      {
        challenge: {
          user: {
            OR: [
              { email: { contains: search, mode: 'insensitive' } },
              { name: { contains: search, mode: 'insensitive' } },
            ],
          },
        },
      },
    ];
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

  // Get personas with pagination
  const [personas, total] = await Promise.all([
    prisma.persona.findMany({
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
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: pageSize,
    }),
    prisma.persona.count({ where }),
  ]);

  const totalPages = Math.ceil(total / pageSize);

  // Get users for filter dropdown
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
    },
    orderBy: { createdAt: 'desc' },
    take: 100, // Limit for dropdown
  });

  return (
    <div className="space-y-6 py-6">
      <div>
        <h1 className="text-3xl font-bold">Persona Management</h1>
        <p className="text-gray-600">Manage all personas in the system</p>
      </div>

      <PersonaListTable
        personas={personas}
        total={total}
        currentPage={page}
        totalPages={totalPages}
        search={search}
        userFilter={userFilter}
        dateFrom={dateFrom}
        dateTo={dateTo}
        users={users.map((u) => ({
          id: u.id,
          label: u.name || u.email,
        }))}
      />
    </div>
  );
}

