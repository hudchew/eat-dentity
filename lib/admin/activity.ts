import { prisma } from '@/lib/prisma';

export type AdminAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'VIEW' | 'EXPORT';
export type EntityType = 'User' | 'Challenge' | 'Meal' | 'Persona' | 'Tag' | 'Admin';

interface LogActivityParams {
  adminId: string;
  action: AdminAction;
  entityType: EntityType;
  entityId?: string;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Log admin activity to audit trail
 */
export async function logAdminActivity(params: LogActivityParams): Promise<void> {
  try {
    await prisma.adminActivity.create({
      data: {
        adminId: params.adminId,
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId,
        details: params.details ? JSON.parse(JSON.stringify(params.details)) : null,
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
      },
    });
  } catch (error) {
    console.error('Error logging admin activity:', error);
    // Don't throw - activity logging should not break the main flow
  }
}

/**
 * Get admin activity history
 */
export async function getAdminActivityHistory(options: {
  adminId?: string;
  entityType?: EntityType;
  entityId?: string;
  limit?: number;
  offset?: number;
}) {
  const { adminId, entityType, entityId, limit = 50, offset = 0 } = options;

  const where: any = {};
  if (adminId) where.adminId = adminId;
  if (entityType) where.entityType = entityType;
  if (entityId) where.entityId = entityId;

  const [activities, total] = await Promise.all([
    prisma.adminActivity.findMany({
      where,
      include: {
        admin: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    }),
    prisma.adminActivity.count({ where }),
  ]);

  return {
    activities,
    total,
    hasMore: offset + limit < total,
  };
}

