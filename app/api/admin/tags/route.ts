import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin/middleware';
import { prisma } from '@/lib/prisma';
import { logAdminActivity } from '@/lib/admin/activity';
import { z } from 'zod';
import type { Category } from '@prisma/client';

// Schema for creating tag
const createTagSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z.string().min(1, 'Slug is required').regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
  category: z.enum(['COOKING_METHOD', 'FOOD_GROUP', 'TASTE', 'BEVERAGE']),
  emoji: z.string().min(1, 'Emoji is required'),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Color must be a valid hex color'),
});

/**
 * GET /api/admin/tags
 * Get all tags (already exists, but ensure it includes count)
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

    const tags = await prisma.tag.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        emoji: true,
        color: true,
        category: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json({ tags });
  } catch (error) {
    console.error('Get tags error:', error);
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/tags
 * Create a new tag
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
    const validated = createTagSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validated.error.issues },
        { status: 400 }
      );
    }

    // Check if name or slug already exists
    const existing = await prisma.tag.findFirst({
      where: {
        OR: [
          { name: validated.data.name },
          { slug: validated.data.slug },
        ],
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: `A tag with this ${existing.name === validated.data.name ? 'name' : 'slug'} already exists` },
        { status: 409 }
      );
    }

    // Create tag
    const tag = await prisma.tag.create({
      data: {
        name: validated.data.name,
        slug: validated.data.slug,
        category: validated.data.category as Category,
        emoji: validated.data.emoji,
        color: validated.data.color,
      },
    });

    // Log activity
    await logAdminActivity({
      adminId: session.admin!.id,
      action: 'CREATE',
      entityType: 'Tag',
      entityId: tag.id,
      details: {
        createdTag: {
          name: tag.name,
          slug: tag.slug,
          category: tag.category,
        },
      },
      ipAddress: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || undefined,
      userAgent: req.headers.get('user-agent') || undefined,
    });

    return NextResponse.json({
      success: true,
      tag,
    });
  } catch (error) {
    console.error('Create tag error:', error);
    return NextResponse.json(
      { error: 'An error occurred while creating the tag' },
      { status: 500 }
    );
  }
}
