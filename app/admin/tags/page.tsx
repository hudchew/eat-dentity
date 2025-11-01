import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { verifyAdminSession } from '@/lib/admin/auth';
import { prisma } from '@/lib/prisma';
import { TagListTable } from '@/components/admin/TagListTable';
import type { Category } from '@prisma/client';

export const dynamic = 'force-dynamic';

export default async function AdminTagsPage({
  searchParams,
}: {
  searchParams: {
    page?: string;
    search?: string;
    category?: string;
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
  const categoryFilter = searchParams.category || 'ALL';
  const pageSize = 20;
  const skip = (page - 1) * pageSize;

  // Build where clause
  const where: any = {};

  // Search by name or slug
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { slug: { contains: search, mode: 'insensitive' } },
    ];
  }

  // Category filter
  if (categoryFilter !== 'ALL') {
    where.category = categoryFilter as Category;
  }

  // Get tags with pagination
  const [tags, total] = await Promise.all([
    prisma.tag.findMany({
      where,
      include: {
        _count: {
          select: {
            meals: true,
          },
        },
      },
      orderBy: { name: 'asc' },
      skip,
      take: pageSize,
    }),
    prisma.tag.count({ where }),
  ]);

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-6 py-6">
      <div>
        <h1 className="text-3xl font-bold">Tag Management</h1>
        <p className="text-gray-600">Manage all food tags in the system</p>
      </div>

      <TagListTable
        tags={tags}
        total={total}
        currentPage={page}
        totalPages={totalPages}
        search={search}
        categoryFilter={categoryFilter}
      />
    </div>
  );
}

