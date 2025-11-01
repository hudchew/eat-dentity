import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin/middleware';
import { prisma } from '@/lib/prisma';
import { logAdminActivity } from '@/lib/admin/activity';
import { z } from 'zod';
import type { Category } from '@prisma/client';

// Schema for updating tag
const updateTagSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  slug: z.string().min(1, 'Slug is required').regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens').optional(),
  category: z.enum(['COOKING_METHOD', 'FOOD_GROUP', 'TASTE', 'BEVERAGE']).optional(),
  emoji: z.string().min(1, 'Emoji is required').optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Color must be a valid hex color').optional(),
});

/**
 * GET /api/admin/tags/[id]
 * Get tag details
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
    const tag = await prisma.tag.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            meals: true,
          },
        },
      },
    });

    if (!tag) {
      return NextResponse.json(
        { error: 'Tag not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ tag });
  } catch (error) {
    console.error('Get tag error:', error);
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/tags/[id]
 * Update tag
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
    const validated = updateTagSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validated.error.issues },
        { status: 400 }
      );
    }

    const { id } = await params;

    // Check if tag exists
    const existingTag = await prisma.tag.findUnique({
      where: { id },
    });

    if (!existingTag) {
      return NextResponse.json(
        { error: 'Tag not found' },
        { status: 404 }
      );
    }

    // Check if name or slug conflicts with other tags
    if (validated.data.name || validated.data.slug) {
      const conflicting = await prisma.tag.findFirst({
        where: {
          id: { not: id },
          OR: [
            ...(validated.data.name ? [{ name: validated.data.name }] : []),
            ...(validated.data.slug ? [{ slug: validated.data.slug }] : []),
          ],
        },
      });

      if (conflicting) {
        return NextResponse.json(
          { error: `A tag with this ${conflicting.name === validated.data.name ? 'name' : 'slug'} already exists` },
          { status: 409 }
        );
      }
    }

    // Build update data
    const updateData: any = {};

    if (validated.data.name) {
      updateData.name = validated.data.name;
    }

    if (validated.data.slug) {
      updateData.slug = validated.data.slug;
    }

    if (validated.data.category) {
      updateData.category = validated.data.category as Category;
    }

    if (validated.data.emoji) {
      updateData.emoji = validated.data.emoji;
    }

    if (validated.data.color) {
      updateData.color = validated.data.color;
    }

    // Update tag
    const updatedTag = await prisma.tag.update({
      where: { id },
      data: updateData,
    });

    // Log activity
    await logAdminActivity({
      adminId: session.admin!.id,
      action: 'UPDATE',
      entityType: 'Tag',
      entityId: id,
      details: {
        before: {
          name: existingTag.name,
          slug: existingTag.slug,
          category: existingTag.category,
        },
        after: {
          name: updatedTag.name,
          slug: updatedTag.slug,
          category: updatedTag.category,
        },
      },
      ipAddress: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || undefined,
      userAgent: req.headers.get('user-agent') || undefined,
    });

    return NextResponse.json({
      success: true,
      tag: updatedTag,
    });
  } catch (error) {
    console.error('Update tag error:', error);
    return NextResponse.json(
      { error: 'An error occurred while updating the tag' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/tags/[id]
 * Delete tag (only if not used)
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

    // Check if tag exists and get usage count
    const tag = await prisma.tag.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            meals: true,
          },
        },
      },
    });

    if (!tag) {
      return NextResponse.json(
        { error: 'Tag not found' },
        { status: 404 }
      );
    }

    // Check if tag is used
    if (tag._count.meals > 0) {
      return NextResponse.json(
        {
          error: `Cannot delete tag. It is currently used by ${tag._count.meals} meal(s). Please remove all usage first.`,
          usageCount: tag._count.meals,
        },
        { status: 409 }
      );
    }

    // Delete tag
    await prisma.tag.delete({
      where: { id },
    });

    // Log activity
    await logAdminActivity({
      adminId: session.admin!.id,
      action: 'DELETE',
      entityType: 'Tag',
      entityId: id,
      details: {
        deletedTag: {
          name: tag.name,
          slug: tag.slug,
          category: tag.category,
        },
      },
      ipAddress: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || undefined,
      userAgent: req.headers.get('user-agent') || undefined,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete tag error:', error);
    return NextResponse.json(
      { error: 'An error occurred while deleting the tag' },
      { status: 500 }
    );
  }
}

