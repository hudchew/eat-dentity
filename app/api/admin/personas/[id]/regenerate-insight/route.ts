import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin/middleware';
import { prisma } from '@/lib/prisma';
import { logAdminActivity } from '@/lib/admin/activity';
import { generatePersonaInsight } from '@/lib/gemini';

/**
 * POST /api/admin/personas/[id]/regenerate-insight
 * Regenerate AI insight for a persona
 */
export async function POST(
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

    // Get stats from persona
    const stats = persona.statsJson as Record<string, number>;

    // Generate new AI insight
    let aiInsight: string | null = null;
    try {
      aiInsight = await generatePersonaInsight(persona.title, stats);
    } catch (error) {
      console.error('Failed to generate AI insight:', error);
      return NextResponse.json(
        { error: 'Failed to generate AI insight. Please check Gemini API configuration.' },
        { status: 500 }
      );
    }

    // Update persona with new insight
    const updatedPersona = await prisma.persona.update({
      where: { id },
      data: {
        aiInsight,
      },
    });

    // Log activity
    await logAdminActivity({
      adminId: session.admin!.id,
      action: 'UPDATE',
      entityType: 'Persona',
      entityId: id,
      details: {
        action: 'Regenerate AI Insight',
        previousInsight: persona.aiInsight,
        newInsight: aiInsight,
      },
      ipAddress: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || undefined,
      userAgent: req.headers.get('user-agent') || undefined,
    });

    return NextResponse.json({
      success: true,
      persona: updatedPersona,
    });
  } catch (error) {
    console.error('Regenerate insight error:', error);
    return NextResponse.json(
      { error: 'An error occurred while regenerating the AI insight' },
      { status: 500 }
    );
  }
}

