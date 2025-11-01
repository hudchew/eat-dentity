import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin/middleware';

export async function GET(req: NextRequest) {
  try {
    const session = await getAdminSession(req);

    if (!session.valid || !session.admin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      admin: session.admin,
    });
  } catch (error) {
    console.error('Get admin session error:', error);
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    );
  }
}

