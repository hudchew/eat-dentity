import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin/middleware';
import { prisma } from '@/lib/prisma';
import type { EntityType } from '@/lib/admin/activity';

/**
 * GET /api/admin/activities/export
 * Export activity log as CSV
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getAdminSession(req);

    if (!session.valid || !session.admin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const searchParams = req.nextUrl.searchParams;
    const search = searchParams.get('search') || '';
    const adminFilter = searchParams.get('admin') || 'ALL';
    const entityTypeFilter = searchParams.get('entityType') || 'ALL';
    const actionFilter = searchParams.get('action') || 'ALL';
    const dateFrom = searchParams.get('from') || '';
    const dateTo = searchParams.get('to') || '';

    // Build where clause (same as list page)
    const where: any = {};

    if (search) {
      where.admin = {
        OR: [
          { email: { contains: search, mode: 'insensitive' } },
          { name: { contains: search, mode: 'insensitive' } },
        ],
      };
    }

    if (adminFilter !== 'ALL') {
      where.adminId = adminFilter;
    }

    if (entityTypeFilter !== 'ALL') {
      where.entityType = entityTypeFilter as EntityType;
    }

    if (actionFilter !== 'ALL') {
      where.action = actionFilter;
    }

    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) {
        where.createdAt.gte = new Date(dateFrom);
      }
      if (dateTo) {
        const toDate = new Date(dateTo);
        toDate.setHours(23, 59, 59, 999);
        where.createdAt.lte = toDate;
      }
    }

    // Get all activities matching filters (no pagination for export)
    const activities = await prisma.adminActivity.findMany({
      where,
      include: {
        admin: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Generate CSV
    const headers = [
      'Timestamp',
      'Admin Name',
      'Admin Email',
      'Action',
      'Entity Type',
      'Entity ID',
      'IP Address',
      'User Agent',
      'Details',
    ];

    const rows = activities.map((activity) => {
      const timestamp = new Date(activity.createdAt).toISOString();
      const details = activity.details
        ? JSON.stringify(activity.details).replace(/"/g, '""')
        : '';
      
      return [
        timestamp,
        activity.admin.name || '',
        activity.admin.email,
        activity.action,
        activity.entityType,
        activity.entityId || '',
        activity.ipAddress || '',
        activity.userAgent?.replace(/"/g, '""') || '',
        details,
      ];
    });

    // CSV content
    const csvContent = [
      headers.map(h => `"${h}"`).join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');

    // Log export activity
    await prisma.adminActivity.create({
      data: {
        adminId: session.admin!.id,
        action: 'EXPORT',
        entityType: 'Admin',
        entityId: null,
        details: {
          filter: {
            search,
            admin: adminFilter,
            entityType: entityTypeFilter,
            action: actionFilter,
            dateFrom,
            dateTo,
          },
          recordCount: activities.length,
        },
        ipAddress: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || undefined,
        userAgent: req.headers.get('user-agent') || undefined,
      },
    });

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="activity-log-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error('Export activities error:', error);
    return NextResponse.json(
      { error: 'An error occurred while exporting activities' },
      { status: 500 }
    );
  }
}

