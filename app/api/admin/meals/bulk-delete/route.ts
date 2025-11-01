import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin/middleware';
import { prisma } from '@/lib/prisma';
import { logAdminActivity } from '@/lib/admin/activity';
import { z } from 'zod';

const bulkDeleteSchema = z.object({
  mealIds: z.array(z.string()).min(1, 'At least one meal ID is required'),
});

/**
 * POST /api/admin/meals/bulk-delete
 * Delete multiple meals
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getAdminSession(req);

    if (!session.valid || !session.admin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const validated = bulkDeleteSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validated.error.issues },
        { status: 400 }
      );
    }

    const { mealIds } = validated.data;

    // Check if meals exist
    const meals = await prisma.meal.findMany({
      where: {
        id: {
          in: mealIds,
        },
      },
    });

    if (meals.length === 0) {
      return NextResponse.json(
        { error: 'No meals found' },
        { status: 404 }
      );
    }

    // Delete meals (cascade deletes meal tags)
    const deleteResult = await prisma.meal.deleteMany({
      where: {
        id: {
          in: mealIds,
        },
      },
    });

    // Log activity
    await logAdminActivity({
      adminId: session.admin!.id,
      action: 'DELETE',
      entityType: 'Meal',
      entityId: undefined, // Bulk operation
      details: {
        bulkDelete: {
          count: deleteResult.count,
          mealIds: meals.map((m) => m.id),
        },
      },
      ipAddress: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || undefined,
      userAgent: req.headers.get('user-agent') || undefined,
    });

    return NextResponse.json({
      success: true,
      deleted: deleteResult.count,
    });
  } catch (error) {
    console.error('Bulk delete meals error:', error);
    return NextResponse.json(
      { error: 'An error occurred while deleting meals' },
      { status: 500 }
    );
  }
}

