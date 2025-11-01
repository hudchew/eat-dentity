import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin/middleware';
import { prisma } from '@/lib/prisma';
import { logAdminActivity } from '@/lib/admin/activity';
import { z } from 'zod';

// Schema for updating persona
const updatePersonaSchema = z.object({
  title: z.string().min(1, 'Title is required').optional(),
  description: z.string().min(1, 'Description is required').optional(),
  statsJson: z.record(z.string(), z.any()).optional(),
});

/**
 * GET /api/admin/personas/[id]
 * Get persona details
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
    const persona = await prisma.persona.findUnique({
      where: { id },
      include: {
        challenge: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!persona) {
      return NextResponse.json(
        { error: 'Persona not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ persona });
  } catch (error) {
    console.error('Get persona error:', error);
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/personas/[id]
 * Update persona (title, description, stats)
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
    const validated = updatePersonaSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validated.error.issues },
        { status: 400 }
      );
    }

    const { id } = await params;

    // Check if persona exists
    const existingPersona = await prisma.persona.findUnique({
      where: { id },
    });

    if (!existingPersona) {
      return NextResponse.json(
        { error: 'Persona not found' },
        { status: 404 }
      );
    }

    // Build update data
    const updateData: any = {};

    if (validated.data.title) {
      updateData.title = validated.data.title;
    }

    if (validated.data.description) {
      updateData.description = validated.data.description;
    }

    if (validated.data.statsJson) {
      updateData.statsJson = validated.data.statsJson;
    }

    // Update persona
    const updatedPersona = await prisma.persona.update({
      where: { id },
      data: updateData,
    });

    // Log activity
    await logAdminActivity({
      adminId: session.admin!.id,
      action: 'UPDATE',
      entityType: 'Persona',
      entityId: id,
      details: {
        before: {
          title: existingPersona.title,
          description: existingPersona.description,
        },
        after: {
          title: updatedPersona.title,
          description: updatedPersona.description,
        },
      },
      ipAddress: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || undefined,
      userAgent: req.headers.get('user-agent') || undefined,
    });

    return NextResponse.json({
      success: true,
      persona: updatedPersona,
    });
  } catch (error) {
    console.error('Update persona error:', error);
    return NextResponse.json(
      { error: 'An error occurred while updating the persona' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/personas/[id]
 * Delete persona
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

    // Check if persona exists
    const persona = await prisma.persona.findUnique({
      where: { id },
    });

    if (!persona) {
      return NextResponse.json(
        { error: 'Persona not found' },
        { status: 404 }
      );
    }

    // Delete persona
    await prisma.persona.delete({
      where: { id },
    });

    // Log activity
    await logAdminActivity({
      adminId: session.admin!.id,
      action: 'DELETE',
      entityType: 'Persona',
      entityId: id,
      details: {
        deletedPersona: {
          id: persona.id,
          challengeId: persona.challengeId,
          title: persona.title,
        },
      },
      ipAddress: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || undefined,
      userAgent: req.headers.get('user-agent') || undefined,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete persona error:', error);
    return NextResponse.json(
      { error: 'An error occurred while deleting the persona' },
      { status: 500 }
    );
  }
}

