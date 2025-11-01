import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin/middleware';
import { prisma } from '@/lib/prisma';
import { logAdminActivity } from '@/lib/admin/activity';
import type { Status } from '@prisma/client';
import { z } from 'zod';

// Schema for updating challenge
const updateChallengeSchema = z.object({
  status: z.enum(['ACTIVE', 'COMPLETED', 'ABANDONED']).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

/**
 * GET /api/admin/challenges/[id]
 * Get challenge details
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAdminSession(req);

    if (!session.valid || !session.admin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const challenge = await prisma.challenge.findUnique({
      where: { id },
      include: {
        user: true,
        meals: true,
        persona: true,
      },
    });

    if (!challenge) {
      return NextResponse.json(
        { error: 'Challenge not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ challenge });
  } catch (error) {
    console.error('Get challenge error:', error);
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/challenges/[id]
 * Update challenge (status, dates)
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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
    const validated = updateChallengeSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validated.error.issues },
        { status: 400 }
      );
    }

    const { id } = await params;

    // Check if challenge exists
    const existingChallenge = await prisma.challenge.findUnique({
      where: { id },
    });

    if (!existingChallenge) {
      return NextResponse.json(
        { error: 'Challenge not found' },
        { status: 404 }
      );
    }

    // Build update data
    const updateData: any = {};

    if (validated.data.status) {
      updateData.status = validated.data.status as Status;
    }

    if (validated.data.startDate) {
      updateData.startDate = new Date(validated.data.startDate);
    }

    if (validated.data.endDate) {
      // Include the entire day
      const endDate = new Date(validated.data.endDate);
      endDate.setHours(23, 59, 59, 999);
      updateData.endDate = endDate;
    }

    // Update challenge
    const updatedChallenge = await prisma.challenge.update({
      where: { id },
      data: updateData,
    });

    // Log activity
    await logAdminActivity({
      adminId: session.admin!.id,
      action: 'UPDATE',
      entityType: 'Challenge',
      entityId: id,
      details: {
        before: {
          status: existingChallenge.status,
          startDate: existingChallenge.startDate,
          endDate: existingChallenge.endDate,
        },
        after: {
          status: updatedChallenge.status,
          startDate: updatedChallenge.startDate,
          endDate: updatedChallenge.endDate,
        },
      },
      ipAddress: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || undefined,
      userAgent: req.headers.get('user-agent') || undefined,
    });

    return NextResponse.json({
      success: true,
      challenge: updatedChallenge,
    });
  } catch (error) {
    console.error('Update challenge error:', error);
    return NextResponse.json(
      { error: 'An error occurred while updating the challenge' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/challenges/[id]
 * Delete challenge (cascade deletes meals and persona)
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAdminSession(req);

    if (!session.valid || !session.admin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Check if challenge exists
    const challenge = await prisma.challenge.findUnique({
      where: { id },
    });

    if (!challenge) {
      return NextResponse.json(
        { error: 'Challenge not found' },
        { status: 404 }
      );
    }

    // Delete challenge (cascade deletes meals and persona)
    await prisma.challenge.delete({
      where: { id },
    });

    // Log activity
    await logAdminActivity({
      adminId: session.admin!.id,
      action: 'DELETE',
      entityType: 'Challenge',
      entityId: id,
      details: {
        deletedChallenge: {
          id: challenge.id,
          userId: challenge.userId,
          status: challenge.status,
        },
      },
      ipAddress: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || undefined,
      userAgent: req.headers.get('user-agent') || undefined,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete challenge error:', error);
    return NextResponse.json(
      { error: 'An error occurred while deleting the challenge' },
      { status: 500 }
    );
  }
}

