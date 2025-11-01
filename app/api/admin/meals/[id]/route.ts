import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin/middleware';
import { prisma } from '@/lib/prisma';
import { logAdminActivity } from '@/lib/admin/activity';
import { z } from 'zod';

// Schema for updating meal
const updateMealSchema = z.object({
  mealTime: z.string().optional(),
  dayNumber: z.number().min(1).max(7).optional(),
  tagIds: z.array(z.string()).optional(),
  notes: z.string().nullable().optional(),
});

/**
 * GET /api/admin/meals/[id]
 * Get meal details
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getAdminSession(req);

    if (!session.valid || !session.admin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const meal = await prisma.meal.findUnique({
      where: { id: params.id },
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
            tag: true,
          },
        },
      },
    });

    if (!meal) {
      return NextResponse.json(
        { error: 'Meal not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ meal });
  } catch (error) {
    console.error('Get meal error:', error);
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/meals/[id]
 * Update meal (time, day, tags, notes)
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getAdminSession(req);

    if (!session.valid || !session.admin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const validated = updateMealSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validated.error.errors },
        { status: 400 }
      );
    }

    // Check if meal exists
    const existingMeal = await prisma.meal.findUnique({
      where: { id: params.id },
      include: {
        tags: true,
      },
    });

    if (!existingMeal) {
      return NextResponse.json(
        { error: 'Meal not found' },
        { status: 404 }
      );
    }

    // Build update data
    const updateData: any = {};

    if (validated.data.mealTime) {
      updateData.mealTime = new Date(validated.data.mealTime);
    }

    if (validated.data.dayNumber !== undefined) {
      updateData.dayNumber = validated.data.dayNumber;
    }

    if (validated.data.notes !== undefined) {
      updateData.notes = validated.data.notes;
    }

    // Update meal
    const updatedMeal = await prisma.meal.update({
      where: { id: params.id },
      data: updateData,
    });

    // Update tags if provided
    if (validated.data.tagIds) {
      // Delete existing meal tags
      await prisma.mealTag.deleteMany({
        where: { mealId: params.id },
      });

      // Create new meal tags
      if (validated.data.tagIds.length > 0) {
        await prisma.mealTag.createMany({
          data: validated.data.tagIds.map((tagId) => ({
            mealId: params.id,
            tagId,
          })),
        });
      }
    }

    // Log activity
    await logAdminActivity({
      adminId: session.admin!.id,
      action: 'UPDATE',
      entityType: 'Meal',
      entityId: params.id,
      details: {
        before: {
          mealTime: existingMeal.mealTime,
          dayNumber: existingMeal.dayNumber,
          notes: existingMeal.notes,
        },
        after: {
          mealTime: updatedMeal.mealTime,
          dayNumber: updatedMeal.dayNumber,
          notes: updatedMeal.notes,
        },
      },
      ipAddress: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || undefined,
      userAgent: req.headers.get('user-agent') || undefined,
    });

    return NextResponse.json({
      success: true,
      meal: updatedMeal,
    });
  } catch (error) {
    console.error('Update meal error:', error);
    return NextResponse.json(
      { error: 'An error occurred while updating the meal' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/meals/[id]
 * Delete meal
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getAdminSession(req);

    if (!session.valid || !session.admin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if meal exists
    const meal = await prisma.meal.findUnique({
      where: { id: params.id },
    });

    if (!meal) {
      return NextResponse.json(
        { error: 'Meal not found' },
        { status: 404 }
      );
    }

    // Delete meal (cascade deletes meal tags)
    await prisma.meal.delete({
      where: { id: params.id },
    });

    // Log activity
    await logAdminActivity({
      adminId: session.admin!.id,
      action: 'DELETE',
      entityType: 'Meal',
      entityId: params.id,
      details: {
        deletedMeal: {
          id: meal.id,
          challengeId: meal.challengeId,
          dayNumber: meal.dayNumber,
        },
      },
      ipAddress: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || undefined,
      userAgent: req.headers.get('user-agent') || undefined,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete meal error:', error);
    return NextResponse.json(
      { error: 'An error occurred while deleting the meal' },
      { status: 500 }
    );
  }
}

